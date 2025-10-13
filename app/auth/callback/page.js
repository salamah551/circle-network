'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const hasRun = useRef(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    // Prevent double execution
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          router.push('/login');
          return;
        }

        const email = data.session.user.email?.toLowerCase().trim();
        
        if (email === 'nahdasheh@gmail.com' || email === 'invite@thecirclenetwork.org') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      }
    };

    handleCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Signing you in...</p>
      </div>
    </div>
  );
}
