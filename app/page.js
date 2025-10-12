'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowRight, Check, Users, MessageSquare, Calendar, 
  Target, TrendingUp, Zap, X, Loader2, Mail, Shield,
  Clock, Award, Gift, Crown, Lock, Eye, Brain, Sparkles,
  ChevronRight, AlertCircle
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Launch date: November 1, 2025
const LAUNCH_DATE = new Date('2025-11-01T00:00:00').getTime();

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
  const [showConciergeModal, setShowConciergeModal] = useState(false);
  const [credentials, setCredentials] = useState({
    firstName: '',
    lastName: '',
    company: '',
    title: '',
    linkedin: ''
  });
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [memberStats, setMemberStats] = useState({ total: 0, founding: 0, recent: 0, spotsRemaining: Number(process.env.NEXT_PUBLIC_FOUNDERS_CAP || 500) });
  const [scrollY, setScrollY] = useState(0);

  // Pre-fill form from URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      const codeParam = params.get('code') || params.get('invite_code');
      
      if (emailParam) setEmail(emailParam);
      if (codeParam) setInviteCode(codeParam);
    }
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Load member stats
  useEffect(() => {
    const loadMemberStats = async () => {
      try {
        // Get total members count
        const { count: totalCount, error: totalError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get founding members count
        const { count: foundingCount, error: foundingError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_founding_member', true);

        // Get recent members (last 48 hours)
        const twoDaysAgo = new Date();
        twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);
        
        const { count: recentCount, error: recentError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', twoDaysAgo.toISOString());

        if (!totalError && !foundingError && !recentError) {
          const total = totalCount || 0;
          const founding = foundingCount || 0;
          const recent = recentCount || 0;
          const spotsRemaining = Math.max(500 - founding, 0);

          setMemberStats({ total, founding, recent, spotsRemaining });
        }
      } catch (error) {
        console.error('Error loading member stats:', error);
      }
    };

    loadMemberStats();
    
    // Refresh stats every 60 seconds
    const interval = setInterval(loadMemberStats, 60000);
    return () => clearInterval(interval);
  }, []);

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
        setShowConciergeModal(false);
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
    <div className="min-h-screen bg-[#0A0E27] relative">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#E5C77E]/5 via-transparent to-[#E5C77E]/10 pointer-events-none" 
           style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
      
      {/* Subtle grain texture */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')]" />

      {/* Navigation */}
      <nav className="relative border-b border-[#E5C77E]/10 bg-[#0A0E27]/90 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Premium Logo */}
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="26" cy="26" r="24" stroke="#E5C77E" strokeWidth="1.5" fill="none" opacity="0.4"/>
                <circle cx="26" cy="26" r="16" stroke="#E5C77E" strokeWidth="1.5" fill="none" opacity="0.6"/>
                <circle cx="26" cy="26" r="8" fill="#E5C77E" opacity="0.8"/>
                <circle cx="26" cy="26" r="3" fill="#FFF" opacity="0.9"/>
              </svg>
              <div>
                <div className="text-xl font-light tracking-[0.2em] text-[#E5C77E]">THE CIRCLE</div>
                <div className="text-[10px] tracking-[0.3em] text-[#E5C77E]/50 -mt-1">RESERVE</div>
              </div>
            </div>
            
            <a 
              href="/login"
              className="text-[#E5C77E]/70 hover:text-[#E5C77E] transition-colors text-sm tracking-wide font-light"
            >
              Member Access
            </a>
          </div>
        </div>
      </nav>

      {/* Countdown Banner - Minimal & Elegant */}
      {!isLaunched && (
        <div className="bg-[#E5C77E]/5 border-y border-[#E5C77E]/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center gap-6 text-center flex-wrap">
              <span className="text-[#E5C77E]/80 text-sm tracking-wide font-light">Full Platform Access</span>
              <div className="flex gap-4 text-[#E5C77E]">
                <div className="text-center">
                  <div className="font-light text-2xl tabular-nums">{countdown.days}</div>
                  <div className="text-[10px] tracking-widest opacity-60">DAYS</div>
                </div>
                <div className="self-center opacity-30">:</div>
                <div className="text-center">
                  <div className="font-light text-2xl tabular-nums">{countdown.hours}</div>
                  <div className="text-[10px] tracking-widest opacity-60">HRS</div>
                </div>
                <div className="self-center opacity-30">:</div>
                <div className="text-center">
                  <div className="font-light text-2xl tabular-nums">{countdown.minutes}</div>
                  <div className="text-[10px] tracking-widest opacity-60">MIN</div>
                </div>
              </div>
              <span className="text-[#E5C77E]/60 text-sm tracking-wide font-light">November 1, 2025</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Ultra Premium */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
          <div className="max-w-5xl mx-auto">
            {/* Scarcity Indicator - Subtle */}
            <div className="flex items-center justify-center mb-8 opacity-0 animate-fadeIn" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <div className="inline-flex items-center gap-3 px-6 py-2.5 border border-[#E5C77E]/20 rounded-full bg-[#E5C77E]/5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E5C77E] animate-pulse" />
                <span className="text-[#E5C77E]/80 text-sm tracking-wide font-light">
                  {memberStats.spotsRemaining} of 500 Founding Reserve Seats Remaining
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-center mb-8 opacity-0 animate-fadeIn" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              <div className="text-5xl md:text-7xl lg:text-8xl font-light text-white/95 mb-4 tracking-tight leading-[1.1]">
                Where Capital
              </div>
              <div className="text-5xl md:text-7xl lg:text-8xl font-light text-white/95 mb-6 tracking-tight leading-[1.1]">
                Meets <span className="text-[#E5C77E] italic font-serif">Caliber</span>
              </div>
            </h1>
            
            <p className="text-center text-xl md:text-2xl text-white/50 mb-16 leading-relaxed max-w-3xl mx-auto font-light opacity-0 animate-fadeIn" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
              An invitation-only network of 500 high-performing professionals across finance, technology, consulting, and commerce.
            </p>

            {/* Success Message */}
            {showSuccessMessage ? (
              <div className="max-w-2xl mx-auto bg-[#E5C77E]/5 border border-[#E5C77E]/20 rounded-xl p-10 mb-12 opacity-0 animate-fadeIn" style={{ animationFillMode: 'forwards' }}>
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-[#E5C77E]/10 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-[#E5C77E]" />
                  </div>
                </div>
                <h3 className="text-2xl font-light text-white mb-4 text-center tracking-wide">Credentials Received</h3>
                <p className="text-white/70 text-center mb-4 font-light">
                  A secure access link has been sent to <span className="text-[#E5C77E] font-normal">{email}</span>
                </p>
                <p className="text-white/50 text-sm text-center font-light">
                  Please check your inbox to complete your application and secure your founding member rate.
                </p>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto opacity-0 animate-fadeIn" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                <button
                  onClick={() => setShowConciergeModal(true)}
                  className="group w-full px-8 py-5 bg-[#E5C77E]/90 hover:bg-[#E5C77E] text-[#0A0E27] font-light tracking-wide rounded-lg transition-all text-base flex items-center justify-center gap-3 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span>Submit Credentials</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-center gap-6 mt-6 text-white/40 text-sm font-light">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Bank-Grade Security</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>30-Day Guarantee</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Future Services Preview - Locked Benefits */}
      <div className="relative border-y border-[#E5C77E]/10 bg-gradient-to-b from-[#E5C77E]/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">
              The Circle Reserve <span className="text-[#E5C77E] italic font-serif">Advantage</span>
            </h2>
            <p className="text-xl text-white/50 font-light">
              Founding members gain priority access to three exclusive services
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Insight Exchange (CI Service) */}
            <div className="group relative bg-white/[0.02] border border-[#E5C77E]/10 rounded-xl p-8 hover:border-[#E5C77E]/30 transition-all duration-500">
              <div className="absolute top-4 right-4">
                <Lock className="w-5 h-5 text-[#E5C77E]/40" />
              </div>
              <div className="mb-6">
                <div className="w-14 h-14 bg-[#E5C77E]/10 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-7 h-7 text-[#E5C77E]" />
                </div>
                <h3 className="text-xl font-light text-white mb-3 tracking-wide">Insight Exchange</h3>
                <p className="text-white/50 text-sm font-light leading-relaxed">
                  Real-time competitive intelligence and market analysis delivered to founding members first.
                </p>
              </div>
              <div className="pt-6 border-t border-[#E5C77E]/10">
                <div className="text-[#E5C77E]/60 text-xs tracking-wider font-light">FOUNDING MEMBERS ONLY</div>
              </div>
            </div>

            {/* Capital Signal (Deal Flow) */}
            <div className="group relative bg-white/[0.02] border border-[#E5C77E]/10 rounded-xl p-8 hover:border-[#E5C77E]/30 transition-all duration-500">
              <div className="absolute top-4 right-4">
                <Lock className="w-5 h-5 text-[#E5C77E]/40" />
              </div>
              <div className="mb-6">
                <div className="w-14 h-14 bg-[#E5C77E]/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-[#E5C77E]" />
                </div>
                <h3 className="text-xl font-light text-white mb-3 tracking-wide">Capital Signal</h3>
                <p className="text-white/50 text-sm font-light leading-relaxed">
                  Curated investment opportunities and private deal flow before they reach the broader market.
                </p>
              </div>
              <div className="pt-6 border-t border-[#E5C77E]/10">
                <div className="text-[#E5C77E]/60 text-xs tracking-wider font-light">FOUNDING MEMBERS ONLY</div>
              </div>
            </div>

            {/* Precision Ops (Reputation) */}
            <div className="group relative bg-white/[0.02] border border-[#E5C77E]/10 rounded-xl p-8 hover:border-[#E5C77E]/30 transition-all duration-500">
              <div className="absolute top-4 right-4">
                <Lock className="w-5 h-5 text-[#E5C77E]/40" />
              </div>
              <div className="mb-6">
                <div className="w-14 h-14 bg-[#E5C77E]/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-[#E5C77E]" />
                </div>
                <h3 className="text-xl font-light text-white mb-3 tracking-wide">Precision Ops</h3>
                <p className="text-white/50 text-sm font-light leading-relaxed">
                  Proactive reputation management and digital presence optimization for high-profile members.
                </p>
              </div>
              <div className="pt-6 border-t border-[#E5C77E]/10">
                <div className="text-[#E5C77E]/60 text-xs tracking-wider font-light">FOUNDING MEMBERS ONLY</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-white/40 text-sm font-light tracking-wide">
              Early access reserved exclusively for the first ${process.env.NEXT_PUBLIC_FOUNDERS_CAP} members
            </p>
          </div>
        </div>
      </div>

      {/* Founding Member Value Prop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#E5C77E]/20 to-[#E5C77E]/5 rounded-2xl blur-2xl opacity-50" />
            <div className="relative bg-[#0A0E27] border border-[#E5C77E]/20 rounded-2xl p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Crown className="w-6 h-6 text-[#E5C77E]" />
                  <h3 className="text-3xl font-light text-white tracking-wide">Founding Reserve Membership</h3>
                </div>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-6xl font-light text-[#E5C77E]">$199</span>
                  <span className="text-2xl text-white/40 font-light">/month</span>
                </div>
                <div className="text-[#E5C77E]/70 text-sm tracking-widest font-light">LIFETIME RATE LOCK</div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#E5C77E]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-[#E5C77E]" />
                  </div>
                  <div>
                    <div className="text-white font-light mb-1">Price Guaranteed Forever</div>
                    <div className="text-white/40 text-sm font-light">${process.env.NEXT_PUBLIC_FOUNDING_PRICE}/mo even if you pause and return</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#E5C77E]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-[#E5C77E]" />
                  </div>
                  <div>
                    <div className="text-white font-light mb-1">Priority Service Access</div>
                    <div className="text-white/40 text-sm font-light">First access to Insight Exchange, Capital Signal, Precision Ops</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#E5C77E]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-[#E5C77E]" />
                  </div>
                  <div>
                    <div className="text-white font-light mb-1">Founding Member Badge</div>
                    <div className="text-white/40 text-sm font-light">Permanent distinction in member directory</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#E5C77E]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-[#E5C77E]" />
                  </div>
                  <div>
                    <div className="text-white font-light mb-1">5 Priority Invitations</div>
                    <div className="text-white/40 text-sm font-light">Invite trusted peers with expedited vetting</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#E5C77E]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-[#E5C77E]" />
                  </div>
                  <div>
                    <div className="text-white font-light mb-1">Reserve Council Access</div>
                    <div className="text-white/40 text-sm font-light">Quarterly roundtables and exclusive dinners</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#E5C77E]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-[#E5C77E]" />
                  </div>
                  <div>
                    <div className="text-white font-light mb-1">Platform Features</div>
                    <div className="text-white/40 text-sm font-light">Full access to directory, messaging, events, requests</div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-8 border-t border-[#E5C77E]/10">
                <div className="text-[#E5C77E] font-light text-lg mb-1">
                  Total Value: $600/year in savings vs. standard rate
                </div>
                <div className="text-white/40 text-sm font-light">
                  Regular members pay $249/mo starting November 1st
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Propositions - What You Get */}
      <div className="border-y border-[#E5C77E]/10 bg-gradient-to-b from-transparent to-[#E5C77E]/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">
              Built for High <span className="text-[#E5C77E] italic font-serif">Performers</span>
            </h2>
            <p className="text-xl text-white/50 font-light">
              Curated for professionals who create outsized value
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <div className="bg-white/[0.02] border border-[#E5C77E]/10 rounded-xl p-8 hover:border-[#E5C77E]/30 transition-all duration-500">
              <div className="w-14 h-14 bg-[#E5C77E]/10 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-[#E5C77E]" />
              </div>
              <h3 className="text-xl font-light text-white mb-3 tracking-wide">Curated Network</h3>
              <p className="text-white/50 text-sm font-light leading-relaxed">
                Limited to 500 founding members across finance, technology, consulting, and commerce. Every member is vetted for professional caliber and active engagement.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-[#E5C77E]/10 rounded-xl p-8 hover:border-[#E5C77E]/30 transition-all duration-500">
              <div className="w-14 h-14 bg-[#E5C77E]/10 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-[#E5C77E]" />
              </div>
              <h3 className="text-xl font-light text-white mb-3 tracking-wide">Direct Access</h3>
              <p className="text-white/50 text-sm font-light leading-relaxed">
                No gatekeepers. Message any member directly, coordinate introductions, and build relationships with decision-makers in your target industries.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-[#E5C77E]/10 rounded-xl p-8 hover:border-[#E5C77E]/30 transition-all duration-500">
              <div className="w-14 h-14 bg-[#E5C77E]/10 rounded-lg flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-[#E5C77E]" />
              </div>
              <h3 className="text-xl font-light text-white mb-3 tracking-wide">Premium Tools</h3>
              <p className="text-white/50 text-sm font-light leading-relaxed">
                Access our member directory, private events calendar, request board, and upcoming AI-powered services designed specifically for high-net-worth professionals.
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-white/40 text-sm font-light tracking-wide mb-4">
              {memberStats.total > 0 ? `${memberStats.total} professionals have already joined` : 'Building a network of 500 exceptional professionals'}
            </p>
            {memberStats.total > 0 && memberStats.recent > 0 && (
              <p className="text-[#E5C77E]/60 text-sm font-light">
                {memberStats.recent} new {memberStats.recent === 1 ? 'member' : 'members'} joined in the last 48 hours
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-light text-white mb-6 tracking-tight">
            Your Invitation <span className="text-[#E5C77E] italic font-serif">Awaits</span>
          </h2>
          <p className="text-xl text-white/50 mb-10 font-light leading-relaxed">
            The first ${process.env.NEXT_PUBLIC_FOUNDERS_CAP} members shape the future of this network. Secure your founding rate before seats close.
          </p>
          
          {!showSuccessMessage && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-[#E5C77E]/90 hover:bg-[#E5C77E] text-[#0A0E27] font-light tracking-wide rounded-lg transition-all text-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span>Submit Your Credentials</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          )}

          <div className="mt-8 pt-8 border-t border-[#E5C77E]/10">
            <p className="text-white/30 text-sm font-light tracking-wide">
              {memberStats.spotsRemaining > 0 
                ? `${memberStats.spotsRemaining} founding seats remaining of 500` 
                : 'Founding seats filling rapidly'}
            </p>
          </div>
        </div>
      </div>

      {/* Concierge Intake Modal */}
      {showConciergeModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0E27] border border-[#E5C77E]/20 rounded-2xl p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowConciergeModal(false);
                setError('');
              }}
              className="float-right text-white/40 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="mb-8">
              <div className="text-xs tracking-[0.3em] text-[#E5C77E]/60 mb-2">CONCIERGE INTAKE</div>
              <h3 className="text-3xl font-light text-white mb-3 tracking-tight">Submit Your Credentials</h3>
              <p className="text-white/60 font-light">
                Please provide the following information to be considered for founding reserve membership.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Professional Credentials */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm font-light mb-2 tracking-wide">First Name</label>
                  <input
                    type="text"
                    value={credentials.firstName}
                    onChange={(e) => setCredentials({...credentials, firstName: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/[0.02] border border-[#E5C77E]/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#E5C77E]/50 transition-all text-base font-light"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm font-light mb-2 tracking-wide">Last Name</label>
                  <input
                    type="text"
                    value={credentials.lastName}
                    onChange={(e) => setCredentials({...credentials, lastName: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/[0.02] border border-[#E5C77E]/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#E5C77E]/50 transition-all text-base font-light"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-sm font-light mb-2 tracking-wide">Company</label>
                <input
                  type="text"
                  value={credentials.company}
                  onChange={(e) => setCredentials({...credentials, company: e.target.value})}
                  required
                  className="w-full px-4 py-3 bg-white/[0.02] border border-[#E5C77E]/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#E5C77E]/50 transition-all text-base font-light"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm font-light mb-2 tracking-wide">Title / Role</label>
                <input
                  type="text"
                  value={credentials.title}
                  onChange={(e) => setCredentials({...credentials, title: e.target.value})}
                  required
                  className="w-full px-4 py-3 bg-white/[0.02] border border-[#E5C77E]/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#E5C77E]/50 transition-all text-base font-light"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm font-light mb-2 tracking-wide">LinkedIn Profile (Optional)</label>
                <input
                  type="url"
                  value={credentials.linkedin}
                  onChange={(e) => setCredentials({...credentials, linkedin: e.target.value})}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-4 py-3 bg-white/[0.02] border border-[#E5C77E]/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#E5C77E]/50 transition-all text-base font-light"
                />
              </div>

              <div className="h-px bg-[#E5C77E]/10 my-6" />

              {/* Invitation Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm font-light mb-2 tracking-wide">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/[0.02] border border-[#E5C77E]/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#E5C77E]/50 transition-all text-base font-light"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm font-light mb-2 tracking-wide">Invitation Code</label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    required
                    className="w-full px-4 py-3 bg-white/[0.02] border border-[#E5C77E]/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#E5C77E]/50 transition-all text-base font-light tracking-widest uppercase"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400/80 text-sm bg-red-400/5 border border-red-400/20 rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isValidating}
                  className="group w-full px-8 py-4 bg-[#E5C77E]/90 hover:bg-[#E5C77E] text-[#0A0E27] font-light tracking-wide rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {isValidating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-white/40 text-xs text-center font-light mt-4">
                Your information is encrypted and handled with bank-grade security
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Existing Member Popup */}
      {showExistingMemberPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0E27] border border-[#E5C77E]/20 rounded-2xl p-10 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E5C77E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-[#E5C77E]" />
              </div>
              <h3 className="text-2xl font-light text-white mb-4 tracking-wide">Welcome Back</h3>
              <p className="text-white/60 mb-8 font-light">
                You're already a Circle member. Please use the login portal to access your account.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowExistingMemberPopup(false)}
                  className="flex-1 px-6 py-3 bg-white/5 border border-[#E5C77E]/20 text-white/70 rounded-lg hover:bg-white/10 transition-all font-light"
                >
                  Close
                </button>
                <a
                  href="/login"
                  className="flex-1 px-6 py-3 bg-[#E5C77E] text-[#0A0E27] rounded-lg hover:bg-[#E5C77E]/90 transition-all font-light"
                >
                  Login
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit Intent Popup */}
      {showExitPopup && !showSuccessMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0E27] border border-[#E5C77E]/20 rounded-2xl p-10 max-w-lg w-full">
            <button
              onClick={() => setShowExitPopup(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E5C77E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-[#E5C77E]" />
              </div>
              <h3 className="text-2xl font-light text-white mb-4 tracking-wide">Before You Go...</h3>
              <p className="text-white/60 mb-6 font-light leading-relaxed">
                The founding member rate of ${process.env.NEXT_PUBLIC_FOUNDING_PRICE}/mo is only available to the first ${process.env.NEXT_PUBLIC_FOUNDERS_CAP} members. Once seats are filled, the rate increases to $249/mo permanently.
              </p>
              <p className="text-[#E5C77E] font-light mb-8">
                {memberStats.spotsRemaining} seats remaining. Secure yours now.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowExitPopup(false)}
                  className="flex-1 px-6 py-3 bg-white/5 border border-[#E5C77E]/20 text-white/70 rounded-lg hover:bg-white/10 transition-all font-light"
                >
                  I'll Think About It
                </button>
                <button
                  onClick={() => {
                    setShowExitPopup(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 px-6 py-3 bg-[#E5C77E] text-[#0A0E27] rounded-lg hover:bg-[#E5C77E]/90 transition-all font-light"
                >
                  Secure My Seat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}

{/* === Coming Soon: Member-Only Intelligence Suite (premium add-ons) === */}
<section className="relative py-20 border-t border-white/10 bg-gradient-to-b from-transparent to-black/20">
  <div className="max-w-5xl mx-auto px-6">
    <div className="mb-10">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/70">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        Coming soon · Member-Only Intelligence Suite (paid add-ons)
      </div>
      <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-white">Multiply your advantage with the Intelligence Suite</h2>
      <p className="text-white/60 max-w-2xl mt-2">Not available yet. Founding members receive priority access as capacity opens. These services are optional and billed in addition to membership.</p>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <div className="text-white/70 text-xs mb-2">Premium Add-On · From $8,000/mo</div>
        <h3 className="text-white font-semibold mb-2">AI Competitive Intelligence</h3>
        <p className="text-white/70 text-sm">24/7 monitoring of competitors (pricing, launches, hiring) with daily briefs, weekly strategy memos, and predictive alerts.</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <div className="text-white/70 text-xs mb-2">Premium Add-On · From $5,000/mo</div>
        <h3 className="text-white font-semibold mb-2">AI Reputation Guardian</h3>
        <p className="text-white/70 text-sm">Always-on monitoring across the open web, social, and dark web with real-time alerts and takedown assistance.</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <div className="text-white/70 text-xs mb-2">Premium Add-On · From $2,000/mo</div>
        <h3 className="text-white font-semibold mb-2">Deal Flow Alerts</h3>
        <p className="text-white/70 text-sm">Weekly curated, high-signal opportunities with AI scoring (pre-public deals, private real estate, acquisitions).</p>
      </div>
    </div>

    <p className="text-white/50 text-xs mt-6">Note: These are optional member-only services and are not available yet. Joining now secures priority access as we roll them out.</p>
  </div>
</section>
