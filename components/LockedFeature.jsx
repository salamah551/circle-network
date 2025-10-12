'use client';
import { useState, useEffect } from 'react';
import { Lock, Clock, Sparkles } from 'lucide-react';
import { getTimeUntilLaunch, getLaunchDate } from '@/lib/feature-flags';

/**
 * LockedFeature Component
 * Displays elegant locked state for features before launch date
 */
import LaunchCountdown from './LaunchCountdown';

export default function LockedFeature({ 
  featureName, 
  featureDescription, 
  featureValue,
  children,
  className = ''
}) {
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilLaunch());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilLaunch());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const launchDate = getLaunchDate();
  const formattedDate = launchDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className={`relative ${className}`}>
      {/* Content (blurred) */}
      <div className="blur-sm opacity-30 pointer-events-none select-none">
        {children}
      </div>

      {/* Locked Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-[#0A0E27]/95 backdrop-blur-xl border border-[#E5C77E]/20 rounded-2xl p-8 max-w-lg mx-4 text-center">
          {/* Lock Icon */}
          <div className="w-16 h-16 bg-[#E5C77E]/10 border border-[#E5C77E]/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[#E5C77E]" />
          </div>

          {/* Feature Name */}
          <h3 className="text-2xl font-light text-white mb-2 tracking-wide">
            {featureName}
          </h3>

          {/* Description */}
          <p className="text-white/60 mb-4 font-light">
            {featureDescription}
          </p>

          {/* Value Proposition */}
          <div className="bg-[#E5C77E]/5 border border-[#E5C77E]/10 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#E5C77E] flex-shrink-0 mt-0.5" />
              <p className="text-white/80 text-sm font-light text-left">
                {featureValue}
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          {!timeRemaining.isLaunched && (
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 text-[#E5C77E]/70 text-sm mb-3">
                <Clock className="w-4 h-4" />
                <span className="tracking-wide font-light">Unlocks in:</span>
              </div>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-light text-[#E5C77E] tabular-nums">
                    {timeRemaining.days}
                  </div>
                  <div className="text-xs text-white/40 tracking-widest mt-1">DAYS</div>
                </div>
                <div className="self-center text-[#E5C77E]/30 text-2xl">:</div>
                <div className="text-center">
                  <div className="text-3xl font-light text-[#E5C77E] tabular-nums">
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-white/40 tracking-widest mt-1">HRS</div>
                </div>
                <div className="self-center text-[#E5C77E]/30 text-2xl">:</div>
                <div className="text-center">
                  <div className="text-3xl font-light text-[#E5C77E] tabular-nums">
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-white/40 tracking-widest mt-1">MIN</div>
                </div>
              </div>
            </div>
          )}

          {/* Launch Date */}
          <div className="pt-6 border-t border-[#E5C77E]/10">
            <p className="text-white/40 text-sm font-light">
              Available to all founding members on{' '}
              <span className="text-[#E5C77E]">{formattedDate}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline Locked Feature Badge
 * Smaller version for navigation items
 */
export function LockedBadge({ timeRemaining }) {
  if (timeRemaining?.isLaunched) return null;
  
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#E5C77E]/10 border border-[#E5C77E]/30 text-[#E5C77E] text-xs rounded-full ml-2">
      <Lock className="w-3 h-3" />
      <span className="font-light">{timeRemaining?.days}d</span>
    </span>
  );
}

/**
 * Feature Unlock Notification
 * Shows when a feature becomes available
 */
export function FeatureUnlockedNotification({ featureName, onDismiss }) {
  return (
    <div className="fixed bottom-8 right-8 bg-[#0A0E27] border border-[#E5C77E]/30 rounded-xl p-6 max-w-sm shadow-2xl animate-fadeIn z-50">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#E5C77E]/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-[#E5C77E]" />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-light text-lg mb-1">Feature Unlocked!</h4>
          <p className="text-white/60 text-sm font-light">
            <span className="text-[#E5C77E]">{featureName}</span> is now available to you.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-white/40 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}


/** Countdown adornment */
export function LockedCountdownBadge() {
  if (typeof window === 'undefined') return null;
  const target = process.env.NEXT_PUBLIC_LAUNCH_DATE;
  if (!target) return null;
  return <div className="mt-4"><LaunchCountdown target={target} /></div>;
}
