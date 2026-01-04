import { requireAuth } from "../../../lib/auth-utils";
import { getGithubProfile } from "../../../module/github/github";
import { Github } from "lucide-react";
import Link from "next/link";
import { RepositoryList } from "../../components/RepositoryList";

export default async function RepositoriesPage() {
  const session = await requireAuth();
  const userId = session.user.id;
  const profile = await getGithubProfile(userId).catch(() => null);

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <Github className="w-16 h-16 mx-auto mb-6 text-white" />
          <h1 className="text-2xl font-bold mb-2">Connect GitHub</h1>
          <p className="text-zinc-400 mb-6">
            To see your repositories, please connect your GitHub account.
          </p>
          <Link 
            href="/api/auth/signin"
            className="inline-block bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
          >
            Connect GitHub Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">R</span>
              </div>
              <span className="font-bold text-lg tracking-tight">Rabbit Stack</span>
            </Link>
            
            <nav className="hidden sm:flex items-center gap-4">
              <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/repositories" className="text-sm text-white font-medium">
                Repositories
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
              <img 
                src={profile.avatarUrl} 
                alt={profile.login} 
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm font-medium text-zinc-300">{profile.login}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RepositoryList />
      </main>
    </div>
  );
}
