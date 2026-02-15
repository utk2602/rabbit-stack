"use client"
import React, { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import BackgroundHero from "./background-hero"
import Canvas3DGrid from "./canvas-3d-grid"
import Canvas2DFlippingGrid from "./canvas-2d-grid"
import MusicPlayerRadio from "@/components/radio"

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const radioRef = useRef<HTMLDivElement>(null)
  const heroMainRef = useRef<HTMLElement>(null)
  const bgHeroRef = useRef<HTMLDivElement>(null)
  const canvas2DRef = useRef<HTMLDivElement>(null)
  const canvas3DRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!radioRef.current || !heroMainRef.current) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: heroMainRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: radioRef.current,
        pinSpacing: false,
        onRefresh: () => {
          const pinSpacer = radioRef.current?.parentElement
          if (pinSpacer && pinSpacer.classList.contains("pin-spacer")) {
            pinSpacer.style.pointerEvents = "none"
          }
        },
      })

      setTimeout(() => {
        const pinSpacer = radioRef.current?.parentElement
        if (pinSpacer && pinSpacer.classList.contains("pin-spacer")) {
          pinSpacer.style.pointerEvents = "none"
        }
      }, 0)

      if (canvas2DRef.current) {
        gsap.to(canvas2DRef.current, {
          zIndex: -20,
          scrollTrigger: {
            trigger: heroMainRef.current,
            start: "top top",
            end: "top top-=100",
            scrub: true,
          },
        })
      }

      if (canvas3DRef.current) {
        gsap.to(canvas3DRef.current, {
          zIndex: 20,
          scrollTrigger: {
            trigger: heroMainRef.current,
            start: "top top",
            end: "top top-=100",
            scrub: true,
          },
        })
      }

      if (bgHeroRef.current) {
        gsap.fromTo(
          bgHeroRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            scrollTrigger: {
              trigger: bgHeroRef.current,
              start: "top center",
              end: "bottom center",
              scrub: true,
            },
          },
        )
      }
    })

    return () => ctx.revert()
  }, [])

  return (
    <main ref={heroMainRef} className="bg-hero-fg relative overflow-hidden">
      <section className="relative h-[250vh]">
        <div ref={canvas2DRef} className="relative z-10">
          <Canvas2DFlippingGrid
            gridCount={14}
            boxSize={200}
            scrollHeight="250vh"
            imageFolder="/assets/hero/stars"
            imageCount={12}
          />
        </div>
        <div ref={canvas3DRef} className="absolute inset-0 z-0">
          <Canvas3DGrid
            gridCount={14}
            boxSize={200}
            scrollHeight="250vh"
            faceColor="#212121"
            sideColor="#B780FF"
            BackgroundComponent={BackgroundHero}
          />
        </div>
      </section>
      <div
        ref={radioRef}
        className="pointer-events-none absolute top-0 left-0 z-30 flex h-screen w-screen items-center justify-center [&_*]:pointer-events-auto"
      >
        <MusicPlayerRadio
          songs={[
            { title: "Rabbit Stack Theme", url: "/assets/music/theme.mp3" },
            { title: "Code Flow", url: "/assets/music/code-flow.mp3" },
            { title: "Deep Focus", artist: "Ambient", url: "/assets/music/deep-focus.mp3" },
          ]}
          targetDate="2026-02-26T00:00:00"
        />
      </div>
    </main>
  )
}
