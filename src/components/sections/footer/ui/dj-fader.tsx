"use client"
import React, { useRef, useState, useEffect } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

export default function DjFader({
  className = "",
  initialPos = 50,
}: {
  className?: string
  initialPos?: number
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [yPos, setYPos] = useState(initialPos)

  useGSAP(() => {
    if (knobRef.current) {
      gsap.to(knobRef.current, {
        top: `${yPos}%`,
        duration: 0.5,
        ease: "power2.out",
      })
    }
  }, [yPos])

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    document.body.style.userSelect = "none"
  }

  const handleEnd = () => {
    setIsDragging(false)
    document.body.style.userSelect = ""
  }

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !trackRef.current) return

    const rect = trackRef.current.getBoundingClientRect()
    const moveY = "touches" in e ? e.touches[0].clientY : e.clientY
    let relativeY = moveY - rect.top

    const padding = rect.height * 0.05
    relativeY = Math.max(padding, Math.min(rect.height - padding, relativeY))

    const percentage = (relativeY / rect.height) * 100
    setYPos(percentage)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMove)
      window.addEventListener("mouseup", handleEnd)
      window.addEventListener("touchmove", handleMove)
      window.addEventListener("touchend", handleEnd)
    } else {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleEnd)
      window.removeEventListener("touchmove", handleMove)
      window.removeEventListener("touchend", handleEnd)
    }
    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleEnd)
      window.removeEventListener("touchmove", handleMove)
      window.removeEventListener("touchend", handleEnd)
    }
  }, [isDragging])

  return (
    <div
      className={`relative flex h-40 w-12 items-center justify-center rounded-xs bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] ${className}`}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <div
        ref={trackRef}
        className="absolute top-4 bottom-4 w-4 rounded-full bg-black"
      >
        <div
          ref={knobRef}
          className="absolute left-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full bg-[#374151] shadow-md transition-transform hover:scale-105 active:cursor-grabbing"
          style={{ top: `${yPos}%` }}
        >
          <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]"></div>
        </div>
      </div>
    </div>
  )
}
