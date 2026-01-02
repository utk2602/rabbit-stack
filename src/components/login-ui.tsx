"use client";
import React, { useState } from 'react';
import { signIn, signUp } from '../../lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LoginUIProps {
  onClose?: () => void;
}

export const LoginUI = ({ onClose }: LoginUIProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false); // Default to Create Account as requested
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false); // This is the "Tell us about yourself" modal
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Modal form state
  const [modalName, setModalName] = useState('');
  const [modalType, setModalType] = useState('Freelancer');
  const [modalPainPoints, setModalPainPoints] = useState('');
  
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

  const handleSocialMock = (provider: string) => {
    console.log(`Sign in with ${provider}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Instead of submitting, open the modal
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    // Here you would handle the actual submission logic
    console.log("Modal submitted", { modalName, modalType, modalPainPoints });
    setShowModal(false);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl h-[85vh] bg-neutral-950 rounded-3xl shadow-2xl flex overflow-hidden border border-white/10">
        
        {/* Close Button for the Main Modal */}
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

        {/* Left Side - Auth Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 overflow-hidden bg-neutral-950 flex flex-col justify-center relative">
            <div className="w-full max-w-md mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
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

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-400 ml-1">First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required={!isLogin}
                            className="w-full bg-neutral-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
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
                            className="w-full bg-neutral-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
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
                        className="w-full bg-neutral-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
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
                        className="w-full bg-neutral-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all pr-10"
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
            </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center p-25">
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <img 
                    src="/image.png" 
                    alt="Login Visual" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
        </div>
      </div>

      {/* "Tell us about yourself" Modal Overlay (Nested) */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-[#0A0A0A] rounded-2xl shadow-2xl flex overflow-hidden border border-white/10 mx-4">
             {/* Close button */}
             <button 
               onClick={() => setShowModal(false)} 
               className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
             >
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>

             {/* Left Side - Form */}
             <div className="w-full lg:w-1/2 p-8 space-y-6 bg-[#0A0A0A]">
                <div>
                  <h2 className="text-2xl font-bold text-white">Tell us about yourself</h2>
                  <p className="text-gray-400 text-sm mt-1">Your email <span className="text-white">{email || "utkarshkashyap4549@gmail.com"}</span> has been noted.</p>
                </div>
                
                {/* Form fields */}
                <div className="space-y-4">
                   {/* Name */}
                   <div className="space-y-2">
                      <label className="text-sm text-gray-400">Name</label>
                      <input 
                        type="text"
                        value={modalName}
                        onChange={(e) => setModalName(e.target.value)}
                        placeholder="Anshika Gautam"
                        className="w-full bg-neutral-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                      />
                   </div>
                   {/* Type */}
                   <div className="space-y-2">
                      <label className="text-sm text-gray-400">Type</label>
                      <div className="relative">
                        <select 
                          value={modalType}
                          onChange={(e) => setModalType(e.target.value)}
                          className="w-full bg-neutral-900/50 border border-white/10 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                        >
                          <option>Freelancer</option>
                          <option>Developer</option>
                          <option>Agency</option>
                          <option>Student</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                   </div>
                   {/* Pain Points */}
                   <div className="space-y-2">
                      <label className="text-sm text-gray-400">Pain Points with Freelancing</label>
                      <textarea 
                        value={modalPainPoints}
                        onChange={(e) => setModalPainPoints(e.target.value)}
                        placeholder="Write something..."
                        rows={4}
                        className="w-full bg-neutral-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
                      />
                   </div>
                </div>

                <button 
                  onClick={handleModalSubmit}
                  className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg transition-all transform active:scale-[0.98]"
                >
                  Send
                </button>
             </div>

             {/* Right Side - Card */}
             <div className="hidden lg:flex w-1/2 p-4 items-center justify-center bg-[#0A0A0A]">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-950 p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                   {/* Content matching image */}
                   <div className="relative z-10">
                     <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                       <span className="text-3xl">X</span>lancr
                     </h3>
                   </div>
                   
                   <div className="relative z-10 mt-auto">
                      <h2 className="text-3xl font-bold text-white mb-2">Help Xlancr</h2>
                      <p className="text-white/80 text-lg">Tell us a little about yourself to help us know better.</p>
                   </div>
                   
                   {/* Decorative gradient/blur effects */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginUI;
