import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { File } from "./type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ALLOWED_DOMAINS = [
  "huggingface.co",
  "deepsite.hf.co",
  "localhost",
  "enzostvs-deepsite-v4-demo.hf.space",
];

export const COLORS = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "pink",
  "gray",
];
export const EMOJIS_FOR_SPACE = [
  "🚀",
  "🔥",
  "✨",
  "💡",
  "🤖",
  "🌟",
  "🎉",
  "💎",
  "⚡",
  "🎨",
  "🧠",
  "📦",
  "🛠️",
  "🚧",
  "🌈",
  "📚",
  "🧩",
  "🔧",
  "🖥️",
  "📱",
];

export const getMentionsFromPrompt = async (prompt: string) => {
  const mentions = prompt.match(/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+/g);
  const validMentions = await Promise.all(
    mentions?.map(async (mention) => {
      let type = "model";
      let response = await fetch(
        `https://huggingface.co/api/models/${mention}`
      );
      if (!response.ok) {
        type = "dataset";
        response = await fetch(
          `https://huggingface.co/api/datasets/${mention}`
        );
        if (!response.ok) {
          return null;
        }
      }
      const readme = await fetch(
        `https://huggingface.co/${
          type === "model" ? "" : "datasets/"
        }${mention}/raw/main/README.md`
      );
      const readmeContent = await readme.text();

      const data = await response.json();
      return {
        library_name: data?.library_name ?? data?.cardData?.library_name,
        pipeline_tag: data?.pipeline_tag ?? data?.cardData?.pipeline_tag,
        model_id: data.id,
        readme: readmeContent ?? "",
      };
    }) ?? []
  );
  return validMentions?.filter((mention) => mention !== null) ?? [];
};
export const getContextFilesFromPrompt = async (
  prompt: string,
  currentFiles: File[]
) => {
  const mentions = prompt.match(/file:\/[a-zA-Z0-9-_.\/]+/g);
  const filesToUseAsContext: File[] = [];
  if (currentFiles.length === 0) return currentFiles;
  if (!mentions || mentions.length === 0) return currentFiles;
  mentions?.forEach((mention) => {
    const filePath = mention.replace("file:/", "");
    const matchedFile = currentFiles.find((file) => file.path === filePath);
    if (matchedFile) {
      filesToUseAsContext.push(matchedFile);
    }
  });
  return filesToUseAsContext;
};

export const defaultHTML = `<!DOCTYPE html>
<html>
  <head>
    <title>My app</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="utf-8">
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="flex justify-center items-center h-screen overflow-hidden bg-white dark:bg-neutral-950 font-sans text-center px-6">
    <div class="w-full">
      <span class="text-xs rounded-full mb-4 inline-block px-2 py-1 border border-indigo-500/15 bg-indigo-500/15 text-indigo-500">
        🔥 DeepSite v4: New version dropped!
      </span>
      <h1 class="text-4xl lg:text-6xl font-bold font-sans dark:text-white">
        <span class="text-2xl lg:text-4xl text-gray-400 dark:text-neutral-500 block font-medium">
         I'm ready to develop,
        </span>
        Ask me anything.
      </h1>
    </div>
      <img src="https://deepsite.hf.co/arrow.svg" class="absolute bottom-8 left-0 w-[100px] transform rotate-30 dark:invert dark:brightness-0" />
    <script></script>
  </body>
</html>
`;

export function injectDeepSiteBadge(html: string): string {
  const badgeScript =
    '<script src="https://deepsite.hf.co/deepsite-badge.js"></script>';

  // Remove any existing badge script to avoid duplicates
  const cleanedHtml = html.replace(
    /<script\s+src=["']https:\/\/deepsite\.hf\.co\/deepsite-badge\.js["']\s*><\/script>\s*/gi,
    ""
  );

  // Check if there's a closing body tag
  const bodyCloseIndex = cleanedHtml.lastIndexOf("</body>");

  if (bodyCloseIndex !== -1) {
    // Inject the script before the closing </body> tag
    return (
      cleanedHtml.slice(0, bodyCloseIndex) +
      badgeScript +
      "\n" +
      cleanedHtml.slice(bodyCloseIndex)
    );
  }

  // If no closing body tag, append the script at the end
  return cleanedHtml + "\n" + badgeScript;
}

export function isIndexPage(path: string): boolean {
  const normalizedPath = path.toLowerCase();
  return (
    normalizedPath === "/" ||
    normalizedPath === "index" ||
    normalizedPath === "/index" ||
    normalizedPath === "index.html" ||
    normalizedPath === "/index.html"
  );
}

export const humanizeNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M+";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K+";
  }
  return num.toString();
};

export const getFileType = (url: string) => {
  if (typeof url !== "string") {
    return "unknown";
  }
  const extension = url.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")) {
    return "image";
  } else if (["mp4", "webm", "ogg", "avi", "mov"].includes(extension || "")) {
    return "video";
  } else if (["mp3", "wav", "ogg", "aac", "m4a"].includes(extension || "")) {
    return "audio";
  }
  return "unknown";
};
export const DISCORD_URL = "https://discord.gg/KpanwM3vXa";
