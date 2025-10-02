'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, Shield, Lock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function SubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    // Check authentication
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        setError('Authentication error. Please try again.');
        setCheckingAuth(false);
        return;
      }

      if (!session) {
        setError('Not authenticated. Please use the magic link from your email.');
        setCheckingAuth(false);
        return;
      }

      setSession(session);
      setCheckingAuth(false);
    });
  }, [searchParams]);

  const handleCheckout = async () => {
    if (!session) {
      setError('Not authenticated. Please use the magic link from your email.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if price ID is configured
      const priceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
      
      console.log('Stripe Price ID:', priceId); // Debug log
      
      if (!priceId) {
        throw new Error('Stripe price ID not configured. Please contact support.');
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          priceId: priceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show the actual error from the API
        throw new Error(data.error || `Failed to create checkout session (${response.status})`);
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-red-500 rounded-2xl p-8 text-center">
          <div className="text-red-400 text-lg font-bold mb-4">Authentication Required</div>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-2 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#D4AF37" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="20" r="12" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
              <circle cx="20" cy="20" r="6" fill="#D4AF37"/>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Secure Your Founding Member Spot</h1>
          <p className="text-zinc-400">One more step to join The Circle Network</p>
        </div>

        <div className="bg-zinc-900 border-2 border-amber-500 rounded-2xl p-8 mb-8">
          <div className="text-center mb-6">
            <div className="inline-block bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1 mb-4">
              <span className="text-amber-400 text-sm font-medium">FOUNDING MEMBER</span>
            </div>
            
            <div className="mb-4">
              <span className="text-5xl font-bold text-amber-400">$199</span>
              <span className="text-zinc-400 text-lg">/month</span>
            </div>
            
            <p className="text-zinc-500 text-sm">
              Regular price: <span className="line-through">$249/month</span>
            </p>
            <p className="text-amber-400 text-sm font-semibold mt-2">
              Your price locked forever
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {[
              'Full access to member directory',
              'Direct messaging with all members',
              'Post and respond to help requests',
              'Host and attend member events',
              'Personal intro service from founder',
              'Invite 5 members to skip vetting',
              'Founding member badge',
              'Cancel anytime'
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm mb-6">
              <strong>Error:</strong> {error}
              <div className="mt-2 text-xs text-red-300">
                If this persists, please contact support with this error message.
              </div>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Secure Checkout with Stripe
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 mt-4 text-zinc-500 text-xs">
            <Shield className="w-4 h-4" />
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold text-amber-400 mb-2">$10,000 Value Guarantee</h3>
          <p className="text-sm text-zinc-400">
            If The Circle Network doesn't provide at least $10,000 in value to you in your first year, we'll refund your full membership fee.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Subscribe() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    }>
      <SubscribePage />
    </Suspense>
  );
}
