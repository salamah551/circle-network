'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, Shield, Lock, Crown, Zap, Mail, Star } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import ROICalculator from '@/components/ROICalculator';
import MoneyBackGuarantee from '@/components/MoneyBackGuarantee';
import { trackEvent } from '@/lib/posthog';
import { TIERS, FOUNDING_OFFER, getStripePriceIdByTier, formatPriceMonthly, LAUNCH_MODE } from '@/lib/pricing';

// Use singleton Supabase browser client to prevent "Multiple GoTrueClient instances" warning
const supabase = getSupabaseBrowserClient();

function SubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('founding'); // Default to Founding tier in launch mode
  const [showFoundingOffer, setShowFoundingOffer] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    // Check if founding offer should be shown (based on env config)
    const foundingPriceId = getStripePriceIdByTier('founding');
    setShowFoundingOffer(!!foundingPriceId);

    // Check authentication
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
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
      const priceId = getStripePriceIdByTier(selectedPlan);
      
      if (!priceId) {
        throw new Error(`Price ID not configured for ${selectedPlan} plan. Please contact support.`);
      }

      console.log('Creating checkout session for:', selectedPlan, priceId);

      // Track checkout initiation
      trackEvent('checkout_initiated', {
        plan: selectedPlan,
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
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Checkout session error:', data);
        throw new Error(data.error || `Failed to create checkout session`);
      }

      if (!data.url) {
        throw new Error('Failed to get checkout URL. Please try again.');
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
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  // Show magic link request UI if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-purple-500/30 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-purple-400" />
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
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {LAUNCH_MODE ? 'Founding Member Access' : 'Choose Your Membership Tier'}
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            {LAUNCH_MODE
              ? 'Secure your founding member spot — one tier, one price, price locked for 24 months.'
              : 'Select the plan that matches your needs. All tiers include access to our AI-powered platform and vetted community.'}
          </p>
        </div>

        {/* Founding Member Special Offer Banner */}
        {showFoundingOffer && (
          <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold text-purple-400">Special Founding Member Offer</h3>
              <Star className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-zinc-300 mb-2">
              Get Pro tier features at <strong className="text-white">${(FOUNDING_OFFER.priceMonthlyCents / 100).toFixed(0)}/mo</strong> — locked for 24 months
            </p>
            <p className="text-sm text-zinc-400">
              Founding rate — locked for 24 months. Standard membership will be $599/mo.
            </p>
          </div>
        )}

        {/* Pricing Tiers — hidden in launch mode */}
        {!LAUNCH_MODE && (
        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-7xl mx-auto">
          {TIERS.map((tier, index) => {
            const isPopular = tier.id === 'pro';
            const isSelected = selectedPlan === tier.id;
            
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedPlan(tier.id)}
                className={`cursor-pointer transition-all relative ${
                  isSelected
                    ? 'ring-2 ring-purple-500 scale-105'
                    : 'hover:scale-102'
                } ${isPopular ? 'md:scale-105' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                
                <div className={`bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 ${
                  isPopular ? 'border-purple-500/50' : 'border-zinc-700'
                } rounded-2xl p-8 h-full flex flex-col`}>
                  <div className="flex items-center justify-between mb-4">
                    {tier.id === 'elite' ? (
                      <Crown className="w-8 h-8 text-purple-400" />
                    ) : (
                      <Zap className="w-8 h-8 text-purple-400" />
                    )}
                    {isSelected && (
                      <Check className="w-6 h-6 text-emerald-400" />
                    )}
                  </div>

                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-sm text-zinc-400 mb-6">{tier.target}</p>

                  <div className="mb-6">
                    <div className="text-5xl font-bold text-white mb-1">
                      ${(tier.priceMonthlyCents / 100).toFixed(0)}
                    </div>
                    <div className="text-zinc-400 text-sm">/month</div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          isPopular ? 'text-purple-400' : 'text-zinc-400'
                        }`} />
                        <span className="text-sm text-zinc-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setSelectedPlan(tier.id)}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Founding Member Option */}
        {showFoundingOffer && (
          <div className="max-w-4xl mx-auto mb-12">
            <div
              onClick={() => setSelectedPlan('founding')}
              className={`cursor-pointer transition-all ${
                selectedPlan === 'founding'
                  ? 'ring-2 ring-purple-500 scale-105'
                  : 'hover:scale-102'
              }`}
            >
              <div className="relative bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 rounded-2xl p-8">
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  SPECIAL OFFER
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Crown className="w-8 h-8 text-purple-400" />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      Founding Member
                      {selectedPlan === 'founding' && (
                        <Check className="w-6 h-6 text-emerald-400" />
                      )}
                    </h3>
                    <p className="text-zinc-300 mb-4">
                      Get <strong>Pro tier</strong> features at founding member pricing — locked for 24 months
                    </p>
                    
                    <div className="flex items-baseline gap-3 mb-4">
                      <div className="text-4xl font-bold text-purple-400">
                        ${(FOUNDING_OFFER.priceMonthlyCents / 100).toFixed(0)}
                      </div>
                      <div className="text-zinc-400">/month</div>
                      <div className="text-sm text-emerald-400 font-semibold">
                        Founding rate — locked for 24 months
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-purple-400 font-semibold mb-2">INCLUDES:</p>
                        <ul className="space-y-1 text-sm text-zinc-400">
                          <li>• All Pro tier features</li>
                          <li>• 10 BriefPoint briefs/day</li>
                          <li>• 30 ARC requests/month</li>
                          <li>• 3 Strategic Intros/week</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs text-purple-400 font-semibold mb-2">BONUSES:</p>
                        <ul className="space-y-1 text-sm text-zinc-400">
                          <li>• Founding Member badge</li>
                          <li>• Priority feature access</li>
                          <li>• Price locked for 24 months</li>
                          <li>• Limited availability</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
            className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 hover:from-purple-600 hover:via-purple-700 hover:to-pink-600 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Proceed to Secure Checkout
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 mt-4 text-zinc-500 text-xs">
            <Shield className="w-4 h-4" />
            <span>Secure payment powered by Stripe • 30-day money-back guarantee</span>
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
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    }>
      <SubscribePage />
    </Suspense>
  );
}
