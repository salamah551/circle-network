'use client';
import { Crown, Star, Zap } from 'lucide-react';

export default function TierBadge({ tier, size = 'default', showLabel = true }) {
  if (!tier || tier === 'founding') {
    // Founding members get a subtle badge
    return showLabel ? (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full ${
        size === 'small' ? 'text-xs' : 'text-sm'
      }`}>
        <Crown className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} style={{ color: '#D4AF37' }} />
        <span className="font-semibold" style={{ color: '#D4AF37' }}>Founding</span>
      </div>
    ) : (
      <Crown className={size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: '#D4AF37' }} />
    );
  }

  if (tier === 'premium') {
    return showLabel ? (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full ${
        size === 'small' ? 'text-xs' : 'text-sm'
      }`}>
        <Star className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} style={{ color: '#a78bfa' }} />
        <span className="font-semibold" style={{ color: '#a78bfa' }}>Premium</span>
      </div>
    ) : (
      <Star className={size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: '#a78bfa' }} />
    );
  }

  if (tier === 'elite') {
    return showLabel ? (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 rounded-full ${
        size === 'small' ? 'text-xs' : 'text-sm'
      }`}>
        <Zap className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} style={{ color: '#D4AF37' }} />
        <span className="font-bold bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
          ELITE
        </span>
      </div>
    ) : (
      <Zap className={size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: '#D4AF37' }} />
    );
  }

  return null;
}

// Helper function to get tier display info
export function getTierInfo(tier) {
  const tiers = {
    founding: {
      name: 'Founding',
      color: '#D4AF37',
      icon: Crown,
      priority: 1
    },
    premium: {
      name: 'Premium',
      color: '#a78bfa',
      icon: Star,
      priority: 2
    },
    elite: {
      name: 'Elite',
      color: '#D4AF37',
      icon: Zap,
      priority: 3
    }
  };

  return tiers[tier?.toLowerCase()] || tiers.founding;
}
