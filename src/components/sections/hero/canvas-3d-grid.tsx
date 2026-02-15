"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Box, Canvas3DGridProps, Face, Point } from "@/types/props"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Canvas3DGrid({
  gridCount = 8,
  boxSize = 200,
  boxDepth = 50,
  faceColor = "#a67eff",
  sideColor = "#ff57f8",
  scrollHeight = "400vh",
  BackgroundComponent,
}: Canvas3DGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const boxesRef = useRef<Box[]>([])
  const animationFrameRef = useRef<number>()
  const focalLength = 500

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width: number, height: number

    const initGrid = () => {
      const boxes: Box[] = []
      const midH = gridCount / 2
      const midV = gridCount / 2

      for (let row = 0; row < gridCount; row++) {
        for (let col = 0; col < gridCount; col++) {
          const order = Math.abs(col - midH) + Math.abs(row - midV)

          boxes.push({
            x: (col - (gridCount / 2 - 0.5)) * boxSize,
            y: (row - (gridCount / 2 - 0.5)) * boxSize,
            z: 0,
            order: order,
            rotation: { x: 0, y: 0, z: 0 },
            opacity: 1,
          })
        }
      }

      return boxes
    }

    boxesRef.current = initGrid()

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const centerX = width / 2
      const centerY = height / 2

      const sortedBoxes = [...boxesRef.current].sort((a, b) => {
        const zDiff = b.z - a.z
        if (Math.abs(zDiff) > 1) return zDiff

        const distA = Math.sqrt(a.x * a.x + a.y * a.y)
        const distB = Math.sqrt(b.x * b.x + b.y * b.y)
        const distDiff = distB - distA
        if (Math.abs(distDiff) > 1) return distDiff

        return b.order - a.order
      })

      sortedBoxes.forEach((box) => {
        if (box.z <= -focalLength || box.opacity <= 0) return

        const scale = focalLength / (focalLength + box.z)
        const backScale = focalLength / (focalLength + box.z + boxDepth)

        const w = boxSize * scale
        const h = boxSize * scale
        const x = centerX + box.x * scale - w / 2
        const y = centerY + box.y * scale - h / 2

        const bw = boxSize * backScale
        const bh = boxSize * backScale
        const bx = centerX + box.x * backScale - bw / 2
        const by = centerY + box.y * backScale - bh / 2

        const f: Face = {
          tl: { x, y },
          tr: { x: x + w, y },
          bl: { x, y: y + h },
          br: { x: x + w, y: y + h },
        }

        const b: Face = {
          tl: { x: bx, y: by },
          tr: { x: bx + bw, y: by },
          bl: { x: bx, y: by + bh },
          br: { x: bx + bw, y: by + bh },
        }

        const drawPoly = (
          p1: Point,
          p2: Point,
          p3: Point,
          p4: Point,
          alpha: number = 1,
        ) => {
          ctx.globalAlpha = alpha
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.lineTo(p3.x, p3.y)
          ctx.lineTo(p4.x, p4.y)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          ctx.globalAlpha = 1
        }

        ctx.fillStyle = sideColor
        ctx.strokeStyle = "#303030"
        ctx.lineWidth = 1
        drawPoly(f.tl, f.tr, b.tr, b.tl, box.opacity)
        drawPoly(f.bl, f.br, b.br, b.bl, box.opacity)
        drawPoly(f.tl, f.bl, b.bl, b.tl, box.opacity)
        drawPoly(f.tr, f.br, b.br, b.tr, box.opacity)

        ctx.globalAlpha = box.opacity
        ctx.fillStyle = faceColor
        ctx.fillRect(x, y, w, h)
        ctx.strokeStyle = "#000"
        ctx.lineWidth = Math.max(0.5, 1.5 * scale)
        ctx.strokeRect(x, y, w, h)
        ctx.globalAlpha = 1
      })

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    const createRandomFromCenterPattern = () => {
      const center = { x: gridCount / 2, y: gridCount / 2 }
      const distanceGroups: number[][] = []

      boxesRef.current.forEach((box, i) => {
        const col = i % gridCount
        const row = Math.floor(i / gridCount)

        const dx = col - center.x + 0.5
        const dy = row - center.y + 0.5
        const distance = Math.sqrt(dx * dx + dy * dy)
        const distIndex = Math.floor(distance)

        if (!distanceGroups[distIndex]) {
          distanceGroups[distIndex] = []
        }
        distanceGroups[distIndex].push(i)
      })

      distanceGroups.forEach((group) => {
        for (let i = group.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[group[i], group[j]] = [group[j], group[i]]
        }
      })

      return distanceGroups
    }

    const distanceGroups = createRandomFromCenterPattern()
    const mainTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        pin: true,
      },
    })

    distanceGroups.forEach((group, distIndex) => {
      group.forEach((i, posInGroup) => {
        const box = boxesRef.current[i]
        if (!box) return

        const col = i % gridCount
        const row = Math.floor(i / gridCount)

        const delay = distIndex * 0.08 + posInGroup * 0.02

        mainTl.to(
          box,
          {
            z: -2500 - Math.random() * 1000,
            x:
              box.x + (col - gridCount / 2) * 600 + (Math.random() - 0.5) * 400,
            y:
              box.y + (row - gridCount / 2) * 600 + (Math.random() - 0.5) * 400,
            opacity: 0.7,
            duration: 0.6,
            ease: "power2.in",
          },
          delay,
        )
      })
    })

    window.addEventListener("resize", resize)
    resize()
    draw()

    return () => {
      window.removeEventListener("resize", resize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      mainTl.kill()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [gridCount, boxSize, boxDepth, faceColor, sideColor])

  return (
    <div
      ref={containerRef}
      style={{
        height: scrollHeight,
        position: "relative",
      }}
    >
      <canvas
        className="z-10"
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "transparent",
          willChange: "transform",
        }}
      />
      <div className="absolute z-0 h-screen w-full">
        {BackgroundComponent ? <BackgroundComponent /> : null}
      </div>
    </div>
  )
}
