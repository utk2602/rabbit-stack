"use client";

import type React from "react";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { FloatingPaths } from "@/components/floating-paths";
import { ChevronLeftIcon, AtSignIcon, Loader2 } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";
import { toast } from "sonner";

export function AuthPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);
	const [name, setName] = useState("");

	const handleGithubSignIn = async () => {
		setIsLoading(true);
		setError(null);
		try {
			await signIn.social({
				provider: "github",
				callbackURL: "/dashboard",
			});
		} catch (err: any) {
			console.error("GitHub sign-in error:", err);
			const msg = err.message || "Failed to sign in with GitHub";
			setError(msg);
			toast.error(msg);
			setIsLoading(false);
		}
	};

	const handleEmailAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !password) {
			setError("Please enter both email and password");
			toast.error("Please enter both email and password");
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			if (isSignUp) {
				const result = await signUp.email({
					email,
					password,
					name: name || email.split("@")[0],
				});
				if (result.error) {
					const msg = result.error.message || "Failed to create account";
					setError(msg);
					toast.error(msg);
					setIsLoading(false);
					return;
				}
				toast.success("Account created! Redirecting...");
			} else {
				const result = await signIn.email({ email, password });
				if (result.error) {
					const msg = result.error.message || "Failed to sign in";
					setError(msg);
					toast.error(msg);
					setIsLoading(false);
					return;
				}
				toast.success("Signed in successfully!");
			}
			window.location.href = "/dashboard";
		} catch (err: any) {
			console.error("Email auth error:", err);
			const msg = err.message || "Authentication failed";
			setError(msg);
			toast.error(msg);
			setIsLoading(false);
		}
	};

	return (
		<main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
			<div className="relative hidden h-full flex-col border-r border-border bg-secondary p-10 lg:flex dark:bg-secondary/20">
				<div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
				<Logo className="mr-auto h-5 relative z-10" />

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
				<div className="absolute inset-0">
					<FloatingPaths position={1} />
					<FloatingPaths position={-1} />
				</div>
			</div>
			<div className="relative flex min-h-screen flex-col justify-center px-8">
				{/* Top Shades */}
				<div
					aria-hidden
					className="absolute inset-0 isolate -z-10 opacity-60 contain-strict"
				>
					<div className="absolute top-0 right-0 h-80 w-36 -translate-y-22 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(255,255,255,0.06)_0,hsla(0,0%,55%,.02)_50%,rgba(255,255,255,0.01)_80%)]" />
					<div className="absolute top-0 right-0 h-80 w-16 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.01)_80%,transparent_100%)] translate-x-[5%] -translate-y-1/2" />
				</div>
				<Button asChild className="absolute top-7 left-5" variant="ghost">
					<a href="/">
						<ChevronLeftIcon className="w-4 h-4 mr-1" />
						Home
					</a>
				</Button>

				<div className="mx-auto w-full max-w-sm space-y-4">
					<Logo className="h-5 lg:hidden" />
					<div className="flex flex-col space-y-1">
						<h1 className="font-bold text-2xl tracking-wide">
							Sign In or Join Now!
						</h1>
						<p className="text-base text-muted-foreground">
							Login or create your Rabbit Stack account.
						</p>
					</div>

					{error && (
						<div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
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
								<GithubIcon className="w-4 h-4 mr-2" />
							)}
							Continue with GitHub
						</Button>
					</div>

					<div className="flex w-full items-center justify-center">
						<div className="h-px w-full bg-border" />
						<span className="px-2 text-muted-foreground text-xs">OR</span>
						<div className="h-px w-full bg-border" />
					</div>

					<form className="space-y-2" onSubmit={handleEmailAuth}>
						<p className="text-start text-muted-foreground text-xs">
							{isSignUp
								? "Create an account with your email"
								: "Enter your email address to sign in"}
						</p>
						{isSignUp && (
							<InputGroup>
								<InputGroupInput
									placeholder="Your name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
								<InputGroupAddon align="inline-start">
									<AtSignIcon className="w-4 h-4" />
								</InputGroupAddon>
							</InputGroup>
						)}
						<InputGroup>
							<InputGroupInput
								placeholder="your.email@example.com"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<InputGroupAddon align="inline-start">
								<AtSignIcon className="w-4 h-4" />
							</InputGroupAddon>
						</InputGroup>
						<InputGroup>
							<InputGroupInput
								placeholder="Password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<InputGroupAddon align="inline-start">
								<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
									<path d="M7 11V7a5 5 0 0110 0v4" />
								</svg>
							</InputGroupAddon>
						</InputGroup>

						<Button className="w-full" type="submit" disabled={isLoading}>
							{isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
							{isSignUp ? "Create Account" : "Continue With Email"}
						</Button>
					</form>

					<button
						type="button"
						onClick={() => {
							setIsSignUp(!isSignUp);
							setError(null);
						}}
						className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
					>
						{isSignUp
							? "Already have an account? Sign in"
							: "Don't have an account? Sign up"}
					</button>

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
		</main>
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
