"use client";
import { ArrowLeft } from "lucide-react";
import { SandpackLayout, SandpackPreview } from "@codesandbox/sandpack-react";

import { DeviceType, MobileTabType } from "@/lib/type";
import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/grid-pattern";
import { useProject } from "@/components/projects/useProject";
import { BlankPage } from "./blank-page";
import { Button } from "@/components/ui/button";

export function AppViewer({
  mobileTab,
  onToggleMobileTab,
  device,
}: {
  mobileTab: MobileTabType;
  device: DeviceType;
  onToggleMobileTab: (tab: MobileTabType) => void;
}) {
  const { project, files } = useProject();

  return (
    <div
      className={cn(
        "relative grow h-full rounded-xl flex max-lg:flex-col max-lg:gap-3 items-center justify-center z-0",
        mobileTab !== "right-sidebar" ? "max-lg:hidden" : "max-lg:w-full!",
        project?.name || (files && files.length > 0)
          ? "lg:border lg:border-border-muted lg:dark:border-secondary"
          : "bg-accent border border-border-muted dark:border-secondary"
      )}
    >
      <GridPattern
        x={-1}
        y={-1}
        strokeDasharray={"4 2"}
        className={cn(
          "mask-[radial-gradient(900px_circle_at_center,white,transparent)] opacity-40 z-1"
        )}
      />
      {project?.name || (files && files.length > 0) ? (
        <SandpackLayout className="h-full! w-full! rounded-xl! flex items-center! justify-center! border-none! bg-transparent!">
          <SandpackPreview
            className={cn(
              "rounded-xl! z-1 transition-all duration-300 flex-none! border-none!",
              device === "mobile"
                ? "w-[470px]! h-[78dvh]! shadow-2xl! rounded-4xl!"
                : "w-full! h-full! scale-100"
            )}
            showOpenInCodeSandbox={false}
            showRefreshButton={false}
          />
        </SandpackLayout>
      ) : (
        <BlankPage />
      )}
      <div
        className={cn(
          "lg:hidden flex items-center w-full z-10",
          project?.name || (files && files.length > 0)
            ? "justify-start"
            : "p-2 justify-center"
        )}
      >
        <Button
          variant="bordered"
          size="xs"
          onClick={() => onToggleMobileTab("left-sidebar")}
        >
          <ArrowLeft className="size-3" /> Go to Chat
        </Button>
      </div>
    </div>
  );
}
