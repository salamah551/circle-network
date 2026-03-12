'use client';
import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Loader2 } from 'lucide-react';
import { identifyUser, trackEvent } from '@/lib/posthog';

function getSafeNext(next) {
  if (!next) return null;
  if (next.startsWith('/') && !next.startsWith('//')) return next;
  return null;
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double execution
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const code = searchParams.get('code');
        const next = getSafeNext(searchParams.get('next'));

        // Handle PKCE code exchange (e.g., password reset flow)
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Auth callback code exchange error:', error);
            router.push('/login?error=auth-callback-failed');
            return;
          }
          // Redirect to the intended destination after code exchange
          router.push(next || '/dashboard');
          return;
        }

        // Normal magic-link / OAuth callback — session should already be set
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          router.push('/login');
          return;
        }

        const email = data.session.user.email?.toLowerCase().trim();
        const userId = data.session.user.id;
        
        // Track user sign-in with PostHog
        identifyUser(userId, {
          email: email,
          signed_in_at: new Date().toISOString()
        });
        
        trackEvent('user_signed_in', {
          email: email,
          user_id: userId
        });
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, onboarding_completed')
          .eq('id', userId)
          .single();

        if (next) {
          router.push(next);
        } else if (profile?.is_admin) {
          router.push('/admin');
        } else if (profile?.onboarding_completed === false) {
          router.push('/onboarding/start');
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Signing you in...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Signing you in...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
