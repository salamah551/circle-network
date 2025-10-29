'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, ArrowRight, Clock, Loader2 } from 'lucide-react';
import { MAGIC_LINK, LOADING } from '@/lib/copy';

function MagicLinkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0 || isResending || !email) return;
    
    setIsResending(true);
    setResendSuccess(false);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setResendSuccess(true);
        setCountdown(60); // Reset countdown
        setTimeout(() => setResendSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Resend error:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    router.push('/login');
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">No email specified</p>
          <button
            onClick={handleChangeEmail}
            className="text-amber-400 hover:text-amber-300 font-medium"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-amber-500 rounded-2xl p-8">
        {/* Icon */}
        <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-amber-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white text-center mb-4">
          {MAGIC_LINK.CHECK_EMAIL_TITLE}
        </h1>

        {/* Email display */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-zinc-400 text-center mb-2">
            {MAGIC_LINK.CHECK_EMAIL_DESCRIPTION}
          </p>
          <p className="text-white font-semibold text-center break-all">
            {email}
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-400 text-xs font-bold">1</span>
            </div>
            <p className="text-sm text-zinc-400">
              Check your inbox for an email from The Circle
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-400 text-xs font-bold">2</span>
            </div>
            <p className="text-sm text-zinc-400">
              Click the secure sign-in link in the email
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-400 text-xs font-bold">3</span>
            </div>
            <p className="text-sm text-zinc-400">
              You'll be automatically signed in to your account
            </p>
          </div>
        </div>

        {/* Success message for resend */}
        {resendSuccess && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-sm text-emerald-400 text-center">
              ✓ New link sent! Check your email.
            </p>
          </div>
        )}

        {/* Resend button with countdown */}
        <button
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-all mb-3 flex items-center justify-center gap-2"
        >
          {isResending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : countdown > 0 ? (
            <>
              <Clock className="w-4 h-4" />
              {MAGIC_LINK.RESEND_LINK} in {countdown}s
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4" />
              {MAGIC_LINK.RESEND_LINK}
            </>
          )}
        </button>

        {/* Change email */}
        <button
          onClick={handleChangeEmail}
          className="w-full text-amber-400 hover:text-amber-300 text-sm font-medium"
        >
          {MAGIC_LINK.CHANGE_EMAIL}
        </button>

        {/* Tip */}
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 text-center">
            💡 Tip: Check your spam folder if you don't see the email within a few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    }>
      <MagicLinkContent />
    </Suspense>
  );
}
