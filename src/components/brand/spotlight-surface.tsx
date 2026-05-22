"use client";

import type * as React from "react";

import SpotlightCard from "@/components/SpotlightCard";
import { cn } from "@/lib/utils";

interface SpotlightSurfaceProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
}

export function SpotlightSurface({
  children,
  className,
  spotlightColor = "rgba(124, 247, 200, 0.18)",
}: SpotlightSurfaceProps) {
  return (
    <SpotlightCard
      spotlightColor={spotlightColor}
      className={cn(
        "surface-panel p-0 transition-colors hover:border-primary/30",
        className
      )}
    >
      <div className="relative">{children}</div>
    </SpotlightCard>
  );
}
