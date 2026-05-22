"use client";

import type React from "react";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AnimatedWordmark } from "@/components/brand/animated-wordmark";
import { ReactBitsStage } from "@/components/brand/react-bits-stage";
import { ReviewSignal } from "@/components/brand/review-signal";
import { SpotlightSurface } from "@/components/brand/spotlight-surface";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { signIn } from "@/lib/auth-client";

export function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
    } catch (err: unknown) {
      console.error("GitHub sign-in error:", err);
      const msg = err instanceof Error ? err.message : "Failed to sign in with GitHub";
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
    }
  };

  return (
    <ReactBitsStage className="min-h-screen" intensity="panel">
      <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden border-r border-border px-10 py-8 lg:flex lg:flex-col">
          <a href="/" className="w-fit">
            <AnimatedWordmark />
          </a>

          <div className="flex flex-1 items-center">
            <SpotlightSurface className="w-full p-6" spotlightColor="rgba(124, 247, 200, 0.18)">
              <div className="grid gap-6 xl:grid-cols-[220px_1fr]">
                <ReviewSignal className="w-full" />
                <div className="flex flex-col justify-center">
                  <StatusBadge tone="good">GitHub OAuth secured</StatusBadge>
                  <h1 className="mt-5 font-brand text-4xl font-black leading-tight">
                    Bring your repositories into review orbit.
                  </h1>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Rabbit Stack uses GitHub OAuth, encrypted API key storage, verified webhooks,
                    and retryable background jobs to keep reviews moving.
                  </p>
                  <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                    <TrustLine>OAuth only. No passwords stored.</TrustLine>
                    <TrustLine>Repository webhooks are signature verified.</TrustLine>
                    <TrustLine>AI review settings are configurable per repository.</TrustLine>
                  </div>
                </div>
              </div>
            </SpotlightSurface>
          </div>
        </section>

        <section className="flex min-h-screen flex-col justify-center px-6 py-8">
          <Button asChild className="absolute left-5 top-5" variant="ghost">
            <a href="/">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Home
            </a>
          </Button>

          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <AnimatedWordmark />
            </div>

            <StatusBadge tone="info">Developer access</StatusBadge>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal">
              Sign in with GitHub
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Connect your GitHub identity to manage repositories, review jobs, and security posture.
            </p>

            {error && (
              <div className="mt-5 rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <Button
              className="mt-6 w-full"
              onClick={handleGithubSignIn}
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GithubIcon className="h-4 w-4" />
              )}
              Continue with GitHub
            </Button>

            <div className="mt-5 rounded-lg border border-border bg-secondary/60 p-4 text-sm leading-6 text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Security model
              </div>
              GitHub is the only sign-in provider. API access can use short-lived JWTs
              from <code className="rounded bg-background px-1 py-0.5">/api/auth/token</code>.
            </div>

            <p className="mt-8 text-sm leading-6 text-muted-foreground">
              By continuing, you agree to use Rabbit Stack with repositories you are
              authorized to connect.
            </p>
          </div>
        </section>
      </main>
    </ReactBitsStage>
  );
}

function TrustLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>{children}</span>
    </div>
  );
}

const GithubIcon = (props: React.ComponentProps<"svg">) => (
  <svg fill="currentColor" viewBox="0 0 1024 1024" {...props}>
    <path
      clipRule="evenodd"
      d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
      fill="currentColor"
      fillRule="evenodd"
      transform="scale(64)"
    />
  </svg>
);

export default AuthPage;
