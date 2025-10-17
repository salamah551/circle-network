'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import {
  ArrowLeft, Lock, Crown, TrendingUp, Bell, Target, 
  DollarSign, Sparkles, Clock, CheckCircle, ArrowRight,
  Zap, Briefcase, MapPin, Calendar, ExternalLink
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DealFlowPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const isFoundingMember = profile?.membership_tier === 'founding' || profile?.is_founding_member;
  const isEliteMember = profile?.membership_tier === 'elite';
  const canAccessFeature = isFoundingMember || isEliteMember;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                AI Deal Flow Alerts
              </h1>
              <p className="text-sm text-zinc-400">Real-time investment opportunities before they hit the market</p>
            </div>
            {canAccessFeature && (
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-semibold">
                Coming Q1 2026
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {!canAccessFeature ? (
          // LOCKED STATE (Premium Members)
          <div className="space-y-8">
            {/* Lock Banner */}
            <div className="bg-gradient-to-br from-red-500/10 via-zinc-900 to-black rounded-2xl p-8 border-2 border-red-500/30 text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Elite Members Only</h2>
              <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
                AI Deal Flow Alerts is an exclusive feature for Elite and Founding members. 
                Upgrade your membership to get early access to investment opportunities.
              </p>
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-bold rounded-lg transition-all"
              >
                <Crown className="w-5 h-5" />
                Upgrade to Elite
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Feature Preview */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-zinc-800">
              <h3 className="text-2xl font-bold mb-6">What You'll Get With This Feature</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Real-Time Alerts</h4>
                    <p className="text-sm text-zinc-400">
                      Get notified the moment a deal matching your criteria emerges—before it goes public.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Custom Criteria</h4>
                    <p className="text-sm text-zinc-400">
                      Set your investment thesis: industry, stage, deal size, geography, business model.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Early Access</h4>
                    <p className="text-sm text-zinc-400">
                      See deals 3-4 days before competitors, giving you preferential access and better terms.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Warm Intro Paths</h4>
                    <p className="text-sm text-zinc-400">
                      See who in Circle Network can introduce you to founders—40-60% response rate vs. 2-5% cold.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // COMING SOON STATE (Founding/Elite Members)
          <div className="space-y-8">
            {/* Coming Soon Banner */}
            <div className="bg-gradient-to-br from-amber-500/10 via-zinc-900 to-black rounded-2xl p-8 border-2 border-amber-500/30 text-center">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Coming Q1 2026</h2>
              <p className="text-xl text-zinc-400 mb-6 max-w-2xl mx-auto">
                We're building AI Deal Flow Alerts and it will be ready in Q1 2026. 
                {isFoundingMember && ' As a founding member, you\'ll get full access at no additional cost.'}
              </p>
              {isFoundingMember && (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                  <Crown className="w-5 h-5" />
                  <span className="font-semibold">Included in Your Founding Membership</span>
                </div>
              )}
            </div>

            {/* Get Notified */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-zinc-800">
              <h3 className="text-2xl font-bold mb-4">Set Your Criteria Now</h3>
              <p className="text-zinc-400 mb-6">
                Tell us what you're looking for and we'll notify you as soon as this feature launches.
              </p>

              <div className="space-y-6">
                {/* Investment Criteria Form (Disabled Preview) */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Industries</label>
                  <div className="flex flex-wrap gap-2 opacity-50 pointer-events-none">
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">SaaS</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">Fintech</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">Healthcare Tech</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">AI/ML</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Deal Size</label>
                  <div className="flex flex-wrap gap-2 opacity-50 pointer-events-none">
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">$50K - $250K</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">$250K - $1M</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">$1M - $5M</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Stage</label>
                  <div className="flex flex-wrap gap-2 opacity-50 pointer-events-none">
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">Pre-seed</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">Seed</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">Series A</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-sm text-zinc-500 text-center">
                    This feature will be available in Q1 2026. You'll be able to set your criteria then.
                  </p>
                </div>
              </div>
            </div>

            {/* Example Alert Preview */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-zinc-800">
              <h3 className="text-2xl font-bold mb-4">Example: What an Alert Looks Like</h3>
              <div className="bg-zinc-900/50 rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-start gap-4 mb-4">
                  <Bell className="w-6 h-6 text-purple-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-lg">MedAI Labs - Series A</h4>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded">
                        Early Access
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-zinc-300">
                      <p><strong>Raising:</strong> $3M at $15M pre-money valuation</p>
                      <p><strong>Industry:</strong> Healthcare AI (Medical Imaging)</p>
                      <p><strong>Traction:</strong> $1.2M ARR, 15 hospital customers, FDA clearance in process</p>
                      <p><strong>Match Score:</strong> <span className="text-purple-400 font-semibold">94%</span> based on your criteria</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-2">Your Connection Path:</p>
                      <p className="text-sm text-zinc-400">
                        Founder is connected to Michael Torres (Circle member you met last month). Warm intro available.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed">
                    Request Intro
                  </button>
                  <button className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed">
                    Pass
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}