import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import WelcomeClient from './WelcomeClient';

export const dynamic = 'force-dynamic';

async function checkAccess() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Check subscription status
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, status, needs_assessment_completed_at')
    .eq('id', user.id)
    .single();
  
  // Only allow active subscribers
  const hasActiveSubscription = profile?.subscription_status === 'active' || profile?.status === 'active';
  
  if (!hasActiveSubscription) {
    redirect('/subscribe');
  }
  
  // Check if user has already completed the needs assessment
  if (profile?.needs_assessment_completed_at) {
    // User has already completed onboarding, redirect to dashboard
    redirect('/dashboard');
  }
  
  return { user };
}

export default async function WelcomePage() {
  await checkAccess();
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <WelcomeClient />
    </Suspense>
  );
}
