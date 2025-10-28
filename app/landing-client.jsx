'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Crown, ArrowRight, CheckCircle, Zap, Users, Brain, TrendingUp, Sparkles, Network, Search, DollarSign, Plane, Receipt, ChevronRight } from 'lucide-react';
import ROICalculator from '../components/ROICalculator';

export default function NewHomepage() {
  const [activeQuote, setActiveQuote] = useState(0);

  const quotes = [
    {
      text: "AI is not just another technology; it's the most profound invention of our time. It will reshape every industry.",
      author: "Lead AI Researcher"
    },
    {
      text: "The businesses that will dominate the next decade are those that can harness data and AI to make smarter, faster decisions.",
      author: "Forbes Technology Council"
    }
  ];

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
                href="/apply"
                className="text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg shadow-purple-500/20"
              >
                Request an Invitation
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
            Where Human Collaboration
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Gains an AI Edge
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-4xl mx-auto leading-relaxed">
            The Circle is a private, application-only community for innovators and professionals. 
            We leverage our proprietary AI engine, <span className="text-purple-400 font-semibold">ARC™</span>, to unlock 
            collective intelligence and create an undeniable advantage for our members.
          </p>

          {/* Primary CTA */}
          <div className="flex justify-center mb-12">
            <Link 
              href="/apply"
              className="group px-10 py-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 flex items-center gap-3"
            >
              Request an Invitation
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span>Application-only membership</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span>100 founding members</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span>AI-powered community</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Age of AI Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">The Age of AI</h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            We're at an inflection point. Those who adapt will thrive.
          </p>
        </div>

        <div className="relative">
          {/* Quote Carousel */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-12 text-center">
            <div className="mb-6">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto" />
            </div>
            
            <blockquote className="text-2xl md:text-3xl font-medium text-white/90 mb-6 leading-relaxed">
              "{quotes[activeQuote].text}"
            </blockquote>
            
            <cite className="text-lg text-purple-400 not-italic">
              — {quotes[activeQuote].author}
            </cite>

            {/* Quote navigation dots */}
            <div className="flex justify-center gap-2 mt-8">
              {quotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveQuote(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeQuote === index 
                      ? 'w-8 bg-purple-400' 
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`View quote ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The ARC™ Engine Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full text-sm font-semibold text-purple-400 mb-4">
            Powered by AI
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Meet ARC™, Your Personal AI Chief of Staff
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Every Circle member gets access to our proprietary AI engine that works around the clock to give you an edge.
          </p>
        </div>

        {/* Current Features */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 text-center text-purple-400">Available Now</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Vendor Leverage */}
            <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-indigo-500/30 hover:bg-gradient-to-br hover:from-indigo-500/5 hover:to-purple-500/5 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="text-xl font-bold mb-3">Vendor Leverage</h4>
              <p className="text-white/60">
                ARC™ analyzes your SaaS and vendor invoices, identifies overspending, and generates negotiation scripts to save you thousands.
              </p>
            </div>

            {/* Travel Optimization */}
            <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-purple-500/30 hover:bg-gradient-to-br hover:from-purple-500/5 hover:to-pink-500/5 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plane className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="text-xl font-bold mb-3">Travel Optimization</h4>
              <p className="text-white/60">
                Forward your flight confirmations and ARC™ finds upgrade opportunities, lounge access, and potential disruptions before they happen.
              </p>
            </div>

            {/* Market Intelligence */}
            <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-pink-500/30 hover:bg-gradient-to-br hover:from-pink-500/5 hover:to-purple-500/5 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-pink-500/10 border border-pink-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-pink-400" />
              </div>
              <h4 className="text-xl font-bold mb-3">Market Intelligence</h4>
              <p className="text-white/60">
                ARC™ scans newsletters and reports, surfacing critical insights and competitor movements you would have missed.
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm font-semibold text-purple-400 mb-2">
              Coming Soon
            </div>
            <h3 className="text-2xl font-bold">In Development</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Network Intelligence */}
            <div className="flex gap-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-500/10 border border-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Network className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">Network Intelligence</h4>
                <p className="text-white/60 text-sm">
                  Map hidden connections within your professional network to find warm introductions.
                </p>
              </div>
            </div>

            {/* Opportunity Radar */}
            <div className="flex gap-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500/20 to-pink-500/10 border border-pink-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">Opportunity Radar</h4>
                <p className="text-white/60 text-sm">
                  Identify M&amp;A signals and emerging market trends from unstructured data.
                </p>
              </div>
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Two Pillars of Unmatched Value</h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            The Circle is more than a network. It's a force multiplier.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* The Community */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 rounded-2xl p-10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/30 to-indigo-500/10 border border-indigo-500/40 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-indigo-300">The Community</h3>
            <p className="text-white/70 text-lg leading-relaxed">
              Collaborate with a vetted group of innovators from diverse industries. Share insights in private channels, 
              solve complex problems in expert-led roundtables, and build a network of trusted peers who understand 
              what it takes to win.
            </p>
          </div>

          {/* The AI Edge */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-10">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-purple-500/10 border border-purple-500/40 rounded-2xl flex items-center justify-center mb-6">
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-purple-300">The AI Edge</h3>
            <p className="text-white/70 text-lg leading-relaxed">
              Every member is equipped with our ARC™ engine. This tool not only provides individual leverage but also 
              contributes anonymized patterns to the collective, making the entire community smarter. The more members 
              we have, the more powerful ARC™ becomes.
            </p>
          </div>
        </div>
      </section>

      {/* A Letter from the Founder */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-10 md:p-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">A Note From Our Founder</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mx-auto rounded-full" />
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              For years, I've watched talented professionals struggle in isolation—brilliant minds working harder, 
              not smarter, because they lacked two critical resources: access to the right people and access to 
              the right intelligence.
            </p>
            
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              I built The Circle to solve this problem. My thesis is simple: <span className="text-purple-400 font-semibold">the 
              future of success lies at the intersection of human collaboration and artificial intelligence.</span>
            </p>
            
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              Our proprietary AI engine, ARC™, doesn't replace human judgment—it amplifies it. It handles the 
              tedious work of monitoring, analyzing, and alerting so you can focus on what humans do best: 
              building relationships, making decisions, and creating value.
            </p>
            
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              But technology alone isn't enough. That's why The Circle is built on a foundation of trust, 
              exclusivity, and mutual value creation. Every member is vetted. Every interaction is intentional. 
              Every connection has the potential to change the trajectory of your business.
            </p>
            
            <p className="text-white/80 text-lg leading-relaxed">
              We're not building another networking group. We're building an unfair advantage for the people 
              who join us. I invite you to be part of this journey.
            </p>

            <div className="mt-8 pt-6 border-t border-zinc-700">
              <p className="text-white/90 text-xl font-semibold">
                Let's build the future together.
              </p>
              <p className="text-purple-400 mt-2">
                — The Founder
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Founding Members Invitation */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-2 border-indigo-500/30 rounded-3xl p-12 md:p-16 text-center">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

          <div className="inline-block px-6 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full text-sm font-bold text-white mb-6">
            LIMITED OPPORTUNITY
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Become a Founding Member
          </h2>

          <div className="max-w-3xl mx-auto mb-10">
            <p className="text-xl text-white/80 leading-relaxed mb-6">
              We are currently inviting <span className="text-purple-400 font-bold">100 founding members</span> to 
              shape the future of our community. Founders receive lifetime-locked annual contributions and a 
              permanent voice in our direction.
            </p>
            
            <p className="text-lg text-white/70">
              After the first 100, the application process will become more stringent, and contribution levels 
              will increase. This is your chance to be part of something exceptional from the ground up.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <CheckCircle className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h4 className="font-bold mb-2">Locked Pricing</h4>
              <p className="text-sm text-white/70">Founding rate forever, never increases</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <CheckCircle className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h4 className="font-bold mb-2">Permanent Voice</h4>
              <p className="text-sm text-white/70">Shape product roadmap and community direction</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <CheckCircle className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h4 className="font-bold mb-2">ARC™ Access</h4>
              <p className="text-sm text-white/70">Full access to our AI engine and all features</p>
            </div>
          </div>

          {/* Final CTA */}
          <Link 
            href="/apply"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xl rounded-xl hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 group"
          >
            Request an Invitation
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="text-sm text-white/50 mt-6">
            Applications are reviewed within 48 hours
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
                An exclusive, application-only community leveraging AI to unlock collective intelligence 
                and create an undeniable advantage for our members.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <Link href="/apply" className="hover:text-white transition-colors">Apply to Join</Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
                </li>
                <li>
                  <Link href="/membership" className="hover:text-white transition-colors">Membership</Link>
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
