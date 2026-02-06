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
      projects.push(space);
    }
  }
  return projects;
};
export const getProject = async (id: string, commitId?: string) => {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  const token = session.accessToken;
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
