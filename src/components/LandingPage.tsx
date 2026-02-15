"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Github,
  ArrowRight,
  BookOpen,
  Zap,
  Shield,
  GitPullRequest,
  Code2,
  Bot,
  Search,
  Mail,
  Instagram,
} from "lucide-react";

const GradientBlindsHero = dynamic(
  () => import("@/components/shaders/Hero"),
  { ssr: false }
);

const CHAT_SLIDES = [
  {
    messages: [
      { from: "user", text: "Have you looked at my PR?" },
      { from: "bot", text: "Which? You've sent... 14 today." },
      { from: "user", text: "..." },
    ],
  },
  {
    messages: [
      { from: "user", text: "Can you review this real quick?" },
      { from: "bot", text: "Sure! Found 3 issues, 2 suggestions, and a missing null check." },
      { from: "user", text: "Already? That was 4 seconds." },
    ],
  },
  {
    messages: [
      { from: "user", text: "Is my code production ready?" },
      { from: "bot", text: "Almost. Security vulnerability in auth.ts line 42." },
      { from: "user", text: "Fixing it now. Thanks, Rabbit!" },
    ],
  },
  {
    messages: [
      { from: "user", text: "Review the refactor PR?" },
      { from: "bot", text: "Walkthrough ready. Sequence diagram included. 0 blockers." },
      { from: "user", text: "Ship it! 🚀" },
    ],
  },
  {
    messages: [
      { from: "user", text: "Why is CI failing?" },
      { from: "bot", text: "Type mismatch on line 87. Patch attached." },
      { from: "user", text: "Life saver." },
    ],
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Rabbit Stack catches edge cases my team misses. It's like having a senior engineer on standby 24/7.",
    name: "Riya Sharma",
    role: "Senior Full-Stack Engineer & CTO",
    avatar: "RS",
  },
  {
    quote:
      "It analyzed 200+ lines of refactored code and pinpointed the exact issue in a production-critical route.",
    name: "Arjun Mehta",
    role: "Co-Founder, TechGrid Studio",
    avatar: "AM",
  },
  {
    quote:
      "Writing code faster was never the issue. The bottleneck was always code review. Rabbit Stack fixed that.",
    name: "Priya Ranganathan",
    role: "Senior Engineering Manager & Lead",
    avatar: "PR",
  },
  {
    quote:
      "We shipped 3x faster after integrating Rabbit Stack. Every PR gets reviewed in under 30 seconds.",
    name: "Karan Patel",
    role: "CTO and Co-Founder, ProStack",
    avatar: "KP",
  },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [chatIndex, setChatIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setChatIndex((prev) => (prev + 1) % CHAT_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="font-bold text-lg tracking-tight">
              Rabbit Stack
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="/docs"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors border border-orange-600"
            >
              Get a free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full min-h-screen overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <GradientBlindsHero />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between min-h-[calc(100vh-4rem)] gap-12 py-20">
          {/* Left Content */}
          <div className="flex-1 max-w-xl">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white mb-6">
              Code reviews were hard before. Now, they feel{" "}
              <span className="text-orange-500">impossible.</span>
            </h1>
            <p className="text-lg text-zinc-300 font-mono mb-8 leading-relaxed">
              Your team moves fast with AI. But fast shouldn&apos;t mean sloppy.
              We make sure every line still earns its merge.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-zinc-600 text-zinc-200 font-semibold hover:bg-zinc-800 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Documentation
              </Link>
            </div>
          </div>

          {/* Right Chat Widget */}
          <div className="flex-1 max-w-lg w-full">
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/60 rounded-2xl p-6 shadow-2xl">
              <div className="space-y-4 min-h-[180px]">
                {CHAT_SLIDES[chatIndex].messages.map((msg, i) => (
                  <div
                    key={`${chatIndex}-${i}`}
                    className={`flex ${
                      msg.from === "user" ? "justify-end" : "justify-start"
                    } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-xl max-w-[80%] text-sm font-mono ${
                        msg.from === "user"
                          ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                          : "bg-zinc-800/60 text-zinc-300 border border-orange-500/30"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Carousel Dots */}
              <div className="flex items-center justify-end gap-2 mt-6">
                {CHAT_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setChatIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === chatIndex
                        ? "bg-zinc-300 w-3"
                        : "bg-zinc-600 hover:bg-zinc-500"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-24 bg-background border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Get started in{" "}
              <span className="text-orange-500">2 clicks.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-2">
              No credit card needed
            </p>
            <div className="flex gap-4 mt-6">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
              >
                Start reviewing
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs"
                className="text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors self-center"
              >
                See pricing →
              </Link>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm font-semibold text-card-foreground">
                  Rabbit Stack
                </span>
              </div>
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm font-mono">
                <div className="text-center space-y-2">
                  <Bot className="w-8 h-8 mx-auto text-orange-500/60" />
                  <p>Setting up your first review...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-background border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything you need for{" "}
              <span className="text-orange-500">faster</span> reviews
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From auto-generated walkthroughs to inline suggestions, Rabbit
              Stack handles the tedious parts so you can focus on shipping.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-5 h-5 text-orange-400" />,
                title: "Instant AI Reviews",
                desc: "Every PR gets a comprehensive review in seconds, not hours. No waiting for teammates.",
              },
              {
                icon: <GitPullRequest className="w-5 h-5 text-orange-400" />,
                title: "GitHub Native",
                desc: "Reviews are posted directly to your PR as GitHub review comments. Zero context switching.",
              },
              {
                icon: <Search className="w-5 h-5 text-orange-400" />,
                title: "Codebase-Aware (RAG)",
                desc: "Understands your entire codebase using embeddings. Reviews with full context, not just diffs.",
              },
              {
                icon: <Shield className="w-5 h-5 text-orange-400" />,
                title: "Security-First",
                desc: "Catches security vulnerabilities, SQL injections, and auth issues before they hit production.",
              },
              {
                icon: <Code2 className="w-5 h-5 text-orange-400" />,
                title: "Inline Comments",
                desc: "Precise line-by-line feedback with severity levels — info, warning, and error.",
              },
              {
                icon: <Bot className="w-5 h-5 text-orange-400" />,
                title: "Poem & Diagram",
                desc: "Every review includes a Mermaid sequence diagram and a fun poem. Because why not?",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 hover:border-orange-500/30 transition-all group"
              >
                <div className="p-2 bg-orange-500/10 rounded-lg w-fit mb-4 group-hover:bg-orange-500/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2 text-card-foreground">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="py-24 bg-background border-t border-border/40"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-sm font-mono text-orange-500 mb-10">
            Why teams prefer Rabbit Stack
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 hover:border-orange-500/20 transition-all"
              >
                <div className="text-orange-500/60 text-3xl font-serif mb-4">
                  &ldquo;&rdquo;
                </div>
                <p className="text-sm text-card-foreground/80 mb-6 leading-relaxed">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">
                Products
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Pull Request Reviews
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    IDE Reviews
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    CLI Reviews
                  </Link>
                </li>
              </ul>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">
                Resources
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Docs
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">
                Contact
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <a
                    href="mailto:workutkarshkashyap@gmail.com"
                    className="hover:text-foreground transition-colors"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:workutkarshkashyap@gmail.com"
                    className="hover:text-foreground transition-colors"
                  >
                    Sales
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Social + Subscribe */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-6 border-t border-border/40">
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/utkarshhhhhhh26"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="X (Twitter)"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/utkxrshh__.__"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:workutkarshkashyap@gmail.com"
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Giant brand text */}
          <div className="mt-8 overflow-hidden">
            <h2 className="w-full text-center text-[6rem] md:text-[10rem] lg:text-[14rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-orange-500/20 to-transparent select-none whitespace-nowrap" style={{ letterSpacing: '0.15em' }}>
              RABBIT STACK
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex gap-4">
              <Link href="/docs" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/docs" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </div>
            <p>Rabbit Stack Inc. &copy; {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
