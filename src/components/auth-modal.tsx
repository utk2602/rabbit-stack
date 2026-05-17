"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FloatingPaths } from "@/components/floating-paths";
import { X, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";

interface AuthModalProps {
open: boolean;
onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const overlayRef = useRef<HTMLDivElement>(null);

useEffect(() => {
if (open) {
document.body.style.overflow = "hidden";
}
return () => {
document.body.style.overflow = "";
};
}, [open]);

const handleClose = useCallback(() => {
onClose();
setError(null);
setIsLoading(false);
}, [onClose]);

useEffect(() => {
if (!open) return;
const handleEsc = (e: KeyboardEvent) => {
if (e.key === "Escape") handleClose();
};
window.addEventListener("keydown", handleEsc);
return () => window.removeEventListener("keydown", handleEsc);
}, [open, handleClose]);

const handleGithubSignIn = async () => {
setIsLoading(true);
setError(null);
try {
await signIn.social({
provider: "github",
callbackURL: "/dashboard",
});
toast.success("Redirecting to GitHub...");
} catch (err: any) {
console.error("GitHub sign-in error:", err);
const msg = err.message || "Failed to sign in with GitHub";
setError(msg);
toast.error(msg);
setIsLoading(false);
}
};

if (!open) return null;

return (
<div
ref={overlayRef}
className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
onClick={(e) => {
if (e.target === e.currentTarget) handleClose();
}}
>
<div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-black/40 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
{/* Close button */}
<button
onClick={handleClose}
className="absolute right-4 top-4 z-50 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
>
<X className="w-5 h-5" />
</button>

<div className="grid lg:grid-cols-2 h-full">
{/* Left decorative panel - hidden on mobile */}
<div className="relative hidden h-full min-h-[600px] flex-col border-r border-border bg-secondary p-10 lg:flex dark:bg-secondary/20">
<div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
<div className="relative z-10">
<div className="flex items-center gap-2">
<div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
<span className="text-primary-foreground font-bold text-sm">R</span>
</div>
<span className="font-bold text-sm tracking-tight">Rabbit Stack</span>
</div>
</div>

<div className="z-10 mt-auto">
<blockquote className="space-y-2">
<p className="text-xl">
&ldquo;Rabbit Stack catches edge cases my team misses. It&apos;s
like having a senior engineer on standby 24/7.&rdquo;
</p>
<footer className="font-mono font-semibold text-sm">
~ Riya Sharma, Senior Full-Stack Engineer
</footer>
</blockquote>
</div>
<div className="absolute inset-0 overflow-hidden rounded-l-2xl">
<FloatingPaths position={1} />
<FloatingPaths position={-1} />
</div>
</div>

{/* Right auth form panel */}
<div className="relative flex min-h-[500px] flex-col justify-center px-8 py-12 overflow-y-auto">
{/* Top shades */}
<div
aria-hidden
className="absolute inset-0 isolate -z-10 opacity-60 contain-strict"
>
<div className="absolute top-0 right-0 h-80 w-36 -translate-y-22 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
<div className="absolute top-0 right-0 h-80 w-16 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] translate-x-[5%] -translate-y-1/2" />
</div>

<div className="mx-auto w-full max-w-sm space-y-4">
{/* Logo - mobile only */}
<div className="flex items-center gap-2 lg:hidden">
<div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
<span className="text-primary-foreground font-bold text-sm">R</span>
</div>
<span className="font-bold text-sm tracking-tight">Rabbit Stack</span>
</div>

<div className="flex flex-col space-y-1">
<h1 className="font-bold text-2xl tracking-wide">
Sign in with GitHub
</h1>
<p className="text-base text-muted-foreground">
Rabbit Stack uses GitHub OAuth only. No password account is needed.
</p>
</div>

{error && (
<div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-destructive text-sm">
{error}
</div>
)}

<div className="space-y-2">
<Button
className="w-full"
onClick={handleGithubSignIn}
disabled={isLoading}
>
{isLoading ? (
<Loader2 className="w-4 h-4 mr-2 animate-spin" />
) : (
<GithubIcon data-icon="inline-start" />
)}
Continue with GitHub
</Button>
</div>

<div className="rounded-lg border border-border bg-secondary/60 p-4 text-sm text-muted-foreground">
GitHub grants repository access for webhooks and PR reviews. Short-lived JWTs
are available from <code>/api/auth/token</code> after sign-in.
</div>

<p className="mt-8 text-muted-foreground text-sm">
By clicking continue, you agree to our{" "}
<a
className="underline underline-offset-4 hover:text-primary"
href="#"
>
Terms of Service
</a>{" "}
and{" "}
<a
className="underline underline-offset-4 hover:text-primary"
href="#"
>
Privacy Policy
</a>
.
</p>
</div>
</div>
</div>
</div>
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
