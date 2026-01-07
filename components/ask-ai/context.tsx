import { AtSign, Braces, FileCode, FileText, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { File } from "@/lib/type";
import { cn } from "@/lib/utils";

export const Context = ({
  files,
  setFiles,
}: {
  files: File[];
  setFiles: (files: File[]) => void;
}) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const getFileIcon = (filePath: string, size = "size-3.5") => {
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

  const getFiles = () => queryClient.getQueryData<File[]>(["files"]) ?? [];

  return (
    <div className="flex items-center justify-start gap-1 flex-wrap">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="xxs" variant={open ? "default" : "bordered"}>
            <AtSign className="size-3" />
            Add Context...
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="translate-x-6 space-y-4 min-w-fit rounded-2xl! p-0!"
        >
          <main className="p-4">
            <p className="text-xs text-muted-foreground mb-2.5">
              Select a file to send as context
            </p>
            <div className="max-h-[200px] overflow-y-auto space-y-0.5">
              {getFiles().length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No files available
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setFiles([]);
                      setOpen(false);
                    }}
                    className={`cursor-pointer w-full px-2 py-1.5 text-xs text-left rounded-md  hover:bg-accent hover:text-accent-foreground transition-colors ${
                      files.length === 0
                        ? "bg-linear-to-r from-indigo-500/20 to-indigo-500/5 text-primary font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    All files (default)
                  </button>
                  {getFiles()?.map((page) => (
                    <button
                      key={page.path}
                      onClick={() => {
                        if (files.some((f) => f.path === page.path))
                          setFiles(files.filter((f) => f.path !== page.path));
                        else setFiles(files ? [...files, page] : [page]);
                        setOpen(false);
                      }}
                      className={`cursor-pointer w-full px-2 py-1.5 text-xs text-left rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-1.5 ${
                        files?.some((f) => f.path === page.path)
                          ? "bg-linear-to-r from-indigo-500/20 to-indigo-500/5 text-primary font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      <span className="shrink-0">
                        {getFileIcon(page.path, "size-3")}
                      </span>
                      <span className="truncate flex-1">{page.path}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </main>
        </PopoverContent>
      </Popover>
      {files?.map((file) => (
        <Button
          key={file.path}
          size="xxs"
          variant="bordered"
          className="cursor-default!"
        >
          {getFileIcon(file.path, "size-3")}
          {file.path}
          <span
            className="opacity-50 hover:opacity-80 cursor-pointer"
            onClick={() => {
              setFiles(files.filter((f) => f.path !== file.path));
            }}
          >
            <X className="size-3.5 opacity-50 hover:opacity-80 shrink-0" />
          </span>
        </Button>
      ))}
    </div>
  );
};
