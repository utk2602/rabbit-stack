"use client";

import ShinyText from "@/components/ShinyText";
import { cn } from "@/lib/utils";

export function AnimatedWordmark({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "grid shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary text-primary-foreground shadow-[0_0_28px_rgba(124,247,200,0.2)]",
          compact ? "h-7 w-7 text-sm" : "h-9 w-9 text-lg"
        )}
      >
        <span className="font-brand font-black">R</span>
      </div>
      <ShinyText
        text="Rabbit Stack"
        speed={3.6}
        color="#f4f7fb"
        shineColor="#7cf7c8"
        className={cn("font-brand font-semibold tracking-normal", compact ? "text-sm" : "text-lg")}
      />
    </div>
  );
}

