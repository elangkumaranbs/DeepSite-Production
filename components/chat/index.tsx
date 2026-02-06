import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Markdown from "react-markdown";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { SpaceEntry } from "@huggingface/hub";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

import { useChat } from "./useChat";
import { AiLoading } from "@/components/ask-ai/loading";
import Loading from "@/components/loading";
import { useGeneration } from "@/components/ask-ai/useGeneration";
import { MessageAction, MessageActionType, File } from "@/lib/type";
import { Button } from "@/components/ui/button";
import { getFileIcon } from "@/components/ask-ai/input-mentions";
import ProIcon from "@/assets/pro.svg";
import { ProModal } from "../pro-modal";

const ASSISTANT_AVATAR_URL = "https://i.imgur.com/Ho6v0or.jpeg";

export function AppEditorChat({
  isNew,
  projectName,
  onSelectFile,
}: {
  isNew?: boolean;
  projectName?: string;
  onSelectFile: (file: string) => void;
}) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const chatProjectName = isNew ? "new" : projectName ?? "new";
  const { messages } = useChat(chatProjectName);
  const { isLoading, createProject } = useGeneration(chatProjectName);
  const [openProModal, setOpenProModal] = useState(false);

  const project = queryClient.getQueryData<SpaceEntry>(["project"]);

  const handleShowLastFile = (files?: string[]) => {
    if (files && files.length > 0) {
      const lastGeneratedFile = files[files.length - 1];
      if (lastGeneratedFile) {
        onSelectFile?.(lastGeneratedFile);
      }
    }
  };
  const handleActions = (action: MessageAction, messageId: string) => {
    if (!action) return;
    switch (action.type) {
      case MessageActionType.PUBLISH_PROJECT:
        const files = queryClient.getQueryData<File[]>(["files"]) ?? [];
        return createProject(
          files ?? [],
          action.projectTitle ?? "",
          messageId,
          action.prompt ?? ""
        );
      case MessageActionType.SEE_LIVE_PREVIEW:
        return window.open(
          `https://huggingface.co/spaces/${project?.name}`,
          "_blank"
        );
      case MessageActionType.UPGRADE_TO_PRO:
        return setOpenProModal(true);
      case MessageActionType.ADD_CREDITS:
        return window.open(
          "https://huggingface.co/settings/billing?add-credits=true",
          "_blank"
        );
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={chatContainerRef} className="grow px-2 overflow-y-auto pb-3">
      {isNew ? (
        <p className="text-xs text-muted-foreground text-center mb-3 bg-accent rounded-md mx-auto w-fit px-2 py-1">
          Start a new conversation with the AI
        </p>
      ) : (
        <p className="text-xs text-muted-foreground text-center mb-3 bg-accent rounded-md mx-auto w-fit px-2 py-1">
          Your last conversation has not been restored.
        </p>
      )}
      <div className="grid grid-cols-1 gap-6 w-full">
        {messages.map((message, id) => (
          <div
            key={id}
            className={cn(
              "flex items-center justify-start gap-2 flex-1",
              message.role === "user"
                ? "flex-row-reverse text-right"
                : "flex-row"
            )}
          >
            <Avatar className="size-4">
              <AvatarImage
                src={
                  message.role === "user"
                    ? session?.user?.image ?? ""
                    : ASSISTANT_AVATAR_URL
                }
                alt="DeepSite"
                className="size-4"
              />
              <AvatarFallback>
                {message.role === "user"
                  ? session?.user?.name?.charAt(0) ?? ""
                  : ""}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col max-w-[90%]">
              <div
                className={cn(
                  "whitespace-pre-line text-sm wrap-break-word text-muted-foreground",
                  message.role === "assistant"
                    ? "-space-y-2 min-w-[60px] border border-border bg-linear-to-br from-muted px-4 py-3.5 rounded-xl"
                    : ""
                )}
              >
                <Markdown
                  components={{
                    strong: ({ children }) => (
                      <b className="font-medium text-primary">{children}</b>
                    ),
                    code: ({ className, children }) => {
                      const isCodeBlock = className?.startsWith("language-");
                      const language = className?.replace("language-", "");
                      if (isCodeBlock) {
                        return (
                          <SyntaxHighlighter
                            language={language}
                            style={dracula}
                            className="m-0! text-xs! rounded-md!"
                          >
                            {String(children).trim()}
                          </SyntaxHighlighter>
                        );
                      }

                      return (
                        <code className="font-mono bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-md">
                          {children}
                        </code>
                      );
                    },
                    ul: ({ children }) => (
                      <ul className="list-inside m-0! p-0! flex flex-col gap-1 list-disc">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-inside m-0! p-0! flex flex-col gap-1 list-decimal">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-muted-foreground">{children}</li>
                    ),
                    a: ({ children, href }) => {
                      const isValidUrl =
                        href &&
                        (href.startsWith("http://") ||
                          href.startsWith("https://") ||
                          href.startsWith("/") ||
                          href.startsWith("#") ||
                          href.startsWith("mailto:") ||
                          href.startsWith("tel:"));
                      const safeHref = isValidUrl ? href : "#";

                      return (
                        <a
                          href={safeHref}
                          target={
                            isValidUrl && href.startsWith("http")
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            isValidUrl && href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="hover:text-blue-500 underline inline-flex items-center gap-0.5"
                        >
                          <ExternalLink className="size-3" />
                          {children}
                        </a>
                      );
                    },
                    pre: ({ children }) => <>{children}</>,
                    p: ({ children }) => {
                      const content = String(children);
                      if (
                        typeof children === "string" &&
                        (content.includes("file:/") || 
                         content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(?:\?[^\s]*)?/i))
                      ) {
                        const parts = content.split(/(file:\/\S+|https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg|bmp|ico)(?:\?[^\s]*)?)/gi);
                        return (
                          <p>
                            {parts.filter(Boolean).map((part, index) => {
                              if (!part || part.trim() === "") return null;
                              
                              if (part.startsWith("file:/")) {
                                return (
                                  <span
                                    key={index}
                                    className="inline-flex w-fit items-center justify-center gap-1 font-mono px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400"
                                  >
                                    {getFileIcon(part, "size-2.5")}
                                    {part.replace("file:/", "")}
                                  </span>
                                );
                              } else if (
                                part.match(
                                  /^https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg|bmp|ico)(?:\?[^\s]*)?$/i
                                )
                              ) {
                                const displayUrl =
                                  part.length > 35
                                    ? part.substring(0, 35) + "..."
                                    : part;
                                return (
                                  <span
                                    key={index}
                                    className="inline-flex w-fit items-center justify-center gap-1 font-mono px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                                  >
                                    <span className="text-[10px]">🖼️</span>
                                    {displayUrl}
                                  </span>
                                );
                              }
                              return part;
                            })}
                          </p>
                        );
                      }
                      return <p>{children}</p>;
                    },
                  }}
                >
                  {message.content}
                </Markdown>
                {message.isThinking && (
                  <AiLoading showCircle={false} className="opacity-70" />
                )}
                {message.isAborted && (
                  <p
                    className={cn(
                      "text-[10px] text-muted-foreground font-mono bg-muted-foreground/10 rounded-md px-2 py-1 w-fit",
                      message.content ? "mt-5" : ""
                    )}
                  >
                    The request has been aborted due to an error OR the user has
                    stopped the generation.
                  </p>
                )}
              </div>
              {message.model && message.createdAt && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground mt-1.5 pl-1">
                    via{" "}
                    <code className="font-mono bg-accent text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-md">
                      {message.model}
                    </code>
                  </p>
                  {!message.isThinking && (
                    <p className="text-[10px] text-muted-foreground/70 mt-1.5 pl-1">
                      {formatDistanceToNow(message.createdAt, {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              )}
              {message.files && message.files.length > 0 && (
                <div className="bg-accent px-3 py-2 rounded-lg w-fit mt-2.5">
                  <div className="flex items-center gap-2">
                    {isLoading &&
                    messages[messages.length - 1].id === message.id ? (
                      <>
                        <Loading
                          overlay={false}
                          className="size-3! opacity-50"
                        />
                        <p className="font-medium text-xs text-muted-foreground">
                          {isNew ? "Creating" : "Editing"}{" "}
                          <FileCode
                            file={message.files[message.files.length - 1]}
                          />
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-xs text-muted-foreground">
                          {isNew ? "Created" : "Edited"}{" "}
                          <FileCode
                            file={message.files[message.files.length - 1]}
                          />
                          {message.files.length > 1 && (
                            <span className="text-[10px] text-muted-foreground ml-1 font-normal">
                              (+ {message.files.length - 1} files)
                            </span>
                          )}
                        </p>
                        <Button
                          size="icon-xs"
                          variant="transparent"
                          className="cursor-pointer size-4"
                          onClick={() => handleShowLastFile(message.files)}
                        >
                          <ChevronRight className="size-3.5 text-muted-foreground/60" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
              {message.actions &&
                message.actions.length > 0 &&
                messages.length - 1 === id && (
                  <div className="flex items-center gap-2 mt-2.5">
                    {message.actions.map((action, id) => (
                      <Button
                        key={id}
                        size="xs"
                        disabled={action.disabled ?? action.loading}
                        variant={action.variant ?? "secondary"}
                        onClick={() => handleActions(action, message.id)}
                      >
                        {action.loading && (
                          <Loading
                            className={`size-3! opacity-50 ${
                              action.variant === "default" ? "text-white!" : ""
                            }`}
                            overlay={false}
                          />
                        )}
                        {action.type === MessageActionType.UPGRADE_TO_PRO && (
                          <Image
                            src={ProIcon}
                            alt="Pro Icon"
                            className="size-3.5"
                          />
                        )}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
      <ProModal open={openProModal} onClose={setOpenProModal} />
    </div>
  );
}

const FileCode = ({ file }: { file: string }) => (
  <code className="font-mono bg-accent text-muted-foreground border border-border-muted rounded text-[10px] px-1 py-0.5">
    {file}
  </code>
);
