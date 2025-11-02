'use client';
import { useState, useEffect } from 'react';
import { Gift, Copy, Check, Users, Send, ExternalLink } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

// Use singleton browser client to prevent "Multiple GoTrueClient instances" warning
const supabase = getSupabaseBrowserClient();

/**
 * ReferralPanel - Shows member's invite allowance and usage
 * Allowances: Founding (5), Premium (2), Elite (5)
 */
export default function ReferralPanel({ userId, userTier = 'founding' }) {
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [allowance, setAllowance] = useState(0);
  const [used, setUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Set allowance based on tier
  const tierAllowances = {
    founding: 5,
    premium: 2,
    elite: 5
  };

  useEffect(() => {
    if (userId) {
      loadReferralData();
    }
  }, [userId, userTier]);

  const loadReferralData = async () => {
    try {
      setIsLoading(true);

      // Set allowance based on tier
      const tierAllowance = tierAllowances[userTier?.toLowerCase()] || 2;
      setAllowance(tierAllowance);

      // Get user's profile to find their referral code
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', userId)
        .single();

      let referralCode = profile?.referral_code;

      // Generate referral code if doesn't exist
      if (!referralCode) {
        const { data: newCode } = await supabase
          .rpc('generate_referral_code');
        
        if (newCode) {
          referralCode = newCode;
          await supabase
            .from('profiles')
            .update({ referral_code: newCode })
            .eq('id', userId);
        }
      }

      // Build referral link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';
      setReferralLink(`${baseUrl}/apply?ref=${referralCode}`);

      // Count claimed invites (only those actually used)
      const { count } = await supabase
        .from('invites')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)
        .eq('status', 'claimed');

      setUsed(count || 0);

    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const remaining = Math.max(0, allowance - used);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <div className="h-24 bg-zinc-800 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-500/10 via-zinc-900 to-blue-500/10 rounded-xl p-4 sm:p-6 border border-purple-500/20">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Invite Friends & Earn</h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Share Circle Network with your network
          </p>
        </div>
      </div>

      {/* Allowance Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-black/40 rounded-lg p-3 sm:p-4 border border-purple-500/20 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-purple-400">{allowance}</div>
          <div className="text-xs text-zinc-500 mt-1">Total</div>
        </div>
        <div className="bg-black/40 rounded-lg p-3 sm:p-4 border border-blue-500/20 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-400">{used}</div>
          <div className="text-xs text-zinc-500 mt-1">Used</div>
        </div>
        <div className="bg-black/40 rounded-lg p-3 sm:p-4 border border-emerald-500/20 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{remaining}</div>
          <div className="text-xs text-zinc-500 mt-1">Remaining</div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium text-zinc-400 mb-2">
          Your Personal Invite Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-black/40 border border-zinc-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            onClick={copyToClipboard}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="/invite"
          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold"
        >
          <Send className="w-4 h-4" />
          Send Direct Invite
        </a>
        <a
          href="/referrals"
          className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold border border-zinc-700"
        >
          <Users className="w-4 h-4" />
          View Referrals
        </a>
      </div>

      {/* Rewards Info */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-purple-500/20">
        <div className="text-xs sm:text-sm text-zinc-400 mb-3">
          <strong className="text-purple-400">Earn rewards</strong> when your invites join:
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="text-purple-400">•</span>
            <span>1 invite = $100 account credit</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="text-purple-400">•</span>
            <span>3 invites = Free month of Premium</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="text-purple-400">•</span>
            <span>5 invites = Free Premium upgrade (1 year)</span>
          </div>
        </div>
      </div>
    </div>
  );
}