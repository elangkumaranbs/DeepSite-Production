import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { ArrowRight, Check, Folder, LogOut, Plus } from "lucide-react";
import { RiContrastFill } from "react-icons/ri";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import { FaDiscord } from "react-icons/fa6";
import Image from "next/image";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProjects } from "@/components/projects/useProjects";
import { ProjectCard } from "@/components/projects/project-card";
import { cn, DISCORD_URL } from "@/lib/utils";
import HFLogo from "@/assets/hf-logo.svg";
import ProIcon from "@/assets/pro.svg";

export function UserMenu() {
  const { data: session, status } = useSession();
  const { projects } = useProjects();
  const isLoading = status === "loading";
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (typeof window !== "undefined" && !session && status !== "loading") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("signin") === "true") {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("signin");
        window.history.replaceState({}, "", newUrl.toString());

        signIn("huggingface", { callbackUrl: "/" });
      }
    }
  }, [session, status]);

  const handleSignIn = () => {
    if (window.location.hostname === "localhost") {
      signIn("huggingface", {
        callbackUrl: "/",
      });
      return;
    }
    const targetUrl = "https://deepsite.hf.co";

    let isOnTargetPage = false;
    if (typeof window !== "undefined") {
      try {
        const isInIframe = window !== window.parent;

        if (isInIframe) {
          try {
            isOnTargetPage = window.parent.location.href.startsWith(targetUrl);
          } catch {
            isOnTargetPage = false;
          }
        } else {
          isOnTargetPage = window.location.href.startsWith(targetUrl);
        }
      } catch {
        isOnTargetPage = false;
      }
    }

    if (!isOnTargetPage) {
      window.open(`${targetUrl}?signin=true`, "_blank");
    } else {
      signIn("huggingface", { callbackUrl: "/" });
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    );
  }
  return session?.user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="transparent"
          size="default"
          className="gap-2 pl-2! pr-3!"
        >
          <div
            className={cn(
              "w-fit rounded-full p-px relative",
              session.user.isPro &&
                "bg-linear-to-r from-pink-500/80 via-green-500/80 to-amber-500/80"
            )}
          >
            <Avatar className="size-6 border border-background">
              <AvatarImage
                src={session.user.image || ""}
                alt={session.user.name || "User"}
              />
              <AvatarFallback>
                {session.user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {session.user.isPro && (
              <Image
                alt="Pro"
                src={ProIcon}
                className="size-2.5 absolute top-0 -left-0.5"
              />
            )}
          </div>
          {session.user.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
          <Link
            href={`https://huggingface.co/${session.user.username}`}
            target="_blank"
          >
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            href={`https://huggingface.co/settings/profile`}
            target="_blank"
          >
            Settings
          </Link>
        </DropdownMenuItem>
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
        <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Projects</DropdownMenuLabel>
          {projects && projects?.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 px-2 pb-2">
              {projects?.slice(0, 2).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
              <div className="w-full flex items-center justify-between">
                {projects?.length > 2 && (
                  <Link
                    href="/#projects"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center justify-start gap-1"
                  >
                    View all projects
                    <ArrowRight className="size-2.5" />
                  </Link>
                )}
                <Link
                  href="/new"
                  className="text-xs text-muted-foreground hover:text-primary flex items-center justify-start gap-1"
                >
                  New project
                  <Plus className="size-2.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="px-2 pb-2">
              <div className="bg-accent p-3 rounded-lg flex flex-col items-center justify-center gap-2">
                <div className="flex items-center justify-center gap-2 bg-accent-foreground/10 p-2 rounded-lg">
                  <Folder className="size-3 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  <span className="font-medium">No projects found.</span> <br />
                  Create a new project to get started.
                </p>
                <Link href="/new">
                  <Button variant="outline" size="xs" className="w-full">
                    New project
                    <Plus className="size-2.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link
            href={DISCORD_URL}
            target="_blank"
            className="flex items-center justify-start gap-2"
          >
            <FaDiscord className="size-4" />
            Discord
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            href="https://huggingface.co/enzostvs"
            target="_blank"
            className="flex items-center justify-start gap-2"
          >
            <Image src={HFLogo} alt="HF" className="size-4 grayscale" />
            Hugging Face
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} variant="destructive">
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <>
      <Button
        variant="outline"
        onClick={handleSignIn}
        className="max-lg:hidden"
      >
        Sign in
      </Button>
      <Button onClick={handleSignIn}>Get Started</Button>
    </>
  );
}
