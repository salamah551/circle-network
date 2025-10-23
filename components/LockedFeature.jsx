'use client';
import { Crown } from 'lucide-react';

// Admin user IDs who can see preview callouts
const ADMIN_USER_IDS = ['9f305857-cf9b-47bd-aca1-75263d22973d'];

/**
 * LockedFeature is now a pass-through wrapper that displays content without gating.
 * Admin users see a preview callout to indicate early access.
 */
export default function LockedFeature({ 
  featureName, 
  featureTitle,
  featureDescription,
  unlockDate = 'November 10, 2025',
  currentUser,
  children 
}) {
  // Admin bypass - show preview callout but don't gate
  const isAdmin = currentUser && ADMIN_USER_IDS.includes(currentUser.id);
  
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
      {children}
    </>
  );
}
