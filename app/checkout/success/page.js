'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Sparkles, Loader2, Crown } from 'lucide-react';
import { CHECKOUT_SUCCESS, TIER_NAMES } from '@/lib/copy';
import { getThreeTierPricing } from '@/lib/pricing';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const tier = searchParams.get('tier') || 'charter';
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const pricing = getThreeTierPricing();

  // Map tier to tier name and message
  const getTierInfo = () => {
    switch (tier.toLowerCase()) {
      case 'inner-circle':
      case 'innercircle':
        return {
          name: TIER_NAMES.INNER_CIRCLE,
          message: CHECKOUT_SUCCESS.INNER_CIRCLE,
          price: `$${pricing.innerCircle.formattedPrice}`,
          color: 'indigo',
          gradient: 'from-indigo-500 via-purple-500 to-pink-500'
        };
      case 'professional':
        return {
          name: TIER_NAMES.PROFESSIONAL_MEMBER,
          message: CHECKOUT_SUCCESS.PROFESSIONAL,
          price: `$${pricing.professional.formattedPrice}`,
          color: 'zinc',
          gradient: 'from-zinc-600 to-zinc-700'
        };
      case 'charter':
      default:
        return {
          name: TIER_NAMES.CHARTER_MEMBER,
          message: CHECKOUT_SUCCESS.CHARTER,
          price: `$${pricing.charter.formattedPrice}`,
          color: 'purple',
          gradient: 'from-purple-500 to-pink-500'
        };
    }
  };

  const tierInfo = getTierInfo();

  useEffect(() => {
    // Check auth status and prefill email if available
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.email) {
            setEmail(data.email);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className={`w-24 h-24 bg-gradient-to-br ${tierInfo.gradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-${tierInfo.color}-500/30`}>
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {CHECKOUT_SUCCESS.TITLE}
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            {tierInfo.message}
          </p>
          {sessionId && (
            <p className="text-sm text-zinc-600 mt-4 font-mono">
              Order ID: {sessionId.substring(0, 24)}...
            </p>
          )}
        </div>

        {/* Membership Card */}
        <div className={`bg-gradient-to-br from-${tierInfo.color}-900/40 to-${tierInfo.color}-800/40 border-2 border-${tierInfo.color}-500/50 rounded-2xl p-8 mb-8`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className={`inline-block px-3 py-1 bg-gradient-to-r ${tierInfo.gradient} rounded-full text-xs font-bold text-white mb-2`}>
                {tierInfo.name.toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-white">{tierInfo.name}</h2>
              <p className="text-zinc-400">{tierInfo.price}/year</p>
            </div>
            <Crown className={`w-12 h-12 text-${tierInfo.color}-400`} />
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">✓</div>
              <p className="text-sm text-zinc-300">Payment Confirmed</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">⚡</div>
              <p className="text-sm text-zinc-300">Access Activated</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">🎯</div>
              <p className="text-sm text-zinc-300">Ready to Start</p>
            </div>
          </div>

          {tier === 'charter' && (
            <div className={`bg-${tierInfo.color}-500/10 border border-${tierInfo.color}-500/30 rounded-lg p-4`}>
              <p className="text-sm text-purple-400 font-semibold">
                🔒 Lifetime Rate Locked: Your ${pricing.charter.formattedPrice}/year rate is guaranteed forever—it will never increase.
              </p>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            What's Next?
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-400 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Complete Your Profile</h3>
                <p className="text-sm text-zinc-400">
                  Help us personalize your experience and connect you with the right members.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-400 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Explore Your Dashboard</h3>
                <p className="text-sm text-zinc-400">
                  Access AI-curated matches, market intelligence, and member directory.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-400 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Activate ARC™</h3>
                <p className="text-sm text-zinc-400">
                  Start leveraging our AI engine for travel optimization, vendor analysis, and more.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/onboarding"
              className={`flex-1 py-4 bg-gradient-to-r ${tierInfo.gradient} text-white font-bold text-center rounded-xl hover:shadow-2xl hover:shadow-${tierInfo.color}-500/30 transition-all duration-300 flex items-center justify-center gap-2`}
            >
              {CHECKOUT_SUCCESS.START_ONBOARDING}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-center rounded-xl transition-all duration-300 border border-zinc-700 hover:border-zinc-600 flex items-center justify-center gap-2"
            >
              {CHECKOUT_SUCCESS.OPEN_DASHBOARD}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="text-center">
          <p className="text-sm text-zinc-500 mb-2">
            Questions? We're here to help.
          </p>
          <Link
            href="/contact"
            className="text-purple-400 hover:text-purple-300 text-sm font-medium"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
