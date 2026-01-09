import {
  CheckCircle,
  FileVideo,
  ImageIcon,
  Music,
  Paperclip,
  Video,
} from "lucide-react";
import { useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { getFileType, humanizeNumber } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectWithCommits } from "@/actions/projects";
import { toast } from "sonner";
import Loading from "../loading";

export const Uploader = ({
  medias,
  selected,
  setSelected,
}: {
  medias?: string[] | null;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const queryClient = useQueryClient();
  const { repoId } = useParams<{ repoId: string }>();

  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (url: string) => {
    const fileType = getFileType(url);
    switch (fileType) {
      case "image":
        return <ImageIcon className="size-4" />;
      case "video":
        return <Video className="size-4" />;
      case "audio":
        return <Music className="size-4" />;
      default:
        return <FileVideo className="size-4" />;
    }
  };

  const uploadFiles = async (files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const data = new FormData();
    Array.from(files).forEach((file) => {
      data.append("images", file);
    });

    const response = await fetch(`/api/projects/${repoId}/medias`, {
      method: "POST",
      body: data,
    })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          return data;
        }
        throw new Error("Failed to save changes");
      })
      .catch((err) => {
        return { success: false, err };
      });

    if (response.success) {
      queryClient.setQueryData(
        ["project"],
        (oldProject: ProjectWithCommits) => ({
          ...oldProject,
          medias: [...response.medias, ...(oldProject?.medias ?? [])],
        })
      );
      toast.success("Media files uploaded successfully!");
    } else {
      setError(
        response.err ?? "Failed to upload media files, try again later."
      );
    }

    setIsUploading(false);
  };

  return (
    <div className="flex items-center justify-start gap-1 flex-wrap">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size={selected?.length > 0 ? "xs" : "icon-xs"}
            variant={
              selected?.length > 0 ? "indigo" : open ? "default" : "bordered"
            }
            className="rounded-full! relative"
          >
            <Paperclip className="size-3" />
            {selected?.length > 0 && (
              <span className="py-0.5 px-1 text-[10px] flex items-center justify-center rounded-full font-semibold bg-white/20 dark:bg-indigo-500 dark:text-white font-mono min-w-4">
                {humanizeNumber(selected.length)}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="translate-x-6 rounded-2xl! p-0! bg-accent! border-border-muted! w-86 text-center overflow-hidden">
          <header className="bg-linear-to-b from-indigo-500/25 dark:from-indigo-500/40 to-accent p-6">
            <div className="flex items-center justify-center -space-x-4 mb-3">
              <div className="size-9 rounded-full bg-pink-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
                📷
              </div>
              <div className="size-11 rounded-full bg-yellow-200 shadow-2xl flex items-center justify-center text-2xl z-2">
                🖼️
              </div>
              <div className="size-9 rounded-full bg-green-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
                📁
              </div>
            </div>
            <p className="text-xl font-semibold text-primary">Upload Files</p>
            <p className="text-sm text-muted-foreground mt-1.5">
              Upload files to include them in the AI context.
            </p>
          </header>
          <main className="space-y-4 px-6 pb-6">
            {error && <p className="text-sm text-red-500">{error}</p>}
            {medias && medias.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Uploaded files:
                </p>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-1.5 flex-wrap max-h-40 overflow-y-auto">
                    {medias.map((media: string) => {
                      const fileType = getFileType(media);
                      return (
                        <div
                          key={media}
                          className="select-none relative cursor-pointer bg-accent rounded-md border-2 border-border transition-all duration-300"
                          onClick={() =>
                            setSelected(
                              selected.includes(media)
                                ? selected.filter((f) => f !== media)
                                : [...selected, media]
                            )
                          }
                        >
                          {fileType === "image" ? (
                            <Image
                              src={media}
                              alt="uploaded image"
                              width={56}
                              height={56}
                              className="object-contain w-full rounded-sm aspect-square h-14"
                            />
                          ) : fileType === "video" ? (
                            <div className="w-full h-14 rounded-sm bg-gray-100 flex items-center justify-center relative">
                              <video
                                src={media}
                                className="w-full h-full object-cover rounded-sm"
                                muted
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-sm">
                                <Video className="size-4 text-white" />
                              </div>
                            </div>
                          ) : fileType === "audio" ? (
                            <div className="w-full h-14 rounded-sm bg-linear-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                              <Music className="size-6 text-purple-600" />
                            </div>
                          ) : (
                            <div className="w-full h-14 rounded-sm bg-gray-100 flex items-center justify-center">
                              {getFileIcon(media)}
                            </div>
                          )}
                          {selected.includes(media) && (
                            <div className="absolute top-0 right-0 h-full w-full flex items-center justify-center bg-black/50 rounded-md">
                              <CheckCircle className="size-6 text-neutral-100" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <div>
              <Button
                variant="default"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loading
                      overlay={false}
                      className="ml-2 size-4 animate-spin text-primary-foreground"
                    />
                    Uploading media file(s)...
                  </>
                ) : (
                  "Upload Media Files"
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="image/*,video/*,audio/*,.mp3,.mp4,.wav,.aac,.m4a,.ogg,.webm,.avi,.mov"
                onChange={(e) => uploadFiles(e.target.files)}
              />
            </div>
          </main>
        </PopoverContent>
      </Popover>
    </div>
  );
};
