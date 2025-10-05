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
        console.log('🔍 Starting auth callback...');
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          router.push('/login');
          return;
        }

        if (!data.session) {
          console.log('❌ No session found');
          router.push('/login');
          return;
        }

        console.log('✅ Session found for:', data.session.user.email);
        console.log('🆔 User ID:', data.session.user.id);

        // Check admin status from DATABASE
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin, email, full_name')
          .eq('id', data.session.user.id)
          .single();

        if (profileError) {
          console.error('⚠️ FULL Profile error:', profileError);
          console.error('⚠️ Error code:', profileError.code);
          console.error('⚠️ Error message:', profileError.message);
          console.error('⚠️ Error details:', profileError.details);
          router.push('/dashboard');
          return;
        }

        console.log('📊 Profile loaded:', {
          email: profile.email,
          isAdmin: profile.is_admin,
          name: profile.full_name
        });

        // Redirect based on database admin status
        if (profile.is_admin === true) {
          console.log('🎯 ADMIN DETECTED! Redirecting to /admin');
          router.push('/admin');
        } else {
          console.log('👤 Regular user. Redirecting to /dashboard');
          router.push('/dashboard');
        }

      } catch (error) {
        console.error('💥 Auth callback error:', error);
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
        <p className="text-zinc-500 text-sm mt-2">Checking permissions...</p>
      </div>
    </div>
  );
}
