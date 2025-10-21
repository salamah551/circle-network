'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Shield, Lock, Crown, ArrowRight, Star, Sparkles, CheckCircle, Users, 
  Briefcase, Handshake, TrendingUp, Zap, Globe, Target, Award,
  Lightbulb, Rocket, BarChart, DollarSign, X, BarChart3, Clock,
  AlertCircle, TrendingDown, Flame, Gift, Infinity, Timer
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

// AI Features Tabs Component
function AIFeaturesTabs() {
  const [activeTab, setActiveTab] = useState('intros');

  const features = {
    intros: {
      icon: Sparkles,
      title: 'AI-Powered Strategic Introductions',
      tagline: 'Available Now',
      description: 'Stop wasting time on random networking. Our AI analyzes your goals, expertise, and needs to match you with exactly the right people every week.',
      benefits: [
        'Get 3 high-quality introductions every Monday',
        '85%+ match accuracy based on your professional goals',
        'Detailed reasoning for why each connection matters',
        'One-click accept with automated email intro',
        'No awkward cold outreach—just warm connections'
      ],
      example: 'Example: You are raising a Series A. Our AI identifies an investor who backed 3 companies in your space, checks if they are actively investing, and sees they mentioned your problem space in a recent podcast. That is a 94% match.',
      color: 'amber'
    },
    dealflow: {
      icon: TrendingUp,
      title: 'AI Deal Flow Alerts',
      tagline: 'Elite • Q1 2026',
      description: 'Never miss a high-value opportunity again. Set your investment criteria and our AI monitors the entire network plus external sources to surface deals before they go wide.',
      benefits: [
        'Real-time alerts when deals match your criteria',
        'See opportunities before they hit the broader market',
        'AI scores each deal based on your preferences',
        'Direct connection to the founder or deal owner',
        'Weekly digest of trending opportunities in your space'
      ],
      example: 'Example: You invest in B2B SaaS at Series A ($2M-5M checks). Our AI spots a company hitting $3M ARR with 150% YoY growth, checks that the founder is in the network, and alerts you 48 hours before their fundraise announcement.',
      color: 'emerald'
    },
    reputation: {
      icon: Shield,
      title: 'Reputation Guardian',
      tagline: 'Elite • Q1 2026',
      description: 'Your reputation is your most valuable asset. Our AI monitors mentions of you and your company across the internet 24/7, alerting you to potential threats before they escalate.',
      benefits: [
        '24/7 monitoring of news, social media, and forums',
        'Instant alerts for negative sentiment or threats',
        'Track what people are saying about you and your company',
        'Early warning system for PR crises',
        'Competitive intelligence on how you are perceived vs competitors'
      ],
      example: 'Example: Someone posts a negative review of your company on Reddit at 2 AM. Our AI detects it, analyzes the sentiment, assesses the threat level, and sends you an alert by 6 AM so you can respond before it spreads.',
      color: 'red'
    },
    intelligence: {
      icon: BarChart3,
      title: 'AI Competitive Intelligence',
      tagline: 'Elite • Q1 2026',
      description: 'Stay ahead of the competition with weekly intelligence reports. Our AI tracks your competitors, market trends, funding announcements, and strategic moves—all in one digestible report.',
      benefits: [
        'Weekly intelligence digest delivered every Monday',
        'Track up to 10 competitors automatically',
        'Funding announcements and key hires in your space',
        'Emerging trends and market shifts',
        'Strategic opportunities you\'re uniquely positioned for'
      ],
      example: 'Example: Your competitor just hired a VP of Enterprise Sales from Salesforce. Our AI spots it on LinkedIn, cross-references their background, identifies 3 enterprise accounts they likely brought with them, and suggests you accelerate your enterprise strategy.',
      color: 'blue'
    }
  };

  const current = features[activeTab];
  const Icon = current.icon;

  const colorClasses = {
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400'
  };

  return (
    <div>
      {/* Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {Object.entries(features).map(([key, feature]) => {
          const FeatureIcon = feature.icon;
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isActive
                  ? `bg-gradient-to-br ${colorClasses[feature.color]} border-current`
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
              }`}
            >
              <FeatureIcon className={`w-6 h-6 mb-2 ${isActive ? 'text-current' : 'text-zinc-500'}`} />
              <div className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                {feature.title.replace('AI-Powered ', '').replace('AI ', '')}
              </div>
              <div className={`text-xs mt-1 ${isActive ? 'text-current' : 'text-zinc-600'}`}>
                {feature.tagline}
              </div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className={`bg-gradient-to-br ${colorClasses[current.color]} rounded-2xl p-8 md:p-10 border-2`}>
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[current.color]} rounded-xl flex items-center justify-center border-2 border-current`}>
            <Icon className="w-8 h-8 text-current" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{current.title}</h3>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-black/30 rounded-full text-xs font-semibold text-current">
              {current.tagline}
            </span>
          </div>
        </div>

        <p className="text-lg text-white/90 mb-6 leading-relaxed">
          {current.description}
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-current" />
              What You Get:
            </h4>
            <ul className="space-y-2">
              {current.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="text-current mt-0.5">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-black/30 rounded-xl p-5 border border-white/10">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-current" />
              Real Example:
            </h4>
            <p className="text-sm text-white/80 leading-relaxed">
              {current.example}
            </p>
          </div>
        </div>

        {activeTab !== 'intros' && (
          <div className="bg-black/40 border border-current/30 rounded-lg p-4 flex items-start gap-3">
            <Crown className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-white/90">
                <strong className="text-amber-400">Founding Members:</strong> This feature is included in your membership at no additional cost. Elite members launching Q1 2026 will pay $9,997/year. You get it for $2,497/year—forever.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
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
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/20"
      >
        <BarChart className="w-5 h-5" />
        Calculate Your ROI
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors z-10 bg-zinc-800 rounded-full p-2 hover:bg-zinc-700"
          aria-label="Close calculator"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-3xl font-bold mb-4 pr-12">What's One Connection Worth?</h2>
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

  // Check for invite link parameters
  const [inviteName, setInviteName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const name = params.get('name');
      const code = params.get('code') || params.get('invite');
      if (name) setInviteName(name);
      if (code) setInviteCode(code);
    }
  }, []);

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
                className="text-sm text-white/70 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                Sign In
              </Link>
              <Link 
                href="/apply"
                className="text-sm bg-amber-500 text-black font-semibold px-5 py-2 rounded-lg hover:bg-amber-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black"
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
          {/* Invite greeting */}
          {inviteName && (
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/30">
                <Crown className="w-5 h-5 text-amber-400" />
                <span className="text-lg text-white">
                  Welcome, <strong className="text-amber-400">{inviteName}</strong> — your private invitation is active
                </span>
                {inviteCode && (
                  <span className="px-3 py-1 bg-black/40 rounded-lg text-xs font-mono text-amber-300 border border-amber-500/30">
                    {inviteCode}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
            <Lock className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400 font-medium">
              Invitation Only • {spotsRemaining} of {foundersCap} Founding Spots Remaining
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Where High-Achievers
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Transform Connections Into Results
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
            An exclusive community of accomplished professionals across all industries. 
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
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-xl hover:shadow-amber-500/20 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              Request Invitation
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#benefits"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black"
            >
              See What's Inside
            </Link>
          </div>

          {/* ROI Calculator Button */}
          <div className="mb-12">
            <ROICalculator />
          </div>

          {/* Credibility indicators */}
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

          {/* Qualifying criteria */}
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

      {/* ===== MISSION & PURPOSE ===== */}
<section className="py-20 relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent -z-10" />
  
  <div className="max-w-6xl mx-auto px-6">
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span className="text-sm text-amber-400 font-medium">Our Mission</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-bold mb-6">
        Why Circle Network <span className="text-amber-400">Exists</span>
      </h2>
      <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
        Professional networking is broken. Circle Network is here to fix it.
      </p>
    </div>

    {/* The Problem */}
    <div className="grid md:grid-cols-2 gap-8 mb-16">
      <div className="p-8 rounded-2xl bg-gradient-to-br from-red-500/10 to-zinc-950 border border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
            <X className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-red-400">The Problem</h3>
        </div>
        <ul className="space-y-3 text-zinc-300">
          <li className="flex items-start gap-3">
            <span className="text-red-400 mt-1">•</span>
            <span>Traditional networking events waste your time with random conversations</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-400 mt-1">•</span>
            <span>LinkedIn is flooded with spam, sales pitches, and low-quality connections</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-400 mt-1">•</span>
            <span>Finding the RIGHT person at the RIGHT time feels impossible</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-400 mt-1">•</span>
            <span>Valuable opportunities slip through the cracks due to poor timing or visibility</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-400 mt-1">•</span>
            <span>No way to protect your reputation or track what people say about you</span>
          </li>
        </ul>
      </div>

      <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-zinc-950 border border-emerald-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-400">Our Solution</h3>
        </div>
        <ul className="space-y-3 text-zinc-300">
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 mt-1">•</span>
            <span><strong className="text-white">AI-matched introductions</strong> to people who can actually help you</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 mt-1">•</span>
            <span><strong className="text-white">Curated, invitation-only</strong> community of accomplished professionals</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 mt-1">•</span>
            <span><strong className="text-white">Real-time deal flow alerts</strong> so you never miss an opportunity</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 mt-1">•</span>
            <span><strong className="text-white">24/7 reputation monitoring</strong> to protect your personal brand</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 mt-1">•</span>
            <span><strong className="text-white">Competitive intelligence</strong> to stay ahead of market trends</span>
          </li>
        </ul>
      </div>
    </div>

    {/* Value Proposition */}
    <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-500/30 rounded-2xl p-8 md:p-12">
      <div className="text-center mb-8">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          This Isn't <span className="text-amber-400">Another</span> Networking Group
        </h3>
        <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
          Circle Network combines the intimacy of a private community with the power of AI to deliver 
          what traditional networking can't: the right connections at the right time.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-amber-400 mb-2">10x</div>
          <div className="text-sm text-zinc-400">More Valuable Than</div>
          <div className="text-white font-semibold">Random Networking</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-amber-400 mb-2">85%+</div>
          <div className="text-sm text-zinc-400">AI Match Accuracy</div>
          <div className="text-white font-semibold">Better Than Cold Outreach</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-amber-400 mb-2">24/7</div>
          <div className="text-sm text-zinc-400">Working For You</div>
          <div className="text-white font-semibold">Even While You Sleep</div>
        </div>
      </div>
    </div>

    {/* Urgency */}
    <div className="mt-12 text-center">
      <div className="inline-block p-8 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border border-red-500/20 rounded-2xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <h3 className="text-2xl font-bold">Don't Miss This Opportunity</h3>
        </div>
        <p className="text-lg text-zinc-300 mb-6 max-w-2xl">
          Founding member pricing ends <strong className="text-white">January 15, 2026</strong> or when we reach capacity—whichever comes first. 
          After that, pricing increases to <strong className="text-white">$4,997-$9,997/year</strong> and Elite AI features cost extra.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Limited time offer</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>{spotsRemaining} spots remaining</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* ===== AI FEATURES TABS - NEW SECTION ===== */}
      <section className="py-20 bg-gradient-to-b from-transparent to-zinc-950/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powered by <span className="text-purple-400">Advanced AI</span>
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Four intelligent systems working 24/7 to give you an unfair advantage in business
            </p>
          </div>

          <AIFeaturesTabs />
        </div>
      </section>

      {/* ===== AI-POWERED ONBOARDING ===== */}
      <section className="py-20 bg-gradient-to-b from-zinc-950/50 to-transparent">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-br from-purple-500/10 via-zinc-900 to-zinc-950 border-2 border-purple-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-400 font-medium">Personalized Experience</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    AI-Powered Onboarding
                  </h2>
                  
                  <p className="text-xl text-white/80 mb-6 leading-relaxed">
                    When you join, you'll complete a brief AI-powered calibration that customizes your entire experience
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Target className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white mb-1">Tell us your strategic goals</div>
                        <div className="text-sm text-zinc-400">What do you want to achieve in the next 12 months?</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white mb-1">Define your ideal connections</div>
                        <div className="text-sm text-zinc-400">Industry focus, geography, expertise needed</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white mb-1">Set your deal flow preferences</div>
                        <div className="text-sm text-zinc-400">Investment criteria, deal size, stage, sectors (Elite)</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white mb-1">Configure your reputation monitoring</div>
                        <div className="text-sm text-zinc-400">Keywords, brands, companies to track (Elite)</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-80 flex-shrink-0">
                  <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">Under 7 Days</div>
                        <div className="text-sm text-zinc-400">Time to First Value</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Onboarding</span>
                        <span className="text-white font-medium">~10 minutes</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">AI Calibration</span>
                        <span className="text-white font-medium">Instant</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">First Intros</span>
                        <span className="text-white font-medium">Next Monday</span>
                      </div>
                    </div>
                    
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-white/90">
                          <strong>Your first strategic introductions arrive the following Monday</strong> after completing onboarding
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY BECOME A FOUNDING MEMBER - NEW SECTION ===== */}
      <section id="founding-member" className="py-20 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400 font-medium">Limited Time Opportunity</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Why Become a <span className="text-amber-400">Founding Member?</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Being first isn't just about timing. It's about locking in advantages that compound forever.
            </p>
          </div>

          {/* Main Value Props Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Locked-In Pricing */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-zinc-950 border-2 border-emerald-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                  <Infinity className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Locked-In Pricing Forever</h3>
                <p className="text-lg text-white/80 mb-6 leading-relaxed">
                  Pay $2,497/year <strong className="text-white">for life</strong>. When prices increase to $4,997 (Premium) or $9,997 (Elite) after January 15, 2026, you're protected.
                </p>
                <div className="bg-black/40 border border-emerald-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Your Price:</span>
                    <span className="text-xl font-bold text-emerald-400">$2,497/year</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Regular Price (2026):</span>
                    <span className="text-xl font-bold text-zinc-500 line-through">$4,997/year</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20">
                    <span className="text-sm font-semibold text-white">Lifetime Savings:</span>
                    <span className="text-2xl font-bold text-emerald-400">$2,500/year</span>
                  </div>
                </div>
              </div>
            </div>

            {/* All Elite Features Included */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 via-zinc-900 to-zinc-950 border-2 border-purple-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                  <Gift className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">All Elite AI Features—FREE</h3>
                <p className="text-lg text-white/80 mb-6 leading-relaxed">
                  While future members pay up to $9,997/year for Elite AI features, you get them all included at <strong className="text-white">no extra cost</strong>.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-purple-500/20">
                    <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white text-sm">AI Deal Flow Alerts</div>
                      <div className="text-xs text-zinc-400">Value: $1,997/year • <span className="text-purple-400">FREE for you</span></div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-purple-500/20">
                    <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white text-sm">Reputation Guardian</div>
                      <div className="text-xs text-zinc-400">Value: $1,497/year • <span className="text-purple-400">FREE for you</span></div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-purple-500/20">
                    <BarChart3 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white text-sm">Competitive Intelligence</div>
                      <div className="text-xs text-zinc-400">Value: $1,497/year • <span className="text-purple-400">FREE for you</span></div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-purple-500/20">
                    <div className="text-center">
                      <div className="text-xs text-zinc-500">Total AI Features Value</div>
                      <div className="text-2xl font-bold text-purple-400">$4,991/year</div>
                      <div className="text-xs text-emerald-400 font-semibold">INCLUDED IN YOUR MEMBERSHIP</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Founding Member Status */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 border-2 border-amber-500/30">
              <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Lifetime Founding Member Status</h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                Your profile will forever display the Founding Member badge—a signal to the network that you were part of the original 250.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-300">Displayed on your profile permanently</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-300">Priority in strategic intro matching</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-300">Recognized as a founding pillar of the community</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-300">Access to exclusive founder events and roundtables</span>
                </li>
              </ul>
            </div>

            {/* Shape the Platform */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 via-zinc-900 to-zinc-950 border-2 border-blue-500/30">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Shape the Future Platform</h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                As a founding member, you'll have direct input on features, priorities, and the direction of Circle Network.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-300">Monthly founder feedback sessions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-300">Early access to test new features before public launch</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-300">Vote on feature priorities and community rules</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-300">Direct line to the founder and product team</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Urgency Section */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-red-500/10 to-zinc-950 border-2 border-red-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Timer className="w-8 h-8 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">This Window Closes Soon</h3>
                <p className="text-lg text-white/80 mb-4 leading-relaxed">
                  Founding member pricing ends when we hit <strong className="text-white">250 members</strong> OR on <strong className="text-white">January 15, 2026</strong>—whichever comes first.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 p-4 bg-black/40 border border-red-500/30 rounded-lg">
                    <div className="text-sm text-zinc-400 mb-1">Spots Remaining</div>
                    <div className="text-3xl font-bold text-red-400">{spotsRemaining}/250</div>
                  </div>
                  <div className="flex-1 p-4 bg-black/40 border border-red-500/30 rounded-lg">
                    <div className="text-sm text-zinc-400 mb-1">Time Until Price Increase</div>
                    <div className="text-2xl font-bold text-red-400">58 days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final Value Statement */}
          <div className="mt-12 text-center max-w-3xl mx-auto">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-amber-500/20">
              <h3 className="text-2xl font-bold mb-4 text-amber-400">The Math is Simple</h3>
              <p className="text-lg text-white/80 leading-relaxed mb-6">
                Over 10 years, founding members save <strong className="text-emerald-400">$25,000</strong> compared to regular pricing. Plus, you get <strong className="text-purple-400">$49,910 worth</strong> of Elite AI features included at no extra cost.
              </p>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="text-sm text-zinc-400">Total Value Over 10 Years:</div>
                <div className="text-3xl font-bold text-emerald-400">$74,910</div>
              </div>
              <p className="text-sm text-zinc-500 mt-4">
                And that's not even counting the deals, partnerships, and opportunities you'll close through the network.
              </p>
            </div>
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
                  'All future Elite features included'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/apply"
                className="block w-full py-3 bg-amber-500 text-black font-bold text-center rounded-lg hover:bg-amber-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                Request Invitation
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 opacity-75">
              <h3 className="text-2xl font-bold mb-2 text-zinc-400">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-zinc-500">${premiumPrice}</span>
                <span className="text-white/40">/year</span>
              </div>
              <p className="text-sm text-zinc-500 mb-6">Available after Jan 15, 2026</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Founding, plus:',
                  'Priority AI intro matching',
                  'Featured profile listing',
                  'Priority event registration',
                  'Advanced search & filters',
                  'Quarterly 1-on-1 with founder'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-zinc-600 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-500 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="w-full py-3 bg-zinc-800 text-zinc-600 font-semibold text-center rounded-lg cursor-not-allowed">
                Coming Soon
              </div>
            </div>

            {/* Elite Tier */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 opacity-75">
              <h3 className="text-2xl font-bold mb-2 text-zinc-400">Elite</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-zinc-500">${elitePrice}</span>
                <span className="text-white/40">/year</span>
              </div>
              <p className="text-sm text-zinc-500 mb-6">Available after Jan 15, 2026</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Premium, plus:',
                  'All AI features included',
                  'VIP event access & hosting',
                  'Concierge introduction service',
                  'Monthly 1-on-1 with founder',
                  'White-glove onboarding'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-zinc-600 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-500 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="w-full py-3 bg-zinc-800 text-zinc-600 font-semibold text-center rounded-lg cursor-not-allowed">
                Coming Soon
              </div>
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

          {/* Performance Guarantee */}
          <div className="mt-8 p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border-2 border-purple-500/30">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Award className="w-8 h-8 text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4">3 Wins in 90 Days — Or +3 Months Free</h2>
                <p className="text-lg text-zinc-300 mb-6 leading-relaxed">
                  We don't just promise value—we guarantee it. If you don't achieve at least 3 meaningful wins 
                  (valuable introductions, partnerships, or opportunities) within your first 90 days of active 
                  membership, we'll extend your membership by 3 months at no additional charge.
                </p>
                <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                  <p className="text-sm text-zinc-400">
                    <strong className="text-purple-400">How it works:</strong> After 90 days, if you haven't 
                    seen tangible results, simply email us within 100 days to claim your 3-month extension. 
                    We stand behind our platform's ability to create real value.
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
            className="inline-block px-12 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg hover:shadow-amber-500/20 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            Request Your Invitation
          </Link>
          <p className="text-sm text-zinc-500 mt-4">
            Applications personally reviewed by the founder • 30-day money-back guarantee
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