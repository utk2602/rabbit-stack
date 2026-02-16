"use client";

import React, { useState } from "react";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero";
import { LogosSection } from "@/components/logos-section";
import { Footer } from "@/components/footer";
import { AuthModal } from "@/components/auth-modal";

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onAuthClick={() => setAuthOpen(true)} />
      <HeroSection onAuthClick={() => setAuthOpen(true)} />
      <LogosSection />
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
