"use client"
import React from "react"
import ContactSection from "./contact-section"
import MixerSection from "./mixer-section"
import PlayerSection from "./player-section"
import RecordPlayer from "./record-player"

export default function Footer() {
  return (
    <footer className="flex w-full items-center justify-end bg-[#1F1F1F]">
      <div className="relative min-h-[65vh] w-full max-w-[1920px] overflow-hidden bg-[#FFFFF] shadow-2xl sm:min-h-[68vh] md:min-h-[70vh] xl:flex xl:min-h-[55vh] xl:flex-row">
        <div className="flex w-full justify-between xl:hidden">
          <div className="pointer-events-none absolute bottom-[-40%] left-[-20%] z-10 h-[70%] w-[60%] origin-bottom-left scale-100 rotate-[10deg] sm:bottom-[-32%] sm:left-[-15%] sm:scale-110 sm:rotate-[8deg] md:bottom-[-22%] md:left-[-8%] md:scale-100 md:rotate-[6deg] lg:bottom-[-24%] lg:left-[-4%] lg:scale-100 lg:rotate-[6deg]">
            <MixerSection />
          </div>

          <div className="pointer-events-none absolute right-[42%] bottom-[-30%] z-20 aspect-square h-[65%] origin-bottom-right scale-80 rotate-[75deg] sm:right-[42%] sm:bottom-[-43%] sm:scale-120 sm:rotate-[78deg] md:right-[45%] md:bottom-[-45%] md:scale-130 md:rotate-[80deg] lg:right-[42%] lg:bottom-[-68%] lg:scale-160 lg:rotate-[80deg]">
            <RecordPlayer />
          </div>
        </div>

        <div className="relative z-20 flex w-full items-center justify-center px-4 py-10 xl:hidden">
          <ContactSection />
        </div>

        <div className="pointer-events-none absolute bottom-[-38%] left-1/2 z-[5] -translate-x-1/2 sm:bottom-[-30%] md:bottom-[-20%] lg:bottom-[-10%] xl:hidden">
          <div className="relative h-[120vw] max-h-[700px] w-[120vw] max-w-[700px]">
            <div className="absolute inset-0 rounded-full bg-white/5" />
            <div className="absolute inset-[10%] rounded-full bg-white/10" />
            <div className="absolute inset-[20%] rounded-full bg-white/15" />
          </div>
        </div>

        <div className="hidden w-full xl:flex">
          <div className="flex-[1.1] overflow-hidden pt-6 pb-6 pl-6">
            <MixerSection />
          </div>

          <div className="relative flex h-full flex-1 items-center justify-center px-2 py-4">
            <ContactSection />
          </div>

          <div className="relative flex-[0.9] py-6 pr-0">
            <PlayerSection />
          </div>
        </div>
      </div>
    </footer>
  )
}
