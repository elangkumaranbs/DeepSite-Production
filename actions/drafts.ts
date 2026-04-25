"use server";

import dbConnect from "@/lib/mongodb";
import Project, { IFile } from "@/lib/models/Project";
import { auth } from "@/lib/auth";

export async function saveDraft({
  name,
  files,
  prompt,
  repoId,
}: {
  name: string;
  files: IFile[];
  prompt?: string;
  repoId?: string;
}) {
  const session = await auth();
  if (!session?.user?.username) {
    throw new Error("Unauthorized");
  }

  await dbConnect();

  try {
    const project = await Project.findOneAndUpdate(
      { name, owner: session.user.username },
      {
        files,
        prompt,
        lastModified: new Date(),
        isDraft: true,
        repoId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return { success: true, project: JSON.parse(JSON.stringify(project)) };
  } catch (error: any) {
    console.error("Failed to save draft:", error);
    return { success: false, error: error.message };
  }
}

export async function getDraft(name: string) {
  const session = await auth();
  if (!session?.user?.username) {
    return null;
  }

  await dbConnect();

  try {
    const project = await Project.findOne({
      name,
      owner: session.user.username,
    });

    if (!project) return null;

    return JSON.parse(JSON.stringify(project));
  } catch (error) {
    console.error("Failed to get draft:", error);
    return null;
  }
}
