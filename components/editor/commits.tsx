import { useRef, useState } from "react";
import { HistoryIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useUpdateEffect } from "react-use";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Commit } from "@/lib/type";
import { cn, humanizeNumber } from "@/lib/utils";

export const Commits = function ({ commits }: { commits?: Commit[] }) {
  const searchParams = useSearchParams();
  const commitParam = searchParams.get("commit");

  const commitsContainer = useRef<HTMLUListElement>(null);
  const commitSelected = useRef<HTMLLIElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(
    commitParam
      ? commitParam
      : commits && commits.length > 0
      ? commits[0]?.oid
      : null
  );

  const handleViewCommit = (commitId: string) => {
    let url = window.location.pathname;
    if (commitId !== commits?.[0].oid) {
      url += `?commit=${encodeURIComponent(commitId)}`;
    }
    window.location.replace(url);
  };

  useUpdateEffect(() => {
    if (open) {
      setTimeout(() => {
        if (commitSelected.current && commitsContainer.current) {
          const container = commitsContainer.current;
          const selected = commitSelected.current;
          if (!container || !selected) return;
          const offsetTop = selected.offsetTop;
          const offsetHeight = selected.offsetHeight;
          const containerHeight = container.offsetHeight;
          const scrollTop = offsetTop - containerHeight / 2 + offsetHeight / 2;
          container.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        }
      }, 200);
    }
  }, [open]);

  useUpdateEffect(() => {
    if (selectedCommit !== commits?.[0].oid && !commitParam) {
      setSelectedCommit(commits ? commits[0]?.oid : null);
    }
  }, [commits]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <form>
        <PopoverTrigger asChild>
          <Button variant={open ? "default" : "ghost"} size="icon-xs">
            <HistoryIcon className="size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="rounded-2xl! p-0! overflow-hidden!"
        >
          <header className="bg-background px-3 py-2 border-b border-background-foreground text-xs text-muted-foreground font-medium flex items-center justify-center gap-1.5">
            Historical Versions
            <span className="py-0.5 px-1 text-[10px] inline-flex items-center justify-center rounded font-semibold bg-accent text-primary font-mono">
              {humanizeNumber(commits ? commits.length : 0)}
            </span>
          </header>
          <ul
            ref={commitsContainer}
            className="p-1 space-y-1 max-h-80 overflow-y-auto"
          >
            {commits?.map((commit) => (
              <li
                key={commit.oid}
                className={cn(
                  "overflow-hidden group relative px-3 py-2 text-xs cursor-pointer rounded-lg",
                  selectedCommit === commit.oid
                    ? "bg-indigo-500/10 text-indigo-600"
                    : "hover:bg-accent"
                )}
                ref={selectedCommit === commit.oid ? commitSelected : undefined}
                onClick={() => handleViewCommit(commit.oid)}
              >
                <p className="truncate break-all">{commit.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(commit.date).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </form>
    </Popover>
  );
};
