'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Sparkles, User, Building2, Target, 
  TrendingUp, Check, X, Loader2, MessageSquare, Eye
} from 'lucide-react';
import LockedFeature from '@/components/LockedFeature';
import { getFeatureStatus } from '@/lib/feature-flags';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function StrategicIntrosPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [intros, setIntros] = useState([]);
  const [featureStatus, setFeatureStatus] = useState(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      // Get user profile to check admin status
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setCurrentUser(profile);

      // Check feature status
      const status = getFeatureStatus('strategic_intros', profile);
      setFeatureStatus(status);

      if (status.unlocked || status.adminBypass) {
        await loadIntros(session.user.id);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const loadIntros = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('strategic_intros')
        .select(`
          *,
          suggested_member:profiles!strategic_intros_suggested_member_id_fkey(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('confidence_score', { ascending: false })
        .limit(3);

      if (error) throw error;
      setIntros(data || []);
    } catch (error) {
      console.error('Error loading intros:', error);
    }
  };

  const handleAccept = async (introId, suggestedMemberId) => {
    try {
      // Update intro status
      const { error } = await supabase
        .from('strategic_intros')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', introId);

      if (error) throw error;

      // Remove from list
      setIntros(intros.filter(i => i.id !== introId));

      // Redirect to member profile or create conversation
      router.push(`/members/${suggestedMemberId}`);
    } catch (error) {
      console.error('Error accepting intro:', error);
    }
  };

  const handleSkip = async (introId) => {
    try {
      const { error } = await supabase
        .from('strategic_intros')
        .update({ status: 'skipped' })
        .eq('id', introId);

      if (error) throw error;

      // Remove from list
      setIntros(intros.filter(i => i.id !== introId));
    } catch (error) {
      console.error('Error skipping intro:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'M';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E5C77E] animate-spin" />
      </div>
    );
  }

  // Show locked state if feature is not unlocked
  if (!featureStatus?.unlocked && !featureStatus?.adminBypass) {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white">
        <header className="border-b border-[#E5C77E]/10 bg-[#0A0E27]/90 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-[#E5C77E]/70 hover:text-[#E5C77E] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-light tracking-wide">Dashboard</span>
              </button>
            </div>
          </div>
        </header>

        <LockedFeature
          featureName={featureStatus?.name}
          featureDescription={featureStatus?.description}
          featureValue={featureStatus?.value}
          className="min-h-[70vh]"
        >
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 h-48" />
              ))}
            </div>
          </div>
        </LockedFeature>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* Header */}
      <header className="border-b border-[#E5C77E]/10 bg-[#0A0E27]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-[#E5C77E]/70 hover:text-[#E5C77E] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-light tracking-wide">Dashboard</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E5C77E]/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#E5C77E]" />
                </div>
                <div>
                  <h1 className="text-2xl font-light tracking-wide">Strategic Intros</h1>
                  <p className="text-sm text-white/40 font-light">AI-curated connections</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
        {/* Intro Section */}
        <div className="mb-12 text-center">
          <p className="text-xl text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
            Every week, our AI analyzes member profiles, goals, and activity to suggest{' '}
            <span className="text-[#E5C77E]">3 high-value connections</span> personalized for you.
          </p>
        </div>

        {/* Intro Cards */}
        {intros.length === 0 ? (
          <div className="bg-white/[0.02] border border-[#E5C77E]/10 rounded-2xl p-16 text-center">
            <div className="w-20 h-20 bg-[#E5C77E]/10 border border-[#E5C77E]/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-[#E5C77E]" />
            </div>
            <h3 className="text-2xl font-light mb-3">New Intros Coming Soon</h3>
            <p className="text-white/50 font-light max-w-md mx-auto">
              We're analyzing member profiles and activity. Your personalized connection recommendations will appear here by next Monday.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {intros.map((intro, index) => (
              <div
                key={intro.id}
                className="bg-white/[0.02] border border-[#E5C77E]/10 rounded-2xl p-8 hover:border-[#E5C77E]/30 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-1">
                    <span className="text-[#E5C77E] font-light text-sm">Recommendation</span>
                    <span className="text-white/40 font-light text-sm">#{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#E5C77E]/10 border border-[#E5C77E]/30 rounded-full">
                    <TrendingUp className="w-4 h-4 text-[#E5C77E]" />
                    <span className="text-[#E5C77E] text-sm font-light">{intro.confidence_score}% Match</span>
                  </div>
                </div>

                {/* Member Info */}
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#E5C77E] to-[#E5C77E]/60 rounded-full flex items-center justify-center flex-shrink-0 text-[#0A0E27] font-bold text-2xl">
                    {getInitials(intro.suggested_member?.full_name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-light text-white mb-2">
                      {intro.suggested_member?.full_name}
                    </h3>
                    <div className="space-y-1">
                      {intro.suggested_member?.title && (
                        <div className="flex items-center gap-2 text-white/70">
                          <Building2 className="w-4 h-4 text-white/40" />
                          <span className="font-light">{intro.suggested_member.title}</span>
                        </div>
                      )}
                      {intro.suggested_member?.company && (
                        <div className="flex items-center gap-2 text-white/70">
                          <User className="w-4 h-4 text-white/40" />
                          <span className="font-light">{intro.suggested_member.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Why This Connection */}
                <div className="bg-[#E5C77E]/5 border border-[#E5C77E]/10 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Target className="w-5 h-5 text-[#E5C77E] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-light mb-2 text-lg">Why this connection matters:</h4>
                      <p className="text-white/70 font-light leading-relaxed">{intro.reason}</p>
                    </div>
                  </div>
                  
                  {intro.mutual_benefits && (
                    <div className="flex items-start gap-3 pt-4 border-t border-[#E5C77E]/10">
                      <Sparkles className="w-5 h-5 text-[#E5C77E] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-white font-light mb-2">Mutual benefits:</h4>
                        <p className="text-white/70 font-light leading-relaxed">{intro.mutual_benefits}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAccept(intro.id, intro.suggested_member_id)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#E5C77E]/90 hover:bg-[#E5C77E] text-[#0A0E27] rounded-lg transition-all font-light"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Connect Now</span>
                  </button>
                  <button
                    onClick={() => router.push(`/members/${intro.suggested_member_id}`)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-[#E5C77E]/20 hover:border-[#E5C77E]/50 text-white rounded-lg transition-all font-light"
                  >
                    <Eye className="w-5 h-5" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => handleSkip(intro.id)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-12 bg-white/[0.02] border border-[#E5C77E]/10 rounded-xl p-6 text-center">
          <p className="text-white/50 text-sm font-light">
            New recommendations generated every Monday at 9 AM EST. Check back weekly for fresh connections.
          </p>
        </div>
      </div>
    </div>
  );
}
