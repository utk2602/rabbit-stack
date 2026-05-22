import type * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border/80 pb-6 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {(eyebrow || Icon) && (
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
            {Icon && <Icon className="h-4 w-4" />}
            {eyebrow && <span>{eyebrow}</span>}
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
        {meta && <div className="mt-4 flex flex-wrap gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
