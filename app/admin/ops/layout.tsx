import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * Server-side layout for /admin/ops
 * Adds server-side guard to prevent client-side login loops
 * 
 * Requirements:
 * - OPS_ADMIN_ENABLED must be "true"
 * - User must be authenticated and have is_admin=true
 * - Does NOT expose OPS_API_KEY or other secrets client-side
 */
export default async function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if ops console is enabled
  if (process.env.OPS_ADMIN_ENABLED !== 'true') {
    // Return 404-like response without exposing that the route exists
    redirect('/admin');
  }

  try {
    // Server-side session check
    const supabase = getSupabaseServerClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      redirect('/login');
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      // User is not admin, redirect to regular admin dashboard
      redirect('/admin');
    }

    // All checks passed, render the ops console
    return <>{children}</>;
  } catch (error) {
    // On any error, redirect to admin dashboard
    console.error('Ops layout error:', error);
    redirect('/admin');
  }
}
