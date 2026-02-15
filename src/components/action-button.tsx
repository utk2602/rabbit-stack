"use client"
import React from "react"
import { ActionButtonProps } from "@/types/props"

export default function ActionButton({
  className = "",
  playAction = false,
  type = "primary",
  text = "ACTION",
  onClick,
}: ActionButtonProps) {
  const baseStyle =
    "relative cursor-pointer select-none rounded-sm px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-150 border-2"

  const primaryStyle = playAction
    ? "bg-[#1F1F1F] text-white border-[#1F1F1F] hover:bg-[#333] shadow-[0_4px_0_#000]"
    : "bg-white text-[#1F1F1F] border-[#1F1F1F] hover:bg-gray-100 shadow-[0_4px_0_#999]"

  const secondaryStyle = playAction
    ? "bg-white text-[#1F1F1F] border-[#1F1F1F] hover:bg-gray-100 shadow-[0_4px_0_#999]"
    : "bg-[#1F1F1F] text-white border-[#1F1F1F] hover:bg-[#333] shadow-[0_4px_0_#000]"

  const typeStyle = type === "primary" ? primaryStyle : secondaryStyle

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${typeStyle} ${className} active:translate-y-1 active:shadow-none`}
      style={{ fontFamily: "var(--font-azurio), sans-serif" }}
    >
      {text}
    </button>
  )
}
