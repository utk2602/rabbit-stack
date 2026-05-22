"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { AnimatedWordmark } from "@/components/brand/animated-wordmark";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { ArrowRightIcon } from "lucide-react";

export const navLinks = [
  {
    label: "Docs",
    href: "/docs",
  },
  {
    label: "Security",
    href: "/docs#security",
  },
  {
    label: "Workflow",
    href: "/docs#how-it-works",
  },
];

interface HeaderProps {
  onAuthClick?: () => void;
}

export function Header({ onAuthClick }: HeaderProps) {
  const scrolled = useScroll(10);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl transition-all",
        scrolled && "bg-background/95 shadow-[0_16px_50px_rgba(0,0,0,0.25)]"
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="rounded-lg p-1 transition-colors hover:bg-accent/60">
          <AnimatedWordmark compact />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Button asChild key={link.label} size="sm" variant="ghost">
              <a href={link.href}>{link.label}</a>
            </Button>
          ))}
          {onAuthClick && (
            <>
              <Button size="sm" variant="outline" onClick={onAuthClick}>
                Sign In
              </Button>
              <Button size="sm" onClick={onAuthClick}>
                Connect GitHub
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <MobileNav onAuthClick={onAuthClick} />
      </nav>
    </header>
  );
}
