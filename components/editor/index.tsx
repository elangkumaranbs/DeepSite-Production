"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useBeforeUnload, useLocalStorage } from "react-use";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { amethyst } from "@codesandbox/sandpack-themes";
import { NextStep } from "nextstepjs";
import confetti from "canvas-confetti";

import { AppEditorHeader } from "./header";
import { AppViewer } from "@/components/viewer";
import { ActivityType, DeviceType, File, MobileTabType } from "@/lib/type";
import { useProject } from "@/components/projects/useProject";
import { AskAI } from "@/components/ask-ai/ask-ai";
import { AppEditorChat } from "@/components/chat";
import { cn, defaultHTML } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AppEditorCode } from "@/components/code";
import { ProjectWithCommits } from "@/actions/projects";
import { HistoryView } from "./history-view";
import { TourCustomCard } from "@/components/tour/card";
import { steps } from "@/lib/onboarding";

const SandpackProvider = dynamic(
  () =>
    import("@codesandbox/sandpack-react").then((mod) => mod.SandpackProvider),
  { ssr: false }
);

export function AppEditor({
  project: initialProject,
  files: initialFiles,
  initialPrompt,
  isNew = false,
  isHistoryView = false,
}: {
  project?: ProjectWithCommits | null;
  files?: File[];
  initialPrompt?: string;
  isNew?: boolean;
  isHistoryView?: boolean;
}) {
  const [currentActivity, setCurrentActivity] = useState<ActivityType>("chat");
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [mobileTab, setMobileTab] = useState<MobileTabType>("left-sidebar");
  const { project, files } = useProject(initialProject, initialFiles, isNew);
  const { resolvedTheme } = useTheme();
  const projectName = isNew ? "new" : project?.name ?? "new";

  const toggleDevice = () => {
    setDevice((prev) => (prev === "desktop" ? "mobile" : "desktop"));
  };
  const [tourHasBeenShown, setTourHasBeenShown] = useLocalStorage<boolean>(
    "tour-has-been-shown",
    false
  );

  useBeforeUnload(
    !project && (files?.length ?? 0) > 0,
    "You have unsaved changes, are you sure?"
  );

  const sandpackFiles = useMemo(() => {
    if (files && files.length > 0) {
      return files.reduce(
        (acc, file) => ({
          ...acc,
          [file.path]: { code: file.content ?? "" },
        }),
        {}
      );
    } else {
      return {
        "/index.html": {
          code: defaultHTML,
        },
      };
    }
  }, [files]);

  return (
    <NextStep
      cardComponent={TourCustomCard}
      clickThroughOverlay={false}
      shadowRgb="0, 0, 0"
      shadowOpacity="0.8"
      steps={steps}
      onComplete={() => {
        setTourHasBeenShown(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 1, x: 0.1 },
        });
      }}
    >
      <SandpackProvider
        template="static"
        options={{
          initMode: "immediate",
          autoReload: false,
          recompileDelay: 3000,
          recompileMode: "immediate",
        }}
        files={sandpackFiles}
        theme={resolvedTheme === "dark" ? amethyst : undefined}
        className="h-screen! w-full! flex! flex-col! justify-between! lg:overflow-hidden!"
      >
        <AppEditorHeader
          currentActivity={currentActivity}
          onToggleActivity={setCurrentActivity}
          onToggleDevice={toggleDevice}
          device={device}
          mobileTab={mobileTab}
          onToggleMobileTab={setMobileTab}
          isNew={isNew}
          isHistoryView={isHistoryView}
        />
        <main className="flex-1! flex! items-center! pb-3! gap-3! px-3!">
          <div
            className={cn(
              "w-1/3 flex flex-col justify-between h-full relative",
              mobileTab !== "left-sidebar" ? "max-lg:hidden" : "max-lg:w-full!"
            )}
          >
            {currentActivity === "chat" ? (
              <div className="justify-between flex flex-col h-[calc(100vh-70px)] grow">
                <AppEditorChat
                  isNew={isNew}
                  projectName={projectName}
                  onSelectFile={() => {
                    setCurrentActivity("code");
                  }}
                />
                <div className="">
                  <div className="lg:hidden flex items-center justify-end pb-2">
                    <Button
                      variant="bordered"
                      size="xs"
                      onClick={() => setMobileTab("right-sidebar")}
                    >
                      Go to Preview <ArrowRight className="size-3" />
                    </Button>
                  </div>
                  <AskAI
                    isHistoryView={isHistoryView}
                    isNew={isNew}
                    projectName={projectName}
                    initialPrompt={initialPrompt}
                    tourHasBeenShown={tourHasBeenShown}
                    files={files}
                    medias={project?.medias ?? []}
                    onToggleMobileTab={setMobileTab}
                  />
                </div>
              </div>
            ) : (
              <AppEditorCode />
            )}
            {isHistoryView && <HistoryView />}
          </div>
          <AppViewer
            mobileTab={mobileTab}
            onToggleMobileTab={setMobileTab}
            device={device}
          />
        </main>
      </SandpackProvider>
    </NextStep>
  );
}
