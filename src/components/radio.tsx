"use client"
import Image from "next/image"
import React, { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { FastForward, Play, Pause, Loader2 } from "lucide-react"
import ActionButton from "@/components/action-button"

interface Song {
  title: string
  artist?: string
  url: string
}

interface MusicPlayerProps {
  songs: Song[]
  bgColors?: string[]
  targetDate?: string
  actionOneText?: string
  actionTwoText?: string
  onActionOneClick?: () => void
  onActionTwoClick?: () => void
}

function FlipDigit({ value }: { value: number }) {
  const digitRef = useRef<HTMLDivElement>(null)
  const prevValue = useRef(value)

  useEffect(() => {
    if (prevValue.current !== value && digitRef.current) {
      const timeline = gsap.timeline()
      timeline.fromTo(
        digitRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
      )
      prevValue.current = value
    }
  }, [value])

  return (
    <span ref={digitRef} className="inline-block tabular-nums">
      {value}
    </span>
  )
}

function FlipNumber({ value }: { value: number }) {
  const tens = Math.floor(value / 10)
  const ones = value % 10
  return (
    <>
      <FlipDigit value={tens} />
      <FlipDigit value={ones} />
    </>
  )
}

export default function MusicPlayerRadio({
  songs,
  targetDate,
  actionOneText = "EVENTS",
  actionTwoText = "PROSHOW",
  onActionOneClick,
  onActionTwoClick,
  bgColors = [
    "bg-[#d27441]",
    "bg-[#d24c41]",
    "bg-[#ffd401]",
    "bg-[#fe44ff]",
    "bg-[#aaf038]",
    "bg-[#a6bfff]",
    "bg-[#73d242]",
    "bg-[#4ffff0]",
  ],
}: MusicPlayerProps) {
  const [bgColor, setBgColor] = useState(bgColors[0])
  const [time, setTime] = useState([0, 0, 0, 0])
  const [mounted, setMounted] = useState(false)
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showPlayer, setShowPlayer] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const nextAudioRef = useRef<HTMLAudioElement | null>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const finalTargetDate = targetDate || "2026-03-15T00:00:00"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || songs.length === 0) return

    audioRef.current = new Audio(songs[currentSongIndex].url)
    audioRef.current.preload = "auto"
    const audio = audioRef.current

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }
    const handleEnded = () => handleNext()
    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleError = () => {
      setIsLoading(false)
      console.error("Audio loading error")
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("error", handleError)

    audio.load()

    if (isPlaying) {
      setIsLoading(true)
      audio.play().catch((error) => {
        console.error("Playback failed:", error)
        setIsPlaying(false)
        setIsLoading(false)
      })
    }

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("error", handleError)
      audio.pause()
    }
  }, [mounted, currentSongIndex, songs])

  useEffect(() => {
    if (!mounted || songs.length <= 1) return

    const nextIndex = (currentSongIndex + 1) % songs.length
    nextAudioRef.current = new Audio(songs[nextIndex].url)
    nextAudioRef.current.preload = "auto"
    nextAudioRef.current.load()

    return () => {
      if (nextAudioRef.current) {
        nextAudioRef.current.pause()
        nextAudioRef.current = null
      }
    }
  }, [mounted, currentSongIndex, songs])

  useEffect(() => {
    if (!mounted) return
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = new Date(finalTargetDate).getTime()
      const difference = target - now
      if (difference > 0) {
        setTime([
          Math.floor(difference / (1000 * 60 * 60 * 24)),
          Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          Math.floor((difference % (1000 * 60)) / 1000),
        ])
      } else {
        setTime([0, 0, 0, 0])
      }
    }
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [mounted, finalTargetDate])

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      if (playerRef.current && logoRef.current) {
        gsap.to(playerRef.current, {
          opacity: 0,
          y: 30,
          scale: 0.95,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => setShowPlayer(false),
        })
        gsap.to(logoRef.current, {
          opacity: 1,
          scale: 1,
          y: -40,
          duration: 0.7,
          delay: 0.3,
          ease: "elastic.out(1, 0.6)",
        })
      }
    } else {
      setShowPlayer(true)
      setIsPlaying(true)
      setIsLoading(true)

      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsLoading(false)
          })
          .catch((error) => {
            console.error("Playback failed:", error)
            setIsPlaying(false)
            setShowPlayer(false)
            setIsLoading(false)
          })
      }

      if (logoRef.current && playerRef.current) {
        gsap.set(playerRef.current, { opacity: 0, y: 30, scale: 0.95 })
        gsap.to(logoRef.current, {
          opacity: 0,
          scale: 0.85,
          y: -40,
          duration: 0.6,
          ease: "power2.inOut",
        })
        gsap.to(playerRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          delay: 0.3,
          ease: "elastic.out(1, 0.6)",
        })
      }
    }
  }

  const handlePause = () => {
    if (isPlaying) togglePlayPause()
  }

  const handleNext = () => {
    const nextIndex = (currentSongIndex + 1) % songs.length
    setBgColor(bgColors[nextIndex % bgColors.length])
    setCurrentSongIndex(nextIndex)
    setCurrentTime(0)
    if (!isPlaying) togglePlayPause()
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!mounted)
    return (
      <div className="border-hero-fg bg-radio-edge relative mx-auto flex aspect-video w-[95vw] max-w-[400px] flex-col rounded-[24px] border-2 p-2 shadow-2xl sm:max-w-[450px] sm:rounded-[32px] sm:border-3 sm:p-3 md:max-w-[500px]" />
    )

  const currentSong = songs[currentSongIndex]

  return (
    <div
      className="border-hero-fg bg-radio-edge relative mx-auto flex aspect-video w-[95vw] max-w-[400px] flex-col rounded-[24px] border-2 p-2 sm:max-w-[450px] sm:rounded-[32px] sm:border-3 sm:p-3 md:max-w-[500px]"
      style={{
        boxShadow:
          "0 8px 16px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)",
      }}
    >
      <div className="absolute top-0 right-4 flex -translate-y-full gap-0 sm:right-10">
        <button
          onClick={togglePlayPause}
          disabled={isPlaying || isLoading}
          className={`border-hero-accent bg-radio-btn-one relative flex w-12 cursor-pointer items-center justify-center rounded-tl-lg border-2 transition-all duration-150 sm:border-3 md:w-20 ${isPlaying || isLoading ? "cursor-not-allowed brightness-75" : "hover:brightness-110"}`}
          style={
            isPlaying || isLoading
              ? {
                  height: "26px",
                  marginTop: "6px",
                  boxShadow:
                    "inset 0 -4px 8px rgba(0,0,0,0.5), inset 0 2px 3px rgba(0,0,0,0.3), 0 -2px 0 var(--color-radio-btn-one-hover)",
                  transform: "perspective(100px)",
                }
              : {
                  height: "32px",
                  boxShadow:
                    "0 -6px 0 var(--color-radio-btn-one-hover), 0 -7px 10px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
                }
          }
          title="Play"
        >
          <div className="flex items-center justify-center">
            {isLoading && !isPlaying ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Play
                size={14}
                className={`transition-transform ${isPlaying ? "scale-90" : ""}`}
                fill="#121212"
              />
            )}
          </div>
        </button>

        <button
          onClick={handlePause}
          disabled={!isPlaying}
          className={`border-hero-accent bg-radio-btn-two relative flex w-12 cursor-pointer items-center justify-center overflow-hidden border-y-2 transition-all duration-150 sm:border-3 md:w-20 ${!isPlaying ? "cursor-not-allowed brightness-75" : "hover:brightness-90"}`}
          style={
            !isPlaying
              ? {
                  height: "26px",
                  marginTop: "6px",
                  boxShadow:
                    "inset 0 -4px 8px rgba(0,0,0,0.5), inset 0 2px 3px rgba(0,0,0,0.3), 0 -2px 0 var(--color-radio-btn-two-hover)",
                  transform: "perspective(100px)",
                }
              : {
                  height: "32px",
                  boxShadow:
                    "0 -6px 0 var(--color-radio-btn-two-hover), 0 -7px 10px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
                }
          }
          title="Pause"
        >
          <div className="flex items-center gap-0.5">
            <Pause
              size={14}
              className={`transition-transform ${isPlaying ? "scale-90" : ""}`}
              fill="#121212"
            />
          </div>
        </button>

        <button
          onClick={handleNext}
          disabled={isLoading}
          className={`border-hero-accent bg-radio-btn-three relative flex w-12 cursor-pointer items-center justify-center rounded-tr-lg border-2 transition-all duration-150 sm:border-3 md:w-20 ${isLoading ? "cursor-not-allowed brightness-75" : "hover:brightness-110"}`}
          style={{
            height: "32px",
            boxShadow:
              "0 -6px 0 var(--color-radio-btn-three-hover), 0 -7px 10px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
          onMouseDown={(e) => {
            if (!isLoading) {
              e.currentTarget.style.height = "26px"
              e.currentTarget.style.marginTop = "6px"
              e.currentTarget.style.boxShadow =
                "inset 0 -4px 8px rgba(0,0,0,0.5), inset 0 2px 3px rgba(0,0,0,0.3), 0 -2px 0 var(--color-radio-btn-three-hover)"
              e.currentTarget.style.transform = "perspective(100px)"
            }
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.height = "32px"
            e.currentTarget.style.marginTop = "0"
            e.currentTarget.style.boxShadow =
              "0 -6px 0 var(--color-radio-btn-three), 0 -7px 10px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.3)"
            e.currentTarget.style.transform = ""
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.height = "32px"
            e.currentTarget.style.marginTop = "0"
            e.currentTarget.style.boxShadow =
              "0 -6px 0 var(--color-radio-btn-three), 0 -7px 10px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.3)"
            e.currentTarget.style.transform = ""
          }}
          title="Next Song"
        >
          <div className="next-icon-wrapper flex items-center justify-center transition-all duration-150">
            <FastForward size={14} className="sm:scale-125" fill="#121012" />
          </div>
        </button>
      </div>

      <div className="flex items-center justify-between px-1 pt-1 pb-2 sm:pb-3">
        <div
          className="relative flex h-6 w-[25%] items-center justify-center overflow-hidden rounded-md bg-stone-800 px-2 sm:h-10 sm:w-[30%] sm:rounded-lg"
          style={{
            boxShadow:
              "inset 0 2px 4px rgba(0,0,0,0.8), inset 0 -1px 2px rgba(255,255,255,0.1), inset 2px 0 4px rgba(0,0,0,0.6), inset -2px 0 4px rgba(0,0,0,0.6)",
            border: "1px solid rgba(0,0,0,0.5)",
          }}
        >
          <div className="marquee-container w-full">
            <div
              className={`marquee-content font-digital-bold text-[13px] whitespace-nowrap text-[#8CFF54] sm:text-[18px] ${isPlaying || !currentSong?.title ? "animate-marquee" : "animate-blink text-clip"}`}
            >
              {isPlaying ? currentSong?.title : "RABBIT RADIO"}
            </div>
          </div>
        </div>
        <div className="text-hero-fg font-digital overflow-hidden text-[15px] font-semibold *:px-1 sm:text-[20px]">
          <span className="text-black">
            <FlipNumber value={time[0]} />
          </span>{" "}
          DAYS{"  "}
          <span className="text-black">
            <FlipNumber value={time[1]} />
          </span>{" "}
          HRS{"  "}
          <span className="text-black">
            <FlipNumber value={time[2]} />
          </span>{" "}
          MINS{"  "}
          <span className="text-black">
            <FlipNumber value={time[3]} />
          </span>{" "}
          SECS
        </div>
      </div>

      <style jsx>{`
        .marquee-container {
          position: relative;
        }

        .marquee-content {
          width: 100%;
          display: inline-block;
        }

        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes blink {
          0%,
          50%,
          100% {
            opacity: 1;
          }
          25%,
          75% {
            opacity: 0;
          }
        }

        .animate-marquee {
          animation: marquee 10s linear infinite;
        }

        .animate-blink {
          animation: blink 3s step-start infinite;
        }
      `}</style>

      <div
        className={`relative flex h-full flex-col justify-center gap-2 overflow-hidden rounded-2xl ${isPlaying ? bgColor : bgColors[0]} sm:rounded-3xl sm:gap-4`}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -top-6 -left-6 h-14 w-14 rotate-45 bg-[#1F1F1F] sm:-top-8 sm:-left-8 sm:h-20 sm:w-20"
            style={{
              clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
            }}
          />
          <div
            className="absolute -top-6 -right-6 h-14 w-14 -rotate-45 bg-[#1F1F1F] sm:-top-8 sm:-right-8 sm:h-20 sm:w-20"
            style={{
              clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
            }}
          />
          <div
            className="absolute -bottom-6 -left-6 h-14 w-14 rotate-45 bg-[#1F1F1F] sm:-bottom-8 sm:-left-8 sm:h-20 sm:w-20"
            style={{
              clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
            }}
          />
          <div
            className="absolute -right-6 -bottom-6 h-14 w-14 -rotate-45 bg-[#1F1F1F] sm:-right-8 sm:-bottom-8 sm:h-20 sm:w-20"
            style={{
              clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
            }}
          />
        </div>

        <div
          ref={logoRef}
          className="absolute inset-0 z-10 mx-auto flex w-[70%] -translate-y-10 transform items-center justify-center transition-opacity duration-75 sm:w-[75%]"
          style={{ opacity: showPlayer ? 0 : 1 }}
        >
          <div className="text-center">
            <h2 className="font-bebas-rounded text-4xl text-[#1F1F1F] sm:text-5xl">
              RABBIT STACK
            </h2>
            <p className="text-sm text-[#1F1F1F]/70">AI Code Reviewer</p>
          </div>
        </div>

        <div
          ref={playerRef}
          className="relative z-10 flex flex-col items-center justify-center gap-2 px-4 transition-opacity duration-75"
          style={{
            opacity: showPlayer ? 1 : 0,
            transform: showPlayer ? "" : "translateY(30px)",
          }}
        >
          <div className="text-center">
            <h3 className="font-bebas-rounded text-hero-bg line-clamp-1 text-sm font-medium sm:text-base md:text-lg">
              {currentSong?.title || "No Song"}
            </h3>
            {currentSong?.artist && (
              <p className="text-xs text-[#1F1F1F]/70">{currentSong.artist}</p>
            )}
          </div>

          <div className="flex w-full max-w-[80%] flex-col gap-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1F1F1F]/30">
              <div
                className="bg-hero-bg h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              />
            </div>
            <div className="font-digital flex justify-between text-[13px] text-[#1F1F1F]/70 sm:text-[18px]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="font-digital text-[13px] text-[#1F1F1F]/60 sm:text-[18px]">
            TRACK {currentSongIndex + 1} / {songs.length}
          </div>
        </div>

        <div className="relative z-10 flex flex-row items-center justify-center gap-3 sm:gap-6">
          <ActionButton
            text={actionOneText}
            type={!isPlaying ? "primary" : "secondary"}
            className="scale-75 sm:scale-100"
            playAction={isPlaying}
            onClick={onActionOneClick}
          />
          <ActionButton
            text={actionTwoText}
            type={isPlaying ? "primary" : "secondary"}
            className="scale-75 sm:scale-100"
            playAction={isPlaying}
            onClick={onActionTwoClick}
          />
        </div>

        <div
          className="absolute top-0 left-1/2 h-3 w-24 -translate-x-1/2 bg-[#1F1F1F] sm:h-5 sm:w-40"
          style={{ clipPath: "polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)" }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-3 w-24 -translate-x-1/2 bg-[#1F1F1F] sm:h-5 sm:w-40"
          style={{ clipPath: "polygon(0% 100%, 15% 0%, 85% 0%, 100% 100%)" }}
        />
      </div>
    </div>
  )
}
