'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Sparkles, User, Building2, Target, 
  TrendingUp, Check, X, Loader2, MessageSquare, Eye,
  AlertCircle, RefreshCw, MapPin, Users, Crown
} from 'lucide-react';
import Link from 'next/link';
import LockedFeature from '@/components/LockedFeature';
import { getFeatureStatus, isAdmin } from '@/lib/feature-flags';

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

      // Check feature status (strategic_intros is ALWAYS available)
      const status = getFeatureStatus('strategic_intros', profile);
      setFeatureStatus(status);

      // Strategic intros should always be unlocked
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
          partner:profiles!strategic_intros_partner_id_fkey(
            id,
            full_name,
            first_name,
            last_name,
            title,
            company,
            bio,
            expertise,
            location,
            photo_url,
            is_founding_member,
            membership_tier
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'proposed')
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

  const handleAccept = async (introId, partnerId) => {
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
        .eq('id', introId);

      if (updateError) {
        throw new Error('Failed to accept introduction');
      }

      // Create intro request for email automation
      const { error: requestError } = await supabase
        .from('intro_requests')
        .insert({
          requester_id: currentUser.id,
          target_member_id: partnerId,
          status: 'accepted',
          message: 'Accepted via Strategic Intros'
        });

      if (requestError) {
        console.error('Error creating intro request:', requestError);
      }

      // Remove from local state
      setIntros(prev => prev.filter(i => i.id !== introId));

      // Show success message
      alert('Introduction accepted! We\'ll send an email introduction shortly.');

      // Reload intros
      await loadIntros(currentUser.id);
    } catch (error) {
      console.error('Error accepting intro:', error);
      setError(error.message || 'Failed to accept introduction');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async (introId) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('strategic_intros')
        .update({ 
          status: 'declined',
          declined_at: new Date().toISOString()
        })
        .eq('id', introId);

      if (updateError) {
        throw new Error('Failed to decline introduction');
      }

      // Remove from local state
      setIntros(prev => prev.filter(i => i.id !== introId));

      // Reload intros
      await loadIntros(currentUser.id);
    } catch (error) {
      console.error('Error declining intro:', error);
      setError(error.message || 'Failed to decline introduction');
    } finally {
      setIsProcessing(false);
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

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  };

  const getConfidenceLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Potential Match';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Loading your intros...</p>
        </div>
      </div>
    );
  }

  // Strategic intros should ALWAYS be available, but show locked state if somehow not
  if (!featureStatus?.unlocked && !featureStatus?.adminBypass) {
    return (
      <LockedFeature
        featureName="strategic_intros"
        featureTitle="Strategic Introductions"
        featureDescription="AI-curated weekly connection recommendations. Get 3 high-value introductions every week with detailed context on why they matter."
        unlockDate="Available Now"
        currentUser={currentUser}
      >
        {/* This should never render - strategic intros always available */}
      </LockedFeature>
    );
  }

  const userIsAdmin = currentUser && isAdmin(currentUser);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Sparkles className="w-6 h-6 text-amber-400" />
              <div>
                <h1 className="text-xl font-bold">Strategic Introductions</h1>
                <p className="text-xs text-zinc-500">
                  AI-curated connections • {intros.length} pending
                </p>
              </div>
            </div>
            <button
              onClick={() => loadIntros(currentUser.id)}
              disabled={isProcessing}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Info Banner */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-transparent border border-amber-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                Weekly AI-Curated Introductions
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
                  Always Available
                </span>
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                Our AI analyzes the network to recommend 3 high-value connections every week based on your expertise, needs, and goals. 
                Accept intros to unlock automated email introductions.
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-amber-400" />
                  <span>Matched to your needs</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>High success rate</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-400" />
                  <span>New matches weekly</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-400">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Introductions List */}
        {intros.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-400 mb-3">No pending introductions</h3>
            <p className="text-zinc-600 mb-6 max-w-md mx-auto">
              Our AI is analyzing the network to find your next best connections. 
              Check back soon for personalized recommendations!
            </p>
            <button
              onClick={() => loadIntros(currentUser.id)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Check for New Intros
            </button>
          </div>
        ) : (
          <div className="space-y-6">
        {intros.map((intro, index) => {
  const member = intro.partner; // ✅ FIXED
  if (!member) return null;

  return (
    <div
      key={intro.id}
      className="p-6 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-amber-500/30 transition-all"
    >
      {/* Match Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 font-medium">
            Match #{index + 1}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getConfidenceColor(intro.confidence_score)}`}>
            {getConfidenceLabel(intro.confidence_score)} • {intro.confidence_score}%
          </span>
        </div>
        {member.is_founding_member && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400">
            <Crown className="w-3 h-3" />
            Founder
          </span>
        )}
      </div>

      {/* Member Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          {member.photo_url ? ( {/* ✅ FIXED - was avatar_url */}
            <img
              src={member.photo_url}
              alt={member.full_name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-bold text-2xl">
              {getInitials(member.full_name)}
            </div>
          )}
        </div>

                  {/* Member Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.full_name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-bold text-2xl">
                          {getInitials(member.full_name)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-1">{member.full_name}</h3>
                      {member.title && (
                        <p className="text-sm text-zinc-400 flex items-center gap-1 mb-1">
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          {member.title}
                          {member.company && ` at ${member.company}`}
                        </p>
                      )}
                      {member.location && (
                        <p className="text-sm text-zinc-500 flex items-center gap-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          {member.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                      {member.bio}
                    </p>
                  )}

                  {/* Expertise */}
                  {member.expertise && member.expertise.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2">Expertise</p>
                      <div className="flex flex-wrap gap-2">
                        {member.expertise.map((exp, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Match Reason */}
                  {intro.reason && (
                    <div className="mb-6 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1 font-semibold">
                        Why this match?
                      </p>
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        {intro.reason}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                    <button
                      onClick={() => handleAccept(intro.id, member.id)}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Accept Introduction
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDecline(intro.id)}
                      disabled={isProcessing}
                      className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Pass
                    </button>
                    <Link
                      href={`/profile/${member.id}`}
                      className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all"
                      title="View full profile"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
          <p className="text-xs text-zinc-500 text-center">
            💡 <strong className="text-zinc-400">Pro Tip:</strong> Accepting an intro triggers an automated email introduction to both parties. 
            You'll be CC'd and can take the conversation from there!
          </p>
        </div>
      </div>
    </div>
  );
}
