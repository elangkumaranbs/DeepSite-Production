import { useRef, useState, useEffect, RefObject } from "react";
import { useClickAway } from "react-use";
import { useQueryClient } from "@tanstack/react-query";

import { searchFilesMentions } from "@/actions/mentions";
import { File } from "@/lib/type";
import { Braces, FileCode, FileText } from "lucide-react";

export function InputMentions({
  ref,
  prompt,
  files,
  setPrompt,
  redesignMdUrl,
  onSubmit,
  imageLinks,
  setImageLinks,
}: {
  ref: RefObject<HTMLDivElement | null>;
  prompt: string;
  files?: File[] | null;
  redesignMdUrl?: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  imageLinks?: string[];
  setImageLinks?: (links: string[]) => void;
}) {
  const queryClient = useQueryClient();
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [, setMentionSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<File[]>([]);

  useClickAway(dropdownRef, () => {
    setShowMentionDropdown(false);
  });

  const isImageUrl = (url: string): boolean => {
    // Check if it's a valid HTTP/HTTPS URL with an image extension
    const imageUrlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
    return imageUrlPattern.test(url);
  };

  const getTextContent = (element: HTMLElement): string => {
    let text = "";
    const childNodes = element.childNodes;

    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent || "";
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.classList.contains("mention-chip")) {
          text += el.getAttribute("data-mention-id") || "";
        } else if (el.classList.contains("image-chip")) {
          // Include image URL in text content for display purposes
          const imageUrl = el.getAttribute("data-image-url") || "";
          text += imageUrl ? ` ${imageUrl} ` : "";
        } else {
          text += el.textContent || "";
        }
      }
    }
    return text + "\u0020";
  };

  const extractPromptWithIds = (): string => {
    if (!ref.current) return "";

    let text = "";
    const childNodes = ref.current.childNodes;

    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent || "";
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.classList.contains("mention-chip")) {
          text += el.getAttribute("data-mention-id") || "";
        } else if (el.classList.contains("image-chip")) {
          // Include image URL in prompt text
          const imageUrl = el.getAttribute("data-image-url") || "";
          text += imageUrl ? ` ${imageUrl} ` : "";
        } else {
          text += el.textContent || "";
        }
      }
    }
    return text;
  };

  const extractImageLinks = (): string[] => {
    if (!ref.current) return [];

    const links: string[] = [];
    const childNodes = ref.current.childNodes;

    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.classList.contains("image-chip")) {
          const imageUrl = el.getAttribute("data-image-url");
          if (imageUrl) links.push(imageUrl);
        }
      }
    }
    return links;
  };

  const shouldDetectMention = (): {
    detect: boolean;
    textBeforeCursor: string;
  } => {
    const selection = window.getSelection();
    if (!selection || !ref.current) {
      return { detect: false, textBeforeCursor: "" };
    }

    const range = selection.getRangeAt(0);
    const node = range.startContainer;

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      if (element.classList?.contains("mention-chip")) {
        return { detect: false, textBeforeCursor: "" };
      }
    }

    if (node.parentElement?.classList?.contains("mention-chip")) {
      return { detect: false, textBeforeCursor: "" };
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const textContent = node.textContent || "";
      const cursorOffset = range.startOffset;
      const textBeforeCursor = textContent.substring(0, cursorOffset);

      const lastAtIndex = textBeforeCursor.lastIndexOf("@");
      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        if (!textAfterAt.includes(" ")) {
          return { detect: true, textBeforeCursor: textAfterAt };
        }
      }
    }

    return { detect: false, textBeforeCursor: "" };
  };

  const handleInput = async () => {
    if (!ref.current) return;
    const text = getTextContent(ref.current);
    
    // Only clear if there's no content at all (including chips)
    const hasImageChips = ref.current.querySelectorAll(".image-chip").length > 0;
    const hasMentionChips = ref.current.querySelectorAll(".mention-chip").length > 0;
    
    if (text.trim() === "" && !hasImageChips && !hasMentionChips) {
      ref.current.innerHTML = "";
    }
    
    setPrompt(text);

    // Update image links whenever input changes
    if (setImageLinks) {
      const links = extractImageLinks();
      setImageLinks(links);
    }

    const { detect, textBeforeCursor } = shouldDetectMention();

    if (detect && files && files?.length > 0) {
      setMentionSearch(textBeforeCursor);
      setShowMentionDropdown(true);
      const files = queryClient.getQueryData<File[]>(["files"]) ?? [];
      const results = await searchFilesMentions(textBeforeCursor, files);
      setResults(results);
    } else {
      setShowMentionDropdown(false);
    }
  };

  const createMentionChipElement = (mentionId: string): HTMLSpanElement => {
    const mentionChip = document.createElement("span");

    mentionChip.className =
      "mention-chip inline-flex w-fit items-center justify-center gap-1 font-mono px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400";
    mentionChip.contentEditable = "false";
    mentionChip.setAttribute("data-mention-id", `file:/${mentionId}`);
    mentionChip.textContent = `@${mentionId}`;

    return mentionChip;
  };

  const createImageChipElement = (imageUrl: string): HTMLSpanElement => {
    const imageChip = document.createElement("span");

    imageChip.className =
      "image-chip inline-flex w-fit items-center justify-center gap-1 font-mono px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400";
    imageChip.contentEditable = "false";
    imageChip.setAttribute("data-image-url", imageUrl);

    // Create icon (using emoji for simplicity)
    const icon = document.createElement("span");
    icon.textContent = "🖼️";
    icon.className = "text-[10px]";

    // Truncate URL for display
    const displayUrl =
      imageUrl.length > 30 ? imageUrl.substring(0, 30) + "..." : imageUrl;
    const text = document.createTextNode(displayUrl);

    imageChip.appendChild(icon);
    imageChip.appendChild(text);

    return imageChip;
  };

  const insertMention = (mentionId: string) => {
    if (!ref.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType !== Node.TEXT_NODE) return;

    const textContent = textNode.textContent || "";
    const cursorOffset = range.startOffset;

    const textBeforeCursor = textContent.substring(0, cursorOffset);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const mentionChip = createMentionChipElement(mentionId);

      const beforeText = textContent.substring(0, lastAtIndex);
      const afterText = textContent.substring(cursorOffset);
      const parent = textNode.parentNode;
      if (!parent) return;

      const beforeNode = beforeText
        ? document.createTextNode(beforeText)
        : null;
      const spaceNode = document.createTextNode("\u0020");
      const afterNode = afterText ? document.createTextNode(afterText) : null;

      if (beforeNode) {
        parent.insertBefore(beforeNode, textNode);
      }
      parent.insertBefore(mentionChip, textNode);
      parent.insertBefore(spaceNode, textNode);
      if (afterNode) {
        parent.insertBefore(afterNode, textNode);
      }

      parent.removeChild(textNode);

      const newRange = document.createRange();
      if (afterNode) {
        newRange.setStart(afterNode, 0);
      } else {
        newRange.setStartAfter(spaceNode);
      }
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);

      const newText = getTextContent(ref.current);
      setPrompt(newText);
      setShowMentionDropdown(false);
      setMentionSearch("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!prompt || prompt.trim() === "") return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const promptWithIds = extractPromptWithIds();
      setPrompt(promptWithIds);
      
      if (setImageLinks) {
        const links = extractImageLinks();
        setImageLinks(links);
      }
      
      onSubmit();

      if (ref.current) {
        ref.current.innerHTML = "";
      }
      setPrompt("");
      setShowMentionDropdown(false);
    } else if (e.key === "Escape") {
      setShowMentionDropdown(false);
    }
  };

  useEffect(() => {
    if (ref.current && prompt === "" && ref.current.innerHTML !== "") {
      ref.current.innerHTML = "";
    }
  }, [prompt]);

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !ref.current) {
      document.execCommand("insertText", false, text);
      return;
    }

    const trimmedText = text.trim();
    
    // Check if pasted text is ONLY an image URL
    if (isImageUrl(trimmedText)) {
      const range = selection.getRangeAt(0);
      const imageChip = createImageChipElement(trimmedText);
      const spaceNode = document.createTextNode("\u0020");

      range.deleteContents();
      range.insertNode(imageChip);
      
      // Insert space after the chip
      const afterChipRange = document.createRange();
      afterChipRange.setStartAfter(imageChip);
      afterChipRange.insertNode(spaceNode);

      // Move cursor after the space
      const newRange = document.createRange();
      newRange.setStartAfter(spaceNode);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);

      // Update state
      const newText = getTextContent(ref.current);
      setPrompt(newText);
      
      if (setImageLinks) {
        const links = extractImageLinks();
        setImageLinks(links);
      }
    } else {
      // Check if text contains image URLs
      const imageUrlPattern = /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?[^\s]*)?/gi;
      const containsImageUrl = imageUrlPattern.test(text);
      
      if (containsImageUrl) {
        // Split text and replace image URLs with chips
        const parts = text.split(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?[^\s]*)?)/gi);
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const fragment = document.createDocumentFragment();
        
        parts.forEach((part) => {
          if (isImageUrl(part)) {
            const imageChip = createImageChipElement(part);
            const spaceNode = document.createTextNode("\u0020");
            fragment.appendChild(imageChip);
            fragment.appendChild(spaceNode);
          } else if (part && !part.match(/^\?[^\s]*$/)) {
            // Skip query string matches, add other text
            const textNode = document.createTextNode(part);
            fragment.appendChild(textNode);
          }
        });
        
        range.insertNode(fragment);
        
        // Move cursor to end
        const newRange = document.createRange();
        newRange.selectNodeContents(ref.current);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Update state
        const newText = getTextContent(ref.current);
        setPrompt(newText);
        
        if (setImageLinks) {
          const links = extractImageLinks();
          setImageLinks(links);
        }
      } else {
        // Plain text, use default insertion
        document.execCommand("insertText", false, text);
      }
    }
  };

  return (
    <div className="relative">
      <div
        id="prompt-input"
        ref={ref}
        contentEditable
        className="pb-2 min-h-10 max-h-[130px] overflow-y-auto w-full h-full resize-none outline-none text-primary text-sm bg-transparent empty:before:block empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
        data-placeholder={
          redesignMdUrl
            ? `I'll redesign ${redesignMdUrl.replace(
                /[<>"']/g,
                ""
              )}, want to add something?`
            : files && files.length > 0
            ? "Ask me anything. Type @ to mention a file..."
            : "Ask me anything..."
        }
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        suppressContentEditableWarning
      ></div>
      {showMentionDropdown && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full mb-2 left-0 z-50 bg-background border border-border rounded-lg shadow-lg min-w-[250px] animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="text-xs text-muted-foreground/60 px-2 py-2">
            {results?.length > 0 && (
              <ul>
                {results.map((file) => (
                  <MentionResult
                    key={file.path}
                    file={file}
                    onSelect={() => insertMention(file.path)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const getFileIcon = (filePath: string, size = "size-3.5") => {
  if (filePath.endsWith(".css")) {
    return <Braces className={size} />;
  } else if (filePath.endsWith(".js")) {
    return <FileCode className={size} />;
  } else if (filePath.endsWith(".json")) {
    return <Braces className={size} />;
  } else {
    return <FileText className={size} />;
  }
};

function MentionResult({
  file,
  onSelect,
}: {
  file: File;
  onSelect: () => void;
}) {
  return (
    <li
      className="flex items-center justify-start gap-2 transition-all duration-200 hover:bg-linear-to-r from-indigo-500/40 to-indigo-500/5 text-primary font-medium rounded-lg px-2 py-2 cursor-pointer select-none"
      onClick={onSelect}
    >
      {getFileIcon(file.path, "size-3")}
      {file.path}
    </li>
  );
}
