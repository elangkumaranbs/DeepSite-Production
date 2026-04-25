import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { images } = await request.json();

  if (!images || !Array.isArray(images) || images.length === 0) {
    return NextResponse.json({ error: "Images are required" }, { status: 400 });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey || groqApiKey === "your_groq_key_here") {
    return NextResponse.json(
      { error: "Groq API key not configured." },
      { status: 503 }
    );
  }

  try {
    const visionMessages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "You are an expert Frontend Developer. Your job is to convert the provided screenshot or design into a clean, modern, and structural HTML skeleton using Tailwind CSS. Do NOT invent business logic, just precisely replicate the visual structure, layout, typography, and color palette of the image into valid HTML code.",
          },
          ...images.map((img: string) => ({
            type: "image_url",
            image_url: { url: img },
          })),
        ],
      },
    ];

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.2-90b-vision-preview",
          messages: visionMessages,
          max_tokens: 4000,
          temperature: 0.2, // low temperature for precise translation
        }),
      }
    );

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      throw new Error(`Vision model failed: ${errorText}`);
    }

    const json = await groqRes.json();
    const generatedMarkdown = json.choices[0]?.message?.content || "";

    return NextResponse.json({
      success: true,
      structure: generatedMarkdown,
    });
  } catch (error) {
    console.error("Vision parsing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to parse image",
      },
      { status: 500 }
    );
  }
}
