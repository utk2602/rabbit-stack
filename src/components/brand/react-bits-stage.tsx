"use client";

import type * as React from "react";

import Aurora from "@/components/Aurora";
import { cn } from "@/lib/utils";

interface ReactBitsStageProps {
  children?: React.ReactNode;
  className?: string;
  intensity?: "hero" | "panel" | "quiet";
}

const intensityConfig = {
  hero: {
    amplitude: 1.2,
    blend: 0.55,
    opacity: "opacity-75",
  },
  panel: {
    amplitude: 0.75,
    blend: 0.35,
    opacity: "opacity-35",
  },
  quiet: {
    amplitude: 0.45,
    blend: 0.25,
    opacity: "opacity-20",
  },
};

export function ReactBitsStage({
  children,
  className,
  intensity = "hero",
}: ReactBitsStageProps) {
  const config = intensityConfig[intensity];

  return (
    <div className={cn("relative overflow-hidden bg-background", className)}>
      <div className={cn("absolute inset-x-0 top-0 h-2/3", config.opacity)}>
        <Aurora
          amplitude={config.amplitude}
          blend={config.blend}
          colorStops={["#7cf7c8", "#5bd8ff", "#a78bfa"]}
          speed={0.5}
        />
      </div>
      <div className="absolute inset-0 bg-radar-grid opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,247,200,0.16),transparent_42%),linear-gradient(180deg,rgba(9,11,15,0)_0%,#090b0f_82%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}
