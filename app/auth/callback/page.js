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

        // Get email and log it for debugging
        const rawEmail = data.session.user.email;
        const email = rawEmail?.toLowerCase().trim();
        
        console.log('Raw email from session:', rawEmail);
        console.log('Cleaned email:', email);
        console.log('Checking against: nahdasheh@gmail.com and invite@thecirclenetwork.org');
        
        // Check if admin
        const isNahdasheh = email === 'nahdasheh@gmail.com';
        const isInvite = email === 'invite@thecirclenetwork.org';
        
        console.log('Is nahdasheh?', isNahdasheh);
        console.log('Is invite?', isInvite);
        
        if (isNahdasheh || isInvite) {
          console.log('✅ ADMIN - Redirecting to /admin');
          router.push('/admin');
        } else {
          console.log('❌ Not admin, redirecting to dashboard');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Signing you in...</p>
      </div>
    </div>
  );
}
