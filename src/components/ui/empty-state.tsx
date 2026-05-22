import type * as React from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const button = action?.href ? (
    <Button asChild>
      <a href={action.href}>{action.label}</a>
    </Button>
  ) : action ? (
    <Button onClick={action.onClick}>{action.label}</Button>
  ) : null;

  return (
    <div
      className={cn(
        "surface-panel-quiet flex flex-col items-center justify-center rounded-lg px-6 py-14 text-center",
        className
      )}
    >
      <div className="mb-4 rounded-lg border border-border bg-secondary/70 p-3 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      )}
      {button && <div className="mt-5">{button}</div>}
    </div>
  );
}

export function LoadingState({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center py-16 text-muted-foreground", className)}>
      <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "surface-panel-quiet flex flex-col items-center justify-center rounded-lg px-6 py-14 text-center",
        className
      )}
    >
      <div className="mb-4 rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-rose-200">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
