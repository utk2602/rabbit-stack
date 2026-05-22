"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileCode,
  GitPullRequest,
  Info,
  Loader2,
  MessageSquare,
  RotateCcw,
  Search,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/ui/empty-state";
import { GlowPanel } from "@/components/ui/glow-panel";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

interface ReviewComment {
  id: string;
  path: string;
  line: number;
  body: string;
  severity: string;
}

interface Review {
  id: string;
  repositoryId: string;
  pullNumber: number;
  pullTitle: string;
  pullUrl: string;
  headSha: string;
  baseBranch: string;
  headBranch: string;
  author: string;
  status: string;
  summary: string | null;
  walkthrough: string | null;
  strengths: string[];
  issues: string[];
  suggestions: string[];
  poem: string | null;
  tokensUsed: number | null;
  processingMs: number | null;
  error: string | null;
  postedToGithub: boolean;
  createdAt: string;
  repository: {
    fullName: string;
    name: string;
  };
  comments: ReviewComment[];
}

type StatusFilter = "all" | "completed" | "running" | "failed";

interface ReviewActivityClientProps {
  reviews: Review[];
}

export function ReviewActivityClient({ reviews }: ReviewActivityClientProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const statusCounts = {
    all: reviews.length,
    completed: reviews.filter((review) => review.status === "completed").length,
    running: reviews.filter((review) =>
      ["pending", "in_progress"].includes(review.status)
    ).length,
    failed: reviews.filter((review) => review.status === "failed").length,
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      searchQuery === "" ||
      review.pullTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.repository.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      review.status === statusFilter ||
      (statusFilter === "running" &&
        ["pending", "in_progress"].includes(review.status));

    return matchesSearch && matchesStatus;
  });

  const handleRetry = async (review: Review) => {
    setRetryingId(review.id);
    toast.loading(`Queueing retry for #${review.pullNumber}...`, {
      id: `retry-review-${review.id}`,
    });

    try {
      const response = await fetch(`/api/reviews/${review.id}/retry`, {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to queue retry");
      }

      toast.success(`Review retry queued for #${review.pullNumber}`, {
        id: `retry-review-${review.id}`,
      });
      window.location.reload();
    } catch (retryError) {
      toast.error("Failed to queue retry", {
        id: `retry-review-${review.id}`,
        description: retryError instanceof Error ? retryError.message : "Please try again.",
      });
    } finally {
      setRetryingId(null);
    }
  };

  const filterOptions: Array<{ value: StatusFilter; label: string; count: number }> = [
    { value: "all", label: "All", count: statusCounts.all },
    { value: "completed", label: "Completed", count: statusCounts.completed },
    { value: "running", label: "Running", count: statusCounts.running },
    { value: "failed", label: "Failed", count: statusCounts.failed },
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        icon={GitPullRequest}
        eyebrow="Review activity"
        title="AI Review Reports"
        description="Inspect completed reviews, retry failed jobs, and trace comments back to pull requests."
        meta={
          <>
            <StatusBadge tone="good">{statusCounts.completed} completed</StatusBadge>
            <StatusBadge tone={statusCounts.running > 0 ? "info" : "idle"} pulse={statusCounts.running > 0}>
              {statusCounts.running} running
            </StatusBadge>
            <StatusBadge tone={statusCounts.failed > 0 ? "bad" : "idle"}>
              {statusCounts.failed} failed
            </StatusBadge>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Reviews"
          value={statusCounts.all}
          detail="Recent review jobs"
          icon={GitPullRequest}
          tone="primary"
        />
        <MetricCard
          title="Inline Comments"
          value={reviews.reduce((total, review) => total + review.comments.length, 0)}
          detail="Posted or generated findings"
          icon={MessageSquare}
          tone="cyan"
        />
        <MetricCard
          title="Issues Flagged"
          value={reviews.reduce((total, review) => total + review.issues.length, 0)}
          detail="Review-level issue summaries"
          icon={AlertTriangle}
          tone={statusCounts.failed > 0 ? "amber" : "violet"}
        />
      </section>

      <GlowPanel className="p-4" accent="violet">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Search by PR title, repository, or author..."
            containerClassName="w-full lg:max-w-xl"
          />
          <SegmentedControl
            value={statusFilter}
            options={filterOptions}
            onValueChange={setStatusFilter}
          />
        </div>
      </GlowPanel>

      {filteredReviews.length === 0 ? (
        <EmptyState
          icon={reviews.length === 0 ? GitPullRequest : Search}
          title={reviews.length === 0 ? "No reviews yet" : "No matching reviews"}
          description={
            reviews.length === 0
              ? "When connected repositories receive pull requests, Rabbit Stack review reports will appear here."
              : "Try a different search query or status filter."
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isExpanded={expandedId === review.id}
              onToggle={() =>
                setExpandedId(expandedId === review.id ? null : review.id)
              }
              onRetry={() => handleRetry(review)}
              isRetrying={retryingId === review.id}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function ReviewCard({
  review,
  isExpanded,
  onToggle,
  onRetry,
  isRetrying,
}: {
  review: Review;
  isExpanded: boolean;
  onToggle: () => void;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  const issueCount = review.issues.length;
  const commentCount = review.comments.length;
  const status = getReviewStatus(review.status);

  return (
    <GlowPanel
      interactive
      accent={review.status === "failed" ? "rose" : review.status === "completed" ? "primary" : "cyan"}
      className="overflow-hidden p-0"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg border", status.iconTone)}>
          {status.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex min-w-0 items-center gap-2">
            <span className="truncate font-medium">{review.pullTitle}</span>
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              #{review.pullNumber}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="truncate">{review.repository.fullName}</span>
            <span>by {review.author}</span>
            <span>{getTimeAgo(new Date(review.createdAt))}</span>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          {commentCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              {commentCount}
            </span>
          )}
          {issueCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-200">
              <AlertTriangle className="h-3.5 w-3.5" />
              {issueCount}
            </span>
          )}
          <StatusBadge tone={status.tone} pulse={status.pulse}>
            {status.label}
          </StatusBadge>
        </div>

        {isExpanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-5 border-t border-border px-5 pb-5 pt-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <FileCode className="h-3.5 w-3.5" />
              {review.baseBranch} &lt;- {review.headBranch}
            </span>
            {review.processingMs && (
              <span className="inline-flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-primary" />
                {(review.processingMs / 1000).toFixed(1)}s processing
              </span>
            )}
            {review.tokensUsed && (
              <span className="inline-flex items-center gap-1">
                <Info className="h-3.5 w-3.5" />
                {review.tokensUsed.toLocaleString()} tokens
              </span>
            )}
            {review.postedToGithub && (
              <span className="inline-flex items-center gap-1 text-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Posted to GitHub
              </span>
            )}
            {review.status === "failed" && (
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground disabled:opacity-60"
              >
                <RotateCcw className={cn("h-3.5 w-3.5", isRetrying && "animate-spin")} />
                Retry
              </button>
            )}
            <a
              href={review.pullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-primary hover:text-primary/80"
            >
              View PR <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {review.summary && (
            <ReportSection title="Summary" tone="primary">
              <p className="whitespace-pre-wrap text-sm leading-6">{review.summary}</p>
            </ReportSection>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {review.strengths.length > 0 && (
              <ReportSection title="Strengths" tone="good">
                <FindingList items={review.strengths} icon={CheckCircle2} tone="good" />
              </ReportSection>
            )}
            {review.issues.length > 0 && (
              <ReportSection title="Issues" tone="warn">
                <FindingList items={review.issues} icon={AlertTriangle} tone="warn" />
              </ReportSection>
            )}
          </div>

          {review.suggestions.length > 0 && (
            <ReportSection title="Suggestions" tone="info">
              <FindingList items={review.suggestions} icon={Zap} tone="info" />
            </ReportSection>
          )}

          {review.comments.length > 0 && (
            <ReportSection title={`Inline Comments (${review.comments.length})`} tone="neutral">
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {review.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-lg border border-border bg-background/35 p-3"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <FileCode className="h-3 w-3" />
                      <span className="max-w-full truncate font-mono">{comment.path}</span>
                      <span>L{comment.line}</span>
                      <CommentSeverity severity={comment.severity} />
                    </div>
                    <p className="text-sm leading-6">{comment.body}</p>
                  </div>
                ))}
              </div>
            </ReportSection>
          )}

          {review.error && (
            <ReportSection title="Error" tone="bad">
              <p className="text-sm leading-6 text-rose-100">{review.error}</p>
            </ReportSection>
          )}

          {review.poem && (
            <ReportSection title="Review Poem" tone="primary">
              <p className="whitespace-pre-wrap text-sm italic leading-6 text-muted-foreground">
                {review.poem}
              </p>
            </ReportSection>
          )}
        </div>
      )}
    </GlowPanel>
  );
}

function ReportSection({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "primary" | "good" | "warn" | "info" | "bad" | "neutral";
  children: React.ReactNode;
}) {
  const toneClass = {
    primary: "border-primary/20 bg-primary/5",
    good: "border-emerald-400/20 bg-emerald-400/5",
    warn: "border-amber-400/20 bg-amber-400/5",
    info: "border-cyan-400/20 bg-cyan-400/5",
    bad: "border-rose-400/20 bg-rose-400/10",
    neutral: "border-border bg-background/30",
  }[tone];

  return (
    <section className={cn("rounded-lg border p-4", toneClass)}>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      {children}
    </section>
  );
}

function FindingList({
  items,
  icon: Icon,
  tone,
}: {
  items: string[];
  icon: typeof CheckCircle2;
  tone: "good" | "warn" | "info";
}) {
  const iconClass = {
    good: "text-emerald-200",
    warn: "text-amber-200",
    info: "text-cyan-200",
  }[tone];

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
          <Icon className={cn("mt-1 h-3.5 w-3.5 shrink-0", iconClass)} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CommentSeverity({ severity }: { severity: string }) {
  const tone =
    severity === "error"
      ? "bg-rose-400/10 text-rose-200"
      : severity === "warning"
        ? "bg-amber-400/10 text-amber-200"
        : "bg-cyan-400/10 text-cyan-200";

  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", tone)}>
      {severity}
    </span>
  );
}

function getReviewStatus(status: string) {
  if (status === "completed") {
    return {
      label: "Completed",
      tone: "good" as const,
      pulse: false,
      iconTone: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
      icon: <CheckCircle2 className="h-4 w-4" />,
    };
  }

  if (status === "failed") {
    return {
      label: "Failed",
      tone: "bad" as const,
      pulse: false,
      iconTone: "border-rose-400/20 bg-rose-400/10 text-rose-200",
      icon: <XCircle className="h-4 w-4" />,
    };
  }

  if (status === "in_progress") {
    return {
      label: "In Progress",
      tone: "info" as const,
      pulse: true,
      iconTone: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
    };
  }

  return {
    label: "Pending",
    tone: "warn" as const,
    pulse: false,
    iconTone: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    icon: <Clock className="h-4 w-4" />,
  };
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
