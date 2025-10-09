'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, Shield, Lock, Crown, Zap } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import ROICalculator from '@/components/ROICalculator';
import MoneyBackGuarantee from '@/components/MoneyBackGuarantee';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Launch date: November 1, 2025
const LAUNCH_DATE = new Date('2025-11-01T00:00:00').getTime();

function SubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [countdown, setCountdown] = useState(30);

  const isLaunched = new Date().getTime() >= LAUNCH_DATE;
  const [selectedPlan, setSelectedPlan] = useState(isLaunched ? 'monthly' : 'founding');

  // Countdown timer for founding member urgency
  useEffect(() => {
    if (!isLaunched && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown, isLaunched]);

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
      // Determine which price ID to use based on selection
      let priceId;
      let planName;
      
      if (selectedPlan === 'founding' && !isLaunched) {
        // Founding member price (only before launch)
        priceId = process.env.NEXT_PUBLIC_STRIPE_FOUNDING_PRICE_ID;
        planName = 'Founding Member';
        console.log('Using founding price ID:', priceId);
      } else if (selectedPlan === 'monthly') {
        // Regular monthly price
        priceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
        planName = 'Monthly';
        console.log('Using monthly price ID:', priceId);
      } else if (selectedPlan === 'annual') {
        // Annual price
        priceId = process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID;
        planName = 'Annual';
        console.log('Using annual price ID:', priceId);
      }
      
      if (!priceId) {
        console.error('Price ID missing for plan:', selectedPlan);
        console.error('Available env vars:', {
          founding: process.env.NEXT_PUBLIC_STRIPE_FOUNDING_PRICE_ID ? 'SET' : 'MISSING',
          monthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ? 'SET' : 'MISSING',
          annual: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID ? 'SET' : 'MISSING'
        });
        throw new Error(`Price ID not configured for ${planName} plan. Please contact support at support@thecirclenetwork.org`);
      }

      console.log('Creating checkout session for:', planName);

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
        console.error('Checkout session error:', data);
        throw new Error(data.error || `Failed to create checkout session for ${planName} plan`);
      }

      if (!data.url) {
        console.error('No checkout URL returned:', data);
        throw new Error('Failed to get checkout URL. Please try again.');
      }

      console.log('Redirecting to Stripe checkout...');
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
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="url(#gold)" strokeWidth="2.5" fill="none"/>
              <circle cx="24" cy="24" r="14" stroke="url(#amber)" strokeWidth="2" fill="none"/>
              <circle cx="24" cy="24" r="7" fill="url(#gold)"/>
              <defs>
                <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
                <linearGradient id="amber" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {!isLaunched ? 'Secure Your Founding Member Spot' : 'Choose Your Membership'}
          </h1>
          <p className="text-zinc-400">
            {!isLaunched ? 'Lock in exclusive founding member benefits' : 'Select the plan that works best for you'}
          </p>
        </div>

        {/* Countdown Timer - Only show before launch */}
        {!isLaunched && countdown > 0 && (
          <div className="max-w-md mx-auto mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-red-400 font-bold mb-2">⏰ Founding Rate Expires Soon</p>
            <div className="text-3xl font-bold text-white">{countdown}s</div>
            <p className="text-zinc-400 text-sm mt-2">Don't miss out on lifetime savings</p>
          </div>
        )}

        {/* Pricing Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Founding Member - Only show before launch OR if selected */}
          {!isLaunched && (
            <div 
              onClick={() => setSelectedPlan('founding')}
              className={`cursor-pointer transition-all ${
                selectedPlan === 'founding' 
                  ? 'ring-2 ring-emerald-500 scale-105' 
                  : 'hover:scale-102'
              }`}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-zinc-900 border-2 border-emerald-500/50 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <Crown className="w-8 h-8 text-amber-400" />
                    {selectedPlan === 'founding' && (
                      <Check className="w-6 h-6 text-emerald-400" />
                    )}
                  </div>
                  
                  <div className="inline-block bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 mb-4">
                    <span className="text-amber-400 text-xs font-bold uppercase">Founding Member</span>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-emerald-400">$199</span>
                    <span className="text-zinc-400 text-lg">/month</span>
                    <div className="text-zinc-500 text-sm mt-1">
                      <span className="line-through">$249/month</span> • Save $600/year
                    </div>
                    <div className="text-amber-400 font-semibold text-sm mt-2">
                      LOCKED FOREVER
                    </div>
                  </div>

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Lifetime price lock at $199/mo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>5 priority invites for peers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Founding member badge</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>All platform features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Early access to new features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Founder's inner circle events</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Plan - Only show after launch */}
          {isLaunched && (
            <div 
              onClick={() => setSelectedPlan('monthly')}
              className={`cursor-pointer transition-all ${
                selectedPlan === 'monthly' 
                  ? 'ring-2 ring-blue-500 scale-105' 
                  : 'hover:scale-102'
              }`}
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="w-8 h-8 text-blue-400" />
                  {selectedPlan === 'monthly' && (
                    <Check className="w-6 h-6 text-blue-400" />
                  )}
                </div>
                
                <h3 className="text-xl font-bold mb-4">Monthly</h3>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">$249</span>
                  <span className="text-zinc-400 text-lg">/month</span>
                  <div className="text-zinc-500 text-sm mt-1">
                    Billed monthly
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-zinc-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                    <span>Full platform access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                    <span>Member directory</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                    <span>Direct messaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                    <span>Events access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                    <span>Cancel anytime</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Annual Plan - Only show after launch */}
          {isLaunched && (
            <div 
              onClick={() => setSelectedPlan('annual')}
              className={`cursor-pointer transition-all ${
                selectedPlan === 'annual' 
                  ? 'ring-2 ring-purple-500 scale-105' 
                  : 'hover:scale-102'
              }`}
            >
              <div className="relative">
                <div className="absolute top-4 right-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  SAVE $588
                </div>
                <div className="bg-zinc-900 border border-purple-500/50 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <Crown className="w-8 h-8 text-purple-400" />
                    {selectedPlan === 'annual' && (
                      <Check className="w-6 h-6 text-purple-400" />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4">Annual</h3>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-purple-400">$2,400</span>
                    <span className="text-zinc-400 text-lg">/year</span>
                    <div className="text-emerald-400 text-sm mt-1 font-semibold">
                      Save $588/year vs monthly
                    </div>
                    <div className="text-zinc-500 text-sm">
                      ($200/month effective rate)
                    </div>
                  </div>

                  <ul className="space-y-3 text-sm text-zinc-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Everything in Monthly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>2 months free</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Annual member badge</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ROI Calculator */}
        <div className="max-w-2xl mx-auto mb-8">
          <ROICalculator />
        </div>

        {/* Money-Back Guarantee */}
        <div className="max-w-4xl mx-auto mb-8">
          <MoneyBackGuarantee />
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Checkout Button */}
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
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
            <span>Secure payment powered by Stripe • 30-day money-back guarantee</span>
          </div>
        </div>

        {/* Value Guarantee */}
        <div className="max-w-2xl mx-auto mt-12 bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold text-amber-400 mb-2">$10,000 Value Guarantee</h3>
          <p className="text-sm text-zinc-400">
            If The Circle doesn't provide at least $10,000 in value to you in your first year, we'll refund your full membership fee.
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

