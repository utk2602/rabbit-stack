// Settings types and interfaces

export interface UserSettings {
  id: string;
  userId: string;
  theme: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  timezone: string;
  publicProfile: boolean;
  showActivity: boolean;
  showRepositories: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SettingsUpdate = Partial<
  Omit<UserSettings, "id" | "userId" | "createdAt" | "updatedAt">
>;

export interface SettingsResponse {
  success: boolean;
  data?: UserSettings;
  error?: string;
}

export type SettingCategory = "appearance" | "notifications" | "privacy" | "general";

export interface SettingField {
  key: keyof SettingsUpdate;
  label: string;
  type: "boolean" | "select" | "text";
  category: SettingCategory;
  description?: string;
  options?: readonly { code: string; name: string }[] | readonly string[];
}
