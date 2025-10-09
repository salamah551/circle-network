'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  TrendingUp, Users, MessageSquare, Calendar,
  Target, Award, Zap, ArrowLeft, Loader2,
  DollarSign, Star, Activity, Gift
} from 'lucide-react';
import { calculateMemberValue, getScoreColor, getScoreBadge } from '@/lib/member-value';
import PreLaunchBanner from '@/components/PreLaunchBanner';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ImpactDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [valueData, setValueData] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadImpactData();
  }, []);

  const loadImpactData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setProfile(userProfile);

      const value = await calculateMemberValue(session.user.id, supabase);
      setValueData(value);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading impact data:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const badge = valueData ? getScoreBadge(valueData.circleScore) : null;
  const scoreColor = valueData ? getScoreColor(valueData.circleScore) : 'text-zinc-400';

  return (
    <div className="min-h-screen bg-black text-white">
      <PreLaunchBanner />
      
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Dashboard
            </button>
            <div>
              <h1 className="text-2xl font-bold">Your Impact</h1>
              <p className="text-sm text-zinc-400">Track your value and engagement in The Circle</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Circle Score Card */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-amber-500/10" />
          <div className="relative p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg text-zinc-400 mb-2">Your Circle Score</h2>
                <div className="flex items-baseline gap-3">
                  <span className={`text-6xl font-bold ${scoreColor}`}>
                    {valueData?.circleScore || 0}
                  </span>
                  <span className="text-3xl text-zinc-600">/100</span>
                </div>
                {badge && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1 ${badge.color} rounded-full text-white font-medium text-sm mt-4`}>
                    <Award className="w-4 h-4" />
                    {badge.label}
                  </div>
                )}
              </div>
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center">
                <Activity className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <p className="text-zinc-400">
              Your Circle Score reflects your engagement and value contribution to the community. 
              Keep connecting, helping, and participating to increase your score!
            </p>
          </div>
        </div>

        {/* Value Created */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Estimated Value Created</h3>
              <p className="text-sm text-zinc-400">Based on your connections, referrals, and help provided</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-2">
                <DollarSign className="w-6 h-6 text-emerald-400" />
                <span className="text-4xl font-bold text-emerald-400">
                  {((valueData?.valueCreated || 0) / 1000).toFixed(0)}K
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">in network value</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-xs text-zinc-500">
                +{valueData?.connections.recent || 0} this week
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{valueData?.connections.total || 0}</div>
            <div className="text-sm text-zinc-400">Connections Made</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="w-8 h-8 text-purple-400" />
              <span className="text-xs text-zinc-500">
                {valueData?.messages.conversations || 0} conversations
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{valueData?.messages.sent || 0}</div>
            <div className="text-sm text-zinc-400">Messages Sent</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-amber-400" />
              <span className="text-xs text-zinc-500">
                {valueData?.events.upcoming || 0} upcoming
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{valueData?.events.attended || 0}</div>
            <div className="text-sm text-zinc-400">Events Attended</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-emerald-400" />
              <span className="text-xs text-zinc-500">
                {valueData?.requests.created || 0} created
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{valueData?.requests.helped || 0}</div>
            <div className="text-sm text-zinc-400">Requests Helped</div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Engagement Breakdown
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <span className="text-zinc-300">Messages Received</span>
                <span className="font-bold">{valueData?.messages.received || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <span className="text-zinc-300">Events Hosted</span>
                <span className="font-bold">{valueData?.events.hosted || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <span className="text-zinc-300">Requests Resolved</span>
                <span className="font-bold">{valueData?.requests.resolved || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-400" />
              Referral Impact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <span className="text-zinc-300">Total Referrals</span>
                <span className="font-bold">{valueData?.referrals.total || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <span className="text-zinc-300">Converted</span>
                <span className="font-bold text-emerald-400">{valueData?.referrals.converted || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <span className="text-zinc-300">Pending</span>
                <span className="font-bold text-amber-400">{valueData?.referrals.pending || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Info */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Member Since</h3>
              <p className="text-zinc-400">
                {valueData?.memberSince.date 
                  ? new Date(valueData.memberSince.date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })
                  : 'Unknown'
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-amber-400">{valueData?.memberSince.days || 0}</div>
              <p className="text-sm text-zinc-400">days active</p>
            </div>
          </div>
        </div>

        {/* Tips to Improve Score */}
        <div className="mt-8 bg-gradient-to-br from-emerald-500/10 to-amber-500/10 border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            How to Increase Your Circle Score
          </h3>
          <ul className="space-y-2 text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Connect with more members and have meaningful conversations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Help others by responding to requests in the community</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Attend events and engage with the community</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Refer quality professionals who will contribute to the network</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
