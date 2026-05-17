import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  DatabaseZap,
  KeyRound,
  RadioTower,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { requireAuth } from "../../../../lib/auth-utils";
import { getSecuritySummary } from "../../../../lib/security-summary";

function statusTone(status: "good" | "warn" | "bad") {
  if (status === "good") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "warn") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  }

  return "border-red-500/20 bg-red-500/10 text-red-300";
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  status,
}: {
  title: string;
  value: string;
  detail: string;
  icon: typeof ShieldCheck;
  status: "good" | "warn" | "bad";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal">{value}</p>
        </div>
        <div className={`rounded-lg border p-2 ${statusTone(status)}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

export default async function SecurityPage() {
  const session = await requireAuth();
  const summary = await getSecuritySummary(session.user.id);

  const plaintextStatus = summary.secrets.plaintext > 0 ? "bad" : "good";
  const webhookStatus =
    summary.webhooks.missingSecret > 0 || summary.webhooks.missingWebhookId > 0
      ? "bad"
      : summary.webhooks.connected === 0
        ? "warn"
        : "good";
  const reviewStatus = summary.reviews.failed > 0 ? "warn" : "good";
  const indexingStatus =
    summary.indexing.failed > 0
      ? "warn"
      : summary.indexing.indexing > 0
        ? "warn"
        : "good";
  const auditStatus = summary.audit.recentFailures > 0 ? "warn" : "good";
  const dependencyStatus =
    !summary.dependencies.latest || summary.dependencies.latest.critical > 0
      ? "bad"
      : summary.dependencies.latest.high > 0
        ? "warn"
        : "good";

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
              <ShieldCheck className="h-4 w-4" />
              Security center
            </div>
            <h1 className="text-3xl font-semibold tracking-normal">
              Posture Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              A live readout of database secret hygiene, webhook trust, review
              job health, and recent security events.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
            <span className="text-muted-foreground">Encryption key: </span>
            <span
              className={
                summary.secrets.missingEncryptionKey
                  ? "text-red-300"
                  : "text-emerald-300"
              }
            >
              {summary.secrets.missingEncryptionKey ? "missing" : "configured"}
            </span>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard
            title="Encrypted Secrets"
            value={`${summary.secrets.encrypted}`}
            detail={`${summary.secrets.plaintext} plaintext values still need backfill.`}
            icon={KeyRound}
            status={plaintextStatus}
          />
          <StatCard
            title="Webhook Trust"
            value={`${summary.webhooks.connected}`}
            detail={`${summary.webhooks.missingSecret} missing secrets, ${summary.webhooks.missingWebhookId} missing IDs, ${summary.webhooks.invalidRecent} recent invalid deliveries.`}
            icon={RadioTower}
            status={webhookStatus}
          />
          <StatCard
            title="Review Jobs"
            value={`${summary.reviews.inProgress}`}
            detail={`${summary.reviews.failed} failed jobs need attention.`}
            icon={Activity}
            status={reviewStatus}
          />
          <StatCard
            title="Code Indexing"
            value={`${summary.indexing.completed}`}
            detail={`${summary.indexing.indexing} running, ${summary.indexing.failed} failed indexes.`}
            icon={DatabaseZap}
            status={indexingStatus}
          />
          <StatCard
            title="Recent Audit Risk"
            value={`${summary.audit.recentFailures}`}
            detail="Error-severity audit events in the recent activity feed."
            icon={Activity}
            status={auditStatus}
          />
          <StatCard
            title="Dependency Risk"
            value={`${summary.dependencies.latest?.total ?? 0}`}
            detail={
              summary.dependencies.latest
                ? `${summary.dependencies.latest.critical} critical, ${summary.dependencies.latest.high} high, ${summary.dependencies.latest.fixable} fixable.`
                : "No dependency audit has been ingested yet."
            }
            icon={ShieldAlert}
            status={dependencyStatus}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-5">
              <h2 className="text-lg font-semibold tracking-normal">
                Recent Audit Events
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Security-relevant events recorded by the application.
              </p>
            </div>
            <div className="divide-y divide-border">
              {summary.audit.recentEvents.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">
                  No audit events recorded yet.
                </div>
              ) : (
                summary.audit.recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 px-5 py-4"
                  >
                    <div
                      className={`mt-0.5 rounded-lg border p-2 ${
                        event.severity === "error"
                          ? statusTone("bad")
                          : event.severity === "warning"
                            ? statusTone("warn")
                            : statusTone("good")
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
                      <p className="mt-1 text-sm text-muted-foreground">
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
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-lg font-semibold tracking-normal">
                Webhook Health
              </h2>
              <div className="mt-5 space-y-3">
                {summary.webhooks.repositories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No repositories have been synced yet.
                  </p>
                ) : (
                  summary.webhooks.repositories.map((repo) => {
                    const status = repo.isConnected
                      ? repo.lastStatus ?? "waiting"
                      : "disconnected";
                    const tone =
                      status === "valid"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
                        : status === "invalid"
                          ? "border-red-500/20 bg-red-500/10 text-red-100"
                          : "border-border bg-secondary text-muted-foreground";

                    return (
                      <div
                        key={repo.id}
                        className="rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-medium">
                            {repo.fullName}
                          </p>
                          <span
                            className={`shrink-0 rounded-md border px-2 py-1 text-xs ${tone}`}
                          >
                            {status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {repo.lastEvent
                            ? `${repo.lastEvent} at ${
                                repo.lastAt
                                  ? new Date(repo.lastAt).toLocaleString()
                                  : "unknown time"
                              }`
                            : "No webhook delivery recorded yet."}
                        </p>
                        {repo.lastError && (
                          <p className="mt-2 text-xs text-red-300">
                            {repo.lastError}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-lg font-semibold tracking-normal">
                Indexing Health
              </h2>
              <div className="mt-5 space-y-3">
                {summary.indexing.repositories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No connected repositories are queued for indexing.
                  </p>
                ) : (
                  summary.indexing.repositories.map((repo) => {
                    const tone =
                      repo.status === "completed"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
                        : repo.status === "failed"
                          ? "border-red-500/20 bg-red-500/10 text-red-100"
                          : repo.status === "indexing"
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-border bg-secondary text-muted-foreground";

                    return (
                      <div
                        key={repo.id}
                        className="rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-medium">
                            {repo.fullName}
                          </p>
                          <span
                            className={`shrink-0 rounded-md border px-2 py-1 text-xs ${tone}`}
                          >
                            {repo.status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {repo.status === "completed"
                            ? `${repo.fileCount} files and ${repo.chunkCount} chunks indexed${
                                repo.lastIndexedAt
                                  ? ` at ${new Date(repo.lastIndexedAt).toLocaleString()}`
                                  : ""
                              }.`
                            : "Awaiting a completed index run."}
                        </p>
                        {repo.lastError && (
                          <p className="mt-2 text-xs text-red-300">
                            {repo.lastError}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-lg font-semibold tracking-normal">
                Dependency Audit
              </h2>
              {summary.dependencies.latest ? (
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-muted-foreground">Total</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {summary.dependencies.latest.total}
                    </p>
                  </div>
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-red-100">Critical</p>
                    <p className="mt-1 text-2xl font-semibold text-red-100">
                      {summary.dependencies.latest.critical}
                    </p>
                  </div>
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                    <p className="text-amber-100">High</p>
                    <p className="mt-1 text-2xl font-semibold text-amber-100">
                      {summary.dependencies.latest.high}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-muted-foreground">Fixable</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {summary.dependencies.latest.fixable}
                    </p>
                  </div>
                  <p className="col-span-2 text-xs text-muted-foreground">
                    Last ingested{" "}
                    {new Date(
                      summary.dependencies.latest.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Run `npm run audit:ingest` to capture the latest production
                  dependency audit.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-lg font-semibold tracking-normal">
                Recommended Next Actions
              </h2>
              <div className="mt-5 space-y-3">
              {summary.secrets.plaintext > 0 && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                  Run `npm run backfill:secrets` after setting
                  `DATA_ENCRYPTION_KEY`.
                </div>
              )}
              {summary.webhooks.missingSecret > 0 && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
                  Reconnect repositories missing webhook secrets.
                </div>
              )}
              {summary.webhooks.connected === 0 && (
                <div className="rounded-lg border border-border bg-secondary p-4 text-sm text-muted-foreground">
                  Connect a repository to enable webhook health tracking.
                </div>
              )}
              {!summary.secrets.missingEncryptionKey &&
                summary.secrets.plaintext === 0 &&
                summary.webhooks.missingSecret === 0 && (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                    Core secret and webhook checks look clean.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
