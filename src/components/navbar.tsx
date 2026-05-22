"use client"

import React, { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import MenuOverlay from "./navbar-opened"

interface NavbarProps {
  onAuthClick?: () => void
}

const Navbar = ({ onAuthClick }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    if (isMenuOpen) {
      html.style.overflow = "hidden"
      body.style.overflow = "hidden"
    } else {
      html.style.overflow = ""
      body.style.overflow = ""
    }

    return () => {
      html.style.overflow = ""
      body.style.overflow = ""
    }
  }, [isMenuOpen])

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  return (
    <>
      <nav className="bg-background border-border fixed top-0 right-0 left-0 z-40 flex h-20 w-full items-center justify-between border-b px-6 backdrop-blur-xl bg-opacity-90">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">R</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">
            Rabbit Stack
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#hero" className="hover:text-primary transition-colors">Home</a>
          <a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a>
          <a href="/#docs" className="hover:text-primary transition-colors">Docs</a>
          {onAuthClick && (
            <button
              onClick={onAuthClick}
              className="ml-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/80"
            >
              Get Started
            </button>
          )}
        </div>
        <button
          onClick={toggleMenu}
          className="border-border bg-card flex cursor-pointer items-center gap-2 border p-2 text-foreground transition-all duration-700 hover:bg-accent"
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>
      </nav>
      <MenuOverlay isOpen={isMenuOpen} closeMenu={() => setIsMenuOpen(false)} />
    </>
  )
}

export default Navbar
export { Navbar }
