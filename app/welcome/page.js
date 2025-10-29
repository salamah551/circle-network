'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Check, ArrowRight, Users, MessageSquare, Calendar, Sparkles, Crown, Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function WelcomePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndNotify();
  }, []);

  useEffect(() => {
    if (!loading && profile) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Redirect new paid users to onboarding if they haven't completed it
            // Check if user has completed onboarding
            const hasCompletedOnboarding = profile.onboarding_completed || profile.onboarding_completed_at;
            
            if (!hasCompletedOnboarding) {
              router.push('/onboarding/start');
            } else {
              router.push('/dashboard');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, profile, router]);

  const checkAuthAndNotify = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push('/login');
        return;
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
      } else {
        setProfile(profileData);
        
        // Notify admin of new signup
        try {
          await fetch('/api/admin/notify-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: profileData.email || session.user.email,
              userName: profileData.full_name || 'New Member',
              membershipTier: profileData.membership_tier || 'founding'
            })
          });
        } catch (notifyError) {
          console.error('Error notifying admin:', notifyError);
          // Don't block user experience if notification fails
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const isFoundingMember = profile?.is_founding_member || profile?.membership_tier === 'founding' || profile?.membership_tier === 'inner-circle';
  const isCoreMember = profile?.membership_tier === 'core' || profile?.membership_tier === 'premium';

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Circle Network! 
          </h1>
          {isFoundingMember && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-semibold">You're an Inner Circle (Founding Member)</span>
            </div>
          )}
          {isCoreMember && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
              <Crown className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-semibold">You're a Core (Charter Member)</span>
            </div>
          )}
          <p className="text-xl text-zinc-400">
            Your journey to meaningful connections starts now
          </p>
        </div>

        {/* Member Card */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-500/30 rounded-2xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                {isFoundingMember && (
                  <div className="text-sm text-amber-400 font-semibold mb-1">INNER CIRCLE (FOUNDING MEMBER)</div>
                )}
                {isCoreMember && (
                  <div className="text-sm text-purple-400 font-semibold mb-1">CORE (CHARTER MEMBER)</div>
                )}
                <div className="text-2xl font-bold">{profile?.full_name || 'Member'}</div>
                {profile?.title && profile?.company && (
                  <div className="text-zinc-400 mt-1">{profile.title} at {profile.company}</div>
                )}
              </div>
              <div className="w-16 h-16">
                <svg viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" stroke="#D4AF37" strokeWidth="2" fill="none"/>
                  <circle cx="20" cy="20" r="12" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
                  <circle cx="20" cy="20" r="6" fill="#D4AF37"/>
                </svg>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-zinc-500 mb-1">Member Since</div>
                <div className="font-semibold">
                  {profile?.created_at 
                    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  }
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-500 mb-1">Membership</div>
                <div className="font-semibold text-amber-400 capitalize">
                  {profile?.membership_tier || 'Founding'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">What's Next?</h2>
          
          <div className="space-y-6">
            {[
              {
                icon: Users,
                iconBg: 'bg-emerald-500/20',
                iconColor: 'text-emerald-400',
                title: 'Complete Your Profile',
                description: 'Add your expertise, what you\'re looking for, and what you can offer',
                action: 'Set up profile',
                link: '/settings'
              },
              {
                icon: Sparkles,
                iconBg: 'bg-amber-500/20',
                iconColor: 'text-amber-400',
                title: 'Review Strategic Introductions',
                description: 'We\'ve already matched you with potential connections based on your profile',
                action: 'View intros',
                link: '/intros'
              },
              {
                icon: MessageSquare,
                iconBg: 'bg-blue-500/20',
                iconColor: 'text-blue-400',
                title: 'Browse Members',
                description: 'Explore the directory of 250 accomplished professionals',
                action: 'Browse members',
                link: '/members'
              },
              {
                icon: Calendar,
                iconBg: 'bg-purple-500/20',
                iconColor: 'text-purple-400',
                title: 'Join Community Events',
                description: 'Exclusive roundtables, workshops, and networking sessions',
                action: 'See events',
                link: '/events'
              }
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div 
                  key={i}
                  className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-amber-500/30 transition-all group"
                >
                  <div className={`w-12 h-12 ${step.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${step.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-zinc-400 mb-3">{step.description}</p>
                    <button
                      onClick={() => router.push(step.link)}
                      className="text-sm text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      {step.action}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inner Circle (Founding Member) Benefits */}
        {isFoundingMember && (
          <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Your Inner Circle (Founding Member) Benefits</h2>
                <p className="text-zinc-400">You've locked in exclusive advantages with full ARC™ access</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Lifetime founding member rate (never increases)',
                'Full ARC™ AI features included',
                'Inner Circle (Founding Member) badge on profile',
                'Priority in strategic intro matching',
                'Direct input on platform development',
                'Early access to all new features'
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core (Charter Member) Benefits */}
        {isCoreMember && (
          <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Your Core (Charter Member) Benefits</h2>
                <p className="text-zinc-400">Immediate but limited ARC™ access with exclusive features</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Immediate limited ARC™ AI access',
                'Core (Charter Member) badge on profile',
                'Strategic introductions weekly',
                'Access to exclusive community events',
                'Premium member directory',
                'Early access to new features'
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auto-redirect */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl mb-4">
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
            <span className="text-zinc-400">
              Redirecting in <strong className="text-white">{countdown}</strong> seconds...
            </span>
          </div>
          <div>
            <button
              onClick={() => {
                const hasCompletedOnboarding = profile?.onboarding_completed || profile?.onboarding_completed_at;
                router.push(hasCompletedOnboarding ? '/dashboard' : '/onboarding/start');
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold text-sm flex items-center gap-2 mx-auto"
            >
              Continue Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}