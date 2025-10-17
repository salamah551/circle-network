'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Check, X, User, MapPin, Briefcase, Target,
  Mail, Sparkles, TrendingUp, Users, Award, ExternalLink
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function IntrosPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [intros, setIntros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setProfile(profileData);

      // Get pending intros (mock data for now)
      setIntros([
        {
          id: 1,
          member: {
            full_name: 'Sarah Martinez',
            title: 'CEO',
            company: 'TechVentures Inc',
            location: 'San Francisco, CA',
            photo_url: null,
            expertise: ['AI/ML', 'SaaS', 'Healthcare Tech'],
            looking_for: 'Series A investors, technical co-founders',
            can_offer: 'Mentorship for early-stage founders, introductions to healthcare industry leaders'
          },
          match_score: 94,
          match_reason: 'Sarah is raising a Series A for her healthcare AI startup. You\'ve invested in 3 healthcare AI companies and mentioned you\'re actively looking for Series A opportunities. Strong alignment on investment thesis and industry expertise.',
          status: 'pending'
        },
        {
          id: 2,
          member: {
            full_name: 'Michael Torres',
            title: 'Managing Partner',
            company: 'Summit Capital',
            location: 'New York, NY',
            photo_url: null,
            expertise: ['Venture Capital', 'B2B SaaS', 'GTM Strategy'],
            looking_for: 'B2B SaaS startups ($1M-$5M ARR) for Series A investment',
            can_offer: 'Capital ($2M-$10M checks), operational support, LP introductions'
          },
          match_score: 87,
          match_reason: 'Michael invests in B2B SaaS companies at the exact stage and ARR range you\'re currently at. He has operational experience scaling GTM teams, which aligns with your stated need for go-to-market guidance.',
          status: 'pending'
        },
        {
          id: 3,
          member: {
            full_name: 'Jennifer Kim',
            title: 'VP of Product',
            company: 'Stripe',
            location: 'Seattle, WA',
            photo_url: null,
            expertise: ['Product Management', 'Fintech', 'Platform Strategy'],
            looking_for: 'Advisory roles at early-stage fintech startups',
            can_offer: 'Product strategy consulting, hiring support, platform architecture advice'
          },
          match_score: 76,
          match_reason: 'Jennifer has deep fintech product experience and is looking for advisory roles. You mentioned exploring payment infrastructure for your platform, and her expertise at Stripe directly addresses this need.',
          status: 'pending'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleAcceptIntro = async (introId) => {
    // TODO: Implement accept intro logic
    console.log('Accept intro:', introId);
    setIntros(intros.map(intro => 
      intro.id === introId ? { ...intro, status: 'accepted' } : intro
    ));
  };

  const handleDeclineIntro = async (introId) => {
    // TODO: Implement decline intro logic
    console.log('Decline intro:', introId);
    setIntros(intros.map(intro => 
      intro.id === introId ? { ...intro, status: 'declined' } : intro
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-pulse" />
          <p className="text-zinc-500">Loading your introductions...</p>
        </div>
      </div>
    );
  }

  const pendingIntros = intros.filter(i => i.status === 'pending');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Strategic Introductions</h1>
              <p className="text-sm text-zinc-400">AI-curated connections based on your goals</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 rounded-xl p-6 border border-amber-500/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingIntros.length}</div>
                <div className="text-sm text-zinc-400">Pending Intros</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-zinc-950 rounded-xl p-6 border border-emerald-500/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-zinc-400">Accepted</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 via-zinc-900 to-zinc-950 rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-zinc-400">Connections</div>
              </div>
            </div>
          </div>
        </div>

        {/* Intro Cards */}
        {pendingIntros.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No pending introductions</h3>
            <p className="text-zinc-400">Check back next week for new AI-curated connections</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingIntros.map((intro) => (
              <div
                key={intro.id}
                className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden"
              >
                {/* Match Score Badge */}
                <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 px-6 py-3 border-b border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-amber-400" />
                      <span className="font-semibold text-amber-400">
                        {intro.match_score}% Match
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500">AI-Recommended</span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Member Info */}
                  <div className="flex items-start gap-6 mb-6">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {intro.member.photo_url ? (
                        <img
                          src={intro.member.photo_url}
                          alt={intro.member.full_name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black text-xl font-bold">
                          {getInitials(intro.member.full_name)}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-1">{intro.member.full_name}</h3>
                      <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <Briefcase className="w-4 h-4" />
                        <span>{intro.member.title} at {intro.member.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400 mb-4">
                        <MapPin className="w-4 h-4" />
                        <span>{intro.member.location}</span>
                      </div>

                      {/* Expertise Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {intro.member.expertise.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Match Reasoning */}
                  <div className="bg-zinc-900/50 rounded-xl p-4 mb-6 border border-zinc-800">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-purple-400 mb-1 text-sm">Why this connection matters</div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{intro.match_reason}</p>
                      </div>
                    </div>
                  </div>

                  {/* What They're Looking For / Offering */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-400">Looking For</span>
                      </div>
                      <p className="text-sm text-zinc-300">{intro.member.looking_for}</p>
                    </div>

                    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold text-blue-400">Can Offer</span>
                      </div>
                      <p className="text-sm text-zinc-300">{intro.member.can_offer}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleAcceptIntro(intro.id)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Accept Introduction
                    </button>
                    <button
                      onClick={() => handleDeclineIntro(intro.id)}
                      className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Pass
                    </button>
                  </div>

                  <p className="text-xs text-zinc-500 text-center mt-4">
                    When you accept, we'll send a personalized email introduction to both of you
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}