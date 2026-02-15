"use client"
import React from "react"

export default function RecordPlayer({
  className = "",
}: {
  className?: string
}) {
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <div className="absolute top-7 right-0 bottom-[10%] left-0 w-full rounded-l-3xl border-1 border-[#FDF2F0] bg-[#114C80] shadow-lg">
        <div className="absolute top-1/2 left-4 flex -translate-y-1/2 flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-4 w-4 rounded-full border-2 border-white bg-[#374151] shadow-sm"
            />
          ))}
        </div>
        <div className="absolute bottom-6 left-6 flex gap-3">
          <div className="h-8 w-3 border-2 border-white bg-[#374151]" />
          <div className="h-8 w-3 border-2 border-white bg-[#374151]" />
        </div>
      </div>

      <div className="absolute top-0 right-[-10%] bottom-0 z-40 flex w-full items-center justify-center">
        <div className="relative flex h-full w-full animate-[spin_12s_linear_infinite] items-center justify-center">
          {/* Vinyl disc drawn with CSS */}
          <div className="absolute inset-[10%] rounded-full bg-gradient-to-br from-[#1a1a1a] via-[#333] to-[#1a1a1a] shadow-2xl">
            <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-[#222] via-[#444] to-[#222]">
              <div className="absolute inset-[30%] rounded-full bg-primary flex items-center justify-center">
                <span className="font-bebas-rounded text-primary-foreground text-xs">RS</span>
              </div>
            </div>
            {/* Vinyl grooves */}
            <div className="absolute inset-[5%] rounded-full border border-white/5" />
            <div className="absolute inset-[10%] rounded-full border border-white/5" />
            <div className="absolute inset-[20%] rounded-full border border-white/5" />
          </div>
          <svg
            viewBox="0 0 100 100"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <defs>
              <path
                id="textCircle"
                d="M 50, 50 m -30, 0 a 30,30 0 1,1 60, 0 a 30,30 0 1,1 -60, 0"
              />
            </defs>

            <text
              className="font-bebas-rounded"
              fill="#ffe0c2"
              fontSize="16"
              fontWeight="bold"
              letterSpacing="0.05em"
            >
              <textPath
                xlinkHref="#textCircle"
                startOffset="50%"
                textAnchor="middle"
              >
                RABBIT{"\u00A0"}STACK{"\u00A0"}AI{"\u00A0"}
              </textPath>
            </text>
          </svg>
        </div>
      </div>

      <style jsx global>{`
        @keyframes sway {
          0%,
          100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(2deg);
          }
        }
      `}</style>
    </div>
  )
}
