import { useState } from "react";
import {
  SandpackLayout,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useUpdateEffect } from "react-use";

import { AppEditorMonacoEditor } from "./monaco-editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Loading from "../loading";
import { ProjectWithCommits } from "@/actions/projects";

export function AppEditorCode() {
  const queryClient = useQueryClient();
  const { repoId } = useParams<{ repoId: string }>();

  const [isFileExplorerCollapsed, setIsFileExplorerCollapsed] = useState(true);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [isSavingChangesSuccess, setIsSavingChangesSuccess] = useState(false);
  const [isSavingChangesError, setIsSavingChangesError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showSaveChanges, setShowSaveChanges] = useState(false);

  const handleSaveChanges = async () => {
    if (repoId === "new") return;
    setIsSavingChanges(true);
    const manuallyUpdatedFiles =
      queryClient.getQueryData<File[]>(["manuallyUpdatedFiles"]) ?? [];
    const response = await fetch(`/api/projects/${repoId}`, {
      method: "PUT",
      body: JSON.stringify({
        files: manuallyUpdatedFiles,
        prompt: `✍️ ${format(new Date(), "dd/MM")} - ${format(
          new Date(),
          "HH:mm"
        )} - Manual changes.`,
        isManualChanges: true,
      }),
    }).then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      throw new Error("Failed to save changes");
    });
    if (response.success) {
      setIsSavingChangesSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["manuallyUpdatedFiles"] });
      queryClient.setQueryData(
        ["project"],
        (oldProject: ProjectWithCommits) => ({
          ...oldProject,
          commits: [response.commit, ...(oldProject?.commits ?? [])],
        })
      );
    } else {
      setIsSavingChangesError(true);
    }
    setIsSavingChanges(false);
    setShowSaveChanges(false);
  };

  const undoChanges = () => {
    queryClient.setQueryData<File[]>(["manuallyUpdatedFiles"], []);
    setShowSaveChanges(false);
  };

  useUpdateEffect(() => {
    if (isSavingChangesSuccess) {
      setTimeout(() => setIsSavingChangesSuccess(false), 3000);
    }
  }, [isSavingChangesSuccess]);

  useUpdateEffect(() => {
    if (isClosing) {
      setTimeout(() => {
        setIsSavingChangesSuccess(false);
        setIsSavingChangesError(false);
        setIsClosing(false);
      }, 300);
    }
  }, [isClosing]);

  return (
    <div className="flex flex-col h-[calc(100%-0px)] w-full relative overflow-hidden">
      <SandpackLayout className="h-full! flex-row! flex-! rounded-2xl! border! border-border-muted! dark:border-secondary!">
        <Button
          variant="bordered"
          size="icon-xs"
          className="absolute top-2 left-2 z-10"
          onClick={() => setIsFileExplorerCollapsed(!isFileExplorerCollapsed)}
          title={
            isFileExplorerCollapsed
              ? "Expand file explorer"
              : "Collapse file explorer"
          }
        >
          {isFileExplorerCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
        <SandpackFileExplorer
          className={cn(
            "flex-1 h-full! pt-8!",
            isFileExplorerCollapsed
              ? "w-[45px]! min-w-[45px]! flex-[0_1_0%]!"
              : ""
          )}
          autoHiddenFiles={true}
        />
        <AppEditorMonacoEditor setShowSaveChanges={setShowSaveChanges} />
      </SandpackLayout>
      {repoId && (
        <div
          className={cn(
            "absolute bottom-0 left-0 w-full py-3 px-4 transition-all duration-300",
            (!showSaveChanges &&
              !isSavingChangesSuccess &&
              !isSavingChangesError) ||
              isClosing
              ? "translate-y-full opacity-0 pointer-events-none"
              : ""
          )}
        >
          <div
            className={cn(
              "bg-accent/50 backdrop-blur-sm rounded-xl border border-border-muted p-3 flex items-center justify-between",
              isSavingChangesError ? "border-red-500/20 bg-red-500/10!" : "",
              isSavingChangesSuccess
                ? "border-emerald-500/20 bg-emerald-500/10!"
                : ""
            )}
          >
            <div>
              <p
                className={cn(
                  "text-sm font-medium",
                  isSavingChangesSuccess
                    ? "text-emerald-500"
                    : isSavingChangesError
                    ? "text-red-500"
                    : "text-primary"
                )}
              >
                {isSavingChangesSuccess
                  ? "Changes saved"
                  : isSavingChangesError
                  ? "Failed to save changes"
                  : "Save Changes"}
              </p>
              <p
                className={cn(
                  "text-xs text-muted-foreground",
                  isSavingChangesSuccess
                    ? "text-emerald-500"
                    : isSavingChangesError
                    ? "text-red-500"
                    : "text-muted-foreground"
                )}
              >
                {isSavingChangesSuccess
                  ? "Changes saved successfully"
                  : isSavingChangesError
                  ? "Something went wrong, please try again."
                  : "You have unsaved manual changes. Click the button to save your changes."}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              {!isSavingChangesSuccess && !isSavingChanges && (
                <Button size="xs" variant="secondary" onClick={undoChanges}>
                  Undo
                </Button>
              )}

              {isSavingChangesSuccess || isSavingChangesError ? (
                <Button
                  variant={isSavingChangesError ? "destructive" : "default"}
                  size="xs"
                  onClick={() => setIsClosing(true)}
                >
                  Close
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="xs"
                  onClick={handleSaveChanges}
                  disabled={isSavingChanges}
                >
                  Save Changes
                  {isSavingChanges && (
                    <Loading
                      overlay={false}
                      className="text-primary-foreground! size-3.5!"
                    />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
