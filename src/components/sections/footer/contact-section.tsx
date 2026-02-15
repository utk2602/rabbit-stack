"use client"
import React from "react"
import Visualizer from "@/components/sections/footer/visualizer"
import { FaInstagram, FaLinkedin, FaYoutube, FaGithub } from "react-icons/fa"
import Link from "next/link"

export default function ContactSection() {
  const socials = [
    {
      icon: FaInstagram,
      href: "https://instagram.com",
    },
    {
      icon: FaLinkedin,
      href: "https://linkedin.com",
    },
    { icon: FaYoutube, href: "https://youtube.com" },
    {
      icon: FaGithub,
      href: "https://github.com",
    },
  ]

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="relative h-auto w-full max-w-md">
        <h2 className="font-bebas-rounded text-6xl leading-[0.6] font-[400] text-black uppercase sm:text-7xl xl:text-8xl xl:text-white">
          Contact Us
        </h2>

        <div className="pt-4 text-lg font-medium text-black sm:text-xl xl:text-white">
          <p>Rabbit Stack Team</p>
          <p className="text-xl opacity-90">AI Code Review Platform</p>
          <a
            href="mailto:hello@rabbitstack.dev"
            className="hover:underline"
          >
            hello@rabbitstack.dev
          </a>
        </div>
      </div>

      <div className="relative h-auto w-full max-w-md">
        <div className="hidden h-full w-110 xl:block">
          <Visualizer className="h-full w-full" />
        </div>

        <div className="flex h-full w-full items-center justify-center xl:hidden">
          <div className="text-center">
            <h3 className="font-bebas-rounded text-3xl text-black">RABBIT STACK</h3>
            <p className="text-sm text-black/70">AI Code Reviewer</p>
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        {socials.map(({ icon: Icon, href }, i) => (
          <Link
            key={i}
            href={href}
            target="_blank"
            className="rounded-sm border-b-7 border-[#B3C4DE] bg-white p-2 shadow-[4px_4px_4px_0px_rgba(0,0,0,0.25)] transition-transform hover:scale-105"
          >
            <Icon className="h-9 w-10 text-black" />
          </Link>
        ))}
      </div>
    </div>
  )
}
