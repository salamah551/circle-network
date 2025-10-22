'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Redirect page for /invite/accept
 * 
 * This page handles the invite acceptance flow by reading the code and email
 * query parameters and redirecting to the root page (/) which already has
 * the logic to handle these parameters.
 * 
 * This fixes the 404 error when users navigate to /invite/accept from the apply form.
 */
function InviteAcceptRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get code and email from query params
    const code = searchParams.get('code');
    const email = searchParams.get('email');
    
    // Build redirect URL with params
    const params = new URLSearchParams();
    if (code) params.set('code', code);
    if (email) params.set('email', email);
    
    const redirectUrl = `/?${params.toString()}`;
    
    // Immediately redirect to root with params
    router.replace(redirectUrl);
  }, [router, searchParams]);

  // Show loading spinner while redirecting
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm">Redirecting...</p>
      </div>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    }>
      <InviteAcceptRedirect />
    </Suspense>
  );
}
