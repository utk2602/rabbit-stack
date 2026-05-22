"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Database,
  GitPullRequest,
  KeyRound,
  ShieldCheck,
  Webhook,
  Zap,
} from "lucide-react";

import { AnimatedWordmark } from "@/components/brand/animated-wordmark";
import { ReactBitsStage } from "@/components/brand/react-bits-stage";
import { GlowPanel } from "@/components/ui/glow-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "how-it-works", label: "How It Works" },
  { id: "setup", label: "Quick Setup" },
  { id: "security", label: "Security" },
  { id: "architecture", label: "Architecture" },
  { id: "environment", label: "Environment" },
  { id: "faq", label: "FAQ" },
];

function CopyBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      <pre className="overflow-x-auto rounded-lg border border-border bg-background/80 p-4 font-mono text-sm leading-6 text-zinc-300">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute right-3 top-3 rounded-md border border-border bg-secondary p-1.5 text-muted-foreground opacity-0 transition-all hover:text-foreground group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <ReactBitsStage className="min-h-screen" intensity="quiet">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="hidden h-5 w-px bg-border sm:block" />
            <AnimatedWordmark compact />
          </div>
          <StatusBadge tone="info">Documentation</StatusBadge>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 pt-24 sm:px-6 lg:px-8">
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-64 shrink-0 overflow-y-auto lg:block">
          <GlowPanel className="p-2" accent="cyan">
            <nav className="space-y-1">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <ChevronRight className="h-3 w-3" />
                  {section.label}
                </a>
              ))}
            </nav>
          </GlowPanel>
        </aside>

        <main className="w-full max-w-4xl space-y-14 pb-20">
          <section id="overview">
            <StatusBadge tone="good">Rabbit Stack docs</StatusBadge>
            <h1 className="mt-4 font-brand text-5xl font-black tracking-normal">
              AI code reviews for every pull request.
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Rabbit Stack connects to GitHub, indexes repository context, listens for
              pull request webhooks, and posts focused AI review reports directly back
              to your PRs.
            </p>
          </section>

          <DocSection id="how-it-works" title="How It Works">
            <div className="space-y-3">
              {[
                {
                  icon: GitPullRequest,
                  title: "Pull request event",
                  desc: "GitHub sends a webhook when a PR is opened, synchronized, or reopened.",
                },
                {
                  icon: Webhook,
                  title: "Verified webhook",
                  desc: "Rabbit Stack verifies the payload signature and queues a review job.",
                },
                {
                  icon: Database,
                  title: "Repository context",
                  desc: "Embeddings and indexed chunks retrieve relevant codebase context.",
                },
                {
                  icon: Bot,
                  title: "AI review",
                  desc: "The reviewer generates summary feedback and inline comments.",
                },
                {
                  icon: Code2,
                  title: "GitHub response",
                  desc: "Comments and the review report are posted back to the pull request.",
                },
              ].map((item) => (
                <DocCard key={item.title} icon={item.icon} title={item.title}>
                  {item.desc}
                </DocCard>
              ))}
            </div>
          </DocSection>

          <DocSection id="setup" title="Quick Setup">
            <div className="grid gap-4 md:grid-cols-2">
              <SetupStep number="1" title="Sign in with GitHub">
                Use the GitHub OAuth flow to authorize Rabbit Stack.
              </SetupStep>
              <SetupStep number="2" title="Connect a repository">
                Choose repositories from the control surface and create webhooks.
              </SetupStep>
              <SetupStep number="3" title="Add API keys">
                Save the OpenAI key for embeddings and configure provider keys on the server.
              </SetupStep>
              <SetupStep number="4" title="Open a pull request">
                Rabbit Stack queues a review and posts results back to GitHub.
              </SetupStep>
            </div>
          </DocSection>

          <DocSection id="security" title="Security Model">
            <div className="grid gap-4 md:grid-cols-3">
              <DocCard icon={ShieldCheck} title="OAuth only">
                No passwords are stored by Rabbit Stack.
              </DocCard>
              <DocCard icon={KeyRound} title="Encrypted secrets">
                API keys are stored through the app&apos;s encrypted secret flow.
              </DocCard>
              <DocCard icon={Webhook} title="Webhook trust">
                Delivery signatures are verified before jobs are queued.
              </DocCard>
            </div>
          </DocSection>

          <DocSection id="architecture" title="Architecture">
            <CopyBlock
              code={`GitHub PR event
  -> Next.js webhook route
  -> signature verification
  -> Inngest review job
  -> fetch pull request diff
  -> retrieve repository context
  -> generate AI review
  -> post review and inline comments to GitHub
  -> persist review metadata in Postgres`}
            />
          </DocSection>

          <DocSection id="environment" title="Environment">
            <CopyBlock
              code={`DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
WEBHOOK_URL="https://your-domain.com"
GOOGLE_GENERATIVE_AI_API_KEY="..."
OPENAI_API_KEY="sk-proj-..."
PINECONE_DB_API_KEY="..."
DATA_ENCRYPTION_KEY="base64-32-byte-key"`}
            />
          </DocSection>

          <DocSection id="faq" title="FAQ">
            <div className="space-y-3">
              <FaqItem question="Can I use private repositories?">
                Yes. Rabbit Stack uses your GitHub authorization and works with repositories
                you are allowed to access.
              </FaqItem>
              <FaqItem question="Does it replace human review?">
                No. It catches obvious issues, security risks, and missing context before
                humans spend time reviewing.
              </FaqItem>
              <FaqItem question="What happens when a job fails?">
                Failed reviews are visible in Review Activity and can be retried.
              </FaqItem>
            </div>
          </DocSection>
        </main>
      </div>
    </ReactBitsStage>
  );
}

function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-5 text-2xl font-semibold tracking-normal">{title}</h2>
      {children}
    </section>
  );
}

function DocCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Zap;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <GlowPanel className="p-4" accent="primary">
      <Icon className="mb-3 h-5 w-5 text-primary" />
      <h3 className="font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{children}</p>
    </GlowPanel>
  );
}

function SetupStep({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <GlowPanel className="p-4" accent="cyan">
      <div className="mb-3 grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
        {number}
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{children}</p>
    </GlowPanel>
  );
}

function FaqItem({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <GlowPanel className="p-4" accent="violet">
      <h3 className="font-medium">{question}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{children}</p>
    </GlowPanel>
  );
}
