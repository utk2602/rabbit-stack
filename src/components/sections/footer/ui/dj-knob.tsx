"use client"
import React, { useRef, useState, useEffect } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

export default function DjKnob() {
  const knobRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<SVGPathElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [rotation, setRotation] = useState(0)

  useGSAP(() => {
    if (indicatorRef.current) {
      gsap.to(indicatorRef.current, {
        rotation: rotation,
        transformOrigin: "50% 50%",
        duration: 0.5,
        ease: "power2.out",
      })
    }
  }, [rotation])

  const handleStart = () => {
    setIsDragging(true)
    document.body.style.userSelect = "none"
  }

  const handleEnd = () => {
    setIsDragging(false)
    document.body.style.userSelect = ""
  }

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !knobRef.current) return

    const rect = knobRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    const dist = Math.sqrt(
      Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2),
    )
    if (dist > 100) return

    const angleRad = Math.atan2(clientY - centerY, clientX - centerX)
    let angleDeg = angleRad * (180 / Math.PI) + 90

    if (angleDeg > 180) angleDeg -= 360

    const diff = Math.abs(angleDeg - rotation)
    if (diff > 180) return

    const clampedAngle = Math.max(-120, Math.min(120, angleDeg))
    setRotation(clampedAngle)
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
  }, [isDragging, rotation])

  return (
    <div
      ref={knobRef}
      className="relative flex aspect-square w-[70%] min-w-6 cursor-pointer items-center justify-center"
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <div className="pointer-events-none aspect-square h-full w-full">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 83 83"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="41.3768"
            cy="41.3767"
            r="38.581"
            fill="#52F6EE"
            stroke="#142441"
            strokeWidth="5.59145"
          />
          <path
            ref={indicatorRef}
            d="M37.4675 59.8283C20.1309 57.5666 12.8605 30.1936 38.0266 21.8064C38.0266 31.3119 37.6302 38.0216 41.3769 38.0216C44.7289 38.0216 44.7318 31.8982 44.7364 21.8732L44.7364 21.8064C70.4535 29.0753 63.185 63.1831 37.4675 59.8283Z"
            fill="#14233F"
            stroke="black"
            strokeWidth="1.11829"
          />
        </svg>
      </div>
    </div>
  )
}
