"use client";

import React, { useState } from "react";
import {
  GitPullRequest,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  Zap,
  FileCode,
  Info,
  Search,
  Filter,
} from "lucide-react";

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

interface ReviewActivityClientProps {
  reviews: Review[];
}

export function ReviewActivityClient({ reviews }: ReviewActivityClientProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      searchQuery === "" ||
      r.pullTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.repository.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: reviews.length,
    completed: reviews.filter((r) => r.status === "completed").length,
    pending: reviews.filter((r) => r.status === "pending").length,
    in_progress: reviews.filter((r) => r.status === "in_progress").length,
    failed: reviews.filter((r) => r.status === "failed").length,
  };

  return (
    <div className="font-sans">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Review Activity</h1>
          <p className="text-muted-foreground">
            Track your AI-powered code reviews across all repositories.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatPill
            label="Total"
            count={statusCounts.all}
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
            color="text-foreground"
          />
          <StatPill
            label="Completed"
            count={statusCounts.completed}
            active={statusFilter === "completed"}
            onClick={() => setStatusFilter("completed")}
            color="text-green-500"
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          />
          <StatPill
            label="In Progress"
            count={statusCounts.in_progress + statusCounts.pending}
            active={statusFilter === "pending" || statusFilter === "in_progress"}
            onClick={() => setStatusFilter("pending")}
            color="text-yellow-500"
            icon={<Loader2 className="w-3.5 h-3.5" />}
          />
          <StatPill
            label="Failed"
            count={statusCounts.failed}
            active={statusFilter === "failed"}
            onClick={() => setStatusFilter("failed")}
            color="text-red-500"
            icon={<XCircle className="w-3.5 h-3.5" />}
          />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by PR title, repo, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          />
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16">
            <GitPullRequest className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {reviews.length === 0
                ? "When you connect repositories and open pull requests, AI reviews will appear here."
                : "No reviews match your search criteria."}
            </p>
          </div>
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
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatPill({
  label,
  count,
  active,
  onClick,
  color,
  icon,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
        active
          ? "bg-orange-500/10 border-orange-500/30"
          : "bg-card/30 border-border hover:border-accent"
      }`}
    >
      <div className="flex items-center gap-2">
        {icon && <span className={color}>{icon}</span>}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className={`text-lg font-bold ${color}`}>{count}</span>
    </button>
  );
}

function ReviewCard({
  review,
  isExpanded,
  onToggle,
}: {
  review: Review;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    completed: {
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: "text-green-500 bg-green-500/10 border-green-500/20",
      label: "Completed",
    },
    pending: {
      icon: <Clock className="w-4 h-4" />,
      color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
      label: "Pending",
    },
    in_progress: {
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      label: "In Progress",
    },
    failed: {
      icon: <XCircle className="w-4 h-4" />,
      color: "text-red-500 bg-red-500/10 border-red-500/20",
      label: "Failed",
    },
  };

  const status = statusConfig[review.status] || statusConfig.pending;
  const timeAgo = getTimeAgo(new Date(review.createdAt));
  const issueCount = review.issues.length;
  const commentCount = review.comments.length;

  return (
    <div className="bg-card/30 border border-border rounded-xl overflow-hidden hover:border-accent transition-colors">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center gap-4 text-left"
      >
        <GitPullRequest className="w-5 h-5 text-muted-foreground shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium truncate">{review.pullTitle}</span>
            <span className="text-xs text-muted-foreground shrink-0">
              #{review.pullNumber}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{review.repository.fullName}</span>
            <span>by {review.author}</span>
            <span>{timeAgo}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {commentCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="w-3.5 h-3.5" />
              {commentCount}
            </div>
          )}
          {issueCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-yellow-500">
              <AlertTriangle className="w-3.5 h-3.5" />
              {issueCount}
            </div>
          )}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}
          >
            {status.icon}
            {status.label}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5" />
              {review.baseBranch} ← {review.headBranch}
            </span>
            {review.processingMs && (
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-orange-500" />
                {(review.processingMs / 1000).toFixed(1)}s processing
              </span>
            )}
            {review.tokensUsed && (
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                {review.tokensUsed.toLocaleString()} tokens
              </span>
            )}
            {review.postedToGithub && (
              <span className="flex items-center gap-1 text-green-500">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Posted to GitHub
              </span>
            )}
            <a
              href={review.pullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-orange-500 hover:underline ml-auto"
            >
              View PR <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Summary */}
          {review.summary && (
            <div className="bg-secondary/50 rounded-lg p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Summary
              </h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {review.summary}
              </p>
            </div>
          )}

          {/* Strengths & Issues */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {review.strengths.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-green-500">
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {review.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {review.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-yellow-500">
                  Issues
                </h4>
                <ul className="space-y-1">
                  {review.issues.map((issue, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {review.suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                Suggestions
              </h4>
              <ul className="space-y-1">
                {review.suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Inline Comments */}
          {review.comments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Inline Comments ({review.comments.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {review.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-secondary/30 rounded-lg p-3 border border-border"
                  >
                    <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                      <FileCode className="w-3 h-3" />
                      <span className="font-mono">{comment.path}</span>
                      <span>L{comment.line}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          comment.severity === "error"
                            ? "bg-red-500/10 text-red-500"
                            : comment.severity === "warning"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {comment.severity}
                      </span>
                    </div>
                    <p className="text-sm">{comment.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {review.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-1">
                Error
              </h4>
              <p className="text-sm text-red-400">{review.error}</p>
            </div>
          )}

          {/* Poem */}
          {review.poem && (
            <div className="bg-secondary/30 rounded-lg p-4 border-l-2 border-orange-500">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-orange-500 mb-2">
                Review Poem
              </h4>
              <p className="text-sm italic text-muted-foreground whitespace-pre-wrap">
                {review.poem}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
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
