import { db } from "./db";

export type AuditSeverity = "info" | "warning" | "error";

export interface AuditEventInput {
  event: string;
  message: string;
  severity?: AuditSeverity;
  userId?: string | null;
  repositoryId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function recordAuditEvent(input: AuditEventInput) {
  return db.auditLog.create({
    data: {
      event: input.event,
      message: input.message,
      severity: input.severity ?? "info",
      userId: input.userId ?? null,
      repositoryId: input.repositoryId ?? null,
      metadata: input.metadata,
    },
  });
}

export async function safeRecordAuditEvent(input: AuditEventInput) {
  try {
    await recordAuditEvent(input);
  } catch (error) {
    console.error("Failed to record audit event:", error);
  }
}
