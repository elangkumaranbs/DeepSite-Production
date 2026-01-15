import { NextResponse } from "next/server";
import { RepoDesignation, createRepo, uploadFiles } from "@huggingface/hub";

import { auth } from "@/lib/auth";
import {
  COLORS,
  EMOJIS_FOR_SPACE,
  injectDeepSiteBadge,
  isIndexPage,
} from "@/lib/utils";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = session.accessToken;

  const body = await request.json();
  const { projectTitle, files, prompt } = body;

  if (!files) {
    return NextResponse.json(
      { error: "Project title and files are required" },
      { status: 400 }
    );
  }

  const title =
    projectTitle || projectTitle !== "" ? projectTitle : "DeepSite Project";

  let formattedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .split("-")
    .filter(Boolean)
    .join("-")
    .slice(0, 75);

  formattedTitle =
    formattedTitle + "-" + Math.random().toString(36).substring(2, 7);

  const repo: RepoDesignation = {
    type: "space",
    name: session.user?.username + "/" + formattedTitle,
  };

  // Escape YAML values to prevent injection attacks
  const escapeYamlValue = (value: string): string => {
    if (/[:|>]|^[-*#]|^\s|['"]/.test(value) || value.includes("\n")) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  };

  // Escape markdown headers to prevent injection
  const escapeMarkdownHeader = (value: string): string => {
    return value.replace(/^#+\s*/g, "").replace(/\n/g, " ");
  };

  const colorFrom = COLORS[Math.floor(Math.random() * COLORS.length)];
  const colorTo = COLORS[Math.floor(Math.random() * COLORS.length)];
  const emoji =
    EMOJIS_FOR_SPACE[Math.floor(Math.random() * EMOJIS_FOR_SPACE.length)];
  const README = `---
title: ${escapeYamlValue(projectTitle)}
colorFrom: ${colorFrom}
colorTo: ${colorTo}
sdk: static
emoji: ${emoji}
tags:
  - deepsite-v4
---

# ${escapeMarkdownHeader(title)}

This project has been created with [DeepSite](https://huggingface.co/deepsite) AI Vibe Coding.
`;

  const filesToUpload: File[] = [
    new File([README], "README.md", { type: "text/markdown" }),
  ];
  for (const file of files) {
    let mimeType = "text/html";
    if (file.path.endsWith(".css")) {
      mimeType = "text/css";
    } else if (file.path.endsWith(".js")) {
      mimeType = "text/javascript";
    }
    const content =
      mimeType === "text/html" && isIndexPage(file.path)
        ? injectDeepSiteBadge(file.content)
        : file.content;

    filesToUpload.push(new File([content], file.path, { type: mimeType }));
  }

  try {
    const { repoUrl } = await createRepo({
      accessToken: token as string,
      repo: repo,
      sdk: "static",
    });

    // Escape commit title to prevent injection
    const escapeCommitTitle = (title: string): string => {
      return title.replace(/[\r\n]/g, " ").slice(0, 200);
    };
    const commitTitle = escapeCommitTitle(prompt ?? "Initial DeepSite commit");
    await uploadFiles({
      repo,
      files: filesToUpload,
      accessToken: token as string,
      commitTitle,
    });

    const path = repoUrl.split("/").slice(-2).join("/");

    return NextResponse.json({ repoUrl: path }, { status: 200 });
  } catch (error) {
    const errMsg =
      error instanceof Error ? error.message : "Failed to upload files";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
