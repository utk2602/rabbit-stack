import { Sidebar } from "@/components/Sidebar";
import { requireAuth } from "../../../lib/auth-utils";
import { getGithubProfile } from "../../../module/github/github";

export default async function RepositoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth();
  const profile = await getGithubProfile(session.user.id).catch(() => null);

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar profile={profile} />
      <main className="flex-1 w-full overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
