"use client";
import React, { useState } from 'react';
import { signIn } from '../../lib/auth-client';
import { Github, ArrowRight, Shield, Zap, Code2 } from 'lucide-react';

interface LoginUIProps {
  onClose?: () => void;
}

export const LoginUI = ({ onClose }: LoginUIProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn.social({
        provider: 'github',
        callbackURL: '/',
      });
    } catch (error: any) {
      console.error('Error during sign-in:', error);
      setError(error.message || 'Failed to sign in with GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl bg-neutral-950 rounded-3xl shadow-2xl flex overflow-hidden border border-white/10">
        
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-20 p-2 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 transition-all backdrop-blur-md border border-white/10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Left Side - Sign In */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">R</span>
                </div>
                <span className="font-bold text-xl text-white tracking-tight">Rabbit Stack</span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Welcome to Rabbit Stack
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                AI-powered code reviews for your GitHub pull requests. Sign in with GitHub to get started in seconds.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGithubSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Github className="w-5 h-5" />
              )}
              Continue with GitHub
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Shield className="w-4 h-4 text-green-500 shrink-0" />
                <span>We only request read access to your repositories</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Zap className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Automated reviews on every pull request</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Code2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Powered by Gemini AI with full codebase context</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 pt-2">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="hidden lg:flex w-1/2 relative items-center justify-center p-8">
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 flex flex-col justify-between p-8">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white/90 text-xs font-medium mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                AI-Powered Reviews
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              {/* Mock code review card */}
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-white/90 text-sm font-medium">Review Complete</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex gap-2">
                    <span className="text-green-400">+</span>
                    <span className="text-white/70">Good use of error boundaries</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-yellow-400">!</span>
                    <span className="text-white/70">Consider memoizing this callback</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-400">+</span>
                    <span className="text-white/70">Type safety looks solid</span>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white">
                Ship better code,<br />faster.
              </h2>
              <p className="text-white/80 text-sm">
                Get instant, intelligent feedback on every pull request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginUI;
