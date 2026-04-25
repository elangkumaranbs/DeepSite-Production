import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/lib/models/Project";
import UserSettings from "@/lib/models/UserSettings";

// ── Netlify helpers ────────────────────────────────────────────────────────────

async function deployToNetlify(
  token: string,
  files: { path: string; content: string }[],
  existingSiteId?: string
): Promise<{ siteId: string; url: string }> {
  // 1. Create or reuse a site
  let siteId = existingSiteId;
  if (!siteId) {
    const siteRes = await fetch("https://api.netlify.com/api/v1/sites", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: null }), // auto-generate name
    });
    if (!siteRes.ok) {
      const err = await siteRes.text();
      throw new Error(`Netlify site creation failed: ${err}`);
    }
    const site = await siteRes.json();
    siteId = site.id as string;
  }

  // 2. Build file digest map (sha1 hex of utf-8 content)
  const { createHash } = await import("crypto");
  const fileDigests: Record<string, string> = {};
  const fileContents: Record<string, string> = {};

  for (const file of files) {
    const normalPath = file.path.startsWith("/") ? file.path : `/${file.path}`;
    const sha = createHash("sha1").update(file.content, "utf8").digest("hex");
    fileDigests[normalPath] = sha;
    fileContents[sha] = file.content;
  }

  // 3. Start deploy
  const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ files: fileDigests }),
  });
  if (!deployRes.ok) {
    const err = await deployRes.text();
    throw new Error(`Netlify deploy failed: ${err}`);
  }
  const deploy = await deployRes.json();

  // 4. Upload required files
  const required: string[] = deploy.required ?? [];
  for (const sha of required) {
    const content = fileContents[sha];
    if (!content) continue;
    const uploadRes = await fetch(
      `https://api.netlify.com/api/v1/deploys/${deploy.id}/files/${sha}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
        },
        body: content,
      }
    );
    if (!uploadRes.ok) {
      throw new Error(`Netlify file upload failed for sha ${sha}`);
    }
  }

  return {
    siteId: siteId!,
    url: `https://${deploy.subdomain}.netlify.app`,
  };
}

// ── Vercel helpers ─────────────────────────────────────────────────────────────

async function deployToVercel(
  token: string,
  files: { path: string; content: string }[],
  existingProjectId?: string
): Promise<{ projectId: string; url: string }> {
  // 1. Create project if needed
  let projectId = existingProjectId;
  if (!projectId) {
    const projRes = await fetch("https://api.vercel.com/v9/projects", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: `deepsite-${Date.now()}`, framework: null }),
    });
    if (!projRes.ok) {
      const err = await projRes.text();
      throw new Error(`Vercel project creation failed: ${err}`);
    }
    const proj = await projRes.json();
    projectId = proj.id as string;
  }

  // 2. Create deployment
  const deployFiles = files.map((f) => ({
    file: f.path.startsWith("/") ? f.path.slice(1) : f.path,
    data: f.content,
    encoding: "utf-8",
  }));

  const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `deepsite-${Date.now()}`,
      project: projectId,
      files: deployFiles,
      target: "production",
    }),
  });

  if (!deployRes.ok) {
    const err = await deployRes.text();
    throw new Error(`Vercel deployment failed: ${err}`);
  }

  const deploy = await deployRes.json();

  return {
    projectId: projectId!,
    url: `https://${deploy.url}`,
  };
}

// ── Main route ─────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username = session.user.username;
  const body = await request.json();
  const { provider, repoId } = body as { provider: "netlify" | "vercel"; repoId: string };

  if (!provider || !["netlify", "vercel"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider. Use 'netlify' or 'vercel'" }, { status: 400 });
  }
  if (!repoId) {
    return NextResponse.json({ error: "repoId is required" }, { status: 400 });
  }

  try {
    await dbConnect();

    // Get user token
    const settings = await UserSettings.findOne({ username });
    const token = provider === "netlify" ? settings?.netlifyToken : settings?.vercelToken;
    if (!token) {
      return NextResponse.json(
        { error: `No ${provider} token found. Please add your token in Deploy settings.` },
        { status: 400 }
      );
    }

    // Get project files from MongoDB draft
    const project = await Project.findOne({ repoId, owner: username });
    if (!project || !project.files || project.files.length === 0) {
      return NextResponse.json(
        { error: "No project files found. Make sure the project has been generated." },
        { status: 404 }
      );
    }

    const files = project.files.map((f: { path: string; content: string }) => ({
      path: f.path,
      content: f.content,
    }));

    let result: { siteId?: string; projectId?: string; url: string };

    if (provider === "netlify") {
      const existingSiteId = project.netlifyDeploy?.siteId;
      const { siteId, url } = await deployToNetlify(token, files, existingSiteId);
      result = { siteId, url };

      await Project.findOneAndUpdate(
        { repoId, owner: username },
        { $set: { netlifyDeploy: { siteId, url } } }
      );
    } else {
      const existingProjectId = project.vercelDeploy?.projectId;
      const { projectId, url } = await deployToVercel(token, files, existingProjectId);
      result = { projectId, url };

      await Project.findOneAndUpdate(
        { repoId, owner: username },
        { $set: { vercelDeploy: { projectId, url } } }
      );
    }

    return NextResponse.json({ success: true, url: result.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Deployment failed";
    console.error(`[deploy/${provider}] Error:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
