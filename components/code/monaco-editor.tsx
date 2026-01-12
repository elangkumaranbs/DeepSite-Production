import { useMemo, useRef, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Monaco } from "@monaco-editor/react";
import {
  useActiveCode,
  SandpackStack,
  FileTabs,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";

import NightLight from "@/components/editor/night-light.json";
import Night from "@/components/editor/night.json";
import { File } from "@/lib/type";
import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.Editor),
  { ssr: false }
);

const LANGUAGE_MAP = {
  js: "javascript",
  ts: "typescript",
  html: "html",
  css: "css",
  json: "json",
  txt: "text",
};

export function AppEditorMonacoEditor({
  setShowSaveChanges,
}: {
  setShowSaveChanges: (show: boolean) => void;
}) {
  const { theme } = useTheme();
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();
  const queryClient = useQueryClient();
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEditorDidMount = (monaco: Monaco) => {
    monaco.editor.defineTheme("NightLight", {
      base: "vs",
      inherit: true,
      ...NightLight,
      rules: [],
    });
    monaco.editor.defineTheme("Night", {
      base: "vs-dark",
      ...Night,
      rules: [],
    });
  };

  const language = useMemo(() => {
    const extension = sandpack.activeFile
      .split(".")
      .pop()
      ?.toLowerCase() as string;
    return LANGUAGE_MAP[extension as keyof typeof LANGUAGE_MAP] ?? "text";
  }, [sandpack.activeFile]);

  const updateFile = useCallback(
    (newValue: string, activeFile: string) => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        const manuallyUpdatedFiles =
          queryClient.getQueryData<File[]>(["manuallyUpdatedFiles"]) ?? [];
        const fileIndex = manuallyUpdatedFiles.findIndex(
          (file) => file.path === activeFile
        );
        if (fileIndex !== -1) {
          manuallyUpdatedFiles[fileIndex].content = newValue;
        } else {
          manuallyUpdatedFiles.push({
            path: activeFile,
            content: newValue,
          });
        }
        queryClient.setQueryData<File[]>(
          ["manuallyUpdatedFiles"],
          manuallyUpdatedFiles
        );
      }, 100);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient]
  );

  const handleEditorChange = (value: string | undefined) => {
    setShowSaveChanges(true);
    const newValue = value || "";
    updateCode(newValue);
    const activeFile = sandpack.activeFile?.replace(/^\//, "");
    updateFile(newValue, activeFile);
  };

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const themeEditor = useMemo(() => {
    const isSystemDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effectiveTheme =
      theme === "system" ? (isSystemDark ? "dark" : "light") : theme;
    return effectiveTheme === "dark" ? "Night" : "NightLight";
  }, [theme]);

  return (
    <SandpackStack className="h-full!">
      <FileTabs />
      <div style={{ flex: 1 }}>
        <Editor
          width="100%"
          height="100%"
          language={language}
          theme={themeEditor}
          key={sandpack.activeFile}
          options={{
            fontSize: 14,
            fontFamily: "Jetbrains-Mono",
            fontLigatures: true,
            wordWrap: "on",
            minimap: {
              enabled: false,
            },
            bracketPairColorization: {
              enabled: true,
            },
            cursorBlinking: "smooth",
            formatOnPaste: true,
            suggest: {
              showFields: false,
              showFunctions: false,
            },
            stickyTabStops: false,
            stickyScroll: {
              enabled: false,
            },
          }}
          beforeMount={handleEditorDidMount}
          value={code}
          onChange={handleEditorChange}
        />
      </div>
    </SandpackStack>
  );
}
