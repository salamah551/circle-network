'use client';
import { Crown, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Admin user IDs who can see preview callouts
const ADMIN_USER_IDS = ['9f305857-cf9b-47bd-aca1-75263d22973d'];

/**
 * LockedFeature renders a premium unlock panel for gated features.
 * - Shows admin preview callout for ADMIN_USER_IDS
 * - Renders unlock panel when no meaningful children provided
 * - Panel includes feature title, description, and upgrade CTA
 */
export default function LockedFeature({ 
  featureName = 'Premium Feature', 
  featureTitle,
  featureDescription = 'This feature is available to premium members.',
  unlockDate = 'November 10, 2025',
  currentUser,
  children 
}) {
  // Admin bypass - show preview callout but don't gate
  const isAdmin = currentUser && ADMIN_USER_IDS.includes(currentUser.id);
  
  // Determine if we should show the unlock panel
  // Show panel if: no children OR children is empty/whitespace only
  const hasChildren = children && (typeof children === 'string' ? children.trim() : true);
  const displayTitle = featureTitle || featureName;
  
  return (
    <>
      {isAdmin && (
        <div className="mb-4 px-4 py-3 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
          <Crown className="w-5 h-5 text-amber-400" />
          <div className="flex-1">
            <span className="text-sm text-amber-400 font-semibold block">
              👑 Admin Preview Mode
            </span>
            <span className="text-xs text-amber-400/70">
              You're viewing this feature as an admin
            </span>
          </div>
        </div>
      )}
      
      {!hasChildren && (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-black" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {displayTitle}
            </h2>
            
            <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
              {featureDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/subscribe"
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold rounded-xl transition-all flex items-center gap-2 group"
              >
                <span>Upgrade to Premium</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all border border-zinc-700"
              >
                Back to Dashboard
              </Link>
            </div>
            
            {unlockDate && (
              <p className="text-sm text-zinc-500 mt-6">
                Available from {unlockDate}
              </p>
            )}
          </div>
        </div>
      )}
      
      {hasChildren && children}
    </>
  );
}
