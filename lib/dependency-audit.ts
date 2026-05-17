import { db } from "./db";

type AuditSeverity = "info" | "low" | "moderate" | "high" | "critical";

interface NpmAuditPayload {
  vulnerabilities?: Record<
    string,
    {
      fixAvailable?: boolean | { name?: string; version?: string };
    }
  >;
  metadata?: {
    vulnerabilities?: Partial<Record<AuditSeverity | "total", number>>;
  };
}

export interface DependencyAuditSummary {
  id: string;
  source: string;
  total: number;
  critical: number;
  high: number;
  moderate: number;
  low: number;
  info: number;
  fixable: number;
  createdAt: string;
}

export function summarizeNpmAudit(payload: NpmAuditPayload) {
  const vulnerabilities = payload.metadata?.vulnerabilities ?? {};
  const fixable = Object.values(payload.vulnerabilities ?? {}).filter(
    (item) => Boolean(item.fixAvailable)
  ).length;

  return {
    total: vulnerabilities.total ?? 0,
    critical: vulnerabilities.critical ?? 0,
    high: vulnerabilities.high ?? 0,
    moderate: vulnerabilities.moderate ?? 0,
    low: vulnerabilities.low ?? 0,
    info: vulnerabilities.info ?? 0,
    fixable,
  };
}

export async function recordNpmAudit(payload: NpmAuditPayload) {
  const summary = summarizeNpmAudit(payload);

  return db.dependencyAudit.create({
    data: {
      source: "npm",
      raw: payload,
      ...summary,
    },
  });
}

export async function getLatestDependencyAudit(): Promise<DependencyAuditSummary | null> {
  const audit = await db.dependencyAudit.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!audit) {
    return null;
  }

  return {
    id: audit.id,
    source: audit.source,
    total: audit.total,
    critical: audit.critical,
    high: audit.high,
    moderate: audit.moderate,
    low: audit.low,
    info: audit.info,
    fixable: audit.fixable,
    createdAt: audit.createdAt.toISOString(),
  };
}
