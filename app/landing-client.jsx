'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Shield, Lock, Crown, ArrowRight, Star, Sparkles, CheckCircle, Users, 
  Briefcase, Handshake, TrendingUp, Zap, Globe
} from 'lucide-react';

// Launch configuration - November 10, 2025, 12:00 AM ET
const LAUNCH_DATE = new Date('2025-11-10T00:00:00-05:00');
const isLaunched = () => Date.now() >= LAUNCH_DATE.getTime();
const msUntilLaunch = () => Math.max(0, LAUNCH_DATE.getTime() - Date.now());

// Pricing
const foundingPrice = '497';
const premiumPrice = '997';
const elitePrice = '1997';

// Member capacity - UPDATED to 250
const foundersCap = '250';
const spotsRemaining = 247; // Update this manually as members join OR make it dynamic

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
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
            <Lock className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400 font-medium">
              Invitation Only • {spotsRemaining} of {foundersCap} Founding Spots Remaining
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            The Network for
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              High-Performers
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
            An exclusive community of {foundersCap} elite professionals across finance, tech, 
            consulting, and commerce who help each other win.
          </p>

          {/* Launch countdown */}
          {!launched && (
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl border border-amber-500/30 bg-amber-500/5 mb-8">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <div className="text-xs text-amber-400/70 uppercase tracking-wider font-medium">
                  Full Launch In
                </div>
                <Countdown />
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/apply"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              Request Invitation
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#benefits"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              See Benefits
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{membersJoined} founding members joined</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-white/30 rounded-full" />
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Avg. net worth: $5M+</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-white/30 rounded-full" />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>92% intro success rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHO THIS IS FOR ===== */}
      <section className="py-20 bg-gradient-to-b from-transparent to-zinc-950/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for the <span className="text-amber-400">1%</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              We curate for quality, not quantity. Every member is hand-selected.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Briefcase,
                title: 'Founders & CEOs',
                description: 'Building companies, raising capital, seeking strategic partnerships',
                stats: '$2M+ revenue or funding'
              },
              {
                icon: TrendingUp,
                title: 'Investors & Advisors',
                description: 'VCs, angels, and advisors looking for deal flow and portfolio support',
                stats: '$1M+ deployed annually'
              },
              {
                icon: Zap,
                title: 'Elite Operators',
                description: 'Senior executives, consultants, and specialists at top firms',
                stats: '$200K+ compensation'
              }
            ].map((persona, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-amber-500/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all">
                  <persona.icon className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{persona.title}</h3>
                <p className="text-white/60 mb-4 leading-relaxed">
                  {persona.description}
                </p>
                <div className="text-sm text-amber-400 font-semibold">
                  {persona.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section id="benefits" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What You Get
            </h2>
            <p className="text-xl text-white/60">
              Exclusive access to features that drive real business results
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Users,
                title: 'Member Directory',
                description: `Browse and connect with all ${foundersCap} founding members`,
                value: '$25K+ value per warm intro'
              },
              {
                icon: Sparkles,
                title: 'AI Strategic Intros',
                description: '3 curated connection recommendations weekly',
                value: 'Save 10+ hours of networking'
              },
              {
                icon: Handshake,
                title: 'Direct Messaging',
                description: 'Reach any member without gatekeepers',
                value: '95% response rate'
              },
              {
                icon: Globe,
                title: 'Exclusive Events',
                description: 'Virtual roundtables and in-person dinners',
                value: '2-4 events per month'
              },
              {
                icon: Shield,
                title: 'Request Board',
                description: 'Post asks, get help within 24 hours',
                value: '87% fulfillment rate'
              },
              {
                icon: TrendingUp,
                title: 'Value Exchange',
                description: 'Trade expertise, intros, and resources',
                value: 'Earn impact score points'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-all">
                    <feature.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-white/60 mb-3">{feature.description}</p>
                    <div className="text-sm text-amber-400 font-semibold">
                      {feature.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="py-20 bg-gradient-to-b from-zinc-950/50 to-transparent">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Founding Member Pricing
            </h2>
            <p className="text-xl text-white/60">
              Lock in lifetime founding member rates • Only {spotsRemaining} spots left
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Founding Tier */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-amber-500/30 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-black text-xs font-bold rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Founding</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">${foundingPrice}</span>
                <span className="text-white/60">/year</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Full member directory access',
                  '3 AI intros per week',
                  'Direct messaging',
                  'Request board access',
                  'All events included',
                  'Founding member badge'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/apply"
                className="block w-full py-3 bg-amber-500 text-black font-bold text-center rounded-lg hover:bg-amber-400 transition-all"
              >
                Request Invitation
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">${premiumPrice}</span>
                <span className="text-white/60">/year</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Founding, plus:',
                  '5 AI intros per week',
                  'Priority event access',
                  'Featured profile listing',
                  'Unlimited requests',
                  '1-on-1 with founder'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/apply"
                className="block w-full py-3 bg-white/10 border border-white/20 text-white font-semibold text-center rounded-lg hover:bg-white/20 transition-all"
              >
                Request Invitation
              </Link>
            </div>

            {/* Elite Tier */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800">
              <h3 className="text-2xl font-bold mb-2">Elite</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">${elitePrice}</span>
                <span className="text-white/60">/year</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Premium, plus:',
                  'Unlimited AI intros',
                  'VIP event access',
                  'Concierge intro service',
                  'Advisory council seat',
                  'Early platform features'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/apply"
                className="block w-full py-3 bg-white/10 border border-white/20 text-white font-semibold text-center rounded-lg hover:bg-white/20 transition-all"
              >
                Request Invitation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Crown className="w-16 h-16 text-amber-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Join the Circle?
          </h2>
          <p className="text-xl text-white/70 mb-8 leading-relaxed">
            Only {spotsRemaining} founding member spots remain. 
            {!launched && (
              <> Platform launches in <Countdown />.</>
            )}
          </p>
          <Link
            href="/apply"
            className="inline-block px-12 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg hover:shadow-amber-500/20"
          >
            Request Your Invitation
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Crown className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-lg">Circle Network</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-white/40">
            © 2025 Circle Network. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
