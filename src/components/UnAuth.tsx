import { redirectIfAuthenticated } from "../../lib/auth-utils";

/**
 * Server Component wrapper that requires NO authentication
 * Redirects to / if user is already authenticated
 * Use this to wrap public pages like login/signup
 */
export async function UnAuth({ children }: { children: React.ReactNode }) {
  await redirectIfAuthenticated("/");
  return <>{children}</>;
}
