import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { File } from "@/lib/type";

const SECURITY_REVIEW_PROMPT = `You are a strict HTML/CSS/JS security and quality auditor. 
You will be given web application source files. Your ONLY job is to silently fix issues and return the corrected files.

SCAN FOR AND FIX:
1. XSS vulnerabilities: innerHTML with user input, eval(), document.write(), unsafe event handlers
2. Unclosed HTML tags or malformed structure
3. Missing meta charset/viewport tags in <head>
4. Mixed content (http:// resources inside https pages)
5. Missing rel="noopener noreferrer" on target="_blank" links
6. Obvious unoptimized CSS (duplicate rules, !important abuse, inline styles that should be classes)
7. Missing alt attributes on <img> tags

STRICT RULES:
- Return ONLY the corrected files in the exact format below. No explanations. No markdown prose.
- If a file has NO issues, output it UNCHANGED.
- Do NOT change any functionality, layout, colors, or logic — only fix the security/quality issues listed above.
- Do NOT add comments explaining what you changed.

OUTPUT FORMAT — use EXACTLY these markers per file:
=== REVIEWED_FILE_START {filename}
{complete corrected file content here}
=== REVIEWED_FILE_END

After all files, output a JSON issues summary on a single line:
=== REVIEW_ISSUES_JSON
{"count": 0, "issues": []}`;

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_key_here") {
    // Silently skip if no Groq key — don't block generation
    return NextResponse.json({ skipped: true, reason: "No Groq key configured" });
  }

  const body = await request.json();
  const { files } = body as { files: File[] };

  if (!files || files.length === 0) {
    return NextResponse.json({ skipped: true, reason: "No files to review" });
  }

  // Only review HTML/CSS/JS files, skip binaries/fonts/images
  const reviewableFiles = files.filter(
    (f) =>
      f.path.endsWith(".html") ||
      f.path.endsWith(".css") ||
      f.path.endsWith(".js") ||
      f.path.endsWith(".ts")
  );

  if (reviewableFiles.length === 0) {
    return NextResponse.json({ skipped: true, reason: "No reviewable files" });
  }

  // Build the user message — limit content to avoid TPM limits
  const MAX_CHARS_PER_FILE = 8000;
  const fileContent = reviewableFiles
    .map(
      (f) =>
        `=== FILE: ${f.path}\n${(f.content ?? "").slice(0, MAX_CHARS_PER_FILE)}`
    )
    .join("\n\n");

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SECURITY_REVIEW_PROMPT },
          { role: "user", content: fileContent },
        ],
        max_tokens: 4096,
        temperature: 0.1,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("[review] Groq error:", errText);
      return NextResponse.json({ skipped: true, reason: "Groq API error" });
    }

    const groqData = await groqRes.json();
    const responseText: string = groqData?.choices?.[0]?.message?.content ?? "";

    // Parse corrected files from response
    const correctedFiles: File[] = [];
    const filePattern =
      /=== REVIEWED_FILE_START (.+?)\n([\s\S]*?)=== REVIEWED_FILE_END/g;
    let match;
    while ((match = filePattern.exec(responseText)) !== null) {
      const path = match[1].trim();
      const content = match[2].trim();
      correctedFiles.push({ path, content });
    }

    // Parse issues summary
    let issueCount = 0;
    let issues: string[] = [];
    const jsonMatch = responseText.match(/=== REVIEW_ISSUES_JSON\n({.+})/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        issueCount = parsed.count ?? 0;
        issues = parsed.issues ?? [];
      } catch {
        // ignore parse failure
      }
    }

    // Determine which files actually changed (avoid false positives)
    const changedFiles = correctedFiles.filter((reviewed) => {
      const original = reviewableFiles.find((f) => f.path === reviewed.path);
      return original && original.content !== reviewed.content;
    });

    return NextResponse.json({
      success: true,
      files: changedFiles,
      issueCount,
      issues,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[review] Error:", msg);
    // Always return gracefully — never block the UI
    return NextResponse.json({ skipped: true, reason: msg });
  }
}
