'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ApplyWithCodePage() {
  const router = useRouter();
  const qs = useSearchParams();

  const [email, setEmail] = useState('');
  const [code, setCode]   = useState('');
  const [error, setError] = useState('');

  // If someone lands with ?code= & ?email= already present, prefill and go
  useEffect(() => {
    const qCode = qs.get('code');
    const qEmail = qs.get('email');
    if (qCode) setCode(qCode);
    if (qEmail) setEmail(qEmail);
  }, [qs]);

  function validate() {
    if (!code.trim()) return 'Please paste your invitation code.';
    if (!email || !/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email.';
    return '';
  }

  function onSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    // Defer verification to your existing accept page / backend
    const url = `/invite/accept?code=${encodeURIComponent(code.trim())}&email=${encodeURIComponent(email.trim())}`;
    router.push(url);
  }

  return (
    <main className="min-h-screen bg-black text-white grid place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-8">
        <h1 className="text-2xl font-semibold">Enter your invitation</h1>
        <p className="text-white/70 mt-2">
          Membership is invite-only. Paste the code from your email and continue.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Invitation code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="one-time-code"
              className="w-full rounded-lg bg-zinc-950 border border-white/10 px-3 py-2 outline-none focus:border-amber-500/40"
              placeholder="e.g., CN-7F2K-93QJ"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-lg bg-zinc-950 border border-white/10 px-3 py-2 outline-none focus:border-amber-500/40"
              placeholder="you@company.com"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-amber-500 text-black font-medium px-5 py-3 hover:bg-amber-400"
          >
            Continue
          </button>

          <div className="text-xs text-white/50 mt-3">
            Need help? <a href="mailto:support@thecirclenetwork.org" className="underline hover:text-white">Contact support</a>.
          </div>
        </form>

        <a
          href="/"
          className="inline-block mt-6 text-sm text-white/70 hover:text-white"
        >
          ← Return to Home
        </a>
      </div>
    </main>
  );
}
