"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { CustomEase } from "gsap/all"
import { Canvas2DFlippingGridProps, Tile } from "@/types/props"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase)
}

export default function Canvas2DFlippingGrid({
  gridCount = 8,
  boxSize = 200,
  boxDepth = 20,
  faceColor = "#212121",
  sideColor = "#ff57f8",
  scrollHeight = "400vh",
  imageFolder = "/assets/hero/stars",
  imageCount = 22,
  extension = "webp",
  BackgroundComponent,
  flipCooldown = 200,
  queueDelay = 100,
  borderRadius = 10,
}: Canvas2DFlippingGridProps & { borderRadius?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tilesRef = useRef<Tile[]>([])
  const imagesRef = useRef<HTMLImageElement[]>([])
  const animationFrameRef = useRef<number>()
  const hasScrollStartedRef = useRef<boolean>(false)
  const loadedImagesRef = useRef<Set<number>>(new Set())

  const flipQueueRef = useRef<number[]>([])
  const currentlyFlippingRef = useRef<Set<number>>(new Set())
  const isProcessingQueueRef = useRef<boolean>(false)

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width: number, height: number

    const roundRect = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number,
    ) => {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height,
      )
      ctx.lineTo(x + radius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
    }

    const loadImage = (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        if (loadedImagesRef.current.has(index)) {
          resolve(imagesRef.current[index])
          return
        }

        const img = new Image()
        img.src = `${imageFolder}/${index + 1}.${extension}`
        img.loading = "lazy"

        img.onload = () => {
          loadedImagesRef.current.add(index)
          imagesRef.current[index] = img
          tilesRef.current.forEach((tile) => {
            if (tile.imageIndex === index) {
              tile.image = img
            }
          })
          resolve(img)
        }

        img.onerror = () => {
          console.warn(`Failed to load image: ${index + 1}.${extension}`)
          reject(new Error(`Failed to load image ${index + 1}`))
        }
      })
    }

    const initImages = () => {
      imagesRef.current = new Array(imageCount).fill(null)
      const initialLoadCount = Math.min(gridCount * gridCount, imageCount)
      for (let i = 0; i < initialLoadCount; i++) {
        loadImage(i).catch(() => null)
      }
    }

    const initGrid = () => {
      const tiles: Tile[] = []
      const totalGridSize = gridCount * boxSize
      const offsetX = (width - totalGridSize) / 2
      const offsetY = (height - totalGridSize) / 2

      for (let row = 0; row < gridCount; row++) {
        for (let col = 0; col < gridCount; col++) {
          const index = row * gridCount + col
          const imageIndex = index % imageCount

          tiles.push({
            x: offsetX + col * boxSize,
            y: offsetY + row * boxSize,
            width: boxSize,
            height: boxSize,
            rotationX: 0,
            image: imagesRef.current[imageIndex] || null,
            imageIndex: imageIndex,
            isAnimating: false,
            opacity: 1,
            lastFlipTime: 0,
          })
        }
      }

      tilesRef.current = tiles
    }

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      initGrid()
    }

    const processFlipQueue = async () => {
      if (isProcessingQueueRef.current) return
      isProcessingQueueRef.current = true

      while (flipQueueRef.current.length > 0) {
        const tileIndex = flipQueueRef.current.shift()
        if (tileIndex === undefined) break

        const tile = tilesRef.current[tileIndex]
        if (!tile) continue

        const currentTime = Date.now()

        if (currentTime - tile.lastFlipTime < flipCooldown) {
          continue
        }

        if (currentlyFlippingRef.current.has(tileIndex)) {
          continue
        }

        if (!loadedImagesRef.current.has(tile.imageIndex)) {
          loadImage(tile.imageIndex).catch(() => {})
        }

        animateTileFlip(tileIndex)

        if (flipQueueRef.current.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, queueDelay))
        }
      }

      isProcessingQueueRef.current = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (hasScrollStartedRef.current) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      tilesRef.current.forEach((tile, index) => {
        if (
          mouseX >= tile.x &&
          mouseX <= tile.x + tile.width &&
          mouseY >= tile.y &&
          mouseY <= tile.y + tile.height
        ) {
          if (
            !flipQueueRef.current.includes(index) &&
            !currentlyFlippingRef.current.has(index)
          ) {
            flipQueueRef.current.push(index)
            processFlipQueue()
          }
        }
      })
    }

    const animateTileFlip = (index: number) => {
      const tile = tilesRef.current[index]
      if (!tile) return

      tile.isAnimating = true
      tile.lastFlipTime = Date.now()
      currentlyFlippingRef.current.add(index)

      const currentRotation = tile.rotationX

      gsap.to(tile, {
        rotationX: currentRotation + 360,
        duration: 1.5,
        ease: CustomEase.create(
          "custom",
          "M0,0 C0.126,0.382 0.153,0.469 0.264,0.695 0.353,0.877 0.453,1.012 0.567,1.052 0.673,1.088 0.742,0.963 0.836,0.927 0.899,0.903 0.956,1 1,1 ",
        ),
        onComplete: () => {
          tile.rotationX = tile.rotationX % 360
          tile.isAnimating = false
          currentlyFlippingRef.current.delete(index)
        },
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      tilesRef.current.forEach((tile) => {
        if (tile.opacity <= 0) return

        const rotRad = (tile.rotationX * Math.PI) / 180
        const heightScale = Math.abs(Math.cos(rotRad))
        const showFront = Math.cos(rotRad) >= 0

        const scaledHeight = tile.height * heightScale

        ctx.save()
        ctx.globalAlpha = tile.opacity
        ctx.translate(tile.x + tile.width / 2, tile.y + tile.height / 2)

        const tiltAmount = Math.sin(rotRad) * 0.25
        ctx.transform(1, 0, tiltAmount, 1, 0, 0)

        if (showFront) {
          ctx.fillStyle = faceColor
          roundRect(
            ctx,
            -tile.width / 2,
            -scaledHeight / 2,
            tile.width,
            scaledHeight,
            borderRadius,
          )
          ctx.fill()

          ctx.strokeStyle = "#000"
          ctx.lineWidth = 1
          ctx.stroke()
        } else {
          ctx.save()

          roundRect(
            ctx,
            -tile.width / 2,
            -scaledHeight / 2,
            tile.width,
            scaledHeight,
            borderRadius,
          )
          ctx.clip()

          if (tile.image && tile.image.complete) {
            ctx.drawImage(
              tile.image,
              -tile.width / 2,
              -scaledHeight / 2,
              tile.width,
              scaledHeight,
            )

            ctx.fillStyle = "rgba(183, 128, 255, 0.5)"
            ctx.fillRect(
              -tile.width / 2,
              -scaledHeight / 2,
              tile.width,
              scaledHeight,
            )
          } else {
            ctx.fillStyle = "#a67deb"
            ctx.fillRect(
              -tile.width / 2,
              -scaledHeight / 2,
              tile.width,
              scaledHeight,
            )
          }

          ctx.restore()

          ctx.strokeStyle = "#000"
          ctx.lineWidth = 1
          roundRect(
            ctx,
            -tile.width / 2,
            -scaledHeight / 2,
            tile.width,
            scaledHeight,
            borderRadius,
          )
          ctx.stroke()
        }

        ctx.restore()
      })

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", resize)

    resize()
    initImages()
    draw()

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", resize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      flipQueueRef.current = []
      currentlyFlippingRef.current.clear()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [
    gridCount,
    boxSize,
    boxDepth,
    faceColor,
    sideColor,
    imageFolder,
    imageCount,
    flipCooldown,
    queueDelay,
    borderRadius,
  ])

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
          backgroundColor: "#111",
          cursor: "pointer",
        }}
      />
      <div className="absolute z-0 h-screen w-full">
        {BackgroundComponent ? <BackgroundComponent /> : null}
      </div>
    </div>
  )
}
