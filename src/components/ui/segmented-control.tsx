import { cn } from "@/lib/utils";

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: Array<SegmentedControlOption<T>>;
  onValueChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onValueChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-border bg-secondary/70 p-1",
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onValueChange(option.value)}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors",
              active && "bg-primary text-primary-foreground shadow-sm",
              !active && "hover:bg-accent hover:text-foreground"
            )}
          >
            <span>{option.label}</span>
            {typeof option.count === "number" && (
              <span
                className={cn(
                  "rounded-sm px-1.5 py-0.5 text-xs",
                  active ? "bg-primary-foreground/15" : "bg-muted text-muted-foreground"
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

