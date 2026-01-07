import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { ArrowRight, Folder, LogOut, Moon, Plus, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProjects } from "@/components/projects/useProjects";
import { ProjectCard } from "@/components/projects/project-card";
import { cn } from "@/lib/utils";

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

        signIn("huggingface", { callbackUrl: "/deepsite" });
      }
    }
  }, [session, status]);

  const handleSignIn = () => {
    if (window.location.hostname === "localhost") {
      signIn("huggingface", { callbackUrl: "/deepsite" });
      return;
    }
    const targetUrl = "https://enzostvs-deepsite-v4-demo.hf.space";

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
      signIn("huggingface", { callbackUrl: "/deepsite" });
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
          <Avatar className="size-6">
            <AvatarImage
              src={session.user.image || ""}
              alt={session.user.name || "User"}
            />
            <AvatarFallback>
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {session.user.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
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
            href={`https://huggingface.co/${session.user.username}/settings`}
            target="_blank"
          >
            Settings
          </Link>
        </DropdownMenuItem>
        <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Projects</DropdownMenuLabel>
          {projects && projects?.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 px-2 pb-2">
              {projects?.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
              <div className="w-full flex items-center justify-between">
                {projects?.length > 0 && (
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
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <div className="flex items-center justify-between gap-2 px-2 pb-2.5">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => setTheme("light")}
            className={cn(
              "flex-1",
              theme === "light" && "border-amber-300! bg-amber-500/10!"
            )}
          >
            <Sun
              className={cn("size-3.5", theme === "light" && "text-amber-500")}
            />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => setTheme("dark")}
            className={cn(
              "flex-1",
              theme === "dark" && "border-indigo-500/50! bg-indigo-500/20!"
            )}
          >
            <Moon
              className={cn("size-3.5", theme === "dark" && "text-indigo-500")}
            />
          </Button>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <>
      <Button variant="outline" onClick={handleSignIn}>
        Sign in
      </Button>
      <Button onClick={handleSignIn}>Get Started</Button>
    </>
  );
}
