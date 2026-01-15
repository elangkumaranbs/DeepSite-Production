"use client";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { useLocalStorage, useMount } from "react-use";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ProviderType } from "@/lib/type";
import { Models } from "./models";
import { DEFAULT_MODEL } from "@/lib/providers";
import { cn } from "@/lib/utils";

export function AskAiLanding({ className }: { className?: string }) {
  const [model = DEFAULT_MODEL, setModel] = useLocalStorage<string>(
    "deepsite-model",
    DEFAULT_MODEL
  );
  const [provider, setProvider] = useLocalStorage<ProviderType>(
    "deepsite-provider",
    "auto" as ProviderType
  );
  const router = useRouter();
  const [prompt, setPrompt] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);

  useMount(() => {
    setMounted(true);
  });

  return (
    <div
      className={cn(
        "dark:bg-[#222222] bg-accent border border-border-muted rounded-xl p-3 block relative",
        className
      )}
    >
      <textarea
        id="prompt-input"
        className="w-full h-full resize-none outline-none text-primary text-sm"
        placeholder="Ask me anything..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            router.push(`/new?prompt=${prompt}`);
          }
        }}
      />
      <footer className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {mounted && (
            <Models
              model={model}
              setModel={setModel}
              provider={provider as ProviderType}
              setProvider={setProvider}
            />
          )}
        </div>
        <div>
          <Button
            size="icon-sm"
            className="rounded-full!"
            onClick={() => {
              router.push(`/new?prompt=${prompt}`);
            }}
          >
            <ArrowUp />
          </Button>
        </div>
      </footer>
    </div>
  );
}
