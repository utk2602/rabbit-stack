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
    <div className="text-white font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RepositoryList />
      </main>
    </div>
  );
}
