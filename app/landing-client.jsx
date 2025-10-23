'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Crown, ArrowRight, CheckCircle, Zap, Clock, Target, Shield, TrendingUp } from 'lucide-react';
import SignalTicker from '../components/SignalTicker';
import ThreatScanModal from '../components/ThreatScanModal';
import FlashBriefingCTA from '../components/FlashBriefingCTA';

export default function NewHomepage() {
  const [showThreatScan, setShowThreatScan] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navigation */}
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
                className="text-sm text-white/70 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-300"
              >
                Sign In
              </Link>
              <Link 
                href="/apply"
                className="text-sm bg-amber-500 text-black font-semibold px-5 py-2 rounded-lg hover:bg-amber-400 transition-all duration-300"
              >
                Request Invitation
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Get Your First Competitor Signal
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              in 48 Hours
            </span>
          </h1>

          <h2 className="text-xl md:text-2xl text-white/70 mb-10 max-w-4xl mx-auto leading-relaxed">
            Start with our free 90-second Threat Scan or order a $297 Flash Briefing directly. 
            Know what moves your competitors are making this week.
          </h2>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <FlashBriefingCTA className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-xl hover:shadow-amber-500/20 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              Order Your $297 Flash Briefing
            </FlashBriefingCTA>
            
            <button
              onClick={() => setShowThreatScan(true)}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Take the Free Threat Scan
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>48-hour delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>No subscription required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Used by 100+ companies</span>
            </div>
          </div>
        </div>
      </section>

      {/* Signal Ticker */}
      <SignalTicker />

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            From zero to competitive intelligence in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-amber-400">1</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Order Your Briefing</h3>
            <p className="text-zinc-400">
              Choose the free Threat Scan or order the full Flash Briefing. Tell us about your competitors and what you need to know.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-emerald-400">2</span>
            </div>
            <h3 className="text-xl font-bold mb-3">We Research & Analyze</h3>
            <p className="text-zinc-400">
              Our analysts dig into competitor moves, pricing changes, product launches, and strategic shifts happening right now.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-500/10 border-2 border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-400">3</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Get Actionable Insights</h3>
            <p className="text-zinc-400">
              Receive a detailed report with strategic recommendations. Know exactly what to do with the intelligence you get.
            </p>
          </div>
        </div>
      </section>

      {/* Offer Cards */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Intelligence Level</h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            From one-time briefings to ongoing intelligence, we've got you covered
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Flash Briefing */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-amber-400" />
              <h3 className="text-2xl font-bold">Flash Briefing</h3>
            </div>
            <div className="mb-4">
              <div className="text-4xl font-bold text-white mb-2">$297</div>
              <div className="text-sm text-zinc-500">One-time payment</div>
            </div>
            <p className="text-zinc-400 mb-6">
              Get your first competitor intelligence report delivered within 48 hours. Perfect for urgent competitive questions.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                '48-hour delivery guarantee',
                'Analysis of 3-5 competitors',
                'Strategic recommendations',
                '30-minute review call',
                'Credits toward membership'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">{feature}</span>
                </li>
              ))}
            </ul>
            <FlashBriefingCTA className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              Order Now
            </FlashBriefingCTA>
          </div>

          {/* 30-Day Sprint */}
          <div className="bg-zinc-900 border-2 border-purple-500/30 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
              MOST POPULAR
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-purple-400" />
              <h3 className="text-2xl font-bold">30-Day Sprint</h3>
            </div>
            <div className="mb-4">
              <div className="text-4xl font-bold text-white mb-2">$3,000</div>
              <div className="text-sm text-zinc-500">One-time pilot</div>
            </div>
            <p className="text-zinc-400 mb-6">
              Deep-dive into your competitive landscape over 30 days. Ideal for strategic planning, fundraising prep, or product launches.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                'Comprehensive competitive analysis',
                'Weekly intelligence briefings',
                'Pricing & positioning matrix',
                '90-minute strategy session',
                'Quarterly report format'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/sprint"
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg hover:from-purple-400 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
            >
              Learn More
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Intelligence Membership */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <h3 className="text-2xl font-bold">Membership</h3>
            </div>
            <div className="mb-4">
              <div className="text-4xl font-bold text-white mb-2">$8,500</div>
              <div className="text-sm text-zinc-500">per month</div>
            </div>
            <p className="text-zinc-400 mb-6">
              Never be blindsided again with 24/7 monitoring, dedicated analyst, and Circle Network community access.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                '24/7 competitive monitoring',
                'Dedicated intelligence analyst',
                'Real-time alerts',
                'Weekly briefings & monthly calls',
                'Full Circle Network access'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/membership"
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-lg hover:from-emerald-400 hover:to-emerald-500 transition-all flex items-center justify-center gap-2"
            >
              Learn More
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border border-amber-500/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-6">
            Stop Being Caught Off Guard by Your Competition
          </h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Join 100+ companies who use Circle Network to stay ahead of competitive moves and make better strategic decisions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <FlashBriefingCTA className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              Start with Flash Briefing
            </FlashBriefingCTA>
            
            <button
              onClick={() => setShowThreatScan(true)}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              Try Free Threat Scan
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-zinc-500">
              © 2025 Circle Network. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/terms" className="text-zinc-500 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-zinc-500 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/contact" className="text-zinc-500 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Threat Scan Modal */}
      <ThreatScanModal isOpen={showThreatScan} onClose={() => setShowThreatScan(false)} />
    </main>
  );
}
