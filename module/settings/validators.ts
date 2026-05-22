// Settings validation functions

import { THEMES, LANGUAGES, TIMEZONES } from "./constants";
import type { SettingsUpdate } from "./types";

export class SettingsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SettingsValidationError";
  }
}

export function validateSettingsUpdate(data: SettingsUpdate): boolean {
  if (data.theme !== undefined && !THEMES.some((theme) => theme === data.theme)) {
    throw new SettingsValidationError(
      `Invalid theme. Must be one of: ${THEMES.join(", ")}`
    );
  }

  if (data.language !== undefined) {
    const validLanguages = LANGUAGES.map((lang) => lang.code);
    if (!validLanguages.some((language) => language === data.language)) {
      throw new SettingsValidationError(
        `Invalid language. Must be one of: ${validLanguages.join(", ")}`
      );
    }
  }

  if (
    data.timezone !== undefined &&
    !TIMEZONES.some((timezone) => timezone === data.timezone)
  ) {
    throw new SettingsValidationError(
      `Invalid timezone. Must be one of: ${TIMEZONES.join(", ")}`
    );
  }

  const booleanFields: (keyof SettingsUpdate)[] = [
    "emailNotifications",
    "pushNotifications",
    "publicProfile",
    "showActivity",
    "showRepositories",
  ];

  for (const field of booleanFields) {
    if (data[field] !== undefined && typeof data[field] !== "boolean") {
      throw new SettingsValidationError(`${field} must be a boolean value`);
    }
  }

  return true;
}

export function sanitizeSettingsUpdate(data: SettingsUpdate): SettingsUpdate {
  const sanitized: SettingsUpdate = {};

  const allowedFields: (keyof SettingsUpdate)[] = [
    "theme",
    "emailNotifications",
    "pushNotifications",
    "language",
    "timezone",
    "publicProfile",
    "showActivity",
    "showRepositories",
    "openaiApiKey",
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      Object.assign(sanitized, { [field]: data[field] });
    }
  }

  return sanitized;
}
