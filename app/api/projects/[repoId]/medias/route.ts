import { auth } from "@/lib/auth";
import { RepoDesignation, uploadFiles } from "@huggingface/hub";
import { NextResponse } from "next/server";

export async function POST(
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

  const formData = await request.formData();
  const newMedias = formData.getAll("images") as File[];

  const filesToUpload: File[] = [];

  if (!newMedias || newMedias.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "At least one media file is required under the 'images' key",
      },
      { status: 400 }
    );
  }

  try {
    for (const media of newMedias) {
      const isImage = media.type.startsWith("image/");
      const isVideo = media.type.startsWith("video/");
      const isAudio = media.type.startsWith("audio/");

      const folderPath = isImage
        ? "images/"
        : isVideo
        ? "videos/"
        : isAudio
        ? "audios/"
        : null;

      if (!folderPath) {
        return NextResponse.json(
          { ok: false, error: "Unsupported media type: " + media.type },
          { status: 400 }
        );
      }

      const mediaName = `${folderPath}${media.name}`;
      const processedFile = new File([media], mediaName, { type: media.type });
      filesToUpload.push(processedFile);
    }

    await uploadFiles({
      repo,
      files: filesToUpload,
      accessToken: token,
      commitTitle: `📁 Upload media files through DeepSite`,
    });

    return NextResponse.json(
      {
        success: true,
        medias: filesToUpload.map(
          (file) =>
            `https://huggingface.co/spaces/${session.user?.username}/${repoId}/resolve/main/${file.name}`
        ),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error ?? "Failed to upload media files" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
