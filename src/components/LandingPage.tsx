"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/sections/footer";
import { AuthModal } from "@/components/auth-modal";

const Hero = dynamic(() => import("@/components/sections/hero"), {
  ssr: false,
});

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onAuthClick={() => setAuthOpen(true)} />
      <Hero />
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
