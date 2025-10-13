'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Shield, Lock, Crown, ArrowRight, Star, Sparkles, CheckCircle, Users, 
  Briefcase, Handshake, TrendingUp, Zap, Globe
} from 'lucide-react';

// Launch configuration
const LAUNCH_DATE = new Date('2025-11-01T00:00:00-05:00');
const isLaunched = () => Date.now() >= LAUNCH_DATE.getTime();
const msUntilLaunch = () => Math.max(0, LAUNCH_DATE.getTime() - Date.now());

const foundingPrice = '497';
const premiumPrice = '997';
const elitePrice = '1997';
const foundersCap = '100';
const spotsRemaining = 53; // Update this as members join

function Countdown() {
  const [ms, setMs] = useState(msUntilLaunch());
  
  useEffect(() => {
    if (isLaunched()) return;
    const id = setInterval(() => setMs(msUntilLaunch()), 1000);
    return () => clearInterval(id);
  }, []);
  
  if (ms <= 0) return null;
  
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  
  return (
    <span className="font-mono text-sm text-amber-300 font-semibold">
      {d}d {h}h {m}m {sec}s
    </span>
  );
}

export default function LandingClient() {
  const launched = isLaunched();
  const membersJoined = parseInt(foundersCap) - spotsRemaining;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* ===== NAVIGATION ===== */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Crown className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold group-hover:text-amber-400 transition-colors">
                Circle Network
              </span>
            </Link>

            {/* Right side buttons */}
            <div className="flex items-center gap-3">
              <Link 
                href="/login"
                className="text-sm text-white/70 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                Sign In
              </Link>
              <Link 
                href="/apply"
                className="text-sm bg-amber-500 text-black font-semibold px-5 py-2 rounded-lg hover:bg-amber-400 transition-all"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="h-[70vh] bg-gradient-to-b from-amber-900/10 via-black to-black" />
          <div
            aria-hidden="true"
            className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full blur-3xl opacity-30"
            style={{ background: 'radial-gradient(closest-side, rgba(212,175,55,0.15), rgba(0,0,0,0))' }}
          />
          <div
            aria-hidden="true"
            className="absolute top-1/2 -left-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(closest-side, rgba(212,175,55,0.1), rgba(0,0,0,0))' }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">
          {/* Invitation Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-amber-300 text-sm backdrop-blur-sm">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-medium">Invitation-Only Network</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-8 text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
            Stop wasting time on<br />
            the wrong connections.
            <span className="block mt-2 bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              Meet the right people, weekly.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-xl text-white/80 max-w-3xl leading-relaxed">
            The private network where $5M+ founders and active investors exchange 
            <span className="text-amber-300 font-medium"> strategic introductions</span>, 
            <span className="text-amber-300 font-medium"> competitive intelligence</span>, and 
            <span className="text-amber-300 font-medium"> exclusive opportunities</span>—without the noise.
          </p>

          {/* Qualification Badge */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm backdrop-blur-sm">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-white/90">For founders with $5M+ revenue or $1M+ net worth</span>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link 
              href="/apply" 
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-black font-semibold px-8 py-4 hover:bg-amber-400 text-lg shadow-2xl shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:scale-[1.02]"
            >
              Apply to Join the Founding Cohort 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({behavior: 'smooth'})}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/20 px-8 py-4 hover:bg-white/10 text-lg backdrop-blur-sm transition-all"
            >
              View Pricing & Benefits
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 flex flex-wrap items-center gap-8 text-sm text-white/70">
            <div className="inline-flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>No ads. No data resale.</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Curated membership</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <Handshake className="w-4 h-4 text-amber-400" />
              <span>Mutual-opt-in intros</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== URGENCY BAR ===== */}
      <section className="bg-gradient-to-r from-amber-900/20 via-amber-800/10 to-amber-900/20 border-y border-amber-500/20 py-4 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-semibold text-white">{spotsRemaining} founding spots remaining</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-white/70">
                <Users className="w-4 h-4" />
                <span>{membersJoined} founders already joined</span>
              </div>
            </div>
            {!launched && (
              <div className="flex items-center gap-2">
                <span className="text-white/70">Full access unlocks in:</span>
                <Countdown />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== VALUE PROPS ===== */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Built for outcomes, not vanity metrics
          </h2>
          <p className="mt-3 text-white/60 text-lg">
            Every feature is designed to save time and create tangible value
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="group rounded-2xl border border-white/10 bg-zinc-950 p-7 hover:border-amber-500/30 transition-all hover:shadow-lg hover:shadow-amber-500/5">
            <div className="flex items-center justify-between mb-4">
              <Crown className="w-7 h-7 text-amber-400" />
              <span className="text-xs text-amber-300 font-semibold bg-amber-500/10 px-3 py-1 rounded-full">
                SAVES 10+ HRS/WEEK
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-3">3 Strategic Intros, Delivered Weekly</h3>
            <p className="text-white/70 leading-relaxed">
              Stop scrolling LinkedIn. AI analyzes 500+ members to find your 3 highest-value 
              connections each Monday. Mutual-opt-in only. Context-rich introductions.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-amber-300">
              <CheckCircle className="w-4 h-4" />
              <span>Average: 2 accepted intros per week</span>
            </div>
          </div>

          <div className="group rounded-2xl border border-white/10 bg-zinc-950 p-7 hover:border-amber-500/30 transition-all hover:shadow-lg hover:shadow-amber-500/5">
            <div className="flex items-center justify-between mb-4">
              <Sparkles className="w-7 h-7 text-amber-400" />
              <span className="text-xs text-amber-300 font-semibold bg-amber-500/10 px-3 py-1 rounded-full">
                REPUTATION-BASED
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Impact Score & Value Exchange</h3>
            <p className="text-white/70 leading-relaxed">
              Earn reputation through contribution. Exchange expertise via asks/offers. 
              Quality rises automatically. Noise disappears. Status you can't buy.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-amber-300">
              <CheckCircle className="w-4 h-4" />
              <span>Unlocks privileges & visibility</span>
            </div>
          </div>

          <div className="group rounded-2xl border border-white/10 bg-zinc-950 p-7 hover:border-amber-500/30 transition-all hover:shadow-lg hover:shadow-amber-500/5">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-7 h-7 text-amber-400" />
              <span className="text-xs text-amber-300 font-semibold bg-amber-500/10 px-3 py-1 rounded-full">
                ZERO SPAM
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Privacy & Integrity, by Design</h3>
            <p className="text-white/70 leading-relaxed">
              No ads. No data resale. Member curation and zero-tolerance on spam. 
              Manual approval of every application. You're here for outcomes, not feeds.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-amber-300">
              <CheckCircle className="w-4 h-4" />
              <span>Your data stays private, always</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INTELLIGENCE SERVICES PREVIEW ===== */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-950/10 to-black p-8 md:p-12 relative overflow-hidden">
          <div 
            aria-hidden="true"
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ background: 'radial-gradient(closest-side, rgba(212,175,55,0.4), transparent)' }}
          />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-amber-300 text-xs mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-semibold">Founding members get early access</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Beyond networking: <span className="text-amber-400">Intelligence as a service.</span>
            </h2>
            
            <p className="text-white/70 text-lg max-w-2xl mb-10">
              Members will soon unlock premium intelligence services that give you an unfair advantage 
              in business—available exclusively through The Circle Network.
            </p>

            <div className="grid md:grid-cols-3 gap-5">
              <div className="rounded-xl border border-white/10 bg-black/60 p-6 backdrop-blur-sm hover:border-amber-500/30 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="font-semibold text-lg">AI Competitive Intelligence</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed mb-4">
                  Know what your competitors are doing before they announce it. Daily briefs. 
                  Weekly strategic analysis. Real-time alerts.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-300 font-semibold">~$8K-12K/mo add-on</span>
                  <span className="text-xs text-white/40">Q1 2026</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/60 p-6 backdrop-blur-sm hover:border-amber-500/30 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Shield className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="font-semibold text-lg">Reputation Protection</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed mb-4">
                  24/7 monitoring of your name across the internet, dark web, and social media. 
                  Catch threats before they spread.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-300 font-semibold">~$5K-8K/mo add-on</span>
                  <span className="text-xs text-white/40">Q1 2026</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/60 p-6 backdrop-blur-sm hover:border-amber-500/30 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Star className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="font-semibold text-lg">Exclusive Deal Flow</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed mb-4">
                  Pre-public investment opportunities. Curated weekly. From our members 
                  and vetted external sources.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-300 font-semibold">~$2K-5K/mo add-on</span>
                  <span className="text-xs text-white/40">Q1 2026</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Launching exclusively for Circle Network members</span>
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* ===== WHO WE INVITE ===== */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Who we invite</h2>
          <p className="text-white/60 mt-3 text-lg max-w-3xl mx-auto">
            Membership is curated for high-signal operators, founders, and investors. 
            Self-attested credentials are reviewed by our team to preserve quality.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-7">
            <h3 className="font-semibold text-xl mb-4">Founders & CEOs</h3>
            <ul className="space-y-3 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" /> 
                <span>$5M-$100M+ revenue or clear trajectory</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" /> 
                <span>Tech, finance, real estate, consumer, healthcare</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" /> 
                <span>Seeking strategic partners or executive hires</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-7">
            <h3 className="font-semibold text-xl mb-4">Investors</h3>
            <ul className="space-y-3 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" /> 
                <span>Active angels, family offices, or funds</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" /> 
                <span>Clear thesis and track record</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" /> 
                <span>Open to warm, mutual-fit introductions</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-7">
            <h3 className="font-semibold text-xl mb-4">Operators & Advisors</h3>
            <ul className="space-y-3 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" /> 
                <span>VP+ leaders with scarce expertise</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" /> 
                <span>Can offer meaningful help (GTM, hiring, M&A)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" /> 
                <span>Referred or vetted via outcomes</span>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-white/60 text-sm mt-6 text-center">
          We do not guarantee admission. Applications are evaluated on fit, intent, and contribution potential.
        </p>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-7 hover:border-amber-500/30 transition-all">
            <div className="p-3 rounded-xl bg-amber-500/10 w-fit mb-4">
              <Briefcase className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-semibold text-xl mb-2">1) Apply & get approved</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Request access, share your focus and goals. We review for fit and signal. 
              Manual approval maintains quality.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-7 hover:border-amber-500/30 transition-all">
            <div className="p-3 rounded-xl bg-amber-500/10 w-fit mb-4">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-semibold text-xl mb-2">2) Set preferences</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Define who you want to meet and what you can offer. Reduce noise. 
              Increase serendipity through better matching.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-7 hover:border-amber-500/30 transition-all">
            <div className="p-3 rounded-xl bg-amber-500/10 w-fit mb-4">
              <Handshake className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-semibold text-xl mb-2">3) Receive weekly intros</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Accept mutual-fit matches. Declines are private. Momentum compounds 
              weekly as your network grows strategically.
            </p>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Lock in founding rates—before they're gone
          </h2>
          <p className="text-white/60 mt-3 text-lg">
            First {foundersCap} members get lifetime pricing. No increases, ever.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* FOUNDING - Highlighted */}
          <div className="rounded-2xl border-2 border-amber-500 bg-gradient-to-b from-amber-950/20 to-zinc-950 p-7 relative transform hover:scale-[1.02] transition-all">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-amber-500 text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                🔥 BEST VALUE
              </span>
            </div>
            
            <div className="text-amber-300 text-sm mb-2 font-semibold uppercase tracking-wide">
              Founding Member
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-bold">${foundingPrice}</span>
              <span className="text-white/60">/month</span>
            </div>
            <div className="text-xs text-amber-300 font-semibold mb-6">
              Price locked for life
            </div>
            
            <ul className="space-y-3 text-white/80 text-sm mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>3 strategic intros per week (AI-curated)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Impact Score & Value Exchange access</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Private member directory (vetted founders)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Early access to intelligence services</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Priority support & feature requests</span>
              </li>
            </ul>
            
            <Link 
              href="/apply" 
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-black font-semibold px-5 py-4 hover:bg-amber-400 shadow-lg shadow-amber-500/30 transition-all"
            >
              Claim Your Spot <ArrowRight className="w-4 h-4" />
            </Link>
            
            <div className="mt-5 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-xs text-amber-300 font-semibold mb-1">
                ⏰ {spotsRemaining} spots remaining
              </div>
              <div className="text-xs text-white/60">
                After founding cohort fills, price increases to ${premiumPrice}/mo
              </div>
            </div>
          </div>

          {/* PREMIUM */}
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-7 hover:border-white/20 transition-all">
            <div className="text-white/60 text-sm mb-2 font-semibold uppercase tracking-wide">
              Premium
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-bold">${premiumPrice}</span>
              <span className="text-white/60">/month</span>
            </div>
            <div className="text-xs text-white/40 font-semibold mb-6">
              Available after founding cohort
            </div>
            
            <ul className="space-y-3 text-white/70 text-sm mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                <span>Everything in Founding</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                <span>Higher visibility in directory</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                <span>Priority intro matching</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                <span>Early access to one add-on</span>
              </li>
            </ul>
            
            <Link 
              href="/apply" 
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-white/10 px-5 py-4 hover:bg-zinc-800 transition-all"
            >
              Request Access
            </Link>
          </div>

          {/* ELITE */}
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-7 hover:border-white/20 transition-all">
            <div className="text-white/60 text-sm mb-2 font-semibold uppercase tracking-wide">
              Elite
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-bold">${elitePrice}</span>
              <span className="text-white/60">/month</span>
            </div>
            <div className="text-xs text-white/40 font-semibold mb-6">
              Limited availability
            </div>
            
            <ul className="space-y-3 text-white/70 text-sm mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                <span>5 strategic intros per week</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                <span>Concierge matching service</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                <span>Includes one intelligence add-on</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                <span>Quarterly virtual events</span>
              </li>
            </ul>
            
            <Link 
              href="/apply" 
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-white/10 px-5 py-4 hover:bg-zinc-800 transition-all"
            >
              Join Waitlist
            </Link>
          </div>
        </div>

        <p className="text-white/60 text-sm mt-8 text-center">
          Intelligence add-ons are optional and billed separately. Cancel anytime in the Billing Portal.
        </p>
      </section>

      {/* ===== FOUNDER'S NOTE ===== */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-2xl">
              ✍️
            </div>
            <div>
              <div className="font-semibold text-lg">A note from the founder</div>
              <div className="text-sm text-white/60">Why we built this</div>
            </div>
          </div>
          
          <div className="text-white/80 space-y-4 leading-relaxed">
            <p>
              I've been part of dozens of networking groups, masterminds, and "exclusive" communities. 
              Most were noise. Random intros. Pitch-fests. People optimizing for follower count, not outcomes.
            </p>
            <p>
              The most valuable connections I've made happened through 
              <span className="text-amber-300 font-medium"> intentional, context-rich introductions</span>—not 
              serendipity. Someone who understood both parties saying "you two need to meet."
            </p>
            <p>
              The Circle Network exists because that experience should be systematized, not left to chance. 
              We're building the platform I wished existed: curated membership, AI-assisted matching, 
              and premium intelligence services that give you an unfair advantage.
            </p>
            <p className="text-white/70 italic border-l-2 border-amber-500/30 pl-4">
              If you're serious about your network being a strategic asset—not a vanity metric—
              you belong here.
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <div>
              <div className="font-semibold">— The Founding Team</div>
              <div className="text-sm text-white/60">The Circle Network</div>
            </div>
            <Link 
              href="/apply" 
              className="text-amber-400 hover:text-amber-300 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              Join us <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Frequently asked questions</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold mb-3">Do you guarantee introductions or results?</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              No. We optimize for fit and momentum, but outcomes depend on your goals, engagement, 
              and the value you bring to your connections.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold mb-3">How do you protect privacy?</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              We don't sell data or run ads. Ever. Profiles are visible within the network only. 
              All introductions are mutual-opt-in. Declines are private.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold mb-3">Are the intelligence services included?</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              They're optional paid add-ons launching Q1 2026. Founding members get early access 
              and preferential pricing when they launch.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold mb-3">Who reviews applications?</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Our team manually evaluates every application based on fit, intent, and contribution 
              potential to preserve a high-signal community.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold mb-3">Can I cancel anytime?</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Yes. Cancel anytime through the Billing Portal with no penalties. Founding members 
              who cancel and rejoin later may not get the same pricing.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold mb-3">What happens after the founding cohort fills?</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              New applications go to a waitlist. Pricing increases to ${premiumPrice}/month. 
              Founding members keep their rate for life while active.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/10 via-black to-black p-12 md:p-16 text-center relative overflow-hidden">
          <div 
            aria-hidden="true"
            className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(closest-side, rgba(212,175,55,0.3), transparent)' }}
          />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Your network determines<br />your net worth.
              <span className="block mt-2 bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                Make it count.
              </span>
            </h2>
            
            <p className="mt-6 text-white/70 text-lg max-w-2xl mx-auto">
              Join {membersJoined} founders who've already claimed their spot in the founding cohort. 
              Only {spotsRemaining} spots remaining at founding rates.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/apply"
                className="group inline-flex items-center gap-2 rounded-xl bg-amber-500 text-black font-bold px-10 py-5 hover:bg-amber-400 text-xl shadow-2xl shadow-amber-500/30 transition-all hover:scale-[1.02]"
              >
                Apply to Join 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              
              {!launched && (
                <div className="flex items-center gap-2 text-sm bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-white/70">Unlocks in:</span>
                  <Countdown />
                </div>
              )}
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>No data resale</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Lifetime price lock</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-white/60 text-sm">
              © {new Date().getFullYear()} The Circle Network. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="/legal/terms" className="text-white/60 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="/legal/privacy" className="text-white/60 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/legal/disclaimer" className="text-white/60 hover:text-white transition-colors">
                Disclaimers
              </a>
            </div>
            
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Globe className="w-4 h-4" />
              <span>Built for global founders</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
