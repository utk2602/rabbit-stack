import { requireAuth } from "../../../lib/auth-utils";
import { getGithubProfile } from "../../../module/github/github";
import { Github } from "lucide-react";
import { RepositoryList } from "../../components/RepositoryList";
import { EmptyState } from "@/components/ui/empty-state";

export default async function RepositoriesPage() {
  const session = await requireAuth();
  const userId = session.user.id;
  const profile = await getGithubProfile(userId).catch(() => null);

  if (!profile) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center px-4 py-8">
        <EmptyState
          icon={Github}
          title="Connect GitHub"
          description="Connect your GitHub account to browse repositories and enable AI review automation."
          action={{ label: "Connect GitHub Account", href: "/api/auth/signin" }}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <RepositoryList />
    </main>
  );
}
