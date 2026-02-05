import { auth } from "@/lib/auth";
import { downloadFile, listFiles, RepoDesignation } from "@huggingface/hub";
import { NextResponse } from "next/server";
import JSZip from "jszip";

export async function GET(
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
    const zip = new JSZip();
    for await (const fileInfo of listFiles({ 
      repo, 
      accessToken: token as string, 
      recursive: true,
    })) {
      if (fileInfo.type === "directory" || fileInfo.path.startsWith(".")) {
        continue;
      }

      try {
        const blob = await downloadFile({ 
          repo, 
          accessToken: token as string, 
          path: fileInfo.path, 
          raw: true 
        }).catch((error) => {
          return null;
        });
        if (!blob) {
          continue;
        }

        if (blob) {
          const arrayBuffer = await blob.arrayBuffer();
          zip.file(fileInfo.path, arrayBuffer);
        }
      } catch (error) {
        console.error(`Error downloading file ${fileInfo.path}:`, error);
      }
    }

    const zipBlob = await zip.generateAsync({ 
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6
      }
    });

    const projectName = `${session.user?.username}-${repoId}`.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${projectName}.zip`;

    return new NextResponse(zipBlob, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": zipBlob.size.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading project:", error);
    return NextResponse.json({ error: "Failed to download project" }, { status: 500 });
  }
}