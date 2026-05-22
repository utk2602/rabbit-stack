import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Code2,
  DatabaseZap,
  FolderGit2,
  GitCommit,
  GitPullRequest,
  GitPullRequestDraft,
  Github,
  Radar,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { ReviewSignal } from "@/components/brand/review-signal";
import { EmptyState } from "@/components/ui/empty-state";
import { GlowPanel } from "@/components/ui/glow-panel";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge, StatusPulse } from "@/components/ui/status-badge";
import { requireAuth } from "../../../lib/auth-utils";
import {
  getContributionStatsByUserId,
  getGithubProfile,
  getMonthlyActivityStatsByUserId,
  getUserContributionsByUserId,
} from "../../../module/github/github";
import { ContributionGraph } from "../../components/ContributionGraph";

export default async function DashboardPage() {
  const session = await requireAuth();
  const userId = session.user.id;
  const [profile, stats, monthlyStats, contributions] = await Promise.all([
    getGithubProfile(userId).catch(() => null),
    getContributionStatsByUserId(userId).catch(() => null),
    getMonthlyActivityStatsByUserId(userId).catch(() => null),
    getUserContributionsByUserId(userId).catch(() => null),
  ]);

  if (!profile || !stats) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center px-4 py-8">
        <EmptyState
          icon={Github}
          title="Connect GitHub"
          description="Connect your GitHub account to unlock repository indexing, AI pull request reviews, and contribution intelligence."
          action={{ label: "Connect GitHub Account", href: "/api/auth/signin" }}
        />
      </main>
    );
  }

  const topRepositories = stats.topRepositories ?? [];
  const maxMonthly = Math.max(
    ...((monthlyStats ?? []).map((month) => month.totalContributions)),
    1
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        icon={Radar}
        eyebrow="Command center"
        title={`Welcome back, ${profile.name || profile.login}`}
        description="A live operating view of your connected repositories, review flow, contribution rhythm, and AI reviewer readiness."
        meta={
          <>
            <StatusBadge tone="good">AI reviewer online</StatusBadge>
            <StatusBadge tone="info">{stats.totalRepositories} repositories tracked</StatusBadge>
          </>
        }
        actions={
          <>
            <Link
              href="/repositories"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-secondary/70 px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <FolderGit2 className="h-4 w-4" />
              Repositories
            </Link>
            <Link
              href="/dashboard/reviews"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <GitPullRequestDraft className="h-4 w-4" />
              Review activity
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Contributions"
          value={stats.totalContributions}
          detail="Synced from GitHub activity"
          icon={Activity}
          tone="primary"
          trend={<StatusPulse />}
        />
        <MetricCard
          title="Pull Requests"
          value={stats.totalPullRequests}
          detail="Reviewable delivery stream"
          icon={GitPullRequest}
          tone="cyan"
        />
        <MetricCard
          title="Code Reviews"
          value={stats.totalReviews}
          detail="AI and human review history"
          icon={GitPullRequestDraft}
          tone="violet"
        />
        <MetricCard
          title="Repositories"
          value={stats.totalRepositories}
          detail={`${topRepositories.length} high-activity repos surfaced`}
          icon={Code2}
          tone="neutral"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
        <div className="space-y-6">
          <GlowPanel className="p-6" accent="cyan">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <TrendingUp className="h-5 w-5 text-cyan-200" />
                  Contribution Activity
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Monthly rhythm across commits, pull requests, issues, and reviews.
                </p>
              </div>
              <StatusBadge tone="idle">Last 12 months</StatusBadge>
            </div>

            {monthlyStats && monthlyStats.length > 0 ? (
              <div className="flex h-56 items-end gap-2 overflow-hidden rounded-lg border border-border/70 bg-background/35 px-3 py-4">
                {monthlyStats
                  .slice()
                  .reverse()
                  .map((month, index) => {
                    const heightPercent = (month.totalContributions / maxMonthly) * 100;
                    const barHeight =
                      month.totalContributions > 0 ? Math.max(heightPercent, 8) : 2;

                    return (
                      <div
                        key={`${month.monthName}-${month.year}-${index}`}
                        className="group flex min-w-0 flex-1 flex-col items-center gap-2"
                      >
                        <div className="relative flex h-44 w-full items-end justify-center">
                          <div
                            className="w-full max-w-8 rounded-t-md bg-linear-to-t from-primary/35 via-cyan-300/65 to-primary shadow-[0_0_24px_rgba(124,247,200,0.12)] transition-all duration-300 group-hover:from-primary/60 group-hover:to-cyan-200"
                            style={{ height: `${barHeight}%` }}
                          />
                          <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 min-w-36 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-xs opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                            <p className="font-semibold">
                              {month.monthName} {month.year}
                            </p>
                            <p className="text-muted-foreground">
                              {month.totalContributions} contributions
                            </p>
                          </div>
                        </div>
                        <span className="w-full truncate text-center text-[11px] font-medium text-muted-foreground">
                          {month.monthName.substring(0, 3)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <EmptyState
                icon={Activity}
                title="No contribution data"
                description="Once GitHub activity syncs, your monthly contribution rhythm will appear here."
                className="bg-background/30"
              />
            )}
          </GlowPanel>

          <GlowPanel className="p-6" accent="primary">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <DatabaseZap className="h-5 w-5 text-primary" />
                  Daily Contribution Graph
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Heatmap readout for long-range delivery consistency.
                </p>
              </div>
            </div>
            {contributions ? (
              <ContributionGraph calendar={contributions.contributionCalendar} />
            ) : (
              <EmptyState
                icon={Activity}
                title="No daily data"
                description="Daily GitHub contribution cells will render after the next sync."
                className="bg-background/30"
              />
            )}
          </GlowPanel>
        </div>

        <div className="space-y-6">
          <GlowPanel className="p-5" accent="primary">
            <div className="grid gap-5 sm:grid-cols-[150px_1fr] xl:grid-cols-1">
              <ReviewSignal className="mx-auto w-full max-w-[170px]" />
              <div>
                <StatusBadge tone="good">System operational</StatusBadge>
                <h2 className="mt-4 text-xl font-semibold">Rabbit Stack AI</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Your reviewer is ready to inspect pull requests, map repository
                  context, and post focused comments when connected repos receive new work.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-border bg-background/35 p-3">
                    <p className="text-muted-foreground">Mode</p>
                    <p className="mt-1 font-semibold text-primary">Balanced</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/35 p-3">
                    <p className="text-muted-foreground">Signal</p>
                    <p className="mt-1 font-semibold text-cyan-200">Live</p>
                  </div>
                </div>
              </div>
            </div>
          </GlowPanel>

          <GlowPanel className="p-5" accent="violet">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Quick Actions</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Move directly into the review workflow.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <ActionLink
                href="/dashboard/reviews"
                icon={GitPullRequest}
                title="Inspect reviews"
                description="Scan recent AI review reports"
              />
              <ActionLink
                href="/repositories"
                icon={FolderGit2}
                title="Connect repository"
                description="Enable indexing and webhooks"
              />
              <ActionLink
                href="/dashboard/security"
                icon={ShieldCheck}
                title="Check security posture"
                description="Review webhooks, secrets, and audit risk"
              />
            </div>
          </GlowPanel>

          <GlowPanel className="overflow-hidden" accent="cyan">
            <div className="border-b border-border p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Top Repositories</h2>
                <Link
                  href="/repositories"
                  className="text-sm font-medium text-primary hover:text-primary/80"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-border">
              {topRepositories.length === 0 ? (
                <div className="p-5 text-sm text-muted-foreground">
                  No repository activity has been synced yet.
                </div>
              ) : (
                topRepositories.slice(0, 5).map((repo, index) => (
                  <div
                    key={`${repo.name}-${index}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-accent/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-secondary/70 text-muted-foreground">
                        <GitCommit className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{repo.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {repo.commits.toLocaleString()} commits
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
          </GlowPanel>
        </div>
      </section>
    </main>
  );
}

function ActionLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof GitPullRequest;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-border bg-background/35 p-3 transition-colors hover:border-primary/30 hover:bg-accent/40"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-secondary/70 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
