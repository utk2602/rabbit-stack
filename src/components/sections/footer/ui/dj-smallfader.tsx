"use client"
import React, { useRef, useState, useEffect } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import DjButton from "./dj-button"

export default function DjSmallFader({ buttonSize = 15 }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [yPos, setYPos] = useState(50)

  useGSAP(() => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
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
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    let relativeY = clientY - rect.top
    relativeY = Math.max(0, Math.min(rect.height, relativeY))

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
      ref={trackRef}
      className="relative mx-auto h-12 w-1.5 cursor-pointer rounded-full bg-black"
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <div
        ref={buttonRef}
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
        style={{
          width: buttonSize,
          top: "50%",
        }}
      >
        <div className="pointer-events-none">
          <DjButton variant="yellow" className="border-b-2" />
        </div>
      </div>
    </div>
  )
}
