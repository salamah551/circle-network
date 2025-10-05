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
        
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          throw error;
        }

        if (data.session) {
          console.log('✅ Session found for user:', data.session.user.email);
          
          // Get user profile with proper error handling
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', data.session.user.id)
            .single();

          if (profileError) {
            console.error('⚠️ Profile fetch error:', profileError);
            // If profile doesn't exist yet, use email from session
            const userEmail = data.session.user.email?.toLowerCase().trim() || '';
            console.log('📧 Using session email:', userEmail);
            
            const adminEmails = ['nahdasheh@gmail.com', 'invite@thecirclenetwork.org'];
            
            if (adminEmails.includes(userEmail)) {
              console.log('🎯 Admin detected! Redirecting to /admin');
              router.push('/admin');
            } else {
              console.log('👤 Regular user. Redirecting to /dashboard');
              router.push('/dashboard');
            }
            return;
          }

          // Normalize email for comparison
          const userEmail = profile?.email?.toLowerCase().trim() || '';
          console.log('📧 Profile email:', userEmail);
          
          // Admin emails (hardcoded for security)
          const adminEmails = ['nahdasheh@gmail.com', 'invite@thecirclenetwork.org'];
          
          // Check if admin
          if (adminEmails.includes(userEmail)) {
            console.log('🎯 Admin detected! Redirecting to /admin');
            router.push('/admin');
          } else {
            console.log('👤 Regular user. Redirecting to /dashboard');
            router.push('/dashboard');
          }
        } else {
          console.log('❌ No session found. Redirecting to login');
          router.push('/login');
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
        <p className="text-zinc-500 text-sm mt-2">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
