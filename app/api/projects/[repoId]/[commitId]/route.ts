import { auth } from "@/lib/auth";
import { createBranch, RepoDesignation } from "@huggingface/hub";
import { format } from "date-fns";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ repoId: string; commitId: string }> }
) {
  const { repoId, commitId }: { repoId: string; commitId: string } =
    await params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = session.accessToken;

  const repo: RepoDesignation = {
    type: "space",
    name: session.user?.username + "/" + repoId,
  };

  const commitTitle = `🔖 ${format(new Date(), "dd/MM")} - ${format(
    new Date(),
    "HH:mm"
  )} - Set commit ${commitId} as default.`;

  await fetch(
    `https://huggingface.co/api/spaces/${session.user?.username}/${repoId}/branch/main`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startingPoint: commitId,
        overwrite: true,
      }),
    }
  ).catch((error) => {
    return NextResponse.json(
      { error: error ?? "Failed to create branch" },
      { status: 500 }
    );
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
