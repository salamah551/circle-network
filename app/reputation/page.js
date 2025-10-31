'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import {
  ArrowLeft, Lock, Crown, Shield, AlertTriangle, Eye, 
  Bell, CheckCircle, Clock, ArrowRight, Zap, TrendingUp,
  MessageSquare, Twitter, Linkedin, Globe
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ReputationPage() {
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
          <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
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
                <Shield className="w-6 h-6 text-blue-400" />
                Reputation Guardian
              </h1>
              <p className="text-sm text-zinc-400">24/7 AI monitoring with instant threat alerts</p>
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
                Reputation Guardian is an exclusive feature for Elite and Founding members. 
                Protect your reputation with 24/7 AI monitoring.
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
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">24/7 Monitoring</h4>
                    <p className="text-sm text-zinc-400">
                      AI scans 50+ platforms continuously: social media, news, reviews, forums.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Instant Alerts</h4>
                    <p className="text-sm text-zinc-400">
                      Email + SMS alerts within 5-30 minutes of a threat appearing (vs. 3-14 days manual).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Threat Level Analysis</h4>
                    <p className="text-sm text-zinc-400">
                      AI classifies threats as low, medium, high, or critical with sentiment analysis.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">AI Response Templates</h4>
                    <p className="text-sm text-zinc-400">
                      Get suggested responses for public and private replies to address issues quickly.
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
                We're building Reputation Guardian and it will be ready in Q1 2026. 
                {isFoundingMember && ' As a founding member, you\'ll get full access at no additional cost.'}
              </p>
              {isFoundingMember && (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                  <Crown className="w-5 h-5" />
                  <span className="font-semibold">Included in Your Founding Membership</span>
                </div>
              )}
            </div>

            {/* Setup Preview */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-zinc-800">
              <h3 className="text-2xl font-bold mb-4">Set Up Monitoring Now</h3>
              <p className="text-zinc-400 mb-6">
                Tell us what to monitor and we'll start tracking as soon as this feature launches.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Your Name (all variations)</label>
                  <div className="flex flex-wrap gap-2 opacity-50 pointer-events-none">
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">Shehab Salamah</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">S. Salamah</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Company Names</label>
                  <div className="flex flex-wrap gap-2 opacity-50 pointer-events-none">
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">Circle Network</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">The Circle Network</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Platforms to Monitor</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 opacity-50 pointer-events-none">
                    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                      <Twitter className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">Twitter/X</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                      <Linkedin className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">LinkedIn</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                      <MessageSquare className="w-4 h-4 text-orange-400" />
                      <span className="text-sm">Reddit</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm">News</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-sm text-zinc-500 text-center">
                    This feature will be available in Q1 2026. You'll be able to configure monitoring then.
                  </p>
                </div>
              </div>
            </div>

            {/* Example Alert */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-zinc-800">
              <h3 className="text-2xl font-bold mb-4">Example: Critical Threat Alert</h3>
              <div className="bg-zinc-900/50 rounded-xl p-6 border border-red-500/30">
                <div className="flex items-start gap-4 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-lg">Negative TechCrunch Article</h4>
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
                        CRITICAL
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-zinc-300 mb-4">
                      <p><strong>Platform:</strong> TechCrunch (Major Tech Publication)</p>
                      <p><strong>Reach:</strong> 500K+ readers, trending on Twitter (2,000 shares in 3 hours)</p>
                      <p><strong>Sentiment:</strong> Negative</p>
                      <p><strong>Detected:</strong> 10 minutes ago</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 mb-4">
                      <p className="text-sm italic text-zinc-400">
                        "Exclusive Networks Under Fire: Are They Worth the Cost? Circle Network charges up to $499/mo..."
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-amber-400 font-semibold">Recommended Actions:</p>
                      <ul className="list-disc list-inside text-zinc-400 space-y-1">
                        <li>Read full article and assess accuracy</li>
                        <li>Draft public response (AI template available)</li>
                        <li>Reach out to journalist for comment/correction</li>
                        <li>Monitor Twitter for spread</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed">
                  View AI Response Template
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}