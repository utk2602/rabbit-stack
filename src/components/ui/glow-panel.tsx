import type * as React from "react";

import { cn } from "@/lib/utils";

interface GlowPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  accent?: "primary" | "cyan" | "violet" | "rose" | "amber";
}

const accentClasses = {
  primary: "before:bg-primary/12",
  cyan: "before:bg-cyan-400/12",
  violet: "before:bg-violet-400/12",
  rose: "before:bg-rose-400/12",
  amber: "before:bg-amber-400/12",
};

export function GlowPanel({
  children,
  className,
  interactive = false,
  accent = "primary",
  ...props
}: GlowPanelProps) {
  return (
    <div
      className={cn(
        "surface-panel relative overflow-hidden rounded-lg",
        "before:pointer-events-none before:absolute before:-right-20 before:-top-24 before:h-52 before:w-52 before:rounded-full before:blur-3xl before:content-['']",
        accentClasses[accent],
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_20px_70px_rgba(124,247,200,0.08)]",
        className
      )}
      {...props}
    >
      <div className="relative">{children}</div>
    </div>
  );
}
