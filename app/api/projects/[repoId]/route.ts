import { auth } from "@/lib/auth";
import { RepoDesignation, deleteRepo, uploadFiles } from "@huggingface/hub";
import { format } from "date-fns";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/lib/models/Project";

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
  const { files, prompt, isManualChanges } = body;

  if (!files) {
    return NextResponse.json({ error: "Files are required" }, { status: 400 });
  }

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const repo: RepoDesignation = {
    type: "space",
    name: session.user?.username + "/" + repoId,
  };

  const filesToUpload: File[] = [];
  for (const file of files) {
    let mimeType = "text/x-python";
    if (file.path.endsWith(".txt")) {
      mimeType = "text/plain";
    } else if (file.path.endsWith(".md")) {
      mimeType = "text/markdown";
    } else if (file.path.endsWith(".json")) {
      mimeType = "application/json";
    }
    filesToUpload.push(new File([file.content], file.path, { type: mimeType }));
  }
  // Escape commit title to prevent injection
  const escapeCommitTitle = (title: string): string => {
    return title.replace(/[\r\n]/g, " ").slice(0, 200);
  };

  const baseTitle = isManualChanges
    ? ""
    : `🐳 ${format(new Date(), "dd/MM")} - ${format(new Date(), "HH:mm")} - `;
  const commitTitle = escapeCommitTitle(
    baseTitle + (prompt ?? "Follow-up DeepSite commit")
  );
  const response = await uploadFiles({
    repo,
    files: filesToUpload,
    accessToken: token,
    commitTitle,
  });

  return NextResponse.json(
    {
      success: true,
      commit: {
        oid: response.commit,
        title: commitTitle,
        date: new Date(),
      },
    },
    { status: 200 }
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ repoId: string }> }
) {
  const { repoId }: { repoId: string } = await params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = session.accessToken;

  const repo: RepoDesignation = {
    type: "space",
    name: session.user?.username + "/" + repoId,
  };

  try {
    // 1. Delete from local MongoDB (Offline Drafts)
    let deletedFromMongo = false;
    try {
      await dbConnect();
      const result = await Project.deleteOne({ owner: session.user.username, name: decodeURIComponent(repoId) });
      if (result.deletedCount > 0) {
        deletedFromMongo = true;
      }
    } catch (dbError) {
      console.error("Failed to delete from MongoDB:", dbError);
    }

    // 2. Try deleting from Hugging Face (Deployed Spaces)
    let deletedFromHF = false;
    try {
      await deleteRepo({
        repo,
        accessToken: token as string,
      });
      deletedFromHF = true;
    } catch (hfError) {
      console.error("Failed to delete from HF:", hfError);
    }

    if (deletedFromMongo || deletedFromHF) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Project not found or could not be deleted" }, { status: 404 });
    }
  } catch (error) {
    const errMsg =
      error instanceof Error ? error.message : "Failed to delete project";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
