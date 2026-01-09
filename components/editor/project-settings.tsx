import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Settings, Contrast, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { ChevronDown, ChevronLeft, Edit } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ProjectWithCommits } from "@/actions/projects";
import { cn } from "@/lib/utils";
import ProIcon from "@/assets/pro.svg";
import { useParams } from "next/navigation";

export const ProjectSettings = ({
  project,
}: {
  project: ProjectWithCommits;
}) => {
  const { repoId, owner } = useParams();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  return (
    // <Popover open={open} onOpenChange={setOpen}>
    //   <PopoverTrigger asChild>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="pl-2.5! pr-3! py-1.5! h-auto!">
          <Image
            src="/logo.svg"
            alt="DeepSite"
            width={100}
            height={100}
            className="size-8"
          />
          <div className="flex flex-col -space-y-1 items-start">
            <p className="text-sm font-bold text-primary">
              {project?.cardData?.title ?? "New DeepSite website"}{" "}
              {project?.cardData?.emoji}
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-start gap-1.5">
            <Contrast className="size-3.5" />
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
  );
};
