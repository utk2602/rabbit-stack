"use client"
import React, { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

export default function Visualizer({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  const barCount = 8
  const totalSlots = 12

  const columnConfig = [
    { min: 2, max: 4 },
    { min: 3, max: 6 },
    { min: 4, max: 9 },
    { min: 6, max: 11 },
    { min: 6, max: 11 },
    { min: 4, max: 9 },
    { min: 3, max: 6 },
    { min: 2, max: 4 },
  ]

  useGSAP(
    () => {
      const columns = gsap.utils.toArray(".vis-col") as HTMLElement[]

      columns.forEach((col, i) => {
        const config = columnConfig[i]
        const blocks = col.querySelectorAll(
          ".vis-block",
        ) as NodeListOf<HTMLElement>

        const proxy = { value: config.min }

        const animate = () => {
          const targetHeight = gsap.utils.random(config.min, config.max, 1)
          const duration = gsap.utils.random(0.1, 0.3)
          gsap.to(proxy, {
            value: targetHeight,
            duration: duration,
            ease: "power1.inOut",
            onUpdate: () => {
              const currentH = Math.round(proxy.value)
              blocks.forEach((block, j) => {
                block.style.opacity = j < currentH ? "1" : "0"
              })
            },
            onComplete: animate,
          })
        }

        animate()
      })
    },
    { scope: containerRef },
  )

  return (
    <div
      ref={containerRef}
      className={`relative !h-40 overflow-hidden rounded-sm border-[1.45px] border-[#FDF2F0] bg-[#114C80] px-8 py-5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] ${className}`}
    >
      <div className="flex h-full items-end justify-between gap-2 bg-[#020605] px-4 shadow-[1px_1px_0px_0px_#FFFFFF]">
        {[...Array(barCount)].map((_, i) => (
          <div
            key={i}
            className="vis-col flex h-full w-full flex-col-reverse items-center gap-1"
          >
            {[...Array(totalSlots)].map((__, j) => (
              <div
                key={j}
                className="vis-block min-h-[4px] w-full flex-1 bg-[#F4E100] transition-opacity duration-75"
                style={{ opacity: 0 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
