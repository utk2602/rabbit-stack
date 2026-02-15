"use client";

import React, { useState } from "react";
import { UserSettings, SettingsUpdate, LANGUAGES, TIMEZONES } from "@/module/settings";
import { updateUserSettings, resetUserSettings } from "@/module/settings";
import { Save, RotateCcw, Monitor, Bell, Lock, Globe, Github, Key, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import type { GitHubProfile } from "@/module/github/github";

interface SettingsFormProps {
  initialSettings: UserSettings;
  githubProfile: GitHubProfile | null;
}

export function SettingsForm({ initialSettings, githubProfile }: SettingsFormProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: keyof SettingsUpdate, value: any) => {
    setSettings((prev: UserSettings) => ({ ...prev, [field]: value }));
    if (message) setMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const { id, userId, createdAt, updatedAt, ...updateData } = settings;
      await updateUserSettings(updateData);
      setMessage({ type: "success", text: "Settings saved successfully" });
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all settings to default?")) return;
    
    setIsResetting(true);
    setMessage(null);
    try {
      const resetSettings = await resetUserSettings();
      setSettings(resetSettings);
      setMessage({ type: "success", text: "Settings reset to defaults" });
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to reset settings" });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === "success" ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
        }`}>
          {message.text}
        </div>
      )}

      {/* Integrations */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xl font-semibold border-b border-border pb-2">
          <Github className="w-5 h-5" />
          <h2>Integrations</h2>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                        <Github className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-medium">GitHub</h3>
                        {githubProfile ? (
                            <p className="text-sm text-green-600 dark:text-green-400">Connected as {githubProfile.login}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground">Not connected</p>
                        )}
                    </div>
                </div>
                <div>
                   {githubProfile ? (
                       <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium border border-green-500/20">Active</span>
                   ) : (
                       <a href="/api/auth/signin" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors">Connect</a>
                   )}
                </div>
            </div>
            {githubProfile && (
                <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                        Repositories connected via webhooks will trigger automatic code reviews.
                    </p>
                </div>
            )}
        </div>
      </section>

      {/* OpenAI API Key */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xl font-semibold border-b border-border pb-2">
          <Key className="w-5 h-5 text-primary" />
          <h2>API Keys</h2>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Your OpenAI API key is used for generating embeddings (RAG) to give the AI full codebase context during reviews.
            Get your key at{" "}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              platform.openai.com
            </a>
          </p>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={settings.openaiApiKey || ""}
              onChange={(e) => handleInputChange("openaiApiKey", e.target.value || null)}
              placeholder="sk-proj-..."
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 pr-12 font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Cost: ~$0.02 per 1M tokens. A full repo index typically costs less than $0.01.
          </p>
        </div>
      </section>

      {/* Appearance */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xl font-semibold border-b border-border pb-2">
          <Monitor className="w-5 h-5 text-purple-500" />
          <h2>Appearance</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Language</label>
            <select
              value={settings.language}
              onChange={(e) => handleInputChange("language", e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            >
              {LANGUAGES.map((lang: { code: string; name: string }) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* General */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xl font-semibold border-b border-border pb-2">
          <Globe className="w-5 h-5 text-blue-500" />
          <h2>General</h2>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => handleInputChange("timezone", e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
          >
            {TIMEZONES.map((tz: string) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Notifications */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xl font-semibold border-b border-border pb-2">
          <Bell className="w-5 h-5 text-yellow-500" />
          <h2>Notifications</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleCard title="Email Notifications" desc="Receive updates via email" checked={settings.emailNotifications} onChange={(v) => handleInputChange("emailNotifications", v)} />
          <ToggleCard title="Push Notifications" desc="Receive push notifications" checked={settings.pushNotifications} onChange={(v) => handleInputChange("pushNotifications", v)} />
        </div>
      </section>

      {/* Privacy */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xl font-semibold border-b border-border pb-2">
          <Lock className="w-5 h-5 text-green-500" />
          <h2>Privacy</h2>
        </div>
        
        <div className="space-y-4">
          <ToggleCard title="Public Profile" desc="Make your profile visible to others" checked={settings.publicProfile} onChange={(v) => handleInputChange("publicProfile", v)} />
          <ToggleCard title="Show Activity" desc="Display your recent activity on profile" checked={settings.showActivity} onChange={(v) => handleInputChange("showActivity", v)} />
          <ToggleCard title="Show Repositories" desc="Display connected repositories on profile" checked={settings.showRepositories} onChange={(v) => handleInputChange("showRepositories", v)} />
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
        
        <button
          onClick={handleReset}
          disabled={isResetting}
          className="flex items-center gap-2 bg-secondary hover:bg-accent text-muted-foreground px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          Reset Defaults
        </button>
      </div>
    </div>
  );
}

function ToggleCard({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
}
