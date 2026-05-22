"use client"

import React, { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { X } from "lucide-react"

interface MenuOverlayProps {
  isOpen: boolean
  closeMenu: () => void
}

const MenuOverlay = ({ isOpen, closeMenu }: MenuOverlayProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!overlayRef.current || !linksRef.current) return

      if (isOpen) {
        gsap.fromTo(
          overlayRef.current,
          { x: "100%" },
          { x: "0%", duration: 0.5, ease: "power3.out" },
        )
        gsap.fromTo(
          linksRef.current.children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.5,
            delay: 0.2,
            ease: "power2.out",
          },
        )
      } else {
        gsap.to(overlayRef.current, {
          x: "100%",
          duration: 0.4,
          ease: "power3.in",
        })
      }
    },
    { dependencies: [isOpen], scope: overlayRef },
  )

  const links = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Repositories", href: "/repositories" },
    { label: "Reviews", href: "/dashboard/reviews" },
    { label: "Documentation", href: "/#docs" },
  ]

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex translate-x-full flex-col bg-background"
    >
      <div className="flex h-20 items-center justify-end px-6">
        <button
          onClick={closeMenu}
          className="flex cursor-pointer items-center gap-2 border border-border bg-card p-2 text-foreground transition-colors hover:bg-accent"
        >
          <X size={32} strokeWidth={1.5} />
        </button>
      </div>
      <div
        ref={linksRef}
        className="flex flex-1 flex-col items-center justify-center gap-8"
      >
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={closeMenu}
            className="font-bebas-rounded text-5xl tracking-wider text-foreground transition-colors hover:text-primary sm:text-6xl"
          >
            {link.label}
          </a>
        ))}
      </div>
      <div className="p-8 text-center text-sm text-muted-foreground">
        <p>Rabbit Stack - AI Code Reviewer</p>
      </div>
    </div>
  )
}

export default MenuOverlay
