'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import {
  ArrowLeft, Lock, Crown, BarChart3, TrendingUp, Users, 
  Briefcase, Clock, ArrowRight, Target, Zap, Bell,
  DollarSign, Award, AlertCircle, CheckCircle
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function IntelligencePage() {
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
          <BarChart3 className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-pulse" />
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
                <BarChart3 className="w-6 h-6 text-emerald-400" />
                AI Competitive Intelligence
              </h1>
              <p className="text-sm text-zinc-400">Weekly intelligence reports on competitors and market trends</p>
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
          // LOCKED STATE
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-red-500/10 via-zinc-900 to-black rounded-2xl p-8 border-2 border-red-500/30 text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Elite Members Only</h2>
              <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
                AI Competitive Intelligence is an exclusive feature for Elite and Founding members. 
                Stay ahead of every move in your industry.
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

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-zinc-800">
              <h3 className="text-2xl font-bold mb-6">What You'll Get With This Feature</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Weekly Intelligence Reports</h4>
                    <p className="text-sm text-zinc-400">
                      Comprehensive reports on competitor moves, funding, hiring, product launches, and customer sentiment.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Real-Time Critical Alerts</h4>
                    <p className="text-sm text-zinc-400">
                      Get notified immediately when competitors raise funding, launch products, or make major moves.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Strategic Recommendations</h4>
                    <p className="text-sm text-zinc-400">
                      AI-generated action items based on competitive landscape and emerging opportunities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Market Trend Analysis</h4>
                    <p className="text-sm text-zinc-400">
                      Track industry shifts, emerging technologies, and market opportunities before competitors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // COMING SOON STATE
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-amber-500/10 via-zinc-900 to-black rounded-2xl p-8 border-2 border-amber-500/30 text-center">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Coming Q1 2026</h2>
              <p className="text-xl text-zinc-400 mb-6 max-w-2xl mx-auto">
                We're building AI Competitive Intelligence and it will be ready in Q1 2026. 
                {isFoundingMember && ' As a founding member, you\'ll get full access at no additional cost.'}
              </p>
              {isFoundingMember && (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                  <Crown className="w-5 h-5" />
                  <span className="font-semibold">Included in Your Founding Membership</span>
                </div>
              )}
            </div>

            {/* Setup Competitors */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-zinc-800">
              <h3 className="text-2xl font-bold mb-4">Define Your Competitors</h3>
              <p className="text-zinc-400 mb-6">
                Tell us who to monitor and we'll start tracking as soon as this feature launches.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Your Company/Industry</label>
                  <div className="opacity-50 pointer-events-none">
                    <input
                      type="text"
                      placeholder="Circle Network - Professional networking + AI tools"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Competitors to Track (up to 10)</label>
                  <div className="space-y-2 opacity-50 pointer-events-none">
                    <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                      <Briefcase className="w-4 h-4 text-zinc-500" />
                      <span className="text-sm">LinkedIn Premium</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                      <Briefcase className="w-4 h-4 text-zinc-500" />
                      <span className="text-sm">On Deck</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                      <Briefcase className="w-4 h-4 text-zinc-500" />
                      <span className="text-sm">Tiger 21</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Topics to Track</label>
                  <div className="flex flex-wrap gap-2 opacity-50 pointer-events-none">
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">Funding</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">Product Launches</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">Hiring</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">Partnerships</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">Pricing Changes</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">Customer Sentiment</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-sm text-zinc-500 text-center">
                    This feature will be available in Q1 2026. You'll be able to configure tracking then.
                  </p>
                </div>
              </div>
            </div>

            {/* Example Report */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-zinc-800">
              <h3 className="text-2xl font-bold mb-4">Example: Weekly Intelligence Report</h3>
              <div className="bg-zinc-900/50 rounded-xl p-6 border border-emerald-500/20 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <h4 className="font-bold">Critical Alerts (Action Required)</h4>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 border border-red-500/20 space-y-2">
                    <p className="text-sm"><strong>On Deck Raises $50M Series C</strong></p>
                    <p className="text-xs text-zinc-400">
                      Investors: Founders Fund, a16z | Valuation: $300M post-money
                    </p>
                    <p className="text-xs text-zinc-500">
                      <strong>What This Means:</strong> They're doubling down on community model. Expect aggressive marketing in Q1.
                    </p>
                    <p className="text-xs text-amber-400">
                      <strong>Recommended Action:</strong> Emphasize your AI differentiation in messaging.
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold">Product & Feature Updates</h4>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>LinkedIn Premium launched "AI Career Advisor" (B2C-focused, mixed reviews)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Tiger 21 announced virtual meetings (some members upset about loss of exclusivity)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h4 className="font-bold">Hiring & Team Changes</h4>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <p>• On Deck hired former VP of Growth from Stripe (expect aggressive scaling)</p>
                    <p>• LinkedIn Premium lost 3 senior PMs to Google (internal turmoil?)</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    <h4 className="font-bold">Customer Sentiment Analysis</h4>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <p>• LinkedIn Premium: G2 rating down to 3.8/5 (from 4.1 last quarter)</p>
                    <p>• Chief increased pricing to $12,000/year → 15% churn spike</p>
                    <p className="text-xs text-amber-400">
                      <strong>Opportunity:</strong> Your Elite tier ($9,997) is now cheaper than Chief
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}