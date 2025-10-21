// components/InviteCapture.jsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * InviteCapture Component
 * 
 * Captures invite code and invite ID from URL parameters and stores them
 * in localStorage for use in subsequent pages (apply, subscribe, etc.)
 * 
 * URL params:
 * - invite: The invitation code
 * - iid: The invitation ID (invite database record ID)
 */
export default function InviteCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const inviteCode = searchParams?.get('invite');
    const inviteId = searchParams?.get('iid');

    // Store invite parameters if present
    if (inviteCode) {
      localStorage.setItem('invite_code', inviteCode);
      console.log('📥 Captured invite code:', inviteCode);
    }

    if (inviteId) {
      localStorage.setItem('invite_id', inviteId);
      console.log('📥 Captured invite ID:', inviteId);
    }
  }, [searchParams]);

  // This component doesn't render anything
  return null;
}
