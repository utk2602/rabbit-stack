"use client";

import React, { useEffect, useRef } from "react";

interface SineWaveGraphProps {
  /** Number of overlaid waves */
  waves?: number;
  /** Base amplitude in px */
  amplitude?: number;
  /** Base frequency */
  frequency?: number;
  /** Canvas height */
  height?: number;
  /** Wave color (CSS color string) */
  color?: string;
  /** Animation speed factor */
  speed?: number;
  /** Line width */
  lineWidth?: number;
  /** Background fill (transparent if empty) */
  bgColor?: string;
}

export function SineWaveGraph({
  waves = 3,
  amplitude = 30,
  frequency = 0.015,
  height = 120,
  color = "#ffe0c2",
  speed = 1,
  lineWidth = 1.6,
  bgColor = "",
}: SineWaveGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    resizeObserver.observe(canvas);

    let t = 0;

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      for (let i = 0; i < waves; i++) {
        const waveAmp = amplitude * (1 - i * 0.2);
        const waveFreq = frequency * (1 + i * 0.3);
        const phase = t * speed * (0.8 + i * 0.15) + i * 1.2;
        const opacity = 1 - i * 0.25;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = opacity;
        ctx.lineWidth = lineWidth - i * 0.3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        for (let x = 0; x <= w; x++) {
          const y =
            h / 2 +
            Math.sin(x * waveFreq + phase) * waveAmp +
            Math.sin(x * waveFreq * 0.5 + phase * 0.7) * waveAmp * 0.3;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      t += 0.02;
      animIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animIdRef.current);
    };
  }, [waves, amplitude, frequency, height, color, speed, lineWidth, bgColor]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height }}
    />
  );
}
