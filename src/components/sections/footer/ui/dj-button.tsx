"use client"
import React, { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

type DjButtonProps = {
  variant?: "cyan" | "yellow"
  onClick?: () => void
  className?: string
}

export default function DjButton({
  variant = "cyan",
  onClick,
  className = "",
}: DjButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const bgClass = variant === "cyan" ? "bg-[#55F6EE]" : "bg-[#E5F94B]"

  const { contextSafe } = useGSAP({ scope: buttonRef })

  const handlePress = contextSafe(() => {
    gsap.to(buttonRef.current, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut",
      onComplete: onClick,
    })
  })

  return (
    <button
      ref={buttonRef}
      onClick={handlePress}
      className={`aspect-square w-full rounded-xs ${bgClass} hover: border-[#B3C4DE] transition-colors ${className} `}
    />
  )
}
