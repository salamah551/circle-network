'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Key, ArrowRight } from 'lucide-react';

export default function ApplyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Prefill from URL params if present
  useEffect(() => {
    const urlCode = searchParams.get('code');
    const urlEmail = searchParams.get('email');
    if (urlCode) setCode(urlCode);
    if (urlEmail) setEmail(urlEmail);
  }, [searchParams]);

  function validate() {
    if (!code.trim()) {
      return 'Please enter your invitation code';
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    // Redirect to invite acceptance page
    const url = `/invite/accept?code=${encodeURIComponent(code.trim())}&email=${encodeURIComponent(email.trim())}`;
    router.push(url);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Enter Your Invitation
          </h1>
          <p className="text-white/60">
            Circle Network is invitation-only. Enter the code from your invite email to continue.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Invitation Code Input */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-white/80 mb-2">
                Invitation Code
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="CN-XXXX-XXXX"
                  autoComplete="off"
                  className="w-full rounded-lg bg-black border border-white/10 pl-11 pr-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  required
                />
              </div>
              <p className="text-xs text-white/50 mt-1.5">
                Found in your invitation email (e.g., CN-7F2K-93QJ)
              </p>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="w-full rounded-lg bg-black border border-white/10 pl-11 pr-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  required
                />
              </div>
              <p className="text-xs text-white/50 mt-1.5">
                Use the same email your invitation was sent to
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 text-black font-semibold px-6 py-3.5 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Continue to Application</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Help Link */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-white/50 text-center">
              Don't have an invitation code?{' '}
              <a 
                href="mailto:invites@thecirclenetwork.com" 
                className="text-amber-400 hover:text-amber-300 underline"
              >
                Request access
              </a>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </main>
  );
}
