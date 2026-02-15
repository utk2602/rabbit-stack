"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GitPullRequest,
  Webhook,
  Bot,
  Database,
  Search,
  Code2,
  Shield,
  Zap,
  Settings,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "how-it-works", label: "How It Works" },
  { id: "setup", label: "Quick Setup" },
  { id: "features", label: "Features" },
  { id: "architecture", label: "Architecture" },
  { id: "api-keys", label: "API Keys" },
  { id: "faq", label: "FAQ" },
];

function CopyBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-zinc-950 dark:bg-zinc-900/60 border border-border rounded-lg p-4 overflow-x-auto text-sm font-mono text-zinc-300">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">R</span>
              </div>
              <span className="font-semibold text-sm">Documentation</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar Nav */}
        <aside className="hidden lg:block w-64 fixed left-0 top-14 bottom-0 border-r border-border/40 bg-background overflow-y-auto">
          <nav className="p-4 space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === s.id
                    ? "bg-orange-500/10 text-orange-500"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <ChevronRight className="w-3 h-3" />
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 max-w-4xl mx-auto px-6 py-12 space-y-16">
          {/* Overview */}
          <section id="overview">
            <h1 className="text-4xl font-bold mb-4">Rabbit Stack Documentation</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Rabbit Stack is an AI-powered code review bot that automatically reviews every pull request on your connected GitHub repositories. It uses Google Gemini for code understanding and generates comprehensive, structured reviews posted directly to GitHub.
            </p>
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-6">
              <h3 className="font-semibold text-orange-500 mb-2">Tagline</h3>
              <p className="text-lg font-mono">
                &ldquo;Your code moves fast. Your reviews should move faster.&rdquo;
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works">
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>
            <div className="space-y-6">
              {[
                {
                  step: "1",
                  icon: <GitPullRequest className="w-5 h-5 text-orange-400" />,
                  title: "A Pull Request is opened",
                  desc: "When a PR is opened, synced, or reopened on a connected repo, GitHub sends a webhook to Rabbit Stack.",
                },
                {
                  step: "2",
                  icon: <Webhook className="w-5 h-5 text-orange-400" />,
                  title: "Webhook triggers Inngest",
                  desc: "The webhook handler verifies the payload signature and dispatches a `pull_request.review_requested` event to Inngest for reliable background processing.",
                },
                {
                  step: "3",
                  icon: <Database className="w-5 h-5 text-orange-400" />,
                  title: "RAG context retrieval",
                  desc: "Rabbit Stack generates embeddings for the changed files and queries Pinecone to fetch the most relevant codebase context, so the review understands your entire repo — not just the diff.",
                },
                {
                  step: "4",
                  icon: <Bot className="w-5 h-5 text-orange-400" />,
                  title: "AI generates review",
                  desc: "Google Gemini 1.5 Pro generates a comprehensive review with walkthrough, sequence diagram, strengths, issues, suggestions, and a poem. Gemini Flash generates inline comments.",
                },
                {
                  step: "5",
                  icon: <Code2 className="w-5 h-5 text-orange-400" />,
                  title: "Review posted to GitHub",
                  desc: "The review is posted directly to GitHub as a pull request review with line-by-line inline comments — visible right in your PR.",
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="flex gap-4 p-4 rounded-xl border border-border bg-card"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    {s.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Setup */}
          <section id="setup">
            <h2 className="text-2xl font-bold mb-6">Quick Setup</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">1. Sign in with GitHub</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Click &ldquo;Get Started&rdquo; and sign in with your GitHub account. Rabbit Stack needs repo access to create webhooks and post reviews.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">2. Connect a repository</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Go to the Repositories page and click &ldquo;Connect&rdquo; on any repo. This creates a webhook that listens for PR events.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">
                  3. Add your OpenAI API key
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Go to Settings and add your OpenAI API key. This is used for generating embeddings (RAG) to give the AI full codebase context.
                </p>
                <CopyBlock code="OPENAI_API_KEY=sk-proj-your-key-here" />
              </div>

              <div>
                <h3 className="font-semibold mb-3">4. Open a Pull Request</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  That&rsquo;s it! Open or update a PR and Rabbit Stack will
                  automatically review it within seconds.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features">
            <h2 className="text-2xl font-bold mb-6">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: <Zap className="w-4 h-4 text-orange-400" />,
                  title: "Instant Reviews",
                  desc: "Reviews generated in < 30 seconds",
                },
                {
                  icon: <Search className="w-4 h-4 text-orange-400" />,
                  title: "RAG-Powered",
                  desc: "Full codebase context via Pinecone embeddings",
                },
                {
                  icon: <Shield className="w-4 h-4 text-orange-400" />,
                  title: "Security Scanning",
                  desc: "Auto-detects vulnerabilities and auth issues",
                },
                {
                  icon: <Code2 className="w-4 h-4 text-orange-400" />,
                  title: "Inline Comments",
                  desc: "Line-by-line feedback with severity levels",
                },
                {
                  icon: <Bot className="w-4 h-4 text-orange-400" />,
                  title: "Walkthrough & Diagrams",
                  desc: "Mermaid sequence diagrams with every review",
                },
                {
                  icon: <Settings className="w-4 h-4 text-orange-400" />,
                  title: "Configurable",
                  desc: "Themes, notifications, and privacy settings",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {f.icon}
                    <h3 className="font-medium text-sm">{f.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Architecture */}
          <section id="architecture">
            <h2 className="text-2xl font-bold mb-6">Architecture</h2>
            <CopyBlock
              code={`┌─────────────────────────────────────────────────────────┐
│                    GitHub PR Event                      │
│            (opened / synchronize / reopened)             │
└─────────────────┬───────────────────────────────────────┘
                  │ Webhook
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js API Route (Webhook)                │
│           Signature verification + dispatch             │
└─────────────────┬───────────────────────────────────────┘
                  │ Inngest Event
                  ▼
┌─────────────────────────────────────────────────────────┐
│           Inngest Function: review-pull-request          │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌────────┐  │
│  │ Fetch PR │→│ RAG Query │→│ AI Review  │→│ Post   │  │
│  │ Details  │ │ (Pinecone)│ │ (Gemini)   │ │ Review │  │
│  └──────────┘ └───────────┘ └────────────┘ └────────┘  │
└─────────────────────────────────────────────────────────┘
                  │
     ┌────────────┴────────────┐
     ▼                         ▼
┌──────────┐            ┌──────────────┐
│ Postgres │            │ GitHub API   │
│ (Neon)   │            │ PR Review    │
└──────────┘            └──────────────┘`}
            />
            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Frontend:</strong> Next.js 16 (App Router) + Tailwind CSS + shadcn/ui
              </p>
              <p>
                <strong className="text-foreground">Auth:</strong> Better Auth with GitHub OAuth
              </p>
              <p>
                <strong className="text-foreground">AI:</strong> Gemini 1.5 Pro (reviews) + Gemini 1.5 Flash (inline comments)
              </p>
              <p>
                <strong className="text-foreground">Embeddings:</strong> OpenAI text-embedding-3-small via Vercel AI SDK
              </p>
              <p>
                <strong className="text-foreground">Vector DB:</strong> Pinecone (1536d, cosine)
              </p>
              <p>
                <strong className="text-foreground">DB:</strong> PostgreSQL (Neon) via Prisma
              </p>
              <p>
                <strong className="text-foreground">Queue:</strong> Inngest (background jobs, retries, concurrency)
              </p>
            </div>
          </section>

          {/* API Keys */}
          <section id="api-keys">
            <h2 className="text-2xl font-bold mb-6">API Keys & Environment</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Rabbit Stack requires the following environment variables:
            </p>
            <CopyBlock
              code={`# Database
DATABASE_URL="postgresql://..."

# Auth
BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Webhook (use ngrok for local dev)
WEBHOOK_URL="https://your-domain.com"

# Google AI (for code review generation)
GOOGLE_GENERATIVE_AI_API_KEY="..."

# OpenAI (for embeddings / RAG)
OPENAI_API_KEY="sk-proj-..."

# Pinecone (vector database)
PINECONE_DB_API_KEY="..."`}
            />
          </section>

          {/* FAQ */}
          <section id="faq">
            <h2 className="text-2xl font-bold mb-6">FAQ</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Is my code stored or used for training?",
                  a: "No. Code is processed transiently for the review and stored only as review metadata in your database. Neither OpenAI nor Google use API inputs for training.",
                },
                {
                  q: "How much does it cost?",
                  a: "Rabbit Stack itself is free and self-hosted. You pay for API usage: Gemini (generous free tier), OpenAI embeddings (~$0.02/1M tokens), Pinecone (free tier available), and Neon DB (free tier).",
                },
                {
                  q: "Can I use it with private repos?",
                  a: "Yes! Rabbit Stack uses your own GitHub token with repo scope, so it works with both public and private repositories.",
                },
                {
                  q: "Why is OpenAI used for embeddings instead of Google?",
                  a: "Google's v1beta API currently has no working embedding models. OpenAI's text-embedding-3-small is fast, cheap, and stable. Gemini is still used for all code review generation.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-border bg-card"
                >
                  <h3 className="font-semibold mb-2">{item.q}</h3>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
