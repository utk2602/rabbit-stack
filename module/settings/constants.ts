// Settings constants and default values

export const THEMES = ["light", "dark", "system"] as const;
export type Theme = typeof THEMES[number];

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
] as const;

export const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
] as const;

export const DEFAULT_SETTINGS = {
  theme: "dark",
  emailNotifications: true,
  pushNotifications: false,
  language: "en",
  timezone: "UTC",
  publicProfile: true,
  showActivity: true,
  showRepositories: true,
} as const;

export const SETTING_CATEGORIES = {
  appearance: ["theme", "language"],
  notifications: ["emailNotifications", "pushNotifications"],
  privacy: ["publicProfile", "showActivity", "showRepositories"],
  general: ["timezone"],
} as const;
