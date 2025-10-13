'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Sparkles, User, Building2, Target, 
  TrendingUp, Check, X, Loader2, MessageSquare, Eye,
  AlertCircle, RefreshCw, MapPin, Users
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [intros, setIntros] = useState([]);
  const [featureStatus, setFeatureStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      setError(null);
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        router.push('/login');
        return;
      }

      // Get user profile to check admin status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to load profile');
      }

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
      setError('Failed to load page. Please try again.');
      setIsLoading(false);
    }
  };

  const loadIntros = async (userId) => {
    try {
      setError(null);
      const { data, error: loadError } = await supabase
        .from('strategic_intros')
        .select(`
          *,
          suggested_member:profiles!strategic_intros_suggested_member_id_fkey(
            id,
            full_name,
            first_name,
            last_name,
            title,
            company,
            bio,
            expertise,
            location
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('confidence_score', { ascending: false })
        .limit(3);

      if (loadError) {
        console.error('Error loading intros:', loadError);
        throw new Error('Failed to load introductions');
      }

      setIntros(data || []);
    } catch (error) {
      console.error('Error loading intros:', error);
      setError('Failed to load introductions. Please try refreshing.');
    }
  };

  const handleAccept = async (introId, suggestedMemberId) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      setError(null);

      // Update intro status
      const { error: updateError } = await supabase
        .from('strategic_intros')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', introId)
        .eq('user_id', currentUser.id); // Add user_id check for security

      if (updateError) {
        throw new Error('Failed to accept introduction');
      }

      // Remove from list immediately for better UX
      setIntros(intros.filter(i => i.id !== introId));

      // Redirect to member profile
      router.push(`/members/${suggestedMemberId}`);
    } catch (error) {
      console.error('Error accepting intro:', error);
      setError('Failed to accept introduction. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSkip = async (introId) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('strategic_intros')
        .update({ 
          status: 'skipped',
          skipped_at: new Date().toISOString()
        })
        .eq('id', introId)
        .eq('user_id', currentUser.id); // Add user_id check for security

      if (updateError) {
        throw new Error('Failed to skip introduction');
      }

      // Remove from list
      setIntros(intros.filter(i => i.id !== introId));
      setIsProcessing(false);
    } catch (error) {
      console.error('Error skipping intro:', error);
      setError('Failed to skip introduction. Please try again.');
      setIsProcessing(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'M';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  // Show locked state if feature is not unlocked
  if (!featureStatus?.unlocked && !featureStatus?.adminBypass) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-zinc-800 bg-zinc-950 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </header>

        <LockedFeature
          featureName={featureStatus?.name || 'Strategic Intros'}
          featureDescription={featureStatus?.description || 'Get AI-curated connection recommendations'}
          featureValue={featureStatus?.value}
          className="min-h-[70vh]"
        >
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-48 animate-pulse" />
              ))}
            </div>
          </div>
        </LockedFeature>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="h-8 w-px bg-zinc-800" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Strategic Intros</h1>
                  <p className="text-sm text-zinc-500">AI-curated connections</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => loadIntros(currentUser?.id)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Intro Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Personalized for You</span>
          </div>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Every week, our AI analyzes member profiles, goals, and activity to suggest{' '}
            <span className="text-white font-semibold">3 high-value connections</span> personalized for you.
          </p>
        </div>

        {/* Intro Cards */}
        {intros.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 md:p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">New Intros Coming Soon</h3>
            <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
              We're analyzing member profiles and activity. Your personalized connection recommendations will appear here soon.
            </p>
            <button
              onClick={() => router.push('/members')}
              className="mt-8 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              <span>Browse Members Meanwhile</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {intros.map((intro, index) => (
              <div
                key={intro.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 hover:border-amber-500/50 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-medium text-sm">Recommendation</span>
                    <span className="text-zinc-600 font-medium text-sm">#{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-full">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-semibold">{intro.confidence_score || 85}% Match</span>
                  </div>
                </div>

                {/* Member Info */}
                <div className="flex items-start gap-4 md:gap-6 mb-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 text-black font-bold text-xl md:text-2xl">
                    {getInitials(intro.suggested_member?.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                      {intro.suggested_member?.full_name}
                    </h3>
                    <div className="space-y-1.5">
                      {intro.suggested_member?.title && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <User className="w-4 h-4 text-zinc-600" />
                          <span className="text-sm">{intro.suggested_member.title}</span>
                        </div>
                      )}
                      {intro.suggested_member?.company && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Building2 className="w-4 h-4 text-zinc-600" />
                          <span className="text-sm">{intro.suggested_member.company}</span>
                        </div>
                      )}
                      {intro.suggested_member?.location && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <MapPin className="w-4 h-4 text-zinc-600" />
                          <span className="text-sm">{intro.suggested_member.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Why This Connection */}
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Target className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-2">Why this connection matters:</h4>
                      <p className="text-zinc-400 leading-relaxed">{intro.reason || 'This member shares similar interests and goals with you.'}</p>
                    </div>
                  </div>
                  
                  {intro.mutual_benefits && (
                    <div className="flex items-start gap-3 pt-4 border-t border-zinc-700">
                      <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-2">Mutual benefits:</h4>
                        <p className="text-zinc-400 leading-relaxed">{intro.mutual_benefits}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expertise Tags */}
                {intro.suggested_member?.expertise && intro.suggested_member.expertise.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm text-zinc-500 mb-3">Areas of Expertise:</h4>
                    <div className="flex flex-wrap gap-2">
                      {intro.suggested_member.expertise.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleAccept(intro.id, intro.suggested_member_id)}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-all"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <MessageSquare className="w-5 h-5" />
                        <span>Connect Now</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => router.push(`/members/${intro.suggested_member_id}`)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-amber-500/50 text-white rounded-lg transition-all"
                  >
                    <Eye className="w-5 h-5" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => handleSkip(intro.id)}
                    disabled={isProcessing}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:cursor-not-allowed border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-white rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                    <span className="sm:hidden">Skip</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <p className="text-white font-semibold">How It Works</p>
          </div>
          <p className="text-zinc-500 text-sm max-w-2xl mx-auto">
            New recommendations are generated every Monday at 9 AM EST based on your profile, expertise, needs, and member activity. Check back weekly for fresh, high-value connections.
          </p>
        </div>
      </div>
    </div>
  );
}
