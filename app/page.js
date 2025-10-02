'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowRight, Check, Users, MessageSquare, Calendar, 
  Target, TrendingUp, Zap, X, Loader2, Mail, Shield,
  Clock, Award, Gift, Crown
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Launch date: October 15, 2025
const LAUNCH_DATE = new Date('2025-10-15T00:00:00').getTime();

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitPopupShown, setExitPopupShown] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showExistingMemberPopup, setShowExistingMemberPopup] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = LAUNCH_DATE - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Exit intent detection (only once per session)
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !exitPopupShown && !showExitPopup) {
        setShowExitPopup(true);
        setExitPopupShown(true);
      }
    };
    
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [exitPopupShown, showExitPopup]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    try {
      const response = await fetch('/api/auth/validate-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, inviteCode })
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if user already exists
        if (data.error && data.error.includes('already')) {
          setShowExistingMemberPopup(true);
          setIsValidating(false);
          return;
        }
        
        setError(data.error || 'Invalid invite code or email');
        setIsValidating(false);
        return;
      }

      // Send magic link
      const magicLinkResponse = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, inviteCode })
      });

      if (magicLinkResponse.ok) {
        setShowSuccessMessage(true);
        setIsValidating(false);
      } else {
        setError('Failed to send magic link. Please try again.');
        setIsValidating(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsValidating(false);
    }
  };

  const isLaunched = new Date().getTime() >= LAUNCH_DATE;

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Countdown Banner - Only show before launch */}
      {!isLaunched && (
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-purple-600 text-white py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-4 text-center flex-wrap">
              <span className="font-bold text-sm sm:text-base">🚀 Official Launch:</span>
              <div className="flex gap-2 sm:gap-4">
                <div className="text-center">
                  <div className="font-bold text-lg sm:text-2xl">{countdown.days}</div>
                  <div className="text-xs opacity-90">DAYS</div>
                </div>
                <div className="text-lg sm:text-2xl font-bold">:</div>
                <div className="text-center">
                  <div className="font-bold text-lg sm:text-2xl">{countdown.hours}</div>
                  <div className="text-xs opacity-90">HRS</div>
                </div>
                <div className="text-lg sm:text-2xl font-bold">:</div>
                <div className="text-center">
                  <div className="font-bold text-lg sm:text-2xl">{countdown.minutes}</div>
                  <div className="text-xs opacity-90">MIN</div>
                </div>
                <div className="text-lg sm:text-2xl font-bold">:</div>
                <div className="text-center">
                  <div className="font-bold text-lg sm:text-2xl">{countdown.seconds}</div>
                  <div className="text-xs opacity-90">SEC</div>
                </div>
              </div>
              <span className="text-xs sm:text-sm opacity-90">October 15, 2025</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/10" />
        
        {/* Navigation */}
        <nav className="relative border-b border-white/10 bg-[#0A0F1E]/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* New Logo with Concentric Circles */}
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="22" stroke="url(#gold-gradient)" strokeWidth="2.5" fill="none"/>
                  <circle cx="24" cy="24" r="14" stroke="url(#amber-gradient)" strokeWidth="2" fill="none"/>
                  <circle cx="24" cy="24" r="7" fill="url(#gold-gradient)"/>
                  <defs>
                    <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                    <linearGradient id="amber-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FBBF24" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-2xl font-bold text-white">The Circle</span>
              </div>
              
              <a 
                href="/login"
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                Member Login
              </a>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Urgency Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full mb-8 animate-pulse">
              <Zap className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-bold">
                Founding Member Spots Filling Fast • Lock Your Rate Now
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Stop Building Alone.<br/>
              <span className="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                Join 1,000 Founders
              </span><br/>
              Who Actually Help Each Other Win.
            </h1>
            
            <p className="text-xl md:text-2xl text-white/70 mb-12 leading-relaxed max-w-3xl mx-auto">
              The Circle is where ambitious founders get introductions that close deals, 
              advice that actually works, and partnerships that scale—without the BS of 
              LinkedIn or cold DMs that go nowhere.
            </p>

            {/* Success Message - Check Your Email */}
            {showSuccessMessage ? (
              <div className="max-w-2xl mx-auto bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-8 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Check Your Email!</h3>
                <p className="text-white/80 text-lg mb-4">
                  We've sent a magic link to <strong className="text-emerald-400">{email}</strong>
                </p>
                <p className="text-white/60 text-sm">
                  Click the link in your email to complete your application and lock in your founding member rate.
                </p>
                {!isLaunched && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-amber-400 text-sm font-medium">
                      🎉 Our official launch is October 15, but you're welcome to explore and connect before then!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
                    />
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="INVITE CODE"
                      required
                      className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg uppercase"
                    />
                  </div>
                  
                  {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isValidating}
                    className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/50"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Crown className="w-5 h-5" />
                        Lock In Founding Member Rate ($199/mo Forever)
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-white/60 text-sm mt-4 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  30-day money-back guarantee • Cancel anytime
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Founding vs Regular Members Section */}
      <div className="bg-gradient-to-br from-amber-500/5 to-purple-500/5 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Founding Members Win
            </h2>
            <p className="text-xl text-white/70">
              Lock in exclusive benefits before we hit 1,000 members
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Founding Members */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-[#0A0F1E] border-2 border-emerald-500/50 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Crown className="w-8 h-8 text-amber-400" />
                  <h3 className="text-3xl font-bold text-white">Founding Members</h3>
                </div>
                
                <div className="text-center mb-6 pb-6 border-b border-white/10">
                  <div className="text-5xl font-bold text-emerald-400 mb-2">$199<span className="text-xl text-white/60">/mo</span></div>
                  <div className="text-amber-400 font-semibold">LOCKED FOREVER</div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-white">Lifetime Price Lock</div>
                      <div className="text-white/60 text-sm">Your rate never increases, even if you leave and come back</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-white">5 Priority Invites</div>
                      <div className="text-white/60 text-sm">Invite your trusted peers to skip the vetting process</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-white">Founding Member Badge</div>
                      <div className="text-white/60 text-sm">Stand out in the directory with exclusive recognition</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-white">All Platform Features</div>
                      <div className="text-white/60 text-sm">Full access to member directory, messaging, events, and requests</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-white">Early Access to New Features</div>
                      <div className="text-white/60 text-sm">Be the first to test and shape new platform capabilities</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-white">Founder's Inner Circle</div>
                      <div className="text-white/60 text-sm">Exclusive quarterly dinners and virtual roundtables</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                  <div className="text-emerald-400 font-bold text-lg mb-2">
                    💰 Total Yearly Savings: $600
                  </div>
                  <div className="text-white/60 text-sm">
                    vs. regular member pricing
                  </div>
                </div>
              </div>
            </div>

            {/* Regular Members */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 opacity-75">
              <h3 className="text-3xl font-bold text-white mb-6">Regular Members</h3>
              
              <div className="text-center mb-6 pb-6 border-b border-white/10">
                <div className="text-5xl font-bold text-white/60 mb-2">$249<span className="text-xl">/mo</span></div>
                <div className="text-white/40">After First 1,000</div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-white/60 line-through">Lifetime Price Lock</div>
                    <div className="text-white/40 text-sm">Subject to price increases</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-white/60 line-through">5 Priority Invites</div>
                    <div className="text-white/40 text-sm">Standard vetting required for all referrals</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-white/60 line-through">Founding Member Badge</div>
                    <div className="text-white/40 text-sm">Standard member profile</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-white/40 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-white/60">All Platform Features</div>
                    <div className="text-white/40 text-sm">Full access to member directory, messaging, events, and requests</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-white/60 line-through">Early Access to New Features</div>
                    <div className="text-white/40 text-sm">Features released on standard timeline</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-white/60 line-through">Founder's Inner Circle</div>
                    <div className="text-white/40 text-sm">Access to general events only</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 text-center">
                <div className="text-red-400 font-bold text-lg">
                  Misses out on $600/year in savings
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-2xl font-bold text-white mb-2">
              The Math is Simple
            </p>
            <p className="text-white/70 text-lg">
              Join now and save $600 per year. Forever.
            </p>
          </div>
        </div>
      </div>

      {/* Value Propositions - Enhanced */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What Makes The Circle Different
          </h2>
          <p className="text-xl text-white/70">
            Not another dead Slack group or LinkedIn echo chamber
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="group">
            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-white/10 rounded-2xl p-8 hover:border-emerald-500/30 transition-all h-full">
              <Users className="w-12 h-12 text-emerald-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Warm Intros That Actually Close Deals
              </h3>
              <p className="text-white/70 text-lg mb-4">
                Stop cold emailing. Our curated directory connects you with the exact founder who solved your problem last quarter. Real intros. Real conversations. Real revenue.
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <p className="text-emerald-400 text-sm font-medium italic">
                  "The investor intro I needed took 6 months of cold outreach before. Here it took 48 hours. We closed the round."
                </p>
                <p className="text-white/40 text-xs mt-2">— Sarah K., SaaS Founder</p>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-all h-full">
              <MessageSquare className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Responses in Hours, Not Days
              </h3>
              <p className="text-white/70 text-lg mb-4">
                No more "let's circle back" that never happens. Circle members respond in under 2 hours average because everyone here is vetted, active, and serious about mutual success.
              </p>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <p className="text-purple-400 text-sm font-medium italic">
                  "Posted a hiring question at 9am. Had 8 qualified responses by lunch. Made the hire by Friday."
                </p>
                <p className="text-white/40 text-xs mt-2">— Marcus T., Fintech CEO</p>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-all h-full">
              <Target className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Post Once, Get Help From Experts
              </h3>
              <p className="text-white/70 text-lg mb-4">
                Need a designer? Looking for your first sales hire? Pricing advice? Post your request and get 5+ qualified responses by EOD. Our members actually show up.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-400 text-sm font-medium italic">
                  "Asked for help with our pricing model. Got detailed feedback from 3 founders who'd been there. Changed everything."
                </p>
                <p className="text-white/40 text-xs mt-2">— James P., B2B SaaS</p>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-white/10 rounded-2xl p-8 hover:border-yellow-500/30 transition-all h-full">
              <Calendar className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Events Where Actual Partnerships Form
              </h3>
              <p className="text-white/70 text-lg mb-4">
                Not networking events. Intimate gatherings (max 15 people) with founders at your stage. Real conversations. Real chemistry. Real deals.
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-400 text-sm font-medium italic">
                  "Met my co-founder at a Circle dinner. Closed our seed round together 6 months later."
                </p>
                <p className="text-white/40 text-xs mt-2">— Lisa R., Marketplace Startup</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Founder's Letter - Enhanced */}
      <div className="bg-gradient-to-br from-emerald-500/5 to-purple-500/5 border-y border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">A Letter From The Founder</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-purple-400 mx-auto" />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Hey, I'm Shehab A. Salamah.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                I've been exactly where you are right now.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Staring at LinkedIn, wondering if that cold DM will ever get a response. Joining Slack groups that feel like ghost towns within a week. Going to "networking events" where everyone's scanning the room for someone more important.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Building a company is the loneliest thing I've ever done. And I kept thinking: <strong className="text-white">"There has to be a better way to connect with people who actually get it."</strong>
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                So I built The Circle.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                <strong className="text-white">Not another networking platform.</strong> Not another directory you browse once and forget about. Not another community where everyone's "too busy" to actually help.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                <strong className="text-emerald-400">A real network of founders who show up for each other.</strong>
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Here's what makes The Circle fundamentally different:
              </p>

              <ul className="text-white/80 text-lg leading-relaxed mb-6 space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  <span><strong className="text-white">We're ruthlessly curated.</strong> Every single member is personally reviewed. No tire-kickers. No "just exploring." Only people who are actually in the arena, building real companies, solving real problems.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  <span><strong className="text-white">We're intentionally intimate.</strong> Hard capped at 1,000 members. Small enough that you actually get to know people. Big enough that someone always has the exact answer you need.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  <span><strong className="text-white">We're relentlessly active.</strong> Average response time under 2 hours. Monthly events that members actually attend. Introductions that actually happen. DMs that actually get responses.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  <span><strong className="text-white">We're obsessed with outcomes.</strong> Not engagement metrics. Not vanity numbers. Real business wins. Deals closed. Hires made. Problems solved. Revenue generated.</span>
                </li>
              </ul>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                I'm not going to promise you'll get your next investor from The Circle (though you might).
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                I'm not going to promise you'll find your co-founder here (though you might).
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                <strong className="text-white">What I will promise you:</strong> If you show up—even just a little—you'll stop feeling like you're building in a vacuum.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                You'll have people to text when you're stuck. People who actually reply. People who've been through the exact same hell you're going through and genuinely want to help you get through it faster.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                <strong className="text-white">That's worth more than any feature list could ever capture.</strong>
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                <strong className="text-emerald-400">The founding member window isn't marketing BS. It's real.</strong> First 1,000 members get $199/mo locked in forever. Member #1,001 pays $249/mo. No exceptions. No grandfather clauses if you leave and come back. No "special deals."
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                I'm not creating artificial scarcity because I read a growth hacking blog. I genuinely want to keep The Circle small enough that it stays valuable. 1,000 committed founders who actually help each other beats 10,000 lurkers every single time.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                So if you're tired of building alone...<br />
                If you're ready to stop "networking" and start connecting...<br />
                If you want to be part of something that actually delivers on its promises...
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-8">
                <strong className="text-white">Join us.</strong>
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                See you inside,
              </p>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  SA
                </div>
                <div>
                  <p className="text-white font-bold text-xl">Shehab A. Salamah</p>
                  <p className="text-white/60">Founder, The Circle</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-white/60 text-sm italic">
                  P.S. - Still not sure? I get it. That's why there's a 30-day money-back guarantee. 
                  Try it. If you don't get tangible value, I'll refund you personally. No questions. No hard feelings. 
                  But I'm confident you'll see why this is different within your first 48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof / Testimonials Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Real Founders. Real Results.
          </h2>
          <p className="text-xl text-white/70">
            Here's what happens when you stop building alone
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                JC
              </div>
              <div>
                <div className="font-bold text-white">John Chen</div>
                <div className="text-white/60 text-sm">E-commerce, $2M ARR</div>
              </div>
            </div>
            <p className="text-white/80 mb-4">
              "Made a post about struggling with CAC. Three founders shared their exact playbooks. Cut our acquisition cost by 40% in 6 weeks."
            </p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Award key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                PR
              </div>
              <div>
                <div className="font-bold text-white">Priya Reddy</div>
                <div className="text-white/60 text-sm">SaaS, Pre-seed</div>
              </div>
            </div>
            <p className="text-white/80 mb-4">
              "Got introduced to an angel who became our lead investor. Closed $500k in 3 weeks. This network is the real deal."
            </p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Award key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                DW
              </div>
              <div>
                <div className="font-bold text-white">David Williams</div>
                <div className="text-white/60 text-sm">Fintech, Series A</div>
              </div>
            </div>
            <p className="text-white/80 mb-4">
              "Found our Head of Sales through a Circle intro. Someone I'd never have reached on LinkedIn. She's crushing it."
            </p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Award key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROI Section - Enhanced */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The ROI is Ridiculous
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            At $199/month, The Circle needs to help you with just ONE thing to 10x your investment
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <TrendingUp className="w-10 h-10 text-emerald-400 mb-3" />
            <h4 className="text-lg font-bold text-white mb-2">One Key Hire</h4>
            <p className="text-3xl font-bold text-emerald-400 mb-2">$15,000+</p>
            <p className="text-white/60 text-sm">Recruiting fees saved through warm intro</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <Users className="w-10 h-10 text-purple-400 mb-3" />
            <h4 className="text-lg font-bold text-white mb-2">One Investor Intro</h4>
            <p className="text-3xl font-bold text-purple-400 mb-2">$10,000+</p>
            <p className="text-white/60 text-sm">Value of warm intro vs cold outreach</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <Target className="w-10 h-10 text-blue-400 mb-3" />
            <h4 className="text-lg font-bold text-white mb-2">One Partnership</h4>
            <p className="text-3xl font-bold text-blue-400 mb-2">$50,000+</p>
            <p className="text-white/60 text-sm">Average deal value from our network</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <Gift className="w-10 h-10 text-amber-400 mb-3" />
            <h4 className="text-lg font-bold text-white mb-2">Sanity & Support</h4>
            <p className="text-3xl font-bold text-amber-400 mb-2">Priceless</p>
            <p className="text-white/60 text-sm">Finally not building alone</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-purple-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
          <p className="text-2xl text-white/90 mb-4">
            <strong className="text-white">Bottom line:</strong> You're not paying for a Slack group.
          </p>
          <p className="text-xl text-emerald-400 font-bold">
            You're investing in outcomes. And our members are seeing them every single day.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Questions? We've Got Answers.</h2>
        </div>

        <div className="space-y-6">
          <details className="bg-white/5 border border-white/10 rounded-xl p-6 group">
            <summary className="text-xl font-bold text-white cursor-pointer list-none flex items-center justify-between">
              Is this just another LinkedIn?
              <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-white/70 mt-4 leading-relaxed">
              Hell no. LinkedIn is spray and pray. The Circle is curated, intimate, and active. Think of it as your founder group chat, but with 1,000 people who can actually help you. Real conversations. Real relationships. Real outcomes.
            </p>
          </details>

          <details className="bg-white/5 border border-white/10 rounded-xl p-6 group">
            <summary className="text-xl font-bold text-white cursor-pointer list-none flex items-center justify-between">
              What if I don't have time for another platform?
              <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-white/70 mt-4 leading-relaxed">
              The Circle is designed for busy founders. No pressure to be online 24/7. Post when you need help. Check in when you have time. Many members spend 20 minutes per week and still make game-changing connections.
            </p>
          </details>

          <details className="bg-white/5 border border-white/10 rounded-xl p-6 group">
            <summary className="text-xl font-bold text-white cursor-pointer list-none flex items-center justify-between">
              Will my competitors be in here?
              <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-white/70 mt-4 leading-relaxed">
              We curate carefully to avoid direct conflicts. Plus, "competitors" often become collaborators at this level. Everyone's focused on building their own thing—there's room for all of us to win.
            </p>
          </details>

          <details className="bg-white/5 border border-white/10 rounded-xl p-6 group">
            <summary className="text-xl font-bold text-white cursor-pointer list-none flex items-center justify-between">
              Can I cancel anytime?
              <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-white/70 mt-4 leading-relaxed">
              Yes, month-to-month. But here's the catch: <strong className="text-white">You can't get your founding member rate back once you leave.</strong> It's locked in for life only while you're an active member. Cancel and you're back to $249/mo if you rejoin.
            </p>
          </details>

          <details className="bg-white/5 border border-white/10 rounded-xl p-6 group">
            <summary className="text-xl font-bold text-white cursor-pointer list-none flex items-center justify-between">
              How do you ensure quality members?
              <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-white/70 mt-4 leading-relaxed">
              Invite-only during founding phase. Every application is personally reviewed. We're looking for builders, not talkers. People who show up. People who help. People who are actually doing the work.
            </p>
          </details>

          <details className="bg-white/5 border border-white/10 rounded-xl p-6 group">
            <summary className="text-xl font-bold text-white cursor-pointer list-none flex items-center justify-between">
              I'm pre-revenue / just starting. Is this for me?
              <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-white/70 mt-4 leading-relaxed">
              ABSOLUTELY. Some of our most valuable members are in early stages. They ask great questions. They're the most helpful. They make the best connections. Everyone started somewhere. No one judges. Everyone helps.
            </p>
          </details>

          <details className="bg-white/5 border border-white/10 rounded-xl p-6 group">
            <summary className="text-xl font-bold text-white cursor-pointer list-none flex items-center justify-between">
              What if I don't like it?
              <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-white/70 mt-4 leading-relaxed">
              Full refund in your first 30 days, no questions asked. We're confident you'll see value. But if you don't, just email us. Done.
            </p>
          </details>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/60">
            Still have questions? <a href="mailto:support@thecirclenetwork.org" className="text-emerald-400 hover:text-emerald-300 font-medium">Email us</a> - We respond in under 24 hours.
          </p>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-purple-500/10 to-blue-500/10 border-y border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Stop Building Alone?
          </h2>

          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Join the founders who decided networking alone doesn't work and started building together.
          </p>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Here's What Happens Next:</h3>
              
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Enter your email & invite code</p>
                    <p className="text-white/60 text-sm">We validate within seconds</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Check your email for magic link</p>
                    <p className="text-white/60 text-sm">Click to complete your application</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Build your profile</p>
                    <p className="text-white/60 text-sm">Tell us about yourself and what you're building</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-bold">4</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Lock in $199/mo founding rate</p>
                    <p className="text-white/60 text-sm">Secure payment via Stripe</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-bold">5</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Start connecting immediately</p>
                    <p className="text-white/60 text-sm">Browse members, post requests, RSVP to events</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!showSuccessMessage && (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto mb-8">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
                />
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="INVITE CODE"
                  required
                  className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg uppercase"
                />
              </div>
              
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={isValidating}
                className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/50"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    Secure My Founding Member Spot
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-white/60 text-sm flex items-center justify-center gap-2 flex-wrap">
            <Shield className="w-4 h-4" />
            30-day money-back guarantee • Cancel anytime • Your rate is locked forever
          </p>

          <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-white/80 text-lg mb-4">
              <strong className="text-white">One last thing:</strong>
            </p>
            <p className="text-white/70 leading-relaxed">
              Every founder in The Circle was exactly where you are right now. Wondering if it's worth it. Wondering if they'll actually get value. Wondering if it's just another thing to manage.
            </p>
            <p className="text-white/70 leading-relaxed mt-4">
              Then they joined. And they got it.
            </p>
            <p className="text-white/70 leading-relaxed mt-4">
              The intros became deals. The messages became friendships. The events became partnerships. The investment became a no-brainer.
            </p>
            <p className="text-emerald-400 font-bold mt-6 text-lg">
              Don't be the person who waits and watches from the outside. Be the person who shows up and builds with us.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="22" stroke="url(#footer-gold-gradient)" strokeWidth="2.5" fill="none"/>
                  <circle cx="24" cy="24" r="14" stroke="url(#footer-amber-gradient)" strokeWidth="2" fill="none"/>
                  <circle cx="24" cy="24" r="7" fill="url(#footer-gold-gradient)"/>
                  <defs>
                    <linearGradient id="footer-gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                    <linearGradient id="footer-amber-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FBBF24" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-xl font-bold text-white">The Circle</span>
              </div>
              <p className="text-white/60 text-sm">
                Where ambitious founders stop building alone.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <a href="/login" className="block text-white/60 hover:text-white text-sm transition-colors">
                  Member Login
                </a>
                <a href="mailto:support@thecirclenetwork.org" className="block text-white/60 hover:text-white text-sm transition-colors">
                  Contact Support
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="/terms" className="block text-white/60 hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
                <a href="/privacy" className="block text-white/60 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-white/60 text-sm">
              © 2025 The Circle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

     
    
      {/* Exit Intent Popup - Shows only ONCE per session */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0F1E] border-2 border-emerald-500/50 rounded-2xl max-w-2xl w-full p-8 relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowExitPopup(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-red-400" />
              </div>

              <h3 className="text-3xl font-bold text-white mb-4">
                Wait! You're About to Miss Out...
              </h3>

              <p className="text-xl text-white/80 mb-6">
                The founding member window is closing faster than you think.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                <p className="text-white/80 mb-4 font-medium">Here's what's at stake:</p>
                <ul className="space-y-3 text-left text-white/70">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-red-400 flex-shrink-0" />
                    Only the first 1,000 members lock in $199/mo forever
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-red-400 flex-shrink-0" />
                    Member #1,001 pays $249/mo (no exceptions)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-red-400 flex-shrink-0" />
                    That's $600/year more if you wait
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-red-400 flex-shrink-0" />
                    Plus you miss founder-only benefits forever
                  </li>
                </ul>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-2xl font-bold text-red-400 mb-2">
                  Spots are filling every single day
                </p>
                <p className="text-white/70 text-sm">
                  Other founders are locking in their rate while you're reading this.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowExitPopup(false)}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-xl transition-all text-sm"
                >
                  No Thanks, I'll Pay $249/mo Later
                </button>
                <button
                  onClick={() => {
                    setShowExitPopup(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/50"
                >
                  Lock In $199/mo Now →
                </button>
              </div>

              <p className="text-white/40 text-xs mt-4 italic">
                "Almost left to 'think about it.' So glad I didn't. Made 2 game-changing connections in my first week." - Michael R.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Member Popup */}
      {showExistingMemberPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0F1E] border-2 border-emerald-500/50 rounded-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowExistingMemberPopup(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Welcome Back!
              </h3>

              <p className="text-white/80 mb-6">
                You already have an account with us. Click below to sign in and access your dashboard.
              </p>

              <button
                onClick={() => router.push('/login')}
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/50 flex items-center justify-center gap-2"
              >
                Sign In to Your Account
                <ArrowRight className="w-5 h-5" />
              </button>
         </div>
      </div>
    </div>
  );
}


