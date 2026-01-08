import { useState } from "react";
import { Paintbrush } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import Loading from "@/components/loading";

export function Redesign({
  onRedesign,
}: {
  onRedesign: (md: string, url: string) => void;
}) {
  const [url, setUrl] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkIfUrlIsValid = (url: string) => {
    const urlPattern = new RegExp(
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
      "i"
    );
    return urlPattern.test(url);
  };

  const handleClick = async () => {
    setError(null);
    if (isLoading) return;
    if (!url) {
      toast.error("Please enter a URL.");
      return;
    }
    if (!checkIfUrlIsValid(url)) {
      toast.error("Please enter a valid URL.");
      return;
    }
    setIsLoading(true);
    const response = await fetch("/api/redesign", {
      method: "PUT",
      body: JSON.stringify({ url: url.trim() }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (response?.ok) {
          const data = await response.json();
          return data;
        }
      })
      .catch((error) => {
        setError(error.message);
      });
    if (response.ok) {
      onRedesign(response.markdown, url);
    }
    setIsLoading(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <form>
        <PopoverTrigger asChild>
          <Button
            size="xs"
            id="tour-redesign-section"
            variant={open ? "default" : "bordered"}
            className="rounded-full! px-2.5!"
          >
            <Paintbrush className="size-3.5" />
            Redesign
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="rounded-2xl! p-0! bg-accent! border-border-muted! min-w-xs text-center overflow-hidden"
        >
          <header className="bg-linear-to-b from-indigo-500/25 dark:from-indigo-500/40 to-accent p-6">
            <div className="flex items-center justify-center -space-x-4 mb-3">
              <div className="size-9 rounded-full bg-pink-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
                🎨
              </div>
              <div className="size-11 rounded-full bg-amber-200 shadow-2xl flex items-center justify-center text-2xl z-2">
                🥳
              </div>
              <div className="size-9 rounded-full bg-sky-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
                💎
              </div>
            </div>
            <p className="text-xl font-semibold text-primary">
              Redesign your Site!
            </p>
            <p className="text-sm text-muted-foreground mt-1.5">
              Try our new Redesign feature to give your site a fresh look.
            </p>
          </header>
          <main className="space-y-4 p-6">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Enter your website URL to get started:
              </p>
              <Input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={(e) => {
                  const inputUrl = e.target.value.trim();
                  if (!inputUrl) {
                    setUrl("");
                    return;
                  }
                  if (!checkIfUrlIsValid(inputUrl)) {
                    toast.error("Please enter a valid URL.");
                    return;
                  }
                  setUrl(inputUrl);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleClick();
                  }
                }}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Then, let&apos;s redesign it!
              </p>
              <Button onClick={handleClick} className="relative w-full">
                {isLoading ? (
                  <>
                    <Loading
                      overlay={false}
                      className="ml-2 size-4 animate-spin text-primary-foreground"
                    />
                    Fetching your site...
                  </>
                ) : (
                  <>
                    Redesign <Paintbrush className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </main>
        </PopoverContent>
      </form>
    </Popover>
  );
}
