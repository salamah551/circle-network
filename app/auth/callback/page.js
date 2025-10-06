'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          router.push('/login');
          return;
        }

        // Simple check - just use email from session
        const email = data.session.user.email?.toLowerCase();
        
        if (email === 'nahdasheh@gmail.com' || email === 'invite@thecirclenetwork.org') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
    </div>
  );
}
