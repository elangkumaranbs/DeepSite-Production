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
}

const IGNORED_PATHS = ["README.md", ".gitignore", ".gitattributes"];

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
      owner: "enzostvs",
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
    const params = { repo, accessToken: token };
    if (commitId) {
      Object.assign(params, { revision: commitId });
    }
    for await (const fileInfo of listFiles(params)) {
      if (IGNORED_PATHS.includes(fileInfo.path)) continue;
      if (
        fileInfo.path.endsWith(".html") ||
        fileInfo.path.endsWith(".css") ||
        fileInfo.path.endsWith(".js") ||
        fileInfo.path.endsWith(".json")
      ) {
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
      if (fileInfo.type === "directory") {
        for await (const subFile of listFiles({
          repo,
          accessToken: token,
          path: fileInfo.path,
        })) {
          if (
            subFile.path.endsWith(".html") ||
            subFile.path.endsWith(".css") ||
            subFile.path.endsWith(".js") ||
            subFile.path.endsWith(".json")
          ) {
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
        }
      }
    }
    const commits: Commit[] = [];
    const commitIterator = listCommits({ repo, accessToken: token });
    for await (const commit of commitIterator) {
      if (commit.title?.toLowerCase() === "initial commit") continue;
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

    return { project, files };
  } catch (error) {
    return {
      project: null,
      files: [],
    };
  }
};
