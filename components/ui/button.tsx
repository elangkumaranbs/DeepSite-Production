import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary hover:border-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        transparent: "bg-accent-foreground/5 hover:bg-accent-foreground/10",
        link: "text-primary underline-offset-4 hover:underline",
        bordered:
          "border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        indigo:
          "border border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/30",
        gradient:
          "bg-linear-to-r from-rose-500/80 via-fushia-500/80 to-yellow-500/80 text-white hover:brightness-110 font-semibold!",
        "ghost-bordered":
          "border bg-primary-foreground hover:bg-background hover:text-accent-foreground dark:hover:bg-accent/50",
        pro: "bg-linear-to-br from-pink-500 dark:from-pink-500/50 via-green-500 dark:via-green-500/50 to-amber-500 dark:to-amber-500/50 text-white hover:brightness-120 font-semibold! [&_img]:grayscale [&_img]:brightness-1 [&_img]:invert dark:[&_img]:invert-0 dark:[&_img]:grayscale-0 dark:[&_img]:brightness-100",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        xs: "h-7 rounded-md gap-1.5 px-2 has-[>svg]:px-1.5 text-xs",
        xxs: "h-6 rounded-md gap-1.5 px-2 has-[>svg]:px-1.5 text-[10px]",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        "icon-xs": "size-7 rounded-md!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
