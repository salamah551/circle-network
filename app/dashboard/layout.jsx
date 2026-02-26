// app/dashboard/layout.jsx
// Server component that enforces auth, subscription, and onboarding gates for dashboard access
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase';
import { validateArcEnvironment } from '@/lib/env/validate';
import { AlertTriangle } from 'lucide-react';

export default async function DashboardLayout({ children }) {
  const supabase = getSupabaseServerClient();
  
  // 1. Check authentication
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    redirect('/login');
  }
  
  // 2. Get user profile with subscription and onboarding status
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('subscription_status, needs_assessment_completed_at, is_admin')
    .eq('id', session.user.id)
    .single();
  
  if (profileError || !profile) {
    console.error('Error fetching profile or profile missing:', profileError);
    // Profile may not exist yet (e.g. payment just completed via magic link).
    // Redirect to /subscribe so the user can complete setup.
    redirect('/subscribe');
  }
  
  // 3. Check for active subscription
  const hasActiveSubscription = profile?.subscription_status === 'active' || 
                                  profile?.subscription_status === 'trialing';
  
  if (!hasActiveSubscription) {
    redirect('/subscribe');
  }
  
  // 4. Check onboarding gate - needs assessment must be completed
  if (!profile?.needs_assessment_completed_at) {
    redirect('/welcome/quiz');
  }
  
  // 5. Environment validation for dev/admin banner
  const envValidation = validateArcEnvironment();
  const isProduction = process.env.NODE_ENV === 'production';
  const isAdmin = profile?.is_admin === true;
  const showEnvBanner = envValidation.hasMissing && (!isProduction || isAdmin);
  
  return (
    <div>
      {showEnvBanner && (
        <EnvironmentWarningBanner missingKeys={envValidation.keys} />
      )}
      {children}
    </div>
  );
}

// Environment warning banner component
function EnvironmentWarningBanner({ missingKeys }) {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-amber-400 font-semibold">
            ⚠️ Missing ARC Environment Variables (Dev/Admin View)
          </p>
          <p className="text-xs text-amber-400/80 mt-1">
            The following keys are not configured: {missingKeys.join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
}
