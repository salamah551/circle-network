'use client';
import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">The Circle is Invitation Only</h1>
        <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
          Membership is extended by invitation only. If you&apos;ve received an invitation, use the link in your email to complete your registration.
        </p>

        <div className="space-y-4">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all"
          >
            Sign In to Your Account
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/#request-access"
            className="flex items-center justify-center gap-2 w-full py-4 bg-zinc-900 border border-zinc-700 text-white font-semibold rounded-lg hover:bg-zinc-800 transition-all"
          >
            Request an Invitation
          </Link>
        </div>

        <p className="mt-8 text-sm text-zinc-600">
          Questions?{' '}
          <a href="mailto:invite@thecirclenetwork.org" className="text-amber-400 hover:text-amber-300">
            invite@thecirclenetwork.org
          </a>
        </p>
      </div>
    </div>
  );
}
