"use client"

import React, { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

const HeroBG = () => {
  const containerRef = useRef(null)
  const row1Ref = useRef(null)
  const row2Ref = useRef(null)

  useGSAP(
    () => {
      gsap.to(row1Ref.current, {
        xPercent: -50,
        repeat: -1,
        duration: 40,
        ease: "linear",
      })

      gsap.fromTo(
        row2Ref.current,
        { xPercent: -50 },
        {
          xPercent: 0,
          repeat: -1,
          duration: 40,
          ease: "linear",
        },
      )
    },
    { scope: containerRef },
  )

  const text = "RISE RUSH REVEL"

  return (
    <div
      ref={containerRef}
      className="bg-background z-10 mt-[6vh] flex h-full w-full flex-col overflow-hidden"
    >
      <div className="text-secondary-foreground flex w-full flex-1 items-center overflow-hidden whitespace-nowrap">
        <div ref={row1Ref} className="flex w-fit">
          {[1, 2, 3, 4].map((_, i) => (
            <h1
              key={i}
              className="font-bebas-rounded pr-10 text-[40vh] leading-none tracking-wide"
            >
              {text}
            </h1>
          ))}
        </div>
      </div>

      <div className="text-secondary-foreground flex w-full flex-1 items-center overflow-hidden whitespace-nowrap">
        <div ref={row2Ref} className="flex w-fit">
          {[1, 2, 3, 4].map((_, i) => (
            <h1
              key={i}
              className="font-bebas-rounded pr-10 text-[40vh] leading-none tracking-wide"
            >
              {text}
            </h1>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HeroBG
