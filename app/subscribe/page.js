'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, Shield, Lock, Crown, Zap, Mail } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import ROICalculator from '@/components/ROICalculator';
import MoneyBackGuarantee from '@/components/MoneyBackGuarantee';
import { trackEvent } from '@/lib/posthog';

// Use singleton Supabase browser client to prevent "Multiple GoTrueClient instances" warning
const supabase = getSupabaseBrowserClient();

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
  const [sendingMagicLink, setSendingMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [foundingMemberStatus, setFoundingMemberStatus] = useState({
    isFull: false,
    spotsAvailable: 50,
    count: 0,
    loading: true
  });

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

  // Fetch founding member availability
  useEffect(() => {
    async function fetchFoundingMemberStatus() {
      try {
        const response = await fetch('/api/founding-members/count');
        if (response.ok) {
          const data = await response.json();
          setFoundingMemberStatus({
            isFull: data.isFull,
            spotsAvailable: data.spotsAvailable,
            count: data.count,
            loading: false
          });
          
          // If founding member slots are full, automatically switch to premium
          if (data.isFull && selectedPlan === 'founding') {
            setSelectedPlan('premium');
          }
        }
      } catch (err) {
        console.error('Error fetching founding member status:', err);
        setFoundingMemberStatus(prev => ({ ...prev, loading: false }));
      }
    }
    
    fetchFoundingMemberStatus();
  }, []);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    // Check authentication
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        // Don't set error here - just log it and allow user to request magic link
      }

      if (session) {
        setSession(session);
      }
      
      setCheckingAuth(false);
    });
  }, [searchParams]);

  // Handle magic link request for unauthenticated users
  const handleRequestMagicLink = async (e) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSendingMagicLink(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/subscribe`,
        }
      });

      if (error) throw error;

      setMagicLinkSent(true);
      setError('');
      
      // Track magic link request
      trackEvent('magic_link_requested', {
        email: email,
        source: 'subscribe_page'
      });
    } catch (err) {
      console.error('Magic link error:', err);
      setError(err.message || 'Failed to send magic link. Please try again.');
    } finally {
      setSendingMagicLink(false);
    }
  };

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
      
      if (selectedPlan === 'founding') {
        // Founding member price
        priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDING || process.env.NEXT_PUBLIC_STRIPE_FOUNDING_PRICE_ID;
        planName = 'Founding Member';
        console.log('Using founding price ID:', priceId);
      } else if (selectedPlan === 'core') {
        // Core tier price
        priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_CORE;
        planName = 'Core';
        console.log('Using core price ID:', priceId);
      } else if (selectedPlan === 'pro' || selectedPlan === 'premium') {
        // Pro tier price (premium for backwards compatibility - TODO: remove 'premium' fallback after migration)
        priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM;
        planName = 'Pro';
        console.log('Using pro price ID:', priceId);
      } else if (selectedPlan === 'elite') {
        // Elite price
        priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE;
        planName = 'Elite';
        console.log('Using elite price ID:', priceId);
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

      // Track checkout initiation with PostHog
      trackEvent('checkout_initiated', {
        plan: planName,
        plan_type: selectedPlan,
        user_email: session.user.email,
        user_id: session.user.id
      });

      const response = await fetch('/api/payments/subscription/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priceId: priceId,
          tier: selectedPlan,
        }),
        credentials: 'include' // Include cookies for server-side auth
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

  // Show magic link request UI if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-amber-500/30 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-zinc-400">
              {magicLinkSent 
                ? 'Check your email for the magic link to continue'
                : 'Enter your email to receive a magic link to continue to checkout'
              }
            </p>
          </div>

          {magicLinkSent ? (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-emerald-400 text-sm">
                ✓ Magic link sent to <strong>{email}</strong>
              </div>
              <p className="text-zinc-400 text-sm text-center">
                Click the link in your email to continue. It may take a minute to arrive.
              </p>
              <button
                onClick={() => {
                  setMagicLinkSent(false);
                  setError('');
                }}
                className="w-full text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Send to a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleRequestMagicLink} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={sendingMagicLink}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingMagicLink ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send Magic Link
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <button 
              onClick={() => router.push('/')}
              className="w-full text-sm text-zinc-400 hover:text-white transition-colors"
            >
              ← Back to Home
            </button>
          </div>
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

        {/* Inner Circle (Founding Member) Availability Banner */}
        {!isLaunched && !foundingMemberStatus.loading && !foundingMemberStatus.isFull && (
          <div className="max-w-md mx-auto mb-8 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
            <p className="text-amber-400 font-bold mb-2">🔥 Inner Circle (Founding Member) - Limited Availability</p>
            <div className="text-3xl font-bold text-white">{foundingMemberStatus.spotsAvailable}</div>
            <p className="text-zinc-400 text-sm mt-2">spots remaining - Exclusive founding rate with full ARC™ access</p>
          </div>
        )}

        {/* Inner Circle Full Banner */}
        {!isLaunched && !foundingMemberStatus.loading && foundingMemberStatus.isFull && (
          <div className="max-w-md mx-auto mb-8 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
            <p className="text-purple-400 font-bold mb-2">✓ Inner Circle (Founding Member) - Filled</p>
            <p className="text-zinc-400 text-sm mt-2">All Inner Circle spots claimed. Core (Charter Member) tier available with limited ARC™ access.</p>
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
                    <span className="text-5xl font-bold text-emerald-400">$179</span>
                    <span className="text-zinc-400 text-lg">/mo</span>
                    <div className="text-zinc-500 text-sm mt-1">
                      Early access pricing
                    </div>
                    <div className="text-amber-400 font-semibold text-sm mt-2">
                      FOUNDING 50 EXCLUSIVE
                    </div>
                    {!foundingMemberStatus.loading && (
                      <div className="text-emerald-400 font-semibold text-xs mt-1">
                        {foundingMemberStatus.spotsAvailable} of 50 spots left
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Founding member price lock</strong> at $179/mo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Exclusive founding member badge & recognition</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Priority access to all new features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>5 priority invites to bring your network</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Founding member strategy sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>All platform features + AI tools</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Premium Plan - Show when founding is full or after launch */}
          {(foundingMemberStatus.isFull || isLaunched) && (
            <div 
              onClick={() => setSelectedPlan('premium')}
              className={`cursor-pointer transition-all ${
                selectedPlan === 'premium' 
                  ? 'ring-2 ring-blue-500 scale-105' 
                  : 'hover:scale-102'
              }`}
            >
              <div className="bg-zinc-900 border border-blue-500/50 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="w-8 h-8 text-blue-400" />
                  {selectedPlan === 'premium' && (
                    <Check className="w-6 h-6 text-blue-400" />
                  )}
                </div>
                
                <div className="inline-block bg-blue-500/10 border border-blue-500/30 rounded-full px-3 py-1 mb-4">
                  <span className="text-blue-400 text-xs font-bold uppercase">Premium</span>
                </div>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-blue-400">$299</span>
                  <span className="text-zinc-400 text-lg">/mo</span>
                  <div className="text-zinc-500 text-sm mt-1">
                    Full platform access
                  </div>
                </div>

                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span><strong>30 ARC™ requests per month</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span><strong>10 BriefPoint briefs per day</strong> (email + Slack)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Complete platform access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>AI-powered strategic introductions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>30-day money-back guarantee</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Elite Plan - Show when founding is full or after launch */}
          {(foundingMemberStatus.isFull || isLaunched) && (
            <div 
              onClick={() => setSelectedPlan('elite')}
              className={`cursor-pointer transition-all ${
                selectedPlan === 'elite' 
                  ? 'ring-2 ring-purple-500 scale-105' 
                  : 'hover:scale-102'
              }`}
            >
              <div className="relative">
                <div className="absolute top-4 right-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  BEST VALUE
                </div>
                <div className="bg-zinc-900 border border-purple-500/50 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <Crown className="w-8 h-8 text-purple-400" />
                    {selectedPlan === 'elite' && (
                      <Check className="w-6 h-6 text-purple-400" />
                    )}
                  </div>
                  
                  <div className="inline-block bg-purple-500/10 border border-purple-500/30 rounded-full px-3 py-1 mb-4">
                    <span className="text-purple-400 text-xs font-bold uppercase">Elite</span>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-purple-400">$499</span>
                    <span className="text-zinc-400 text-lg">/mo</span>
                    <div className="text-purple-400 text-sm mt-1 font-semibold">
                      VIP access + AI tools
                    </div>
                  </div>

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span><strong>50 ARC™ requests per month</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span><strong>20 BriefPoint briefs per day</strong> (email + Slack)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Everything in Pro</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>White-glove concierge service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Dedicated account manager</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Elite member badge & status</span>
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
            <span>Secure payment powered by Stripe • 30-day money-back guarantee • 3 wins in 90 days or +3 months free</span>
          </div>
        </div>

        {/* Guarantees Section */}
        <div className="max-w-2xl mx-auto mt-12 space-y-4">
          {/* 30-Day Money-Back */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-emerald-400 mb-2">30-Day Money-Back Guarantee</h3>
                <p className="text-sm text-zinc-300">
                  If Circle Network doesn't deliver meaningful value in your first 30 days, we'll refund 
                  your membership fee in full. No questions asked. Simple email request.
                </p>
              </div>
            </div>
          </div>

          {/* Performance Guarantee */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Zap className="w-8 h-8 text-purple-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-purple-400 mb-2">3 Wins in 90 Days — Or +3 Months Free</h3>
                <p className="text-sm text-zinc-300">
                  If you don't achieve at least 3 meaningful wins (valuable introductions, partnerships, or 
                  opportunities) within your first 90 days, we'll extend your membership by 3 months at no charge. 
                  Email us within 100 days to claim.
                </p>
              </div>
            </div>
          </div>
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

