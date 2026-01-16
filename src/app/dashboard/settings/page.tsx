import React from 'react';
import { SettingsForm } from '@/components/SettingsForm';
import { getUserSettings } from '@/module/settings';
import { getGithubProfile } from '@/module/github/github';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Settings | Rabbit Stack",
  description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  let settings;
  let githubProfile = null;
  
  try {
    const [settingsData, profileData] = await Promise.all([
      getUserSettings(),
      getGithubProfile(session.user.id).catch(() => null)
    ]);
    settings = settingsData;
    githubProfile = profileData;
  } catch (error) {
    console.error("Error loading settings:", error);
    // Fallback or error page logic could go here
  }

  return (
    <div className="text-white font-sans selection:bg-zinc-800">
       <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
            {settings ? (
              <SettingsForm initialSettings={settings} githubProfile={githubProfile} />
            ) : (
              <p>Loading settings...</p>
            )}
        </div>
       </main>
    </div>
  );
}