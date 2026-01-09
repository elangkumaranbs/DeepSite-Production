"use client";

import { useState } from "react";
import {
  Earth,
  RefreshCw,
  Monitor,
  Smartphone,
  Code,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSandpackNavigation } from "@codesandbox/sandpack-react";

import { Button } from "@/components/ui/button";
import { ActivityType, DeviceType, MobileTabType } from "@/lib/type";
import { UserMenu } from "@/components/user-menu";
import { useProject } from "@/components/projects/useProject";
import { cn } from "@/lib/utils";
import { Commits } from "./commits";
import { ProjectSettings } from "./project-settings";

export function AppEditorHeader({
  currentActivity,
  onToggleActivity,
  onToggleDevice,
  device,
  mobileTab,
  isHistoryView,
}: {
  isNew?: boolean;
  isHistoryView?: boolean;
  currentActivity: ActivityType;
  onToggleActivity: (activity: ActivityType) => void;
  onToggleDevice: () => void;
  device: DeviceType;
  mobileTab: MobileTabType;
  onToggleMobileTab: (tab: MobileTabType) => void;
}) {
  const { project, files } = useProject();
  const { refresh } = useSandpackNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      refresh();
      setIsRefreshing(false);
    }, 1000);
  };

  const handleToggleActivity = () => {
    onToggleActivity(currentActivity === "chat" ? "code" : "chat");
  };

  return (
    <header className="px-3 lg:px-2 py-1.5 flex items-center gap-3">
      <div
        className={cn(
          "w-1/3 flex items-center gap-1.5 justify-between",
          mobileTab !== "left-sidebar" ? "max-lg:hidden" : "max-lg:w-full!"
        )}
      >
        <ProjectSettings project={project} />
        <div className="flex items-center justify-end gap-2 max-lg:hidden">
          {(project?.commits?.length ?? 0) > 0 && (
            <Commits commits={project?.commits} />
          )}
        </div>
      </div>
      <div className="grow flex items-center justify-end lg:grid lg:grid-cols-3">
        <div className="flex items-center justify-start gap-1.5 max-lg:hidden">
          {files && files.length > 0 && (
            <>
              {!isHistoryView && (
                <Button
                  variant="bordered"
                  size="xs"
                  onClick={handleToggleActivity}
                >
                  {currentActivity === "chat" ? (
                    <Code className="size-3.5" />
                  ) : (
                    <MessageCircle className="size-3.5" />
                  )}
                  {currentActivity === "chat" ? "Code" : "Chat"}
                </Button>
              )}
              <Button
                variant="bordered"
                size="xs"
                onClick={onToggleDevice}
                className="gap-2"
              >
                {device === "desktop" ? (
                  <>
                    <Monitor className="size-3.5" />
                    Desktop
                  </>
                ) : (
                  <>
                    <Smartphone className="size-3.5" />
                    Mobile
                  </>
                )}
              </Button>
            </>
          )}
          {!isHistoryView && project?.name && (
            <Link
              href={`https://${project.name.replaceAll(
                "/",
                "-"
              )}.static.hf.space`}
              target="_blank"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Button
                variant="bordered"
                className="h-7 px-2! overflow-hidden gap-0"
              >
                <ExternalLink className="size-3.5 shrink-0" />
                <motion.span
                  initial={false}
                  animate={{
                    width: isHovered ? "auto" : 0,
                    opacity: isHovered ? 1 : 0,
                    marginLeft: isHovered ? 6 : 0,
                  }}
                  transition={{ duration: 0.2, ease: "linear" }}
                  className="overflow-hidden whitespace-nowrap text-xs"
                  style={{ display: "inline-block" }}
                >
                  See Live preview
                </motion.span>
              </Button>
            </Link>
          )}
          {isHistoryView && (
            <Button
              variant="indigo"
              size="xs"
              className="cursor-default! border-transparent!"
            >
              Viewing historical version
            </Button>
          )}
        </div>
        <div
          className={cn(
            "flex items-center justify-center",
            mobileTab !== "right-sidebar" && "max-lg:hidden"
          )}
        >
          <div className="flex items-center justify-between gap-3 pl-3 pr-2 py-1 bg-secondary rounded-md text-xs">
            <div className="flex items-center text-muted-foreground">
              <Earth className="size-3 shrink-0 mr-2" />
              <span className="font-mono max-w-26 truncate">
                {project?.name
                  ? `${project.name.replaceAll("/", "-")}`
                  : "localhost:3000"}
              </span>
              <span className="font-mono">
                {project?.name && ".static.hf.space"}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleRefresh}
                aria-label="Refresh preview"
                disabled={isRefreshing}
                className="hover:bg-background/60"
              >
                <RefreshCw
                  className={`size-3 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 w-full">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
