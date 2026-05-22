import type * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  detail?: string;
  icon?: LucideIcon;
  tone?: "primary" | "cyan" | "violet" | "amber" | "rose" | "neutral";
  trend?: React.ReactNode;
  className?: string;
}

const toneClasses = {
  primary: "text-primary bg-primary/10 border-primary/20",
  cyan: "text-cyan-200 bg-cyan-400/10 border-cyan-400/20",
  violet: "text-violet-200 bg-violet-400/10 border-violet-400/20",
  amber: "text-amber-200 bg-amber-400/10 border-amber-400/20",
  rose: "text-rose-200 bg-rose-400/10 border-rose-400/20",
  neutral: "text-muted-foreground bg-secondary/70 border-border",
};

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "neutral",
  trend,
  className,
}: MetricCardProps) {
  return (
    <div className={cn("surface-panel rounded-lg p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-foreground">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        {Icon && (
          <div className={cn("rounded-lg border p-2", toneClasses[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {(detail || trend) && (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          {detail && <p className="min-w-0 truncate text-muted-foreground">{detail}</p>}
          {trend && <div className="shrink-0">{trend}</div>}
        </div>
      )}
    </div>
  );
}
