import { Paperclip } from "lucide-react";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
// todo: implement the uploader component

export const Uploader = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-start gap-1 flex-wrap">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon-xs"
            variant={open ? "default" : "bordered"}
            className="rounded-full!"
          >
            <Paperclip className="size-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="space-y-4 min-w-fit rounded-2xl! p-0!"
        >
          <main className="p-4">
            <p className="text-xs text-muted-foreground mb-2.5">
              Upload a file
            </p>
          </main>
        </PopoverContent>
      </Popover>
    </div>
  );
};
