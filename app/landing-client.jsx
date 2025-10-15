'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Shield, Lock, Crown, ArrowRight, Star, Sparkles, CheckCircle, Users, 
  Briefcase, Handshake, TrendingUp, Zap, Globe, Target, Award,
  Lightbulb, Rocket, BarChart, DollarSign, X
} from 'lucide-react';

// Launch configuration - November 10, 2025, 12:00 AM ET
const LAUNCH_DATE = new Date('2025-11-10T00:00:00-05:00');
const isLaunched = () => Date.now() >= LAUNCH_DATE.getTime();
const msUntilLaunch = () => Math.max(0, LAUNCH_DATE.getTime() - Date.now());

// UPDATED PRICING - Mid-market positioning
const foundingPrice = '2,497';
const premiumPrice = '4,997';
const elitePrice = '9,997';

// Member capacity
const foundersCap = '250';
const spotsRemaining = 247;

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

// ROI Calculator Component
function ROICalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [scenario, setScenario] = useState('partnership');
  const [customValue, setCustomValue] = useState(100000);

  const scenarios = {
    partnership: {
      title: 'Strategic Partnership',
      description: 'One meaningful business partnership',
      value: 250000,
      examples: 'Distribution deal, joint venture, or strategic alliance'
    },
    hire: {
      title: 'Key Hire',
      description: 'Finding your next executive or specialist',
      value: 150000,
      examples: 'Save on recruiting fees and find pre-vetted talent'
    },
    client: {
      title: 'High-Value Client',
      description: 'One quality client or customer',
      value: 500000,
      examples: 'Enterprise contract, major account, or retainer'
    },
    investment: {
      title: 'Investment or Funding',
      description: 'Capital for your next venture',
      value: 1000000,
      examples: 'Angel investment, strategic capital, or partnership equity'
    },
    knowledge: {
      title: 'Expert Advice',
      description: 'Insights that transform your business',
      value: 50000,
      examples: 'Avoid costly mistakes, optimize operations, accelerate growth'
    },
    custom: {
      title: 'Custom Scenario',
      description: 'What\'s one valuable connection worth to you?',
      value: customValue,
      examples: 'Enter your own estimated value'
    }
  };

  const current = scenarios[scenario];
  const value = scenario === 'custom' ? customValue : current.value;
  const membership = 2497;
  const roi = Math.round(((value - membership) / membership) * 100);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg"
      >
        <BarChart className="w-5 h-5" />
        Calculate Your ROI
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-8 relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold mb-4">What's One Connection Worth?</h2>
        <p className="text-zinc-400 mb-6">
          Calculate the potential return on your Circle Network membership
        </p>

        {/* Scenario Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {Object.entries(scenarios).map(([key, s]) => (
            <button
              key={key}
              onClick={() => setScenario(key)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                scenario === key
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <div className={`text-sm font-semibold mb-1 ${
                scenario === key ? 'text-amber-400' : 'text-zinc-400'
              }`}>
                {s.title}
              </div>
              <div className="text-xs text-zinc-500">{s.description}</div>
            </button>
          ))}
        </div>

        {/* Custom Value Input */}
        {scenario === 'custom' && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Estimated Value ($)</label>
            <input
              type="number"
              value={customValue}
              onChange={(e) => setCustomValue(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
              min="0"
              step="1000"
            />
          </div>
        )}

        {/* Calculation Display */}
        <div className="bg-black border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="mb-4">
            <div className="text-sm text-zinc-500 mb-1">Scenario</div>
            <div className="text-lg font-bold text-white">{current.title}</div>
            <div className="text-sm text-zinc-400 mt-1">{current.examples}</div>
          </div>

          <div className="border-t border-zinc-800 pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">Estimated Value:</span>
              <span className="text-white font-bold">${value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Membership Cost:</span>
              <span className="text-white">$2,497/year</span>
            </div>
            <div className="flex justify-between border-t border-zinc-800 pt-3">
              <span className="text-zinc-400 font-semibold">Your ROI:</span>
              <span className="text-emerald-400 font-bold text-xl">{roi}x</span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
          <p className="text-sm text-emerald-400">
            <strong>Reality check:</strong> If just ONE connection delivers this value, your membership 
            pays for itself {roi}x over. Most members make multiple valuable connections per year.
          </p>
        </div>
      </div>
    </div>
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
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Crown className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold group-hover:text-amber-400 transition-colors">
                Circle Network
              </span>
            </Link>

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
                Request Invitation
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

          {/* Main headline - Outcome focused, industry agnostic */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Where High-Achievers
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Transform Connections Into Results
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
            An exclusive community of {foundersCap} accomplished professionals across all industries. 
            Get the right introductions, close meaningful deals, and accelerate your success.
          </p>

          {/* Launch countdown */}
          {!launched && (
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl border border-amber-500/30 bg-amber-500/5 mb-8">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <div className="text-xs text-amber-400/70 uppercase tracking-wider font-medium">
                  Full Platform Launch In
                </div>
                <Countdown />
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
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
              See What's Inside
            </Link>
          </div>

          {/* ROI Calculator Button */}
          <div className="mb-12">
            <ROICalculator />
          </div>

          {/* Safe credibility indicators - vague but ethical */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Curated network of accomplished professionals</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-white/30 rounded-full" />
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Members across 15+ industries</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-white/30 rounded-full" />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>High engagement and response rates</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHO THIS IS FOR ===== */}
      <section className="py-20 bg-gradient-to-b from-transparent to-zinc-950/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for <span className="text-amber-400">Accomplished Professionals</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              We curate for quality, ambition, and proven success. Every member brings real value to the network.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Rocket,
                title: 'Business Owners & Founders',
                description: 'Building companies, scaling operations, seeking strategic partnerships and growth opportunities',
                stats: 'Proven track record of success'
              },
              {
                icon: Briefcase,
                title: 'Senior Executives & Leaders',
                description: 'Leading teams, driving innovation, making high-impact decisions at established organizations',
                stats: 'Senior leadership experience'
              },
              {
                icon: Lightbulb,
                title: 'Investors & Advisors',
                description: 'Deploying capital, providing expertise, building portfolios across multiple industries',
                stats: 'Active investment or advisory role'
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

          {/* Vague but premium qualifying criteria */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5 border border-amber-500/20">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Are You a Good Fit?</h3>
              <p className="text-zinc-400">Circle Network is designed for established professionals who value quality connections</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-300">Demonstrated professional success and accomplishment</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-300">Active in your industry with meaningful network</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-300">Able to provide value to other accomplished professionals</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-300">Committed to building genuine, long-term relationships</span>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-sm text-zinc-500">
                Applications reviewed personally by the founder and our team
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== OUTCOME-FOCUSED BENEFITS ===== */}
      <section id="benefits" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Real Results, Not Just Features
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Circle Network helps you achieve what matters: close deals, find partners, 
              solve problems, and accelerate your professional growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              {
                icon: Handshake,
                title: 'Close Your Next Big Deal',
                description: 'Connect directly with decision-makers who can say yes. Skip the gatekeepers and cold outreach.',
                outcome: 'Strategic partnerships, client acquisitions, and business opportunities'
              },
              {
                icon: Sparkles,
                title: 'Find the Perfect Match',
                description: 'AI-powered introductions to the right people at the right time. Quality over quantity, every week.',
                outcome: 'Co-founders, investors, advisors, and strategic partners'
              },
              {
                icon: Target,
                title: 'Solve Problems Fast',
                description: 'Tap into collective expertise. Post your challenge and get actionable insights from experienced professionals.',
                outcome: 'Expert advice, strategic guidance, and problem-solving support'
              },
              {
                icon: Users,
                title: 'Build Your Inner Circle',
                description: 'Access a curated directory of accomplished professionals. Message anyone, anytime, no introductions needed.',
                outcome: 'Trusted relationships that compound in value over time'
              },
              {
                icon: Rocket,
                title: 'Accelerate Your Growth',
                description: 'Learn from peers who\'ve been there. Exclusive events, roundtables, and knowledge sharing.',
                outcome: 'Avoid costly mistakes and capitalize on proven strategies'
              },
              {
                icon: Award,
                title: 'Elevate Your Network',
                description: 'Surround yourself with ambitious, accomplished professionals who push you to level up.',
                outcome: 'Access to opportunities you won\'t find anywhere else'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-amber-500/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-all">
                    <feature.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-white/60 mb-3 text-sm">{feature.description}</p>
                    <div className="text-sm text-emerald-400 font-semibold flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{feature.outcome}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon - hint at future features */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-purple-400">Coming Soon: Premium Features</h3>
                <p className="text-white/60 mb-4">
                  We're building even more powerful tools to help you succeed:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="text-sm text-zinc-400">• Personal success dashboard & impact tracking</div>
                  <div className="text-sm text-zinc-400">• Expert 1-on-1 consultation sessions</div>
                  <div className="text-sm text-zinc-400">• Industry-specific sub-communities</div>
                  <div className="text-sm text-zinc-400">• Mobile apps for iOS & Android</div>
                  <div className="text-sm text-zinc-400">• Advanced AI matching algorithms</div>
                  <div className="text-sm text-zinc-400">• Deal flow & partnership marketplace</div>
                </div>
                <p className="text-xs text-zinc-500 mt-4">
                  Founding members get early access to all new features at no additional cost
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING - UPDATED ===== */}
      <section className="py-20 bg-gradient-to-b from-zinc-950/50 to-transparent">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Founding Member Pricing
            </h2>
            <p className="text-xl text-white/60 mb-2">
              Lock in exclusive rates that never increase • Only {spotsRemaining} spots remaining
            </p>
            <p className="text-sm text-emerald-400 font-semibold">
              30-Day Money-Back Guarantee • Zero Risk
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Founding Tier */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-amber-500/30 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-black text-xs font-bold rounded-full">
                BEST VALUE
              </div>
              <h3 className="text-2xl font-bold mb-2">Founding</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">${foundingPrice}</span>
                <span className="text-white/60">/year</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Full member directory access',
                  'AI-powered strategic introductions',
                  'Direct messaging with all members',
                  'Request board & knowledge sharing',
                  'Exclusive events & roundtables',
                  'Founding member badge & priority',
                  'All future features included'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">{item}</span>
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
                  'Priority AI intro matching',
                  'Featured profile listing',
                  'Priority event registration',
                  'Advanced search & filters',
                  'Quarterly 1-on-1 with founder',
                  'Early access to new features'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">{item}</span>
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
                  'Unlimited AI introductions',
                  'VIP event access & hosting',
                  'Concierge introduction service',
                  'Advisory council participation',
                  'Monthly 1-on-1 with founder',
                  'White-glove onboarding'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">{item}</span>
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

      {/* ===== GUARANTEE SECTION ===== */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border-2 border-emerald-500/30">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4">30-Day Money-Back Guarantee</h2>
                <p className="text-lg text-zinc-300 mb-6 leading-relaxed">
                  If Circle Network doesn't deliver meaningful value in your first 30 days, 
                  we'll refund your membership fee in full. No questions asked. No hassle.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white mb-1">Full Refund</div>
                      <div className="text-sm text-zinc-400">100% of your payment returned</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white mb-1">No Questions Asked</div>
                      <div className="text-sm text-zinc-400">Simple email request process</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white mb-1">Keep Your Connections</div>
                      <div className="text-sm text-zinc-400">Relationships you made are yours</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white mb-1">Fast Processing</div>
                      <div className="text-sm text-zinc-400">Refund within 2-3 business days</div>
                    </div>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-4 border border-emerald-500/20">
                  <p className="text-sm text-zinc-400">
                    <strong className="text-emerald-400">Why we offer this:</strong> We're confident Circle Network 
                    will be one of the most valuable investments you make in your professional growth. If it's not 
                    right for you, you shouldn't pay for it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Crown className="w-16 h-16 text-amber-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Accelerate Your Success?
          </h2>
          <p className="text-xl text-white/70 mb-4 leading-relaxed">
            Join {membersJoined} accomplished professionals who are already making valuable connections.
          </p>
          <p className="text-lg text-amber-400 font-semibold mb-8">
            Only {spotsRemaining} founding member spots remain
            {!launched && (
              <> • Platform launches in <Countdown /></>
            )}
          </p>
          <Link
            href="/apply"
            className="inline-block px-12 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg hover:shadow-amber-500/20 mb-6"
          >
            Request Your Invitation
          </Link>
          <p className="text-sm text-zinc-500">
            Applications personally reviewed by the founder and our team • 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
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
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
          <div className="text-center text-sm text-white/40">
            © 2025 Circle Network. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
