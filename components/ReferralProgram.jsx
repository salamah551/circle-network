'use client';
import { useState, useEffect } from 'react';
import { Gift, Users, Copy, Check, Mail, Share2, Award } from 'lucide-react';
import { showToast } from './Toast';

export default function ReferralProgram({ userId, userEmail, userName }) {
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    credited: 0
  });
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadReferralData();
    }
  }, [userId]);

  const loadReferralData = async () => {
    try {
      const response = await fetch(`/api/referrals?userId=${userId}`);
      const data = await response.json();
      setReferralCode(data.referralCode);
      setReferralStats(data.stats);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReferralLink = () => {
    return `${process.env.NEXT_PUBLIC_APP_URL}/apply?ref=${referralCode}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getReferralLink());
      setCopied(true);
      showToast('Referral link copied!', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      showToast('Failed to copy link', 'error');
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join Circle Network');
    const body = encodeURIComponent(
      `Hi,\n\nI'm part of Circle Network, an exclusive community of accomplished professionals. I think you'd be a great fit.\n\nHere's your invitation link:\n${getReferralLink()}\n\nCircle Network is invitation-only with only 250 founding member spots available. The platform connects you with high-achievers across all industries for meaningful partnerships and growth.\n\nHope to see you inside!\n\n${userName || 'A fellow member'}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-zinc-800 rounded-xl" />
      </div>
    );
  }

  const rewards = [
    { threshold: 1, reward: '$100 account credit', icon: '💵' },
    { threshold: 3, reward: 'Free month of Premium', icon: '⭐' },
    { threshold: 5, reward: 'Free Premium upgrade (1 year)', icon: '🎁' },
    { threshold: 10, reward: 'Lifetime Elite membership', icon: '👑' }
  ];

  const nextReward = rewards.find(r => referralStats.credited < r.threshold);
  const progress = nextReward 
    ? (referralStats.credited / nextReward.threshold) * 100 
    : 100;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 via-zinc-900 to-blue-500/10 border border-purple-500/20">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Gift className="w-7 h-7 text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Invite Fellow Professionals</h2>
            <p className="text-zinc-400">
              Know someone who'd thrive in Circle Network? Refer them and earn rewards when they join.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
            <div className="text-2xl font-bold text-white mb-1">{referralStats.total}</div>
            <div className="text-xs text-zinc-500">Total Invites</div>
          </div>
          <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
            <div className="text-2xl font-bold text-amber-400 mb-1">{referralStats.pending}</div>
            <div className="text-xs text-zinc-500">Pending</div>
          </div>
          <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
            <div className="text-2xl font-bold text-emerald-400 mb-1">{referralStats.accepted}</div>
            <div className="text-xs text-zinc-500">Accepted</div>
          </div>
          <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
            <div className="text-2xl font-bold text-purple-400 mb-1">{referralStats.credited}</div>
            <div className="text-xs text-zinc-500">Credited</div>
          </div>
        </div>

        {/* Progress to next reward */}
        {nextReward && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Next Reward</span>
              <span className="text-sm font-bold text-purple-400">
                {referralStats.credited}/{nextReward.threshold} referrals
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{nextReward.icon}</span>
              <span className="text-sm font-semibold text-white">{nextReward.reward}</span>
            </div>
          </div>
        )}
      </div>

      {/* Your Referral Link */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-amber-400" />
          Your Referral Link
        </h3>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg font-mono text-sm text-zinc-300 overflow-x-auto">
            {getReferralLink()}
          </div>
          <button
            onClick={copyToClipboard}
            className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-all flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy
              </>
            )}
          </button>
        </div>

        <button
          onClick={shareViaEmail}
          className="w-full px-6 py-3 bg-zinc-800 border border-zinc-700 text-white font-semibold rounded-lg hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
        >
          <Mail className="w-5 h-5" />
          Share via Email
        </button>
      </div>

      {/* Rewards Tier */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Rewards Tier
        </h3>

        <div className="space-y-3">
          {rewards.map((reward, i) => {
            const achieved = referralStats.credited >= reward.threshold;
            return (
              <div
                key={i}
                className={`p-4 rounded-lg border transition-all ${
                  achieved
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-zinc-800/50 border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{reward.icon}</span>
                    <div>
                      <div className={`font-semibold ${achieved ? 'text-emerald-400' : 'text-white'}`}>
                        {reward.reward}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {reward.threshold} successful referral{reward.threshold !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  {achieved && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">Earned</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <h3 className="text-lg font-bold mb-4">How It Works</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-400">1</span>
            </div>
            <div>
              <div className="font-semibold text-white mb-1">Share Your Link</div>
              <div className="text-sm text-zinc-400">
                Send your unique referral link to qualified professionals who'd benefit from Circle Network
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-400">2</span>
            </div>
            <div>
              <div className="font-semibold text-white mb-1">They Apply & Join</div>
              <div className="text-sm text-zinc-400">
                When they apply using your link and become a paying member, you both benefit
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-400">3</span>
            </div>
            <div>
              <div className="font-semibold text-white mb-1">Earn Rewards</div>
              <div className="text-sm text-zinc-400">
                Get credits, upgrades, and exclusive perks based on successful referrals
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-400">
            <strong>💡 Pro Tip:</strong> Quality over quantity. Refer professionals who'll actively 
            engage and create value. Our community thrives when every member contributes.
          </p>
        </div>
      </div>
    </div>
  );
}
