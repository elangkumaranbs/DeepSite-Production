import { auth } from "@/lib/auth";
import { downloadFile, RepoDesignation, uploadFile } from "@huggingface/hub";
import { format } from "date-fns";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ repoId: string }> }
) {
  const { repoId }: { repoId: string } = await params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = session.accessToken;

  const body = await request.json();
  const { newTitle } = body;

  if (!newTitle) {
    return NextResponse.json(
      { error: "newTitle is required" },
      { status: 400 }
    );
  }

  const repo: RepoDesignation = {
    type: "space",
    name: session.user?.username + "/" + repoId,
  };

  const blob = await downloadFile({
    repo,
    accessToken: token,
    path: "README.md",
    raw: true,
  }).catch((_) => {
    return null;
  });

  if (!blob) {
    return NextResponse.json(
      { error: "Could not fetch README.md" },
      { status: 500 }
    );
  }

  const readmeFile = await blob?.text();
  if (!readmeFile) {
    return NextResponse.json(
      { error: "Could not read README.md content" },
      { status: 500 }
    );
  }

  // Escape YAML values to prevent injection attacks
  const escapeYamlValue = (value: string): string => {
    if (/[:|>]|^[-*#]|^\s|['"]/.test(value) || value.includes("\n")) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  };

  // Escape commit message to prevent injection
  const escapeCommitMessage = (message: string): string => {
    return message.replace(/[\r\n]/g, " ").slice(0, 200);
  };

  const updatedReadmeFile = readmeFile.replace(
    /^title:\s*(.*)$/m,
    `title: ${escapeYamlValue(newTitle)}`
  );

  await uploadFile({
    repo,
    accessToken: token,
    file: new File([updatedReadmeFile], "README.md", { type: "text/markdown" }),
    commitTitle: escapeCommitMessage(
      `🐳 ${format(new Date(), "dd/MM")} - ${format(
        new Date(),
        "HH:mm"
      )} - Rename project to "${newTitle}"`
    ),
  });

  return NextResponse.json(
    {
      success: true,
    },
    { status: 200 }
  );
}
