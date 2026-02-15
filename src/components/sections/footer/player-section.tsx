"use client"
import React from "react"
import RecordPlayer from "./record-player"
import DjButton from "@/components/sections/footer/ui/dj-button"
import DjKnob from "@/components/sections/footer/ui/dj-knob"
import DjFader from "@/components/sections/footer/ui/dj-fader"

export default function PlayerSection() {
  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden md:gap-0 lg:flex-row">
      <div className="flex hidden h-auto w-full flex-col items-center justify-between bg-[#AD7CFF] p-4 pl-0 lg:flex lg:h-full lg:w-[35%]">
        <div className="-mb-4 flex gap-4">
          <DjKnob />
          <DjKnob />
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-x-1 gap-y-4 px-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex w-[30%] justify-center">
              <div className="w-7">
                <DjButton variant="yellow" className="border-b-4 shadow-lg" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex w-full justify-center gap-2">
          <DjFader initialPos={60} />
          <DjFader initialPos={40} />
          <DjFader initialPos={80} />
        </div>

        <div className="mb-4 flex gap-6">
          <div className="relative h-11 w-10 cursor-pointer rounded-xs border-2 border-white bg-gray-300 shadow-md transition-transform select-none active:scale-95">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-bold text-xs text-primary-foreground">RS</span>
            </div>
          </div>
          <div className="relative h-11 w-10 cursor-pointer rounded-xs border-2 border-white bg-gray-300 shadow-md transition-transform select-none active:scale-95">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-bold text-xs text-primary-foreground">AI</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none relative h-full w-[65%] overflow-hidden">
        <div className="absolute top-0 right-[-45%] bottom-0 flex w-[140%] items-center justify-center lg:pr-0">
          <RecordPlayer />
        </div>
      </div>
    </div>
  )
}
