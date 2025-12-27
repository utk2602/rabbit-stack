import { requireAuth } from "../../lib/auth-utils";

/**
 * Server Component wrapper that requires authentication
 * Redirects to /login if user is not authenticated
 * Use this to wrap protected page content
 */
export async function Auth({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return <>{children}</>;
}
