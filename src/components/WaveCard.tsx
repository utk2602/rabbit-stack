"use client";

import { SineWaveGraph } from "@/components/SineWaveGraph";

interface WaveCardProps {
  title: string;
  subtitle?: string;
  color?: string;
  waves?: number;
  amplitude?: number;
  frequency?: number;
  height?: number;
}

export function WaveCard({
  title,
  subtitle,
  color = "#ffe0c2",
  waves = 3,
  amplitude = 28,
  frequency = 0.018,
  height = 100,
}: WaveCardProps) {
  return (
    <div className="bg-card/30 border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors group">
      <div className="p-4 pb-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="px-2 pb-2">
        <SineWaveGraph
          color={color}
          waves={waves}
          amplitude={amplitude}
          frequency={frequency}
          height={height}
          speed={0.8}
          lineWidth={1.5}
        />
      </div>
    </div>
  );
}
