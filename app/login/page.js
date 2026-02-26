'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { LOADING, ERRORS, SUCCESS } from '@/lib/copy';
import { useAuth } from '@/components/AuthProvider';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase-browser';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading, initError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Show success message if redirected from sign-up
    const message = searchParams.get('message');
    if (message === 'account-created') {
      setSuccessMessage(SUCCESS.ACCOUNT_CREATED);
    } else if (message === 'password-updated') {
      setSuccessMessage(SUCCESS.PASSWORD_UPDATED);
    }
  }, [searchParams]);

  useEffect(() => {
    // Only redirect if auth state is fully resolved (not loading)
    if (!loading && user) {
      if (profile?.is_admin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, profile, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // If Supabase env keys are missing, show a clear error immediately
      if (!isSupabaseConfigured()) {
        throw new Error('Authentication is not configured. Please contact support.');
      }

      // Sign in directly with the browser Supabase client so it gains a valid
      // local session and the AuthProvider's onAuthStateChange fires correctly.
      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (signInError) {
        const msg = signInError.message?.toLowerCase() || '';
        const isInvalidCredentials =
          signInError.code === 'invalid_credentials' ||
          msg.includes('invalid') ||
          msg.includes('credentials') ||
          msg.includes('email not confirmed');
        throw new Error(isInvalidCredentials ? ERRORS.INVALID_CREDENTIALS : (signInError.message || ERRORS.GENERIC));
      }

      // onAuthStateChange in AuthProvider will update `user`, triggering
      // the redirect useEffect above. Push to /dashboard as an explicit
      // fallback; the useEffect will redirect to /admin if the user is an admin.
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || ERRORS.GENERIC);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#D4AF37" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="20" r="12" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
              <circle cx="20" cy="20" r="6" fill="#D4AF37"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-zinc-400">Sign in to your Circle account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {initError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
              Authentication service unavailable. Please try again later or contact support.
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-emerald-400 text-sm">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="mt-2 text-right">
              <a href="/forgot-password" className="text-sm text-amber-400 hover:text-amber-300">
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {LOADING.SIGNING_IN}
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-500">
            Don't have an account?{' '}
            <a href="/subscribe" className="text-amber-400 hover:text-amber-300">
              Get started
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
