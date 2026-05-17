import { db } from "./db";
import { isEncryptedSecret } from "./secrets";

export interface SecuritySummary {
  secrets: {
    encrypted: number;
    plaintext: number;
    missingEncryptionKey: boolean;
  };
  webhooks: {
    connected: number;
    missingSecret: number;
    missingWebhookId: number;
  };
  reviews: {
    failed: number;
    inProgress: number;
  };
  audit: {
    recentFailures: number;
    recentEvents: Array<{
      id: string;
      event: string;
      severity: string;
      message: string;
      createdAt: string;
      repository?: string | null;
    }>;
  };
}

function countSecret(value: string | null | undefined) {
  if (!value) {
    return { encrypted: 0, plaintext: 0 };
  }

  return isEncryptedSecret(value)
    ? { encrypted: 1, plaintext: 0 }
    : { encrypted: 0, plaintext: 1 };
}

export async function getSecuritySummary(userId: string): Promise<SecuritySummary> {
  const [settings, accounts, repositories, failedReviews, inProgressReviews, recentEvents] =
    await Promise.all([
      db.settings.findUnique({
        where: { userId },
        select: { openaiApiKey: true },
      }),
      db.account.findMany({
        where: { userId },
        select: {
          accessToken: true,
          refreshToken: true,
          idToken: true,
          password: true,
        },
      }),
      db.repository.findMany({
        where: { userId },
        select: {
          id: true,
          fullName: true,
          isConnected: true,
          webhookId: true,
          webhookSecret: true,
        },
      }),
      db.pullRequestReview.count({
        where: {
          status: "failed",
          repository: { userId },
        },
      }),
      db.pullRequestReview.count({
        where: {
          status: "in_progress",
          repository: { userId },
        },
      }),
      db.auditLog.findMany({
        where: { userId },
        include: {
          repository: {
            select: { fullName: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const secretCounts = [
    countSecret(settings?.openaiApiKey),
    ...accounts.flatMap((account) => [
      countSecret(account.accessToken),
      countSecret(account.refreshToken),
      countSecret(account.idToken),
      countSecret(account.password),
    ]),
    ...repositories.map((repository) => countSecret(repository.webhookSecret)),
  ].reduce(
    (total, current) => ({
      encrypted: total.encrypted + current.encrypted,
      plaintext: total.plaintext + current.plaintext,
    }),
    { encrypted: 0, plaintext: 0 }
  );

  const connectedRepos = repositories.filter((repo) => repo.isConnected);

  return {
    secrets: {
      ...secretCounts,
      missingEncryptionKey: !process.env.DATA_ENCRYPTION_KEY,
    },
    webhooks: {
      connected: connectedRepos.length,
      missingSecret: connectedRepos.filter((repo) => !repo.webhookSecret).length,
      missingWebhookId: connectedRepos.filter((repo) => !repo.webhookId).length,
    },
    reviews: {
      failed: failedReviews,
      inProgress: inProgressReviews,
    },
    audit: {
      recentFailures: recentEvents.filter((event) => event.severity === "error")
        .length,
      recentEvents: recentEvents.map((event) => ({
        id: event.id,
        event: event.event,
        severity: event.severity,
        message: event.message,
        createdAt: event.createdAt.toISOString(),
        repository: event.repository?.fullName ?? null,
      })),
    },
  };
}
