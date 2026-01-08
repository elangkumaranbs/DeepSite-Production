import {
  BrainIcon,
  ChevronDown,
  DollarSign,
  StarsIcon,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProviderType } from "@/lib/type";
import { MODELS } from "@/lib/providers";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Models({
  model,
  setModel,
  provider,
  setProvider,
}: {
  model: string;
  setModel: (model: string) => void;
  provider: ProviderType;
  setProvider: (provider: ProviderType) => void;
}) {
  const [open, setOpen] = useState(false);

  const formattedModels = useMemo(() => {
    const lists: ((typeof MODELS)[0] | { isCategory: true; name: string })[] =
      [];
    const keys = new Set<string>();
    MODELS.forEach((model) => {
      if (!keys.has(model.companyName)) {
        lists.push({
          isCategory: true,
          name: model.companyName,
          logo: model.logo,
        });
        keys.add(model.companyName);
      }
      lists.push(model);
    });
    return lists;
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="tour-model-section"
          variant={open ? "default" : "bordered"}
          size="xs"
          className="flex items-center gap-1 rounded-full! px-2.5!"
        >
          <span className="max-w-48 truncate">
            {model.split("/").pop()?.toLowerCase()}
          </span>
          <ChevronDown className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="translate-x-6 rounded-2xl! p-0! bg-accent! border-border-muted! min-w-fit text-center overflow-hidden">
        <header className="bg-linear-to-b from-indigo-500/25 dark:from-indigo-500/40 to-accent p-6">
          <div className="flex items-center justify-center -space-x-4 mb-3">
            <div className="size-9 rounded-full bg-pink-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
              💬
            </div>
            <div className="size-11 rounded-full bg-yellow-200 shadow-2xl flex items-center justify-center text-2xl z-2">
              🧠
            </div>
            <div className="size-9 rounded-full bg-green-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
              🤖
            </div>
          </div>
          <p className="text-xl font-semibold text-primary">
            Choose your AI model
          </p>
          <p className="text-sm text-muted-foreground mt-1.5">
            Select the AI model that best fits your needs.
          </p>
        </header>
        <main className="space-y-4 px-6 pb-6">
          <div>
            <Select defaultValue={model} onValueChange={setModel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {formattedModels.map(
                    (
                      item:
                        | (typeof MODELS)[0]
                        | { isCategory: true; name: string }
                    ) => {
                      if ("isCategory" in item) {
                        return (
                          <SelectLabel
                            key={item.name}
                            className="flex items-center gap-1"
                          >
                            {item.name}
                          </SelectLabel>
                        );
                      }
                      const {
                        value,
                        label,
                        isNew = false,
                        isBestSeller = false,
                      } = item;
                      return (
                        <SelectItem key={value} value={value} className="">
                          {value.split("/").pop() || label}
                          {isNew && (
                            <span className="text-xs bg-indigo-500 dark:bg-indigo-500/20 text-primary-foreground dark:text-indigo-500 rounded-full px-1.5 py-0.5">
                              New
                            </span>
                          )}
                          {isBestSeller && (
                            <StarsIcon className="size-3.5 text-yellow-500 fill-yellow-500" />
                          )}
                        </SelectItem>
                      );
                    }
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Provider mode:</p>
            <div
              role="radiogroup"
              aria-label="Provider mode"
              className="flex w-fit items-center gap-1.5"
            >
              {(
                [
                  { value: "cheapest", icon: DollarSign, color: "emerald" },
                  {
                    value: "auto",
                    icon: BrainIcon,
                    color: "indigo",
                    name: "Smartest",
                  },
                  { value: "fastest", icon: Zap, color: "amber" },
                ] as const
              ).map(
                ({
                  value,
                  icon: Icon,
                  color,
                  name,
                }: {
                  value: string;
                  icon: React.ElementType;
                  color: string;
                  name?: string;
                }) => (
                  <div
                    key={value}
                    role="radio"
                    aria-checked={provider === value}
                    tabIndex={0}
                    onClick={() => setProvider(value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setProvider(value);
                      }
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 h-7 px-2.5 text-xs font-medium border border-border rounded-md cursor-pointer transition-colors select-none",
                      "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      provider === value && [
                        "bg-transparent",
                        color === "emerald" &&
                          "[&_svg]:fill-emerald-500 [&_svg]:stroke-emerald-500 bg-emerald-500/10! border-emerald-500/10! text-emerald-500!",
                        color === "indigo" &&
                          "[&_svg]:fill-indigo-500 [&_svg]:stroke-indigo-500 bg-indigo-500/10! border-indigo-500/10! text-indigo-500!",
                        color === "amber" &&
                          "[&_svg]:fill-amber-500 [&_svg]:stroke-amber-500 bg-amber-500/10! border-amber-500/10! text-amber-500!",
                      ]
                    )}
                  >
                    <Icon className="size-3.5" />
                    {name ?? value.charAt(0).toUpperCase() + value.slice(1)}
                  </div>
                )
              )}
            </div>
          </div>
        </main>
      </PopoverContent>
    </Popover>
  );
}
