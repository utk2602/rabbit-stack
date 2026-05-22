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
    
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar profile={profile} />
      <main className="w-full flex-1 overflow-y-auto pt-16 pb-20 md:max-h-screen md:pt-0 md:pb-0">
        {children}
      </main>
    </div>
  );
}
