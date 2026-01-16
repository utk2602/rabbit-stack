"use client";

import React, { useState } from "react";
import { UserSettings, SettingsUpdate, THEMES, LANGUAGES, TIMEZONES } from "@/module/settings";
import { updateUserSettings, resetUserSettings } from "@/module/settings";
import { Save, RotateCcw, Monitor, Bell, Lock, Globe, Moon, Sun, Laptop, Github } from "lucide-react";
import { useRouter } from "next/navigation";
import { GitHubProfile } from "@/module/github/github";

interface SettingsFormProps {
  initialSettings: UserSettings;
  githubProfile: GitHubProfile | null;
}

export function SettingsForm({ initialSettings, githubProfile }: SettingsFormProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleInputChange = (field: keyof SettingsUpdate, value: any) => {
    setSettings((prev: UserSettings) => ({ ...prev, [field]: value }));
    // Clear message when user makes changes
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
          message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}>
          {message.text}
        </div>
      )}

      {/* Integrations */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xl font-semibold text-white border-b border-zinc-800 pb-2">
          <Github className="w-5 h-5 text-white" />
          <h2>Integrations</h2>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                        <Github className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">GitHub</h3>
                        {githubProfile ? (
                            <p className="text-sm text-green-400">Connected as {githubProfile.login}</p>
                        ) : (
                            <p className="text-sm text-zinc-500">Not connected</p>
                        )}
                    </div>
                </div>
                <div>
                   {githubProfile ? (
                       <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-medium border border-green-500/20">Active</span>
                   ) : (
                       <a href="/api/auth/signin" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors">Connect</a>
                   )}
                </div>
            </div>
            {githubProfile && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-2">
                        Repositories connected via webhooks will trigger automatic code reviews. Validated by GitHub signature verification.
                    </p>
                </div>
            )}
        </div>
      </section>

      {/* Appearance */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xl font-semibold text-white border-b border-zinc-800 pb-2">
          <Monitor className="w-5 h-5 text-purple-400" />
          <h2>Appearance</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((theme: string) => (
                <button
                  key={theme}
                  onClick={() => handleInputChange("theme", theme)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    settings.theme === theme
                      ? "bg-purple-500/20 border-purple-500 text-white"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {theme === "light" && <Sun className="w-5 h-5 mb-2" />}
                  {theme === "dark" && <Moon className="w-5 h-5 mb-2" />}
                  {theme === "system" && <Laptop className="w-5 h-5 mb-2" />}
                  <span className="text-xs capitalize">{theme}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Language</label>
            <select
              value={settings.language}
              onChange={(e) => handleInputChange("language", e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
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
        <div className="flex items-center gap-2 text-xl font-semibold text-white border-b border-zinc-800 pb-2">
          <Globe className="w-5 h-5 text-blue-400" />
          <h2>General</h2>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => handleInputChange("timezone", e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
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
        <div className="flex items-center gap-2 text-xl font-semibold text-white border-b border-zinc-800 pb-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          <h2>Notifications</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-sm text-zinc-500">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.emailNotifications}
                onChange={(e) => handleInputChange("emailNotifications", e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Push Notifications</p>
              <p className="text-sm text-zinc-500">Receive push notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.pushNotifications}
                onChange={(e) => handleInputChange("pushNotifications", e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xl font-semibold text-white border-b border-zinc-800 pb-2">
          <Lock className="w-5 h-5 text-green-400" />
          <h2>Privacy</h2>
        </div>
        
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Public Profile</p>
              <p className="text-sm text-zinc-500">Make your profile visible to others</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.publicProfile}
                onChange={(e) => handleInputChange("publicProfile", e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Show Activity</p>
              <p className="text-sm text-zinc-500">Display your recent activity on profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.showActivity}
                onChange={(e) => handleInputChange("showActivity", e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Show Repositories</p>
              <p className="text-sm text-zinc-500">Display connected repositories on profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.showRepositories}
                onChange={(e) => handleInputChange("showRepositories", e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
        
        <button
          onClick={handleReset}
          disabled={isResetting}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          Reset Defaults
        </button>
      </div>
    </div>
  );
}
