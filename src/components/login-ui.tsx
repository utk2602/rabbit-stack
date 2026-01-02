"use client";
import React, { useState, useEffect } from 'react';
import { signIn, signUp } from '../../lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const LoginUI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false); // Default to Create Account as requested
  const [showPassword, setShowPassword] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/loginui3.png", // Placeholder - User needs to add this image
      tagline: "Elevate Your Code,\nAutomate Your Review."
    },
    {
      image: "/loginui2.png", // Placeholder - User needs to add this image
      tagline: "AI-Powered Insights\nat Your Fingertips."
    },
    {
      image: "/loginui1.png", // Placeholder - User needs to add this image
      tagline: "Ship Faster\nwith Confidence."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  const router = useRouter();

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

  // Placeholder for Google since it is requested in UI but might not be configured
  const handleSocialMock = (provider: string) => {
    console.log(`Sign in with ${provider}`);
    // For now, we can fallback to GitHub if the user clicks these, or just show an alert
    // But to be safe and functional with existing setup, I'll leave them as UI only or map to GitHub if appropriate, 
    // but better to just keep them as UI buttons as requested.
    // If the user really wants them to work, they need to configure providers in auth.ts
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signIn.email({
          email,
          password,
          callbackURL: '/',
        });
      } else {
        await signUp.email({
          email,
          password,
          name: `${firstName} ${lastName}`.trim(),
          callbackURL: '/',
        });
      }
    } catch (error: any) {
      console.error('Error during auth:', error);
      setError(error.message || (isLogin ? 'Failed to sign in' : 'Failed to sign up'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      <div className="hidden lg:flex w-[40%] relative flex-col justify-between p-8 overflow-hidden bg-neutral-950 border-r border-white/5">
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-neutral-950 to-neutral-950 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay"></div>
        <div className="relative z-10 flex justify-end items-center w-full">
          <Link href="/" className="px-4 py-2 rounded-full text-sm font-medium text-white/80 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all flex items-center gap-2 group">
            Back to website
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        
        <div className="relative z-10 flex-1 flex items-center justify-center my-4">
          <div className="relative w-full max-w-md aspect-square">
             
             <div className="w-full h-full flex items-center">
                {slides.map((slide, index) => (
                  <div 
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                  >
                    
                    <img 
                      src={slide.image} 
                      alt={`Slide ${index + 1}`} 
                      className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center">
                       <svg viewBox="0 0 200 200" className="w-full h-full text-white opacity-90">
                          <path fill="currentColor" d="M100 40 C 110 20, 130 10, 140 40 C 145 55, 135 70, 120 80 C 140 90, 160 110, 150 140 C 140 170, 100 170, 80 150 C 60 170, 20 160, 30 130 C 40 100, 70 90, 80 80 C 65 70, 55 55, 60 40 C 70 10, 90 20, 100 40 Z" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" />
                          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="14">Image {index + 1} Missing</text>
                       </svg>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        
        <div className="relative z-10 space-y-4 h-32">
          <div className="relative h-20">
            {slides.map((slide, index) => (
              <h2 
                key={index}
                className={`absolute top-0 left-0 text-3xl font-medium leading-tight tracking-tight transition-opacity duration-1000 ease-in-out whitespace-pre-line ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              >
                {slide.tagline}
              </h2>
            ))}
          </div>
          
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-neutral-950 relative">
        <div className="w-full max-w-md space-y-6">
          
          
          <div className="lg:hidden flex justify-between items-center mb-4">
             <div className="flex items-center gap-2">
                <span className="font-bold tracking-wider text-lg">CODE RABBIT</span>
             </div>
             <Link href="/" className="text-sm text-gray-400 hover:text-white">Back</Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isLogin ? 'New to Code Rabbit? ' : 'Already have an account? '}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white transition-all"
              >
                {isLogin ? 'Create an account' : 'Log in'}
              </button>
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 ml-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={!isLogin}
                    className="w-full bg-neutral-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 ml-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={!isLogin}
                    className="w-full bg-neutral-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-neutral-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-neutral-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="flex items-start gap-3 pt-1">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="w-4 h-4 rounded border-white/10 bg-neutral-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-neutral-950"
                  />
                </div>
                <label htmlFor="terms" className="text-sm text-gray-400">
                  I agree to the <a href="#" className="text-white hover:underline">Terms & Conditions</a>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white hover:bg-gray-200 text-black font-bold rounded-lg shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-neutral-950 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={handleGithubSignIn}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-white hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.576.688.48C19.138 20.115 22 16.379 22 11.97 22 6.463 17.522 2 12 2z" />
              </svg>
              GitHub
            </button>
            <button 
              type="button"
              onClick={() => handleSocialMock('google')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-white hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>
          
          
           <div className="mt-4">
            <button
                onClick={handleGithubSignIn}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#24292F] hover:bg-[#24292F]/90 border border-white/10 rounded-lg text-white transition-colors"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.576.688.48C19.138 20.115 22 16.379 22 11.97 22 6.463 17.522 2 12 2z" />
                </svg>
                Continue with GitHub
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginUI;
