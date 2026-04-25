"use server";
import {
  downloadFile,
  listCommits,
  listFiles,
  listSpaces,
  RepoDesignation,
  SpaceEntry,
  spaceInfo,
} from "@huggingface/hub";

import { auth } from "@/lib/auth";
import { Commit, File } from "@/lib/type";
import dbConnect from "@/lib/mongodb";
import Project from "@/lib/models/Project";

export interface ProjectWithCommits extends SpaceEntry {
  commits?: Commit[];
  medias?: string[];
}

const IGNORED_PATHS = ["README.md", ".gitignore", ".gitattributes"];
const IGNORED_FORMATS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".mp4",
  ".mp3",
  ".wav",
];

export const getProjects = async () => {
  const projects: SpaceEntry[] = [];
  const session = await auth();
  if (!session?.user) {
    return projects;
  }
  const token = session.accessToken;

  // 1. Fetch from MongoDB (Offline Drafts)
  try {
    await dbConnect();
    const localProjects = await Project.find({ owner: session.user.username })
      .sort({ lastModified: -1 })
      .lean();

    for (const lp of localProjects) {
      projects.push({
        id: `${session.user.username}/${lp.name}`,
        name: `${session.user.username}/${lp.name}`,
        author: session.user.username,
        lastModified: lp.lastModified,
        updatedAt: lp.lastModified,
        private: true,
        sdk: "static",
        likes: 0,
        cardData: {
          title: lp.name,
          emoji: lp.brandKit?.primaryColor ? "🎨" : "📝",
          tags: ["deepsite"],
        },
      } as unknown as SpaceEntry);
    }
  } catch (error) {
    console.error("Failed to fetch local projects:", error);
  }

  // 2. Fetch from Hugging Face (Deployed Spaces)
  try {
    for await (const space of listSpaces({
      accessToken: token,
      additionalFields: ["author", "cardData"],
      search: {
        owner: session.user.username,
      },
    })) {
      if (
        space.sdk === "static" &&
        Array.isArray((space.cardData as { tags?: string[] })?.tags) &&
        (space.cardData as { tags?: string[] })?.tags?.some((tag) =>
          tag.includes("deepsite")
        )
      ) {
        // Only push if not already loaded from MongoDB to avoid duplicates
        const exists = projects.find((p) => p.name === space.name);
        if (!exists) {
          projects.push(space);
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch HF projects:", error);
  }

  return projects;
};

export const getProject = async (id: string, commitId?: string) => {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  const token = session.accessToken;

  // 1. Check MongoDB first (Offline Drafts)
  try {
    await dbConnect();
    const owner = decodeURIComponent(id.split("/")[0]);
    const repoName = decodeURIComponent(id.split("/").slice(1).join("/"));

    const localProject = await Project.findOne({ owner, name: repoName }).lean();
    if (localProject) {
      const project: ProjectWithCommits = {
        id: id,
        name: id,
        author: owner,
        lastModified: localProject.lastModified,
        updatedAt: localProject.lastModified,
        private: true,
        sdk: "static",
        likes: 0,
        commits: [],
        medias: [],
        cardData: {
          title: localProject.name,
          emoji: localProject.brandKit?.primaryColor ? "🎨" : "📝",
        },
      } as unknown as ProjectWithCommits;

      const files: File[] = (localProject.files || []).map((f: any) => ({
        path: f.path,
        content: f.content,
      }));

      // Sort index.html to the top
      const sortedFiles = files.sort((a, b) => {
        if (a.path === "index.html") return -1;
        if (b.path === "index.html") return 1;
        return a.path.localeCompare(b.path);
      });

      return { project, files: sortedFiles };
    }
  } catch (error) {
    console.error("Failed to fetch local project:", error);
  }

  // 2. Fall back to Hugging Face
  try {
    const project: ProjectWithCommits | null = await spaceInfo({
      name: id,
      accessToken: token,
      additionalFields: ["author", "cardData"],
    });
    const repo: RepoDesignation = {
      type: "space",
      name: id,
    };
    const files: File[] = [];
    const medias: string[] = [];
    const params = { repo, accessToken: token };
    if (commitId) {
      Object.assign(params, { revision: commitId });
    }
    for await (const fileInfo of listFiles(params)) {
      if (IGNORED_PATHS.includes(fileInfo.path)) continue;
      if (IGNORED_FORMATS.some((format) => fileInfo.path.endsWith(format))) {
        medias.push(
          `https://huggingface.co/spaces/${id}/resolve/main/${fileInfo.path}`
        );
        continue;
      }

      if (fileInfo.type === "directory") {
        for await (const subFile of listFiles({
          repo,
          accessToken: token,
          path: fileInfo.path,
        })) {
          if (IGNORED_FORMATS.some((format) => subFile.path.endsWith(format))) {
            medias.push(
              `https://huggingface.co/spaces/${id}/resolve/main/${subFile.path}`
            );
          }
          const blob = await downloadFile({
            repo,
            accessToken: token,
            path: subFile.path,
            raw: true,
            ...(commitId ? { revision: commitId } : {}),
          }).catch((_) => {
            return null;
          });
          if (!blob) {
            continue;
          }
          const html = await blob?.text();
          if (!html) {
            continue;
          }
          files[subFile.path === "index.html" ? "unshift" : "push"]({
            path: subFile.path,
            content: html,
          });
        }
      } else {
        const blob = await downloadFile({
          repo,
          accessToken: token,
          path: fileInfo.path,
          raw: true,
          ...(commitId ? { revision: commitId } : {}),
        }).catch((_) => {
          return null;
        });
        if (!blob) {
          continue;
        }
        const html = await blob?.text();
        if (!html) {
          continue;
        }
        files[fileInfo.path === "index.html" ? "unshift" : "push"]({
          path: fileInfo.path,
          content: html,
        });
      }
    }
    const commits: Commit[] = [];
    const commitIterator = listCommits({ repo, accessToken: token });
    for await (const commit of commitIterator) {
      if (
        commit.title?.toLowerCase() === "initial commit" ||
        commit.title
          ?.toLowerCase()
          ?.includes("upload media files through deepsite")
      )
        continue;
      commits.push({
        title: commit.title,
        oid: commit.oid,
        date: commit.date,
      });
      if (commits.length >= 20) {
        break;
      }
    }

    project.commits = commits;
    project.medias = medias;

    return { project, files };
  } catch (error) {
    return {
      project: null,
      files: [],
    };
  }
};
