import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Settings, Check, Plus, Download } from "lucide-react";
import { RiContrastFill } from "react-icons/ri";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { ChevronDown, ChevronLeft, Edit } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProjectWithCommits } from "@/actions/projects";
import ProIcon from "@/assets/pro.svg";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/components/loading";
import { toast } from "sonner";

export const ProjectSettings = ({
  project,
}: {
  project?: ProjectWithCommits | null;
}) => {
  const queryClient = useQueryClient();
  const { repoId, owner } = useParams();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState(
    project?.cardData?.title || "New DeepSite website",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRenameProject = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${repoId}/rename`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newTitle: projectName }),
      }).then(async (response) => {
        if (response.ok) {
          return response.json();
        }
      });
      if (response?.success) {
        setOpen(false);
        queryClient.setQueryData(
          ["project"],
          (oldProject: ProjectWithCommits) => ({
            ...oldProject,
            cardData: {
              ...oldProject.cardData,
              title: projectName,
            },
          }),
        );
      } else {
        setError("Could not rename the project. Please try again.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
    setIsLoading(false);
  };

  const handleDownload = async () => {
    try {
      toast.info("Preparing download...");
      const response = await fetch(`/api/projects/${repoId}/download`, {
        headers: {
          Accept: "application/zip",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to download project");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${session?.user?.username}-${repoId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch (error) {
      toast.error("Failed to download project");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="pl-2.5! pr-3! py-1.5! h-auto!">
            {project?.cardData?.emoji ? (
              <span className="text-3xl">{project?.cardData?.emoji}</span>
            ) : (
              <Image
                src="/logo.svg"
                alt="DeepSite"
                width={100}
                height={100}
                className="size-8"
              />
            )}
            <div className="flex flex-col -space-y-1 items-start">
              <p className="text-sm font-bold text-primary">
                {project?.cardData?.title ?? "New DeepSite website"}{" "}
              </p>
              <p className="text-xs text-muted-foreground">
                Live preview of your app
              </p>
            </div>
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuItem>
            <Link href="/" className="flex items-center gap-1.5">
              <ChevronLeft className="size-3.5" />
              Go to Projects
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {!session?.user?.isPro && (
            <>
              <DropdownMenuItem>
                <Link
                  href="https://huggingface.co/pro"
                  className="flex items-center gap-1.5 bg-linear-to-r from-pink-500 via-green-500 to-amber-500 text-transparent bg-clip-text font-semibold"
                  target="_blank"
                >
                  <Image alt="Pro" src={ProIcon} className="size-3.5" />
                  Subscribe to Pro
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem>
            <Link href="/new" className="flex items-center gap-1.5">
              <Plus className="size-3.5" />
              New Project
            </Link>
          </DropdownMenuItem>
          {project && (
            <>
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <Edit className="size-3.5" />
                Rename the project
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`https://huggingface.co/${owner}/${repoId}/settings`}
                  className="flex items-center gap-1.5"
                >
                  <Settings className="size-3.5" />
                  Project settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload()}>
                <Download className="size-3.5" />
                Download project
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center justify-start gap-1.5">
              <RiContrastFill className="size-3.5" />
              Appearance
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                  {theme === "light" && <Check />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                  {theme === "dark" && <Check />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                  {theme === "system" && <Check />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl!">
          <DialogHeader>
            <DialogTitle>Rename your Project</DialogTitle>
            <DialogDescription>
              Update the name of your project below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              {error && <p className="text-sm text-red-500">{error}</p>}
              <p className="border border-amber-500/20 bg-amber-500/10 text-amber-500 rounded-lg p-3 text-xs">
                The URL of your project will remain the same after changing the
                name, only the displayed name will be updated.
              </p>
              <Input
                id="name-1"
                placeholder="Enter the project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="default"
              disabled={
                projectName ===
                  (project?.cardData?.title || "New DeepSite website") ||
                projectName.length === 0
              }
              onClick={() => handleRenameProject()}
            >
              {isLoading ? (
                <>
                  <Loading
                    overlay={false}
                    className="ml-2 size-4 animate-spin text-primary-foreground"
                  />
                  Saving project...
                </>
              ) : (
                <>
                  <Edit className="size-4" />
                  Update Project name
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
