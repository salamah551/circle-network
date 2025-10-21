import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import OnboardingWizard from '../OnboardingWizard';

export const dynamic = 'force-dynamic';

async function checkAccess() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
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

  // Check subscription status - only active subscribers can access onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, status, onboarding_completed, onboarding_profile, reputation_keywords')
    .eq('id', user.id)
    .single();
  
  // Allow access if subscription_status is 'active' or status is 'active'
  // (handles different schema variations)
  const hasActiveSubscription = profile?.subscription_status === 'active' || profile?.status === 'active';
  
  if (!hasActiveSubscription) {
    // Redirect to subscribe page if no active subscription
    redirect('/subscribe');
  }
  
  // Check if user has already completed onboarding
  // Check multiple indicators: onboarding_completed flag, onboarding_profile with completedAt, or reputation_keywords
  const isOnboardingComplete = 
    profile?.onboarding_completed === true ||
    (profile?.onboarding_profile && profile.onboarding_profile.completedAt) ||
    (profile?.onboarding_profile && profile.onboarding_profile.calibratedAt) ||
    (profile?.reputation_keywords && profile.reputation_keywords.length > 0);
  
  if (isOnboardingComplete) {
    // User has already completed onboarding, redirect to dashboard
    redirect('/dashboard');
  }
  
  return { user };
}

export default async function OnboardingStartPage() {
  await checkAccess();
  
  return <OnboardingWizard />;
}
