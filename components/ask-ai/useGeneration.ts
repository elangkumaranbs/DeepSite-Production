"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "react-use";
import { useSession } from "next-auth/react";

import { formatResponse } from "@/lib/format";
import { File, Message, MessageActionType, ProviderType } from "@/lib/type";
import { getContextFilesFromPrompt } from "@/lib/utils";
import { saveDraft } from "@/actions/drafts";

const MESSAGES_QUERY_KEY = (projectName: string) =>
  ["messages", projectName] as const;

export const useGeneration = (projectName: string) => {
  const router = useRouter();
  const audio = useRef<HTMLAudioElement>(null);
  const queryClient = useQueryClient();
  const abortController = useRef<AbortController | null>(null);
  const [, setStoredMessages] = useLocalStorage<Message[]>(
    `messages-${projectName}`,
    []
  );
  const { data: session } = useSession();

  const { data: isLoading } = useQuery({
    queryKey: ["ai.generation.isLoading"],
    queryFn: () => false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });

  const setIsLoading = (isLoading: boolean) => {
    queryClient.setQueryData(["ai.generation.isLoading"], isLoading);
  };

  const getFiles = () => queryClient.getQueryData<File[]>(["files"]) ?? [];
  const setFiles = (newFiles: File[]) => {
    queryClient.setQueryData<File[]>(["files"], (oldFiles: File[] = []) => {
      const currentFiles = oldFiles.filter(
        (file) => !newFiles.some((f) => f.path === file.path)
      );
      return [...currentFiles, ...newFiles];
    });
  };

  const getMessages = () =>
    queryClient.getQueryData<Message[]>(
      MESSAGES_QUERY_KEY(projectName ?? "new")
    ) ?? [];
  const addMessage = (message: Omit<Message, "id">) => {
    const id = uuidv4();
    const key = MESSAGES_QUERY_KEY(projectName ?? "new");
    queryClient.setQueryData<Message[]>(key, (oldMessages = []) => {
      const newMessages = [...oldMessages, { ...message, id }];
      if (projectName !== "new") {
        localStorage.setItem(
          `messages-${projectName}`,
          JSON.stringify(newMessages)
        );
      }
      return newMessages;
    });
    return id;
  };

  const updateLastMessage = (content: string, files?: File[]) => {
    queryClient.setQueryData<Message[]>(
      MESSAGES_QUERY_KEY(projectName),
      (oldMessages = []) => {
        const newMessages = [
          ...oldMessages.slice(0, -1),
          {
            ...oldMessages[oldMessages.length - 1],
            content,
            isThinking: false,
            files: files?.map((file) => file.path),
          },
        ];
        if (projectName !== "new") {
          setStoredMessages(newMessages);
        }
        return newMessages;
      }
    );
  };

  const updateMessage = (messageId: string, message: Partial<Message>) => {
    const key = MESSAGES_QUERY_KEY(projectName ?? "new");
    const currentMessages = queryClient.getQueryData<Message[]>(key);
    if (!currentMessages) return;
    const index = currentMessages.findIndex((m) => m.id === messageId);
    if (index === -1) return;
    const newMessages = [
      ...currentMessages.slice(0, index),
      { ...currentMessages[index], ...message },
      ...currentMessages.slice(index + 1),
    ];
    if (projectName !== "new") {
      setStoredMessages(newMessages);
    }
    queryClient.setQueryData<Message[]>(key, newMessages);
  };

  const storeMessages = async (newProjectName: string) => {
    return new Promise((resolve) => {
      const currentMessages = queryClient.getQueryData<Message[]>(
        MESSAGES_QUERY_KEY("new")
      );
      localStorage.setItem(
        `messages-${newProjectName}`,
        JSON.stringify(currentMessages)
      );
      queryClient.setQueryData<Message[]>(
        MESSAGES_QUERY_KEY(newProjectName),
        currentMessages
      );
      setTimeout(() => resolve(true), 100);
    });
  };

  const createProject = async (
    files: File[],
    projectTitle: string,
    indexMessage: string,
    prompt: string
  ) => {
    updateMessage(indexMessage, {
      actions: [
        {
          label: "Publishing on Hugging Face...",
          variant: "default",
          loading: true,
          type: MessageActionType.PUBLISH_PROJECT,
        },
      ],
    });
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          projectTitle,
          files,
          prompt,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          return data;
        }
        throw new Error("Failed to publish project");
      });

      if (response.repoUrl) {
        toast.success("Project has been published, build in progress...");
        updateMessage(indexMessage, {
          actions: [
            {
              label: "See Live preview",
              variant: "default",
              type: MessageActionType.SEE_LIVE_PREVIEW,
            },
          ],
        });
        storeMessages(response.repoUrl).then(() => {
          router.push(`/${response.repoUrl}`);
        });
      }
    } catch (error) {
      toast.error("Failed to publish project");
      updateMessage(indexMessage, {
        actions: [
          {
            label: "Publish on Hugging Face",
            variant: "default",
            type: MessageActionType.PUBLISH_PROJECT,
            projectTitle,
            prompt,
          },
        ],
      });
    }
  };

  const callAi = async (
    {
      prompt,
      model,
      onComplete,
      provider = "auto",
      redesignMd,
      medias,
    }: {
      prompt: string;
      model: string;
      redesignMd?: {
        url: string;
        md: string;
      } | null;
      medias?: string[] | null;
      onComplete: () => void;
      provider?: ProviderType;
    },
    setModel: (model: string) => void
  ) => {
    setIsLoading(true);
    const messages = getMessages();
    const files = getFiles();
    const filesToUse = await getContextFilesFromPrompt(prompt, files);
    const previousMessages = [...messages]?.filter(
      (message) => !message.isAutomated || !message.isAborted
    );
    addMessage({
      role: "user",
      content: `${
        redesignMd?.url ? `Redesign: ${redesignMd.url}\n` : ""
      }${prompt}`,
      createdAt: new Date(),
    });
    addMessage({
      role: "assistant",
      isThinking: true,
      createdAt: new Date(),
      model,
    });

    const isFollowUp = files?.length > 0;
    abortController.current = new AbortController();

    let visionStructuralMd = "";
    const imageMedias = medias?.filter(m => m.startsWith('data:image/') || m.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) || [];
    
    if (imageMedias.length > 0 && !filesToUse?.length) {
      try {
        const visionRes = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: imageMedias }),
        });
        if (visionRes.ok) {
          const vData = await visionRes.json();
          if (vData.success && vData.structure) {
            visionStructuralMd = `\n\nHere is the exact structural HTML skeleton extracted from the user's provided design/screenshot using a vision model. Focus purely on writing the backend logic and styling this precisely as given. Do not invent a different layout.\n\n--- Vision Extracted Layout ---\n${vData.structure}\n--- End Extracted Layout ---\n`;
          }
        }
      } catch (err) {
        console.error("Vision processing failed", err);
      }
    }

    const finalPrompt = prompt + visionStructuralMd;
    const projectInfo = queryClient.getQueryData<any>(["project"]);
    const brandKit = projectInfo?.brandKit;

    const request = await fetch("/api/ask", {
      method: "POST",
      body: JSON.stringify({
        prompt: finalPrompt,
        model,
        files: filesToUse,
        previousMessages,
        provider,
        redesignMd,
        medias,
        brandKit,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      ...(abortController.current
        ? { signal: abortController.current.signal }
        : {}),
    });

    const currentMessages = getMessages();

    if (!request.ok) {
      const jsonResponse = await request.json()?.catch(() => null);
      const errorMessage =
        jsonResponse?.error || `Status code: ${request.status}`;

      const lastMessageId = currentMessages[currentMessages.length - 1].id;
      updateMessage(lastMessageId, {
        isThinking: false,
        isAborted: true,
        content: `Error: ${errorMessage}`,
      });
      setIsLoading(false);
      return;
    }

    if (request && request.body) {
      const reader = request.body.getReader();
      const decoder = new TextDecoder();
      let completeResponse = "";
      const read = async () => {
        const { done, value } = await reader.read();
        if (done) {
          audio.current?.play();
          const files = getFiles();
          const {
            messageContent,
            files: newFiles,
            projectTitle,
          } = formatResponse(completeResponse, files ?? []);
          updateLastMessage(messageContent, newFiles);
          if (newFiles && newFiles.length > 0) {
            setFiles(newFiles);
            onComplete();

            // ── Background Security Review ─────────────────────────────────
            // Fire-and-forget: silently scan generated files for XSS, unclosed
            // tags, missing meta, unsafe links, etc. If issues are found the
            // model returns corrected files which are patched in automatically.
            (async () => {
              try {
                const reviewRes = await fetch("/api/review", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ files: newFiles }),
                });
                if (!reviewRes.ok) return;
                const reviewData = await reviewRes.json();
                if (reviewData.skipped) return;
                const { files: patchedFiles, issueCount } = reviewData;
                if (patchedFiles && patchedFiles.length > 0) {
                  setFiles(patchedFiles);
                  toast.success(
                    `🔍 Security scan: ${issueCount > 0 ? `${issueCount} issue${issueCount > 1 ? "s" : ""} auto-fixed` : `${patchedFiles.length} file${patchedFiles.length > 1 ? "s" : ""} improved`}`,
                    { duration: 4000 }
                  );
                }
              } catch {
                // Never surface review errors to the user
              }
            })();
            // ─────────────────────────────────────────────────────────────────

            // Automatically save the final generated files to local MongoDB as a draft
            saveDraft({
              name: projectTitle || projectName || 'Generated-Website',
              files: newFiles
                .filter((f): f is { path: string; content: string } => f.content !== undefined),
              prompt: prompt,
            }).then(res => {
              if (res.success) {
                console.log("Draft saved to MongoDB");
              } else {
                console.error("Failed to save draft to MongoDB:", res.error);
              }
            });

            // Automatically save the final generated files locally to the deepsite/projects folder
            fetch('/api/save-local', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectTitle: projectTitle || projectName || 'Generated-Website',
                files: newFiles
              })
            })
              .then(res => res.json())
              .then(data => {
                if (data.success) {
                  toast.success(`Project saved locally! 📁`);
                  console.log(`Auto-save → ${data.path}`);
                } else {
                  toast.error(`Local save failed: ${data.error}`);
                }
              })
              .catch(err => {
                toast.error('Local save error — check console');
                console.error('Auto-save failed:', err);
              });

            if (projectName === "new") {
              addMessage({
                role: "assistant",
                content:
                  "I've finished the generation. Now you can decide to publish the project on Hugging Face to share it!",
                createdAt: new Date(),
                isAutomated: true,
                actions: [
                  {
                    label: "Publish on Hugging Face",
                    variant: "default",
                    type: MessageActionType.PUBLISH_PROJECT,
                    prompt,
                    projectTitle,
                  },
                ],
              });
            } else {
              const response = await fetch(
                `/api/projects/${projectName.split("/")[1]}`,
                {
                  method: "PUT",
                  body: JSON.stringify({
                    files: newFiles,
                    prompt,
                  }),
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              ).then(async (response) => {
                if (response.ok) {
                  const data = await response.json();
                  return data;
                }
              });
              if (response.success) {
                toast.success("Project has been updated");
              } else {
                toast.error("Failed to update project");
              }
            }
          }

          setIsLoading(false);
          return;
        }
        const chunk = decoder.decode(value, { stream: true });
        completeResponse += chunk;

        if (completeResponse.includes("__ERROR__:")) {
          const errorMatch = completeResponse.match(/__ERROR__:(.+)/);
          if (errorMatch) {
            try {
              const errorData = JSON.parse(errorMatch[1]);
              if (errorData.isError) {
                const lastMessageId =
                  currentMessages[currentMessages.length - 1].id;
                updateMessage(lastMessageId, {
                  isThinking: false,
                  isAborted: true,
                  content: errorData?.showProMessage
                    ? session?.user?.isPro ? "You have already reached your monthly included credits with Hugging Face Pro plan. Please consider adding more credits to your account." : "You have exceeded your monthly included credits with Hugging Face inference provider. Please consider upgrading to a pro plan."
                    : `Error: ${errorData.messageError}`,
                  actions: errorData?.showProMessage
                    ? session?.user?.isPro ? [{
                      label: "Add more credits",
                      variant: "default",
                      type: MessageActionType.ADD_CREDITS,
                    }] : [
                        {
                          label: "Upgrade to Pro",
                          variant: "pro",
                          type: MessageActionType.UPGRADE_TO_PRO,
                        },
                      ]
                    : [],
                });
                setIsLoading(false);
                return;
              }
            } catch (e) {
              console.error("Failed to parse error message:", e);
            }
          }
        }
        if (
          completeResponse.includes(
            "_Note: The selected model was not available. Switched to"
          )
        ) {
          const newModel = completeResponse
            .match(
              /The selected model was not available. Switched to (.+)/
            )?.[1]
            .replace(/`/g, "")
            .replace(" ", "")
            .replace(/\.|_$/g, "");
          if (newModel) {
            setModel(newModel);
            updateMessage(currentMessages[currentMessages.length - 1].id, {
              model: newModel,
            });
          }
        }

        const files = getFiles();
        const { messageContent, files: newFiles } = formatResponse(
          completeResponse,
          files ?? []
        );
        if (messageContent) updateLastMessage(messageContent);
        if (newFiles && newFiles.length > 0) {
          if (!isFollowUp) {
            setFiles(newFiles);
          }
          updateLastMessage(messageContent, newFiles);
        }
        read();
      };
      return await read();
    }
  };

  const stopGeneration = () => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
      setIsLoading(false);
      const currentMessages = getMessages();
      const lastMessageId = currentMessages[currentMessages.length - 1].id;
      updateMessage(lastMessageId, {
        isAborted: true,
        isThinking: false,
      });
    }
  };

  return {
    callAi,
    isLoading,
    stopGeneration,
    files: getFiles(),
    createProject,
    audio,
  };
};
