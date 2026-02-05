"use client";
import { ArrowUp, Paintbrush, X } from "lucide-react";
import { FaHand } from "react-icons/fa6";
import { useRef, useState } from "react";
import { HiStop } from "react-icons/hi2";
import { useLocalStorage, useMount, useUpdateEffect } from "react-use";
import { useRouter } from "next/navigation";
import { useNextStep } from "nextstepjs";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGeneration } from "./useGeneration";
import { File, MobileTabType, ProviderType } from "@/lib/type";
import { Models } from "./models";
import { DEFAULT_MODEL, MODELS } from "@/lib/providers";
import { Redesign } from "./redesign";
import { Uploader } from "./uploader";
import { InputMentions } from "./input-mentions";

export function AskAI({
  initialPrompt,
  className,
  onToggleMobileTab,
  files,
  medias,
  tourHasBeenShown,
  isNew = false,
  isHistoryView,
  projectName = "new",
}: {
  initialPrompt?: string;
  className?: string;
  files?: File[] | null;
  medias?: string[] | null;
  tourHasBeenShown?: boolean;
  onToggleMobileTab?: (tab: MobileTabType) => void;
  isNew?: boolean;
  isHistoryView?: boolean;
  projectName?: string;
}) {
  const contentEditableRef = useRef<HTMLDivElement | null>(null);
  const [model = DEFAULT_MODEL, setModel] = useLocalStorage<string>(
    "deepsite-model",
    DEFAULT_MODEL
  );
  const [provider, setProvider] = useLocalStorage<ProviderType>(
    "deepsite-provider",
    "auto" as ProviderType
  );

  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [redesignMd, setRedesignMd] = useState<{
    md: string;
    url: string;
  } | null>(null);
  const [selectedMedias, setSelectedMedias] = useState<string[]>([]);
  const [imageLinks, setImageLinks] = useState<string[]>([]);
  const [startTour, setStartTour] = useState<boolean>(false);

  const router = useRouter();
  const { callAi, isLoading, stopGeneration, audio } =
    useGeneration(projectName);
  const { startNextStep } = useNextStep();

  const onComplete = () => {
    onToggleMobileTab?.("right-sidebar");
  };

  useMount(() => {
    if (initialPrompt && initialPrompt.trim() !== "" && isNew) {
      setTimeout(() => {
        if (isHistoryView) return;
        callAi(
          {
            prompt: initialPrompt,
            model,
            onComplete,
            provider,
          },
          setModel
        );
        router.replace("/new");
      }, 200);
    }
  });

  const onSubmit = () => {
    if (isHistoryView) return;
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = "";
    }
    callAi(
      {
        prompt,
        model,
        onComplete,
        provider,
        redesignMd,
        medias: [...(selectedMedias ?? []), ...(imageLinks ?? [])],
      },
      setModel
    );
    if (selectedMedias.length > 0) setSelectedMedias([]);
    if (imageLinks.length > 0) setImageLinks([]);
    if (redesignMd) setRedesignMd(null);
  };

  return (
    <div
      id="tour-ask-ai-section"
      className={cn(
        "dark:bg-[#222222] bg-accent border border-border-muted rounded-xl p-2.5 block relative",
        className
      )}
    >
      <InputMentions
        ref={contentEditableRef}
        files={files}
        prompt={prompt}
        setPrompt={setPrompt}
        redesignMdUrl={redesignMd?.url?.replace(/(^\w+:|^)\/\//, "")}
        onSubmit={onSubmit}
        imageLinks={imageLinks}
        setImageLinks={setImageLinks}
      />
      <footer className="flex items-center justify-between mt-0">
        <div className="flex items-center gap-1.5">
          {!tourHasBeenShown && (
            <div className="relative z-1">
              <Button
                variant="indigo"
                size="icon-xs"
                className="rounded-full!"
                onClick={() => {
                  setStartTour(true);
                  startNextStep("onboarding");
                }}
              >
                <FaHand className="size-3" />
              </Button>
              {!startTour && (
                <div className="animate-ping h-full rounded-full bg-indigo-500 w-full top-0 left-0 absolute -z-1" />
              )}
            </div>
          )}
          {!isNew && (
            <Uploader
              medias={medias}
              selected={selectedMedias}
              setSelected={setSelectedMedias}
            />
          )}
          <Models
            model={model}
            setModel={setModel}
            provider={provider as ProviderType}
            setProvider={setProvider}
          />
          {!files ||
            (files?.length === 0 &&
              (redesignMd ? (
                <Button
                  size="xs"
                  variant="indigo"
                  className="rounded-full! px-2.5!"
                  onClick={() => setRedesignMd(null)}
                >
                  <Paintbrush className="size-3" />
                  {redesignMd.url?.replace(/(^\w+:|^)\/\//, "")}
                  <X className="size-3.5" onClick={() => setRedesignMd(null)} />
                </Button>
              ) : (
                <Redesign
                  onRedesign={(md, url) => {
                    setRedesignMd({
                      md,
                      url,
                    });
                  }}
                />
              )))}
        </div>
        <div>
          {isLoading ? (
            <Button
              size="icon-sm"
              className="rounded-full!"
              variant="bordered"
              onClick={stopGeneration}
            >
              <HiStop />
            </Button>
          ) : (
            <Button
              size="icon-sm"
              className="rounded-full!"
              disabled={
                isHistoryView ||
                isLoading ||
                (prompt.trim() === "" && !redesignMd)
              }
              onClick={onSubmit}
            >
              <ArrowUp />
            </Button>
          )}
        </div>
      </footer>
      <audio ref={audio} id="audio" className="hidden">
        <source src="/ding.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
