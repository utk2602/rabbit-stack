import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  DatabaseZap,
  KeyRound,
  RadioTower,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { GlowPanel } from "@/components/ui/glow-panel";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireAuth } from "../../../../lib/auth-utils";
import { getSecuritySummary } from "../../../../lib/security-summary";

type RiskStatus = "good" | "warn" | "bad";

function metricTone(status: RiskStatus): "primary" | "amber" | "rose" {
  if (status === "good") return "primary";
  if (status === "warn") return "amber";
  return "rose";
}

function badgeTone(status: RiskStatus): "good" | "warn" | "bad" {
  if (status === "good") return "good";
  if (status === "warn") return "warn";
  return "bad";
}

export default async function SecurityPage() {
  const session = await requireAuth();
  const summary = await getSecuritySummary(session.user.id);

  const plaintextStatus: RiskStatus = summary.secrets.plaintext > 0 ? "bad" : "good";
  const webhookStatus: RiskStatus =
    summary.webhooks.missingSecret > 0 || summary.webhooks.missingWebhookId > 0
      ? "bad"
      : summary.webhooks.connected === 0
        ? "warn"
        : "good" as RiskStatus;
  const reviewStatus: RiskStatus = summary.reviews.failed > 0 ? "warn" : "good";
  const indexingStatus: RiskStatus =
    summary.indexing.failed > 0
      ? "warn"
      : summary.indexing.indexing > 0
        ? "warn"
        : "good" as RiskStatus;
  const auditStatus: RiskStatus = summary.audit.recentFailures > 0 ? "warn" : "good";
  const dependencyStatus: RiskStatus =
    !summary.dependencies.latest || summary.dependencies.latest.critical > 0
      ? "bad"
      : summary.dependencies.latest.high > 0
        ? "warn"
        : "good" as RiskStatus;

  const overallStatus: RiskStatus = [
    plaintextStatus,
    webhookStatus,
    reviewStatus,
    indexingStatus,
    auditStatus,
    dependencyStatus,
  ].includes("bad")
    ? "bad"
    : [
          plaintextStatus,
          webhookStatus,
          reviewStatus,
          indexingStatus,
          auditStatus,
          dependencyStatus,
        ].includes("warn")
      ? "warn"
      : "good";

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        icon={ShieldCheck}
        eyebrow="Security center"
        title="Posture Dashboard"
        description="A live readout of secret hygiene, webhook trust, review job health, indexing integrity, dependency risk, and audit events."
        meta={
          <>
            <StatusBadge tone={badgeTone(overallStatus)}>
              {overallStatus === "good"
                ? "Core checks clean"
                : overallStatus === "warn"
                  ? "Attention needed"
                  : "Action required"}
            </StatusBadge>
            <StatusBadge tone={summary.secrets.missingEncryptionKey ? "bad" : "good"}>
              Encryption key {summary.secrets.missingEncryptionKey ? "missing" : "configured"}
            </StatusBadge>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard
          title="Encrypted Secrets"
          value={summary.secrets.encrypted}
          detail={`${summary.secrets.plaintext} plaintext values need backfill`}
          icon={KeyRound}
          tone={metricTone(plaintextStatus)}
        />
        <MetricCard
          title="Webhook Trust"
          value={summary.webhooks.connected}
          detail={`${summary.webhooks.missingSecret} missing secrets, ${summary.webhooks.invalidRecent} invalid recent`}
          icon={RadioTower}
          tone={metricTone(webhookStatus)}
        />
        <MetricCard
          title="Review Jobs"
          value={summary.reviews.inProgress}
          detail={`${summary.reviews.failed} failed jobs`}
          icon={Activity}
          tone={metricTone(reviewStatus)}
        />
        <MetricCard
          title="Code Indexing"
          value={summary.indexing.completed}
          detail={`${summary.indexing.indexing} running, ${summary.indexing.failed} failed`}
          icon={DatabaseZap}
          tone={metricTone(indexingStatus)}
        />
        <MetricCard
          title="Audit Risk"
          value={summary.audit.recentFailures}
          detail="Recent error-severity audit events"
          icon={Activity}
          tone={metricTone(auditStatus)}
        />
        <MetricCard
          title="Dependency Risk"
          value={summary.dependencies.latest?.total ?? 0}
          detail={
            summary.dependencies.latest
              ? `${summary.dependencies.latest.critical} critical, ${summary.dependencies.latest.high} high`
              : "No audit ingested"
          }
          icon={ShieldAlert}
          tone={metricTone(dependencyStatus)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlowPanel className="overflow-hidden" accent="primary">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">Recent Audit Events</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Security-relevant application events sorted by recency.
            </p>
          </div>
          <div className="divide-y divide-border">
            {summary.audit.recentEvents.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                No audit events recorded yet.
              </div>
            ) : (
              summary.audit.recentEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-4 px-5 py-4">
                  <div
                    className={`mt-0.5 rounded-lg border p-2 ${
                      event.severity === "error"
                        ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
                        : event.severity === "warning"
                          ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
                          : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    }`}
                  >
                    {event.severity === "error" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{event.event}</p>
                      {event.repository && (
                        <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                          {event.repository}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {event.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlowPanel>

        <div className="space-y-6">
          <HealthPanel
            title="Webhook Health"
            empty="No repositories have been synced yet."
            items={summary.webhooks.repositories.map((repo) => {
              const status = repo.isConnected
                ? repo.lastStatus ?? "waiting"
                : "disconnected";

              return {
                id: repo.id,
                name: repo.fullName,
                status,
                detail: repo.lastEvent
                  ? `${repo.lastEvent} at ${
                      repo.lastAt ? new Date(repo.lastAt).toLocaleString() : "unknown time"
                    }`
                  : "No webhook delivery recorded yet.",
                error: repo.lastError,
              };
            })}
          />

          <HealthPanel
            title="Indexing Health"
            empty="No connected repositories are queued for indexing."
            items={summary.indexing.repositories.map((repo) => ({
              id: repo.id,
              name: repo.fullName,
              status: repo.status,
              detail:
                repo.status === "completed"
                  ? `${repo.fileCount} files and ${repo.chunkCount} chunks indexed${
                      repo.lastIndexedAt
                        ? ` at ${new Date(repo.lastIndexedAt).toLocaleString()}`
                        : ""
                    }.`
                  : "Awaiting a completed index run.",
              error: repo.lastError,
            }))}
          />

          <DependencyPanel latest={summary.dependencies.latest} />
          <NextActions summary={summary} />
        </div>
      </section>
    </main>
  );
}

function HealthPanel({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: Array<{
    id: string;
    name: string;
    status: string;
    detail: string;
    error?: string | null;
  }>;
}) {
  return (
    <GlowPanel className="p-5" accent="cyan">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-background/35 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <HealthBadge status={item.status} />
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.detail}</p>
              {item.error && <p className="mt-2 text-xs text-rose-200">{item.error}</p>}
            </div>
          ))
        )}
      </div>
    </GlowPanel>
  );
}

function HealthBadge({ status }: { status: string }) {
  const tone: "good" | "bad" | "info" | "idle" =
    status === "valid" || status === "completed"
      ? "good"
      : status === "invalid" || status === "failed" || status === "disconnected"
        ? "bad"
        : status === "indexing"
          ? "info"
          : "idle";

  return (
    <StatusBadge tone={tone} pulse={status === "indexing"}>
      {status}
    </StatusBadge>
  );
}

function DependencyPanel({
  latest,
}: {
  latest: {
    total: number;
    critical: number;
    high: number;
    fixable: number;
    createdAt: Date | string;
  } | null;
}) {
  return (
    <GlowPanel className="p-5" accent="amber">
      <h2 className="text-lg font-semibold">Dependency Audit</h2>
      {latest ? (
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <DependencyMetric label="Total" value={latest.total} />
          <DependencyMetric label="Critical" value={latest.critical} tone="bad" />
          <DependencyMetric label="High" value={latest.high} tone="warn" />
          <DependencyMetric label="Fixable" value={latest.fixable} />
          <p className="col-span-2 text-xs text-muted-foreground">
            Last ingested {new Date(latest.createdAt).toLocaleString()}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Run `npm run audit:ingest` to capture production dependency risk.
        </p>
      )}
    </GlowPanel>
  );
}

function DependencyMetric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "bad" | "warn";
}) {
  const toneClass =
    tone === "bad"
      ? "border-rose-400/20 bg-rose-400/10 text-rose-100"
      : tone === "warn"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
        : "border-border bg-background/35";

  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function NextActions({
  summary,
}: {
  summary: Awaited<ReturnType<typeof getSecuritySummary>>;
}) {
  const actions: Array<{ tone: "bad" | "warn" | "idle" | "good"; text: string }> = [];

  if (summary.secrets.plaintext > 0) {
    actions.push({
      tone: "warn",
      text: "Run `npm run backfill:secrets` after setting `DATA_ENCRYPTION_KEY`.",
    });
  }
  if (summary.webhooks.missingSecret > 0) {
    actions.push({
      tone: "bad",
      text: "Reconnect repositories missing webhook secrets.",
    });
  }
  if (summary.webhooks.connected === 0) {
    actions.push({
      tone: "idle",
      text: "Connect a repository to enable webhook health tracking.",
    });
  }
  if (summary.indexing.failed > 0) {
    actions.push({
      tone: "warn",
      text: "Retry failed repository indexes from the repository cards.",
    });
  }
  if (!summary.dependencies.latest) {
    actions.push({
      tone: "idle",
      text: "Run `npm run audit:ingest` to populate dependency risk.",
    });
  }
  if (actions.length === 0) {
    actions.push({
      tone: "good",
      text: "Core secret, webhook, indexing, and dependency checks look clean.",
    });
  }

  return (
    <GlowPanel className="p-5" accent="primary">
      <h2 className="text-lg font-semibold">Recommended Next Actions</h2>
      <div className="mt-5 space-y-3">
        {actions.map((action, index) => (
          <div
            key={`${action.text}-${index}`}
            className="flex items-start gap-3 rounded-lg border border-border bg-background/35 p-4 text-sm"
          >
            <StatusBadge tone={action.tone}>{action.tone}</StatusBadge>
            <p className="min-w-0 leading-6 text-muted-foreground">{action.text}</p>
          </div>
        ))}
      </div>
    </GlowPanel>
  );
}
