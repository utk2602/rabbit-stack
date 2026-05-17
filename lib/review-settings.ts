import { db } from "./db";

export const REVIEW_MODES = [
  "balanced",
  "security",
  "performance",
  "style",
  "strict",
] as const;

export const REVIEW_SEVERITIES = ["info", "warning", "error"] as const;

export type ReviewMode = (typeof REVIEW_MODES)[number];
export type ReviewSeverity = (typeof REVIEW_SEVERITIES)[number];
export const MAX_CUSTOM_RULES_LENGTH = 4000;

export interface ReviewSettingsInput {
  mode?: ReviewMode;
  minimumSeverityToPost?: ReviewSeverity;
  customRules?: string | null;
  useRepositoryRules?: boolean;
}

function assertValidMode(mode: string): asserts mode is ReviewMode {
  if (!REVIEW_MODES.includes(mode as ReviewMode)) {
    throw new Error("Invalid review mode");
  }
}

function assertValidSeverity(
  severity: string
): asserts severity is ReviewSeverity {
  if (!REVIEW_SEVERITIES.includes(severity as ReviewSeverity)) {
    throw new Error("Invalid review severity");
  }
}

export function sanitizeReviewSettings(input: ReviewSettingsInput) {
  const data: ReviewSettingsInput = {};

  if (input.mode !== undefined) {
    assertValidMode(input.mode);
    data.mode = input.mode;
  }

  if (input.minimumSeverityToPost !== undefined) {
    assertValidSeverity(input.minimumSeverityToPost);
    data.minimumSeverityToPost = input.minimumSeverityToPost;
  }

  if (input.customRules !== undefined) {
    const customRules = input.customRules?.trim() || null;
    if (customRules && customRules.length > MAX_CUSTOM_RULES_LENGTH) {
      throw new Error(
        `Custom review rules must be ${MAX_CUSTOM_RULES_LENGTH} characters or fewer`
      );
    }
    data.customRules = customRules;
  }

  if (input.useRepositoryRules !== undefined) {
    data.useRepositoryRules = Boolean(input.useRepositoryRules);
  }

  return data;
}

export async function getRepositoryReviewSettings(
  repositoryId: string,
  userId: string
) {
  const repository = await db.repository.findFirst({
    where: { id: repositoryId, userId },
    select: { id: true },
  });

  if (!repository) {
    return null;
  }

  return db.repositoryReviewSettings.upsert({
    where: { repositoryId },
    update: {},
    create: { repositoryId },
  });
}

export async function updateRepositoryReviewSettings(
  repositoryId: string,
  userId: string,
  input: ReviewSettingsInput
) {
  const repository = await db.repository.findFirst({
    where: { id: repositoryId, userId },
    select: { id: true },
  });

  if (!repository) {
    return null;
  }

  return db.repositoryReviewSettings.upsert({
    where: { repositoryId },
    update: sanitizeReviewSettings(input),
    create: {
      repositoryId,
      ...sanitizeReviewSettings(input),
    },
  });
}
