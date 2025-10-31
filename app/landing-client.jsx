'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Crown, ArrowRight, CheckCircle, Zap, Users, Brain, TrendingUp, Sparkles, Network, Search, DollarSign, Plane, Receipt, ChevronRight, Shield } from 'lucide-react';
import ROICalculator from '../components/ROICalculator';
import { getThreeTierPricing, shouldShowCharterUrgencyBadge } from '@/lib/pricing';

export default function NewHomepage() {
  const pricing = getThreeTierPricing();
  const showCharterUrgency = shouldShowCharterUrgencyBadge();

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                The Circle
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
                href="/subscribe"
                className="text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg shadow-purple-500/20"
              >
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10" />
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl animate-pulse-slower" />
          {/* Neural network-like lines */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/3 w-px h-40 bg-gradient-to-b from-indigo-500 to-transparent" />
            <div className="absolute top-1/3 right-1/3 w-px h-32 bg-gradient-to-b from-purple-500 to-transparent" />
            <div className="absolute bottom-1/3 left-1/2 w-px h-36 bg-gradient-to-b from-pink-500 to-transparent" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              The World's First
              <br />
              AI-Enhanced Private Network
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-4xl mx-auto leading-relaxed">
            Never walk into a meeting or decision cold again. Get <span className="text-purple-400 font-semibold">ARC™</span> competitive intelligence 
            and <span className="text-purple-400 font-semibold">BriefPoint</span> meeting briefs—plus an exclusive community 
            where elite professionals share insights and opportunities.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link 
              href="/subscribe"
              className="group px-10 py-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center gap-3"
            >
              View Membership Tiers
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/briefpoint"
              className="group px-10 py-5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              Learn About BriefPoint
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span>Invitation-only access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span>Curated for excellence</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span>AI-enhanced intelligence</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Statistics Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">The AI Advantage</h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Leading organizations are already seeing transformative results with AI
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Statistic 1 - Cost Reduction */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 hover:border-indigo-500/30 transition-all">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 border border-indigo-500/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-white mb-4">10-20%</div>
            <p className="text-white/80 text-lg leading-relaxed mb-4">
              average cost decrease across various business functions through AI adoption
            </p>
            <a 
              href="https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai-in-2023-generative-ais-breakout-year" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
            >
              Source: McKinsey Global Survey
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Statistic 2 - Sales Impact */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 hover:border-purple-500/30 transition-all">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 border border-purple-500/30 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-white mb-4">50%+</div>
            <p className="text-white/80 text-lg leading-relaxed mb-4">
              increase in leads and 60-70% reduction in call time for companies using AI in sales
            </p>
            <a 
              href="https://hbr.org/2021/07/when-sales-teams-should-and-shouldnt-use-ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1"
            >
              Source: Harvard Business Review
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Statistic 3 - Future Advantage */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 hover:border-pink-500/30 transition-all">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-pink-500/10 border border-pink-500/30 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-pink-400" />
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-white mb-4">72%</div>
            <p className="text-white/80 text-lg leading-relaxed mb-4">
              of business leaders believe AI will be the business advantage of the future
            </p>
            <a 
              href="https://www.pwc.com/us/en/tech-effect/ai-analytics/ai-business-survey.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-pink-400 hover:text-pink-300 transition-colors inline-flex items-center gap-1"
            >
              Source: PwC
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* The ARC™ Engine Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full text-sm font-semibold text-purple-400 mb-4">
            ⚡ Powered by AI
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            The ARC™ Engine: Your Unfair Advantage
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            While others are still figuring out AI, our members are already leveraging a purpose-built intelligence 
            platform that works 24/7 to deliver insights, opportunities, and advantages.
          </p>
        </div>

        {/* Current Features - Enhanced Layout */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-2xl font-bold text-center text-green-400">Available Now</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Vendor Leverage */}
            <div className="group relative bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/30 to-indigo-500/10 border border-indigo-500/40 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Receipt className="w-7 h-7 text-indigo-400" />
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-indigo-300 transition-colors">Vendor Leverage</h4>
                <p className="text-white/60 leading-relaxed">
                  ARC™ analyzes your SaaS and vendor invoices in real-time, identifies hidden overspending patterns, 
                  and auto-generates negotiation scripts proven to save thousands in annual costs.
                </p>
                <div className="mt-4 pt-4 border-t border-zinc-700/50">
                  <span className="text-xs text-indigo-400 font-semibold">AVERAGE SAVINGS: $12K+/YEAR</span>
                </div>
              </div>
            </div>

            {/* Travel Optimization */}
            <div className="group relative bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-purple-500/10 border border-purple-500/40 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Plane className="w-7 h-7 text-purple-400" />
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-purple-300 transition-colors">Travel Optimization</h4>
                <p className="text-white/60 leading-relaxed">
                  Simply forward your flight confirmations. ARC™ monitors upgrade opportunities, alerts you to lounge access 
                  you didn't know you had, and predicts potential disruptions hours before airlines announce them.
                </p>
                <div className="mt-4 pt-4 border-t border-zinc-700/50">
                  <span className="text-xs text-purple-400 font-semibold">SAVE 15+ HOURS/MONTH</span>
                </div>
              </div>
            </div>

            {/* Market Intelligence */}
            <div className="group relative bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10 transition-all cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500/30 to-pink-500/10 border border-pink-500/40 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <TrendingUp className="w-7 h-7 text-pink-400" />
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-pink-300 transition-colors">Market Intelligence</h4>
                <p className="text-white/60 leading-relaxed">
                  ARC™ continuously scans industry newsletters, research reports, and competitive signals to surface 
                  critical insights you would have missed—delivered as concise, actionable briefs every morning.
                </p>
                <div className="mt-4 pt-4 border-t border-zinc-700/50">
                  <span className="text-xs text-pink-400 font-semibold">DAILY COMPETITIVE EDGE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Limited ARC Access for Core Members */}
        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 border border-zinc-700 rounded-2xl p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm font-semibold text-purple-400 mb-2">
              <Zap className="w-4 h-4" />
              Limited ARC Access
            </div>
            <h3 className="text-2xl font-bold">Core Member Capabilities</h3>
            <p className="text-white/50 text-sm mt-2">Immediate but focused ARC™ access for Charter Members</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Network Intelligence */}
            <div className="flex gap-4 p-6 bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl border border-zinc-700 hover:border-purple-500/30 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 border border-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Network className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
                  Network Intelligence
                  <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">Limited ARC Access</span>
                </h4>
                <p className="text-white/60 text-sm leading-relaxed">
                  ARC™ will map the hidden web of connections within your professional network, identifying 
                  warm introduction paths to any decision-maker—even through 3-4 degrees of separation.
                </p>
              </div>
            </div>

            {/* Opportunity Radar */}
            <div className="flex gap-4 p-6 bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl border border-zinc-700 hover:border-pink-500/30 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-pink-500/10 border border-pink-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Search className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
                  Opportunity Radar
                  <span className="text-xs px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded-full">Limited ARC Access</span>
                </h4>
                <p className="text-white/60 text-sm leading-relaxed">
                  Detect M&A signals, funding rounds, and market shifts before they're public knowledge. 
                  ARC™ synthesizes unstructured data from hundreds of sources to give you first-mover advantage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BriefPoint Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm font-semibold text-purple-400 mb-4">
              ⚡ Never Walk Into a Meeting Cold
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Introducing BriefPoint
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Automated meeting briefs delivered before every conversation. Get participant intelligence, 
              strategic talking points, and context—so you're always the most prepared person in the room.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">What You Get</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">Sunday weekly prep packs for the week ahead</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">T-120 minute pre-meeting briefs with talking points</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">Participant intel and company background</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">Strategic angles and opportunity identification</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4">Your Privacy Matters</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">No raw email storage—metadata only</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">30-day automatic data purge</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">Read-only calendar access (Calendar Mode)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">Ghost Mode available (no calendar access)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center pt-6 border-t border-purple-500/20">
              <Link
                href="/briefpoint"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Learn more about BriefPoint
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The ROI Calculator */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Quantify Your Advantage</h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            See how much time and money ARC™ can save you each year
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <ROICalculator />
        </div>
      </section>

      {/* The Pillars of Value Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Where Technology Meets Exclusivity</h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            The Circle isn't just a network or a tool—it's the convergence of both, 
            designed exclusively for those who understand that exceptional results require exceptional resources.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* The Community */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 rounded-2xl p-10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/30 to-indigo-500/10 border border-indigo-500/40 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-indigo-300">Elite Community</h3>
            <p className="text-white/70 text-lg leading-relaxed">
              Access a rigorously vetted network of innovators, decision-makers, and industry leaders. 
              Share insights in private channels, solve complex challenges in expert-led sessions, 
              and build relationships with peers who operate at your level—or higher.
            </p>
          </div>

          {/* The AI Edge */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-10">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-purple-500/10 border border-purple-500/40 rounded-2xl flex items-center justify-center mb-6">
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-purple-300">Proprietary AI Platform</h3>
            <p className="text-white/70 text-lg leading-relaxed">
              Every member is equipped with ARC™, our purpose-built AI engine that doesn't just assist—it anticipates. 
              The platform learns from the collective patterns of our community, creating a network effect 
              where each member's intelligence amplifies the advantage for all.
            </p>
          </div>
        </div>
      </section>

      {/* A Letter from the Founder */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-10 md:p-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Why We Built This</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mx-auto rounded-full" />
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              For years, I watched brilliant professionals operate in isolation—working harder instead of smarter 
              because they lacked two critical resources: access to the right intelligence and access to the right people.
            </p>
            
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              The Circle exists to solve this problem for a select few. <span className="text-purple-400 font-semibold">The 
              future belongs to those who can harness both human expertise and artificial intelligence</span>—not as separate tools, 
              but as a unified advantage.
            </p>
            
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              ARC™, our proprietary AI engine, doesn't replace judgment—it amplifies it. It handles the exhausting work 
              of monitoring markets, analyzing patterns, and surfacing opportunities so you can focus on what actually 
              drives results: relationships, decisions, and execution.
            </p>
            
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              But technology without the right community is incomplete. That's why membership is selective and intentional. 
              Every person here has been vetted. Every interaction has purpose. Every connection has the potential to 
              fundamentally change the trajectory of your career or business.
            </p>
            
            <p className="text-white/80 text-lg leading-relaxed">
              We're not building another networking platform or productivity tool. We're building an unfair advantage 
              for the people who join us early. If you recognize the value of what we're creating, I invite you to apply.
            </p>

            <div className="mt-8 pt-6 border-t border-zinc-700">
              <p className="text-white/90 text-xl font-semibold">
                The future is built by those who show up first.
              </p>
              <p className="text-purple-400 mt-2">
                — Shehab Salamah
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three-Tier Membership Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-block px-6 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full text-sm font-bold text-white mb-6">
            THREE PATHS TO EXTRAORDINARY
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your Level of Access
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            The Circle offers three distinct membership tiers, each designed to deliver exceptional value. 
            All provide access to our AI-powered platform and vetted community—the difference is depth and exclusivity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Inner Circle - Founding Member */}
          <div className="relative bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 border-2 border-indigo-500/50 rounded-3xl p-8 overflow-hidden group hover:border-indigo-400/70 transition-all duration-300 flex flex-col">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/30 transition-all" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -z-10 group-hover:bg-purple-500/30 transition-all" />
            
            <div className="inline-block px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-xs font-bold text-white mb-4 self-start">
              INVITE ONLY
            </div>

            <h3 className="text-2xl md:text-3xl font-bold mb-1">Inner Circle</h3>
            <p className="text-white/60 text-sm mb-6">For visionary founders and C-suite executives</p>

            <div className="mb-6">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">${pricing.innerCircle.formattedPrice}</div>
              <div className="text-white/60 text-sm">Annual Contribution</div>
            </div>

            <div className="space-y-3 mb-8 flex-grow">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">White-Glove Concierge</div>
                  <div className="text-white/60 text-xs">Personalized introductions and dedicated support</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">Exclusive Deal Flow</div>
                  <div className="text-white/60 text-xs">Early access to vetted opportunities</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">Unlimited ARC™ Access</div>
                  <div className="text-white/60 text-xs">Full, unlimited AI capabilities</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">Private Roundtables</div>
                  <div className="text-white/60 text-xs">Quarterly executive sessions</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">Platform Influence</div>
                  <div className="text-white/60 text-xs">Shape the roadmap</div>
                </div>
              </div>
            </div>

            <Link
              href="/subscribe"
              className="block w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-center rounded-xl hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 mt-auto"
            >
              <span className="flex items-center justify-center gap-2 text-sm">
                Subscribe Now
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          {/* Charter Member - Highlighted */}
          <div className="relative bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500/70 rounded-3xl p-8 overflow-hidden group hover:border-purple-400/90 transition-all duration-300 flex flex-col transform md:scale-105">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl -z-10 group-hover:bg-purple-500/40 transition-all" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/30 rounded-full blur-3xl -z-10 group-hover:bg-pink-500/40 transition-all" />
            
            {showCharterUrgency && (
              <div className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold text-white mb-4 self-start animate-pulse">
                LIMITED TIME OFFER
              </div>
            )}

            <h3 className="text-2xl md:text-3xl font-bold mb-1">Charter Member</h3>
            <p className="text-white/60 text-sm mb-6">For accomplished professionals</p>

            <div className="mb-6">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">${pricing.charter.formattedPrice}</div>
              <div className="text-white/60 text-sm">
                Annual <span className="text-purple-400 font-semibold">(Lifetime Rate)</span>
              </div>
            </div>

            <div className="space-y-3 mb-8 flex-grow">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">Limited ARC™ Access</div>
                  <div className="text-white/60 text-xs">10 AI-powered briefs per month during beta</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">AI-Curated Matches</div>
                  <div className="text-white/60 text-xs">Intelligent connection recommendations</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">Community Access</div>
                  <div className="text-white/60 text-xs">Full member directory access</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">Lifetime Charter Rate</div>
                  <div className="text-white/60 text-xs">Lock in ${pricing.charter.formattedPrice}/year forever</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">Priority Full Access</div>
                  <div className="text-white/60 text-xs">First in line when unlimited ARC™ launches</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">Charter Badge</div>
                  <div className="text-white/60 text-xs">Permanent recognition as early supporter</div>
                </div>
              </div>
            </div>

            <Link
              href="/subscribe"
              className="block w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-center rounded-xl hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 mt-auto"
            >
              <span className="flex items-center justify-center gap-2 text-sm">
                Subscribe Now
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <p className="text-xs text-white/50 mt-3 text-center">
              Charter pricing ends at capacity
            </p>
          </div>

          {/* Professional Member */}
          <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 border-zinc-700 rounded-3xl p-8 overflow-hidden group hover:border-zinc-600 transition-all duration-300 flex flex-col">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-zinc-500/10 rounded-full blur-3xl -z-10 group-hover:bg-zinc-500/20 transition-all" />
            
            <div className="inline-block px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs font-bold text-white/80 mb-4 self-start">
              STANDARD
            </div>

            <h3 className="text-2xl md:text-3xl font-bold mb-1">Professional Member</h3>
            <p className="text-white/60 text-sm mb-6">For rising executives and entrepreneurs</p>

            <div className="mb-6">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">${pricing.professional.formattedPrice}</div>
              <div className="text-white/60 text-sm">Annual Contribution</div>
            </div>

            <div className="space-y-3 mb-8 flex-grow">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">Standard ARC™ Access</div>
                  <div className="text-white/60 text-xs">5 AI-powered briefs per month</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">AI-Curated Matches</div>
                  <div className="text-white/60 text-xs">Smart connection recommendations</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">Community Access</div>
                  <div className="text-white/60 text-xs">Full member directory access</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">Event Access</div>
                  <div className="text-white/60 text-xs">Attend virtual and in-person events</div>
                </div>
              </div>
            </div>

            <Link
              href="/subscribe"
              className="block w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-center rounded-xl transition-all duration-300 border border-zinc-700 hover:border-zinc-600 mt-auto"
            >
              <span className="flex items-center justify-center gap-2 text-sm">
                Subscribe Now
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/60 text-sm">
            Compare all features on the <Link href="/membership" className="text-purple-400 hover:text-purple-300 font-semibold">membership page</Link> or learn about <Link href="/briefpoint" className="text-purple-400 hover:text-purple-300 font-semibold">BriefPoint</Link>.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  The Circle
                </span>
              </Link>
              <p className="text-white/60 max-w-md">
                The world's first AI-enhanced private network. An exclusive, invitation-only community 
                where technology and human expertise converge to create an undeniable advantage.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <Link href="/subscribe" className="hover:text-white transition-colors">Subscribe</Link>
                </li>
                <li>
                  <Link href="/membership" className="hover:text-white transition-colors">Membership</Link>
                </li>
                <li>
                  <Link href="/briefpoint" className="hover:text-white transition-colors">BriefPoint</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-white/40">
              © 2025 The Circle Network. All rights reserved.
            </div>
            <div className="text-sm text-white/40">
              Powered by ARC™ AI Engine
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
