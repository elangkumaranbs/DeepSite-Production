import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useProject } from "@/components/projects/useProject";
import { useMemo } from "react";

const LANGUAGE_MAP = {
  "py": "python",
  "js": "javascript",
  "ts": "typescript",
  "html": "html",
  "css": "css",
  "json": "json",
  "txt": "text",
}

export const useEditor = () => {
  const queryClient = useQueryClient();
  const { files } = useProject();

  const { data: isFileListOpen } = useQuery<boolean>({
    queryKey: ["isFileListOpen"],
    queryFn: () => {
      return false;
    },
    initialData: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const setIsFileListOpen = (isOpen: boolean) => {
    queryClient.setQueryData<boolean>(["isFileListOpen"], () => isOpen);
  }

  const { data: editorFilePath } = useQuery<string>({
    queryKey: ["editorFile"],
    queryFn: () => {
      return "app.py";
    },
    initialData: "app.py",
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchIntervalInBackground: false,
  });

  const setEditorFilePath = (path: string) => {
    queryClient.setQueryData<string>(["editorFile"], () => path);
  }

  const editorFileData = useMemo(() => {
    const finalFile = { path: "", content: "", language: "" };
    if (editorFilePath) {
      const file = files?.find((file) => file.path === editorFilePath);
      if (file) {
        finalFile.path = file.path;
        finalFile.content = file.content ?? "";
        finalFile.language = LANGUAGE_MAP[file.path.split(".").pop()?.toLowerCase() as keyof typeof LANGUAGE_MAP] ?? "text";
      }
    }

    return finalFile
  }, [editorFilePath, files])

  return {
    editorFilePath,
    editorFileData,
    setEditorFilePath,
    isFileListOpen,
    setIsFileListOpen,
  }
}