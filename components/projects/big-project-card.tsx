import Link from "next/link";
import { SpaceEntry } from "@huggingface/hub";
import { format } from "date-fns";
import {
  CogIcon,
  EllipsisVertical,
  ExternalLink,
  TrashIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// from-red-500 to-red-500
// from-yellow-500 to-yellow-500
// from-green-500 to-green-500
// from-purple-500 to-purple-500
// from-blue-500 to-blue-500
// from-pink-500 to-pink-500
// from-gray-500 to-gray-500
// from-indigo-500 to-indigo-500

export function BigProjectCard({
  project,
  onOpenDeleteDialog,
}: {
  project: SpaceEntry;
  onOpenDeleteDialog: (id: string) => void;
}) {
  return (
    // todo: use Link instead. But first fix the fact the preview is not re-rendered when changing path
    <a href={`/${project.name}`} className="">
      <div className="group/big-card rounded-lg overflow-hidden transition-all border-2 border-background ring-[1px] ring-border relative">
        {project.private ? (
          <div className="h-40 bg-linear-to-br flex flex-col gap-1 items-center justify-center text-lg from-blue-500 to-purple-500">
            <p className="text-3xl">{project.cardData?.emoji}</p>
            <p className="text-lg font-bold font-mono text-white">
              {project.cardData?.title}
            </p>
          </div>
        ) : (
          <div className="relative inset-0 w-full h-40 overflow-hidden">
            <iframe
              src={`https://${project.name.replaceAll(
                "/",
                "-"
              )}.static.hf.space`}
              className="w-[700px] h-[350px] border-0 origin-top-left pointer-events-none"
              style={{
                transform: "scale(0.5)",
                transformOrigin: "top left",
              }}
            />
          </div>
        )}
        <div className="absolute inset-0 w-full h-full bg-black/50 group-hover/big-card:opacity-100 flex items-center justify-center opacity-0 transition-all duration-300">
          <Button variant="bordered" size="sm">
            <ExternalLink className="size-4" />
            Open project
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 ml-0.5 absolute bottom-0 right-0 bg-accent px-2 py-1 rounded-tl-lg line-clamp-1">
          {project.cardData?.title}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground mt-1.5 ml-0.5">
          Last update: {format(project.updatedAt, "MMM d, yyyy")}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs">
              <EllipsisVertical className="size-4 text-muted-foreground hover:text-foreground transition-all" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(
                  `https://huggingface.co/spaces/${project.name}/settings`,
                  "_blank"
                );
              }}
            >
              <CogIcon />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenDeleteDialog(project.name);
              }}
            >
              <TrashIcon />
              Delete this project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </a>
  );
}
