'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Users, Copy, Check, TrendingUp, DollarSign,
  Mail, Loader2, Gift, Share2
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ReferralsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    converted: 0,
    totalRewards: 0
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    setUser(session.user);
    await generateReferralCode();
    await loadReferrals(session.user.id);
    setIsLoading(false);
  };

  const generateReferralCode = async () => {
    const response = await fetch('/api/referrals/generate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (response.ok) {
      const data = await response.json();
      setReferralCode(data.referral_code);
      setReferralLink(data.referral_link);
    }
  };

  const loadReferrals = async (userId) => {
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referred_profile:profiles!referrals_referred_id_fkey(full_name, email)
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReferrals(data);

      const stats = data.reduce((acc, ref) => {
        acc.total = data.length;
        if (ref.status === 'pending') acc.pending++;
        if (ref.status === 'converted') acc.converted++;
        acc.totalRewards += parseFloat(ref.reward_amount || 0);
        return acc;
      }, { total: 0, pending: 0, converted: 0, totalRewards: 0 });

      setStats(stats);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join me in The Circle Network');
    const body = encodeURIComponent(`I thought you'd be a great fit for The Circle Network - an exclusive community of high-performing professionals.\n\nUse my referral link to join: ${referralLink}\n\nLooking forward to seeing you inside!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Referral Program
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Invite professionals and earn rewards
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Total Referrals</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Pending</span>
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-bold">{stats.pending}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Converted</span>
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold">{stats.converted}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Total Rewards</span>
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-bold">${stats.totalRewards.toFixed(0)}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-black" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Your Referral Link</h2>
              <p className="text-zinc-300 mb-4">
                Share this link with high-performing professionals. You'll earn rewards when they join.
              </p>

              <div className="bg-black border border-zinc-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between gap-4">
                  <code className="text-amber-400 text-sm break-all">{referralLink}</code>
                  <button
                    onClick={() => copyToClipboard(referralLink)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors flex-shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(referralLink)}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Copy Link
                </button>
                <button
                  onClick={shareViaEmail}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Share via Email
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h3 className="text-xl font-bold">Your Referrals</h3>
          </div>

          {referrals.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-zinc-400 mb-2">No referrals yet</h3>
              <p className="text-zinc-500">Start sharing your referral link to invite members</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {referrals.map((referral) => (
                <div key={referral.id} className="p-6 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white mb-1">
                        {referral.referred_profile?.full_name || referral.referred_email}
                      </p>
                      <p className="text-sm text-zinc-400">{referral.referred_email}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Referred on {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        referral.status === 'converted'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : referral.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-zinc-700 text-zinc-400'
                      }`}>
                        {referral.status}
                      </span>
                      {referral.reward_amount > 0 && (
                        <p className="text-sm text-amber-400 mt-2">
                          ${referral.reward_amount} reward
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-black font-bold mb-3">
                1
              </div>
              <h4 className="font-semibold mb-2">Share Your Link</h4>
              <p className="text-sm text-zinc-400">
                Copy your unique referral link and share it with professionals you know
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-black font-bold mb-3">
                2
              </div>
              <h4 className="font-semibold mb-2">They Join</h4>
              <p className="text-sm text-zinc-400">
                When they sign up using your link and become a paying member
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-black font-bold mb-3">
                3
              </div>
              <h4 className="font-semibold mb-2">Earn Rewards</h4>
              <p className="text-sm text-zinc-400">
                You earn rewards for each successful referral that joins The Circle
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
