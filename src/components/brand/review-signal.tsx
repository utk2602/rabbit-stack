import { cn } from "@/lib/utils";

export function ReviewSignal({
  className,
  label = "AI review signal",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-lg border border-primary/20 bg-secondary/50",
        className
      )}
      aria-label={label}
    >
      <div className="absolute inset-5 rounded-full border border-primary/15" />
      <div className="absolute inset-10 rounded-full border border-cyan-400/15" />
      <div className="absolute inset-16 rounded-full border border-violet-400/15" />
      <div
        className="absolute left-1/2 top-1/2 h-[46%] w-px origin-bottom bg-linear-to-t from-primary/0 via-primary/70 to-primary"
        style={{ animation: "radar-sweep 4.8s linear infinite" }}
      />
      <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_30px_rgba(124,247,200,0.5)]" />
      <div className="absolute left-[64%] top-[30%] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(91,216,255,0.6)]" />
      <div className="absolute left-[28%] top-[67%] h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(167,139,250,0.6)]" />
      <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-primary/10 to-transparent" />
    </div>
  );
}

