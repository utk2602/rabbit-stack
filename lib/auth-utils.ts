import { auth } from "./auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Server-side utility to get the current session
 * Use this in Server Components, Server Actions, and Route Handlers
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  return session;
}

/**
 * Server-side utility to require authentication
 * Redirects to /login if not authenticated
 * Use this in Server Components that require authentication
 */
export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }
  
  return session;
}

/**
 * Server-side utility to check if user is authenticated
 * Returns the session or null
 */
export async function isAuthenticated() {
  const session = await getSession();
  return session !== null;
}

/**
 * Server-side utility to redirect authenticated users away from public pages
 * Use this on login/signup pages to redirect already logged-in users
 */
export async function redirectIfAuthenticated(redirectTo: string = "/") {
  const session = await getSession();
  
  if (session) {
    redirect(redirectTo);
  }
}
