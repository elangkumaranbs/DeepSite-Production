"use client";
import Image from "next/image";
import { useMount } from "react-use";
import { useState } from "react";
import { EXAMPLES_OF_PROJECT_SUGGESTIONS } from "@/lib/prompts";

interface ExampleOfProjectSuggestion {
  short_value: string;
  long_value: string;
}

export function BlankPage() {
  const [suggestions, setSuggestions] = useState<ExampleOfProjectSuggestion[]>(
    []
  );

  useMount(() => {
    const randomSuggestions = [...EXAMPLES_OF_PROJECT_SUGGESTIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    setSuggestions(randomSuggestions);
  });
  return (
    <div className="bg-card max-w-lg w-full px-10 py-6 z-1 rounded-xl shadow-accent-foreground mx-auto">
      <header className="flex flex-col items-center justify-center">
        <Image
          src="/logo.svg"
          alt="DeepSite"
          width={56}
          height={56}
          className="size-14 mb-2"
        />
        <h2 className="text-xl font-extrabold font-mono mb-2 text-primary">
          DeepSite
        </h2>
        <p className="text-sm text-muted-foreground text-center text-balance">
          Your next web-based application is waiting to be built. <br />
          Ask me anything about DeepSite and AI, and I&apos;ll help you build
          it.
        </p>
      </header>
      <main className="mt-4">
        <p className="text-sm text-muted-foreground text-center text-balance mb-3">
          Here are some suggestions for you:
        </p>
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.short_value}
              className="text-xs rounded-full px-3 py-1 text-muted-foreground text-center bg-accent/50 hover:bg-accent-foreground/8 cursor-pointer border border-border"
              onClick={() => {
                const promptInput = document.getElementById("prompt-input");
                if (promptInput) {
                  (promptInput as HTMLDivElement).textContent =
                    suggestion.long_value;
                }
              }}
            >
              {suggestion.short_value}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
