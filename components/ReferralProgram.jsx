'use client';
import { useState, useEffect } from 'react';
import { Gift, Users, Copy, Check, Mail, Share2, Award } from 'lucide-react';
import { showToast } from './Toast';

export default function ReferralProgram({ userId, userEmail, userName }) {
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadReferralCode();
    }
  }, [userId]);

  const loadReferralCode = async () => {
    try {
      // Use YOUR existing API endpoint
      const response = await fetch('/api/referrals/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.referral_code) {
        setReferralCode(data.referral_code);
        setReferralLink(data.referral_link);
      }
    } catch (error) {
      console.error('Error loading referral code:', error);
      showToast('Failed to load referral code', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      showToast('Referral link copied!', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      showToast('Failed to copy link', 'error');
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join Circle Network - Exclusive Invitation');
    const body = encodeURIComponent(
      `Hi,\n\nI'm part of Circle Network, an exclusive community of accomplished professionals across all industries. I think you'd be a great fit.\n\nHere's your personal invitation link:\n${referralLink}\n\nCircle Network is invitation-only with only 250 founding member spots available. The platform connects you with high-achievers for meaningful partnerships, strategic introductions, and accelerated growth.\n\nKey benefits:\n• AI-powered strategic introductions\n• Direct access to decision-makers\n• Exclusive events and roundtables\n• Problem-solving support from experts\n\nPlatform launches November 10, 2025. Join now to lock in founding member pricing ($179/mo).\n\nMembership tiers:\n• Founding: $179/mo\n• Premium: $299/mo\n• Elite: $499/mo\n\nHope to see you inside!\n\n${userName || 'A fellow member'}`
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
              Know someone who'd thrive in Circle Network? Share your referral link and earn rewards when they join.
            </p>
          </div>
        </div>

        {/* Your Referral Code Display */}
        <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 mb-4">
          <div className="text-sm text-zinc-500 mb-2">Your Referral Code</div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{referralCode}</div>
        </div>
      </div>

      {/* Your Referral Link */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-amber-400" />
          Your Referral Link
        </h3>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg font-mono text-sm text-zinc-300 overflow-x-auto">
            {referralLink}
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
          {rewards.map((reward, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border bg-zinc-800/50 border-zinc-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{reward.icon}</span>
                  <div>
                    <div className="font-semibold text-white">{reward.reward}</div>
                    <div className="text-xs text-zinc-500">
                      {reward.threshold} successful referral{reward.threshold !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
