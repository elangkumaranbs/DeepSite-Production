import {
  END_FILE_CONTENT,
  END_PROJECT_NAME,
  START_FILE_CONTENT,
  START_PROJECT_NAME,
  SEARCH_START,
  DIVIDER,
  REPLACE_END,
} from "./prompts";
import { File } from "./type";

// todo: the Editing stuffs in message doesnt show when it"s a SEARCH and REPLACE operation, I mean it shows it but only at the end of the message, not during the generation. fix that.

/**
 * Validates that a filename has an extension.
 * Returns the filename if valid, null otherwise.
 * Allows dotfiles (like .gitignore) and regular files with extensions (like app.py).
 */
const validateFilename = (filename: string): string | null => {
  if (!filename) return null;

  const trimmed = filename.trim();
  if (!trimmed) return null;

  // Find the last dot in the filename
  const lastDotIndex = trimmed.lastIndexOf(".");

  // No dot found - invalid (no extension)
  if (lastDotIndex === -1) return null;

  // Dot at the end - invalid (no extension after dot)
  if (lastDotIndex === trimmed.length - 1) return null;

  // Dot at the start - this is a dotfile (like .gitignore), which is valid
  // Dot in the middle - this is a regular file with extension (like app.py), which is valid
  // Both cases are acceptable as long as there's something after the dot

  return trimmed;
};

/**
 * Check if the end of a string contains a partial match of a target string
 */
const hasPartialMarkerAtEnd = (text: string, marker: string): number => {
  // Check for partial matches starting from length 3 (to avoid false positives with common substrings)
  for (
    let len = Math.max(3, Math.floor(marker.length / 2));
    len < marker.length;
    len++
  ) {
    const partialMarker = marker.substring(0, len);
    if (text.endsWith(partialMarker)) {
      return len; // Return the length of the partial match
    }
  }
  return 0; // No partial match found
};

/**
 * Extract message content by removing all special markers and their content
 */
const extractMessageContent = (message: string): string => {
  let result = message;

  // Remove all complete START_FILE_CONTENT...END_FILE_CONTENT blocks
  const fileContentRegex = new RegExp(
    `${START_FILE_CONTENT}[\\s\\S]*?${END_FILE_CONTENT}`,
    "g"
  );
  result = result.replace(fileContentRegex, "");

  // Remove incomplete START_FILE_CONTENT blocks (streaming - no END_FILE_CONTENT yet)
  const incompleteFileIndex = result.indexOf(START_FILE_CONTENT);
  if (incompleteFileIndex !== -1) {
    result = result.substring(0, incompleteFileIndex);
  }

  // Remove all complete START_PROJECT_NAME...END_PROJECT_NAME blocks
  const projectNameRegex = new RegExp(
    `${START_PROJECT_NAME}[\\s\\S]*?${END_PROJECT_NAME}`,
    "g"
  );
  result = result.replace(projectNameRegex, "");

  // Remove incomplete START_PROJECT_NAME blocks (streaming - no END_PROJECT_NAME yet)
  const incompleteProjectIndex = result.indexOf(START_PROJECT_NAME);
  if (incompleteProjectIndex !== -1) {
    result = result.substring(0, incompleteProjectIndex);
  }

  // Remove all complete SEARCH_START...REPLACE_END blocks
  const searchReplaceRegex = new RegExp(
    `${SEARCH_START}[\\s\\S]*?${REPLACE_END}`,
    "g"
  );
  result = result.replace(searchReplaceRegex, "");

  // Remove incomplete SEARCH_START blocks (streaming - no REPLACE_END yet)
  const incompleteSearchIndex = result.indexOf(SEARCH_START);
  if (incompleteSearchIndex !== -1) {
    result = result.substring(0, incompleteSearchIndex);
  }

  // Handle incomplete/partial markers at the end (for streaming)
  // This is critical to prevent showing marker text to users during streaming
  const markers = [START_FILE_CONTENT, START_PROJECT_NAME, SEARCH_START];

  for (const marker of markers) {
    const partialLength = hasPartialMarkerAtEnd(result, marker);
    if (partialLength > 0) {
      result = result.substring(0, result.length - partialLength);
      break; // Only one marker can be at the end
    }
  }

  // Clean up extra whitespace
  return result.trim();
};

export const formatResponse = (message: string, currentFiles: File[]) => {
  // Track which files have been created or modified
  const modifiedFiles = new Map<string, File>();

  // Extract message content (everything outside special markers)
  const messageContent = extractMessageContent(message);

  // Extract project title
  let projectTitle =
    message.split(START_PROJECT_NAME)[1]?.split(END_PROJECT_NAME)[0]?.trim() ??
    "";

  // Handle partial project title markers
  if (projectTitle && !message.includes(END_PROJECT_NAME)) {
    for (let i = END_PROJECT_NAME.length - 1; i > 0; i--) {
      const partialMarker = END_PROJECT_NAME.substring(0, i);
      if (projectTitle.endsWith(partialMarker)) {
        projectTitle = projectTitle
          .substring(0, projectTitle.length - partialMarker.length)
          .trim();
        break;
      }
    }
  }

  if (message.includes(SEARCH_START)) {
    const searchSections = message.split(SEARCH_START).slice(1);

    for (
      let sectionIndex = 0;
      sectionIndex < searchSections.length;
      sectionIndex++
    ) {
      const section = searchSections[sectionIndex];
      const isLastSection = sectionIndex === searchSections.length - 1;

      // Check if this section has a complete REPLACE_END marker
      const hasReplaceEnd = section.includes(REPLACE_END);

      // For incomplete sections (last section without REPLACE_END), skip processing
      // to avoid applying partial replacements that corrupt the file
      if (isLastSection && !hasReplaceEnd) {
        continue;
      }

      const searchPart = section.split(REPLACE_END)[0];
      if (!searchPart) continue;

      const dividerIndex = searchPart.indexOf(DIVIDER);
      if (dividerIndex === -1) continue;

      const searchContent = searchPart.substring(0, dividerIndex);
      const replaceContent = searchPart.substring(
        dividerIndex + DIVIDER.length
      );

      if (!searchContent || !replaceContent) continue;

      // Extract filename from the first line (same line as SEARCH_START)
      const firstNewlineIndex = searchContent.indexOf("\n");
      let filename = "";
      let searchContentAfterFilename = searchContent;

      if (firstNewlineIndex !== -1) {
        // Filename is on the first line (same line as SEARCH_START marker)
        filename = searchContent.substring(0, firstNewlineIndex).trim();
        searchContentAfterFilename = searchContent.substring(
          firstNewlineIndex + 1
        );
      } else {
        // No newline found, entire content might be just the filename
        filename = searchContent.trim();
        searchContentAfterFilename = "";
      }

      // Validate filename has extension
      const validatedFilename = validateFilename(filename);
      if (!validatedFilename) continue;
      filename = validatedFilename;

      const searchCodeStart = searchContentAfterFilename.indexOf("```");
      if (searchCodeStart === -1) continue;

      const searchCodeBlock =
        searchContentAfterFilename.substring(searchCodeStart);
      let searchMatch = searchCodeBlock.match(/^```[\w]*\n?([\s\S]*?)```/);
      if (!searchMatch) {
        searchMatch = searchCodeBlock.match(/^```[\w]*\n?([\s\S]*)/);
      }
      if (!searchMatch) continue;

      const searchText = searchMatch[1].trim();

      const replaceCodeStart = replaceContent.indexOf("```");
      if (replaceCodeStart === -1) continue;

      const replaceCodeBlock = replaceContent.substring(replaceCodeStart);
      let replaceMatch = replaceCodeBlock.match(/^```[\w]*\n?([\s\S]*?)```/);
      if (!replaceMatch) {
        replaceMatch = replaceCodeBlock.match(/^```[\w]*\n?([\s\S]*)/);
      }
      if (!replaceMatch) continue;

      let replaceText = replaceMatch[1];
      for (let i = 1; i < 3; i++) {
        const partialClosing = "`".repeat(i);
        if (replaceText.endsWith(partialClosing)) {
          replaceText = replaceText.substring(0, replaceText.length - i);
          break;
        }
      }
      replaceText = replaceText.trim();

      // First check if we already have a modified version of this file in the current operation
      const existingModifiedFile = modifiedFiles.get(filename);
      const fileToModify =
        existingModifiedFile || currentFiles.find((f) => f.path === filename);

      if (fileToModify && fileToModify.content) {
        const newContent = fileToModify.content.replace(
          searchText,
          replaceText
        );
        if (newContent !== fileToModify.content) {
          modifiedFiles.set(filename, { path: filename, content: newContent });
        }
      } else if (!fileToModify) {
        modifiedFiles.set(filename, { path: filename, content: replaceText });
      }
    }
  }

  // Handle new file creation blocks
  if (message.includes(START_FILE_CONTENT)) {
    const fileSections = message.split(START_FILE_CONTENT).slice(1);

    for (const section of fileSections) {
      const rawContent = section.split(END_FILE_CONTENT)[0] || "";

      // Extract filename - it's on the same line as START_FILE_CONTENT (before first newline)
      const firstNewlineIndex = rawContent.indexOf("\n");
      let path = "";
      let contentAfterFilename = rawContent;

      if (firstNewlineIndex !== -1) {
        // Filename is before the first newline (same line as START_FILE_CONTENT marker)
        path = rawContent.substring(0, firstNewlineIndex).trim();
        contentAfterFilename = rawContent.substring(firstNewlineIndex + 1);
      } else {
        // No newline found, entire content might be just the filename
        path = rawContent.trim();
        contentAfterFilename = "";
      }

      // Validate that path has an extension
      const validatedPath = validateFilename(path);
      if (!validatedPath) continue;
      path = validatedPath;

      // Find code block
      const codeBlockStart = contentAfterFilename.indexOf("```");

      if (codeBlockStart === -1) {
        // No code block, use raw content after filename
        const content = contentAfterFilename.trim();
        if (content || !currentFiles.find((f) => f.path === path)) {
          // Always add files from the message
          modifiedFiles.set(path, { path, content });
        }
      } else {
        // Has code block - extract content between ``` markers
        const afterCodeBlockStart =
          contentAfterFilename.substring(codeBlockStart);

        // Try to match complete code block first
        const completeMatch = afterCodeBlockStart.match(
          /^```[\w]*\n?([\s\S]*?)```/
        );

        if (completeMatch) {
          const content = completeMatch[1].trim();
          modifiedFiles.set(path, { path, content });
        } else {
          // Incomplete code block (streaming) - match everything after opening ```
          const incompleteMatch = afterCodeBlockStart.match(
            /^```[\w]*\n?([\s\S]*)/
          );
          if (incompleteMatch) {
            let content = incompleteMatch[1];
            // Remove trailing partial closing marker if present
            for (let i = 1; i < 3; i++) {
              const partialClosing = "`".repeat(i);
              if (content.endsWith(partialClosing)) {
                content = content.substring(0, content.length - i);
                break;
              }
            }
            content = content.trim();
            modifiedFiles.set(path, { path, content });
          }
        }
      }
    }
  }

  // Convert modified files map to array
  const files = Array.from(modifiedFiles.values())?.filter(
    (file) => file.path !== "README.md"
  );

  return {
    messageContent,
    files,
    projectTitle,
  };
};
