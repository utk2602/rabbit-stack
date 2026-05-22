import { Bot, DatabaseZap, GitPullRequest, RadioTower, ShieldCheck, Zap } from "lucide-react";

import { SpotlightSurface } from "@/components/brand/spotlight-surface";

const signals = [
  { icon: GitPullRequest, label: "Pull requests", detail: "Opened, synced, reopened" },
  { icon: RadioTower, label: "Webhooks", detail: "Signature verified delivery" },
  { icon: DatabaseZap, label: "Indexing", detail: "Codebase context retrieval" },
  { icon: Bot, label: "AI reports", detail: "Summary and inline comments" },
  { icon: ShieldCheck, label: "Security", detail: "Secrets, webhooks, audit risk" },
  { icon: Zap, label: "Retries", detail: "Recover failed review jobs" },
];

export function LogosSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-primary">Workflow signals</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal">
          Built around the events developers already trust.
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {signals.map((signal) => {
          const Icon = signal.icon;

          return (
            <SpotlightSurface key={signal.label} className="p-4">
              <Icon className="mb-4 h-5 w-5 text-primary" />
              <h3 className="font-medium">{signal.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{signal.detail}</p>
            </SpotlightSurface>
          );
        })}
      </div>
    </section>
  );
}
