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
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (data.session) {
          // Get user profile to check if admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', data.session.user.id)
            .single();

          // Admin emails - these get redirected to /admin
          const adminEmails = ['nahdasheh@gmail.com', 'invite@thecirclenetwork.org'];

          // Smart redirect based on email
          if (profile && adminEmails.includes(profile.email)) {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } else {
          // No session, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
        <p className="text-white">Signing you in...</p>
      </div>
    </div>
  );
}
