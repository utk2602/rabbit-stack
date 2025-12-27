"use client";

import { signIn, signOut, useSession } from "../../lib/auth-client";
import { useEffect, useState } from "react";
import Link from "next/link";

export function AuthButton() {
  const { data: session, isPending } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isPending) {
    return (
      <button
        disabled
        className="flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-200 px-6 text-zinc-400 dark:bg-zinc-800"
      >
        Loading...
      </button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="h-8 w-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {session.user.name || session.user.email}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="flex h-10 items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
    >
      Sign In
    </Link>
  );
}
