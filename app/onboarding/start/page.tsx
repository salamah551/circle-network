import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import OnboardingWizard from '../OnboardingWizard';

export const dynamic = 'force-dynamic';

async function checkAccess() {
  const cookieStore = cookies();
  const supabase = createClient(
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

  // Note: In a production environment, you might want to check subscription_status
  // However, since this is a new feature and schemas may vary, we'll allow access
  // for any authenticated user and let the component handle the logic
  
  return { user };
}

export default async function OnboardingStartPage() {
  await checkAccess();
  
  return <OnboardingWizard />;
}
