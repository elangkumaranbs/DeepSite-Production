import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "react-use";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { Message } from "@/lib/type";

const MESSAGES_QUERY_KEY = (projectName: string) =>
  ["messages", projectName] as const;

export function useChat(projectName: string) {
  const queryClient = useQueryClient();
  const [, setStoredMessages, clearStoredMessages] = useLocalStorage<Message[]>(
    `messages-${projectName}`,
    []
  );

  useEffect(() => {
    if (projectName !== "new") {
      queryClient.invalidateQueries({
        queryKey: MESSAGES_QUERY_KEY(projectName),
      });
    }
  }, [projectName, queryClient]);

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: MESSAGES_QUERY_KEY(projectName),
    queryFn: () => {
      if (projectName === "new") {
        return [];
      }
      const storedData = localStorage.getItem(`messages-${projectName}`);
      if (storedData) {
        try {
          const parsedMessages = JSON.parse(storedData);
          if (parsedMessages && parsedMessages.length > 0) {
            return parsedMessages;
          }
        } catch (error) {
          console.error("Failed to parse stored messages:", error);
        }
      }
      return [];
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });

  const addMessage = (message: Omit<Message, "id">) => {
    const id = uuidv4();
    queryClient.setQueryData<Message[]>(
      MESSAGES_QUERY_KEY(projectName),
      (oldMessages = []) => {
        const newMessages = [
          ...oldMessages,
          {
            ...message,
            id,
          },
        ];
        if (projectName !== "new") {
          setStoredMessages(newMessages);
        }
        return newMessages;
      }
    );
    return id;
  };
  const clearMessages = () => {
    queryClient.setQueryData<Message[]>(MESSAGES_QUERY_KEY(projectName), []);
    clearStoredMessages();
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

  return {
    messages,
    addMessage,
    clearMessages,
    storeMessages,
  };
}
