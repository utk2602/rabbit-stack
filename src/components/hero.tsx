"use client";

import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircle2,
  GitPullRequest,
  Radar,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { ReactBitsStage } from "@/components/brand/react-bits-stage";
import { ReviewSignal } from "@/components/brand/review-signal";
import { SpotlightSurface } from "@/components/brand/spotlight-surface";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

interface HeroSectionProps {
  onAuthClick?: () => void;
}

const previewFindings = [
  "Missing authorization check on repository settings update.",
  "Webhook signature verification fails closed when header is absent.",
  "Index retry flow should preserve the previous successful snapshot.",
];

export function HeroSection({ onAuthClick }: HeroSectionProps) {
  return (
    <ReactBitsStage className="min-h-[calc(100vh-4rem)]">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-6 flex flex-wrap gap-2">
            <StatusBadge tone="good">AI reviewer online</StatusBadge>
            <StatusBadge tone="info">GitHub PR automation</StatusBadge>
          </div>

          <h1 className="font-brand text-5xl font-black leading-[0.95] tracking-normal text-foreground sm:text-6xl lg:text-7xl">
            Rabbit Stack
            <span className="mt-3 block text-gradient-primary">
              reviews pull requests before they bite back.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Connect GitHub repositories, let Rabbit Stack index your codebase, and
            get focused AI review reports with inline comments, security findings,
            and retryable background jobs.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={onAuthClick}>
              Connect GitHub
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/docs">
                <BookOpenIcon className="h-4 w-4" />
                View docs
              </a>
            </Button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <HeroStat icon={GitPullRequest} value="Every PR" label="reviewed automatically" />
            <HeroStat icon={ShieldCheck} value="Security" label="findings highlighted" />
            <HeroStat icon={Zap} value="Retryable" label="background review jobs" />
          </div>
        </div>

        <SpotlightSurface className="p-0" spotlightColor="rgba(91, 216, 255, 0.20)">
          <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
              <ReviewSignal className="mx-auto max-w-64" />
              <div className="mt-5">
                <StatusBadge tone="good">Review passed with warnings</StatusBadge>
                <h2 className="mt-4 text-xl font-semibold">PR #128: webhook hardening</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Rabbit Stack found 3 actionable issues and generated 5 inline comments.
                </p>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">AI review report</p>
                  <p className="text-xs text-muted-foreground">api/webhooks/github/route.ts</p>
                </div>
                <Radar className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-3">
                {previewFindings.map((finding, index) => (
                  <div
                    key={finding}
                    className="rounded-lg border border-border bg-background/45 p-3"
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Finding {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{finding}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SpotlightSurface>
      </section>
    </ReactBitsStage>
  );
}

function HeroStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof GitPullRequest;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/45 p-4 backdrop-blur">
      <Icon className="mb-3 h-5 w-5 text-primary" />
      <p className="font-semibold">{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{label}</p>
    </div>
  );
}
