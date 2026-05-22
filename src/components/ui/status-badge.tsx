import type * as React from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Clock3, Loader2, ShieldAlert, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type StatusTone = "good" | "info" | "warn" | "bad" | "idle";

const toneClasses: Record<StatusTone, string> = {
  good: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  info: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
  warn: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  bad: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  idle: "border-border bg-secondary/70 text-muted-foreground",
};

const defaultIcons: Record<StatusTone, LucideIcon> = {
  good: CheckCircle2,
  info: Loader2,
  warn: ShieldAlert,
  bad: XCircle,
  idle: Clock3,
};

interface StatusBadgeProps {
  children: React.ReactNode;
  tone?: StatusTone;
  icon?: LucideIcon;
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({
  children,
  tone = "idle",
  icon,
  pulse = false,
  className,
}: StatusBadgeProps) {
  const Icon = icon ?? defaultIcons[tone];

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium leading-none",
        toneClasses[tone],
        className
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          pulse && "animate-spin",
          !pulse && tone === "good" && "opacity-90"
        )}
      />
      <span className="truncate">{children}</span>
    </span>
  );
}

export function StatusPulse({
  tone = "good",
  className,
}: {
  tone?: StatusTone;
  className?: string;
}) {
  const color =
    tone === "bad"
      ? "bg-rose-400"
      : tone === "warn"
        ? "bg-amber-400"
        : tone === "info"
          ? "bg-cyan-400"
          : tone === "idle"
            ? "bg-muted-foreground"
            : "bg-primary";

  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      <span
        className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-60",
          color
        )}
        style={{ animation: "signal-pulse 1.8s ease-in-out infinite" }}
      />
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", color)} />
    </span>
  );
}
