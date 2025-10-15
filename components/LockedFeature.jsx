'use client';
import { Calendar, Lock, Crown } from 'lucide-react';
import Link from 'next/link';

// Admin user IDs who can bypass feature locks
const ADMIN_USER_IDS = ['9f305857-cf9b-47bd-aca1-75263d22973d'];

export default function LockedFeature({ 
  featureName, 
  featureTitle,
  featureDescription,
  unlockDate = 'November 10, 2025',
  currentUser,
  children 
}) {
  // Admin bypass - you can always access
  const isAdmin = currentUser && ADMIN_USER_IDS.includes(currentUser.id);
  
  // Check if feature should be unlocked (November 10, 2025 at 12:00 AM ET)
  const launchDate = new Date('2025-11-10T00:00:00-05:00');
  const isUnlocked = Date.now() >= launchDate.getTime();
  
  // Show unlocked content if admin or past launch date
  if (isAdmin || isUnlocked) {
    return (
      <>
        {isAdmin && !isUnlocked && (
          <div className="mb-4 px-4 py-3 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl flex items-center gap-3 animate-pulse">
            <Crown className="w-5 h-5 text-amber-400" />
            <div className="flex-1">
              <span className="text-sm text-amber-400 font-semibold block">
                👑 Admin Preview Mode
              </span>
              <span className="text-xs text-amber-400/70">
                This feature is locked for members until {unlockDate}
              </span>
            </div>
          </div>
        )}
        {children}
      </>
    );
  }

  // Show locked state for regular members
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5 animate-pulse" />
          
          <div className="relative p-12 text-center">
            {/* Lock icon with glow */}
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping" />
              <Lock className="w-12 h-12 text-amber-400 relative z-10" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent">
              {featureTitle || 'Feature Coming Soon'}
            </h1>
            
            <p className="text-lg text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
              {featureDescription || 'This premium feature will be available after the full platform launch.'}
            </p>
            
            {/* Countdown display */}
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/20 rounded-xl mb-8 shadow-lg">
              <Calendar className="w-6 h-6 text-amber-400" />
              <div className="text-left">
                <div className="text-xs text-amber-400/70 font-medium uppercase tracking-wider">Unlocks On</div>
                <div className="text-lg text-amber-400 font-bold">{unlockDate}</div>
                <div className="text-xs text-emerald-400/70 mt-0.5">12:00 AM Eastern Time</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Link 
                href="/dashboard"
                className="inline-block px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg hover:shadow-amber-500/20"
              >
                Return to Dashboard
              </Link>
              
              <p className="text-sm text-zinc-500">
                ✨ You'll receive an email notification when this feature launches
              </p>
            </div>
          </div>
        </div>
        
        {/* Info footer */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-zinc-600">
            <span className="text-amber-400 font-semibold">🎉 Founding Member Benefit:</span> Early platform access
          </p>
          <p className="text-xs text-zinc-700">
            All premium features unlock automatically on launch day • No action needed
          </p>
        </div>
      </div>
    </div>
  );
}
