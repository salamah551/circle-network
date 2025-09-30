'use client';
import React, { useState, useEffect } from 'react';
import { Check, Users, MessageSquare, Zap, Shield, TrendingUp, Calendar, Award, ArrowRight, Clock, X, Menu, Star, Building2, Sparkles } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 14 });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev.days > 0 ? { days: prev.days - 1 } : prev);
    }, 86400000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async () => {
    if (email && inviteCode) {
      try {
        const response = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, inviteCode }),
        });
        if (response.ok) setIsSubmitted(true);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">You're on the list!</h2>
          <p className="text-zinc-400 mb-6">Check your email for next steps. We'll send you the application link within 24 hours.</p>
          <p className="text-sm text-zinc-500">Application closes in {timeLeft.days} days.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Enhanced Header with Navigation */}
      <header className="bg-black/95 backdrop-blur-sm border-b border-zinc-800 py-4 px-4 md:px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
              <circle cx="20" cy="20" r="18" stroke="#D4AF37" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="20" r="12" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
              <circle cx="20" cy="20" r="6" fill="#D4AF37"/>
            </svg>
            <div>
              <span className="font-bold text-lg md:text-xl block leading-none">The Circle Network</span>
              <span className="text-xs text-amber-400 uppercase tracking-wider">Invitation Only</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
            <a href="#about" className="text-sm text-zinc-400 hover:text-white transition-colors">About</a>
            <button 
              onClick={() => document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-2 rounded-lg transition-colors text-sm"
            >
              Apply Now
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-zinc-800 pt-4">
            <nav className="flex flex-col gap-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm text-zinc-400 hover:text-white">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm text-zinc-400 hover:text-white">How It Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm text-zinc-400 hover:text-white">Pricing</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm text-zinc-400 hover:text-white">About</a>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-amber-500 text-black font-bold px-6 py-2 rounded-lg text-sm"
              >
                Apply Now
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-black py-12 md:py-20 px-4 md:px-6 border-b border-zinc-800">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-6">
            <span className="text-amber-400 text-sm font-medium">Founding Member Cohort Now Open</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Where High-Performers</span><br />
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Connect</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-3xl mx-auto px-4">
            The invite-only network for professionals who have the money, skills, and connections to help each other win. No noise. Just results.
          </p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span className="text-zinc-300 text-sm font-medium">Applications Close In</span>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-amber-400">{timeLeft.days}</div>
              <div className="text-sm text-zinc-500 uppercase mt-2">Days Remaining</div>
            </div>
            <p className="text-zinc-500 text-sm mt-6">Limited to first 100 founding members</p>
          </div>

          <div id="cta-form" className="max-w-md mx-auto space-y-3 px-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Your invitation code"
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              Claim Your Founding Member Spot
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-zinc-500 text-sm mt-4 px-4">
            <span className="text-amber-400">$2,400/year</span> or <span className="text-amber-400">$200/month</span> • Price locked forever
          </p>
        </div>
      </section>{/* Stats Bar */}
      <section className="bg-zinc-950 py-8 md:py-12 px-4 md:px-6 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { value: "100", label: "Founding Members", suffix: "" },
            { value: "$10K", label: "Average Deal Value", suffix: "+" },
            { value: "94%", label: "Response Rate", suffix: "" },
            { value: "<12hr", label: "Avg Response Time", suffix: "" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-amber-400 mb-1">{stat.value}{stat.suffix}</div>
              <div className="text-xs md:text-sm text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-black border-b border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">You're done with...</h3>
              <ul className="space-y-4">
                {[
                  "LinkedIn spam and cold outreach that goes nowhere",
                  "Networking events that waste your time",
                  "Slack/Discord groups that go silent after a week",
                  "Asking for help and hearing crickets",
                  "Not knowing anyone who's solved your exact problem"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-400">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">You deserve...</h3>
              <ul className="space-y-4">
                {[
                  "5+ valuable connections in your first month",
                  "Direct access to decision-makers with capital",
                  "Help when you actually need it",
                  "Cross-industry perspectives you can't find elsewhere",
                  "Founding member price locked forever",
                  "Invite 5 pre-approved members to join you"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-400">
                    <Check className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How We Compare</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">See why The Circle Network is different from other networking options</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] bg-zinc-900 border border-zinc-800 rounded-xl">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-4 text-sm font-semibold text-zinc-400">Feature</th>
                  <th className="text-center p-4 text-sm font-semibold text-amber-400">The Circle</th>
                  <th className="text-center p-4 text-sm font-semibold text-zinc-400">LinkedIn</th>
                  <th className="text-center p-4 text-sm font-semibold text-zinc-400">Other Networks</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Vetted Members", circle: true, linkedin: false, others: true },
                  { feature: "Direct Messaging", circle: true, linkedin: true, others: true },
                  { feature: "Personal Intro Service", circle: true, linkedin: false, others: false },
                  { feature: "Response Rate >90%", circle: true, linkedin: false, others: false },
                  { feature: "Cross-Industry", circle: true, linkedin: true, others: false },
                  { feature: "No Spam/Noise", circle: true, linkedin: false, others: false },
                  { feature: "Price", circle: "$2,400/yr", linkedin: "Free", others: "$8,500/yr" }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-zinc-800 last:border-0">
                    <td className="p-4 text-sm text-zinc-300">{row.feature}</td>
                    <td className="p-4 text-center">
                      {typeof row.circle === 'boolean' ? (
                        row.circle ? <Check className="w-5 h-5 text-amber-400 mx-auto" /> : <X className="w-5 h-5 text-zinc-600 mx-auto" />
                      ) : (
                        <span className="text-sm text-amber-400 font-semibold">{row.circle}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.linkedin === 'boolean' ? (
                        row.linkedin ? <Check className="w-5 h-5 text-zinc-500 mx-auto" /> : <X className="w-5 h-5 text-zinc-600 mx-auto" />
                      ) : (
                        <span className="text-sm text-zinc-500">{row.linkedin}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.others === 'boolean' ? (
                        row.others ? <Check className="w-5 h-5 text-zinc-500 mx-auto" /> : <X className="w-5 h-5 text-zinc-600 mx-auto" />
                      ) : (
                        <span className="text-sm text-zinc-500">{row.others}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-16 px-4 md:px-6 bg-black border-b border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Founding Members Get</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Everything you need to build valuable relationships. No upsells. No hidden fees.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Curated Member Directory", desc: "Browse 100+ vetted professionals across finance, tech, consulting, and commerce. Advanced filters by expertise, location, and needs." },
              { icon: MessageSquare, title: "Direct Messaging", desc: "Skip connection requests. Message anyone directly. Average response time under 12 hours because everyone here is committed." },
              { icon: Zap, title: "Requests Board", desc: "Post what you need and get responses from people who can actually help. Typical asks: investor intros, hiring referrals, strategic advice." },
              { icon: Shield, title: "Personal Intro Service", desc: "I personally facilitate warm introductions when you need to connect with someone specific. White-glove concierge included." },
              { icon: Calendar, title: "Member-Hosted Events", desc: "Virtual roundtables and local meetups hosted by members. Learn from operators who've been there. No fluff, actionable insights only." },
              { icon: TrendingUp, title: "Deal Flow & Opportunities", desc: "First access to partnership opportunities, investment deals, and key hires from within the network. Your competitive advantage." }
            ].map((f, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-amber-500/50 transition-all">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>{/* How It Works */}
      <section id="how-it-works" className="py-12 md:py-16 px-4 md:px-6 bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Simple, transparent process from invitation to connection</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 md:gap-8">
            {[
              { num: "1", title: "Receive Invitation", desc: "Every member is personally vetted and invited. No public sign-ups." },
              { num: "2", title: "Apply & Pay", desc: "Complete your profile and secure your founding member spot at locked pricing." },
              { num: "3", title: "Get Approved", desc: "I personally review every application to ensure quality and fit." },
              { num: "4", title: "Start Connecting", desc: "Browse directory, send messages, post requests, and grow your network." }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-400">{step.desc}</p>
                </div>
                {i < 3 && (
                  <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-amber-500/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Founder Story */}
      <section id="about" className="py-12 md:py-16 px-4 md:px-6 bg-black border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-black font-bold text-xl flex-shrink-0">
                SS
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Shehab Salamah</h3>
                <p className="text-zinc-400 text-sm">Founder & Curator</p>
              </div>
            </div>
            
            <h4 className="text-2xl md:text-3xl font-bold text-white mb-6">A Letter From The Founder</h4>
            
            <div className="space-y-4 text-zinc-400 leading-relaxed">
              <p>
                Throughout my career building and scaling businesses across finance, technology, consulting, data analytics, and e-commerce, I've encountered a persistent challenge that most high-performing professionals face: finding the right connections at the right time.
              </p>
              <p>
                The professionals I needed weren't just skilled—they had capital to deploy, specialized expertise to share, and networks that could open doors. They existed, but traditional networking channels failed to connect us effectively.
              </p>
              <p>
                Existing platforms presented clear limitations: LinkedIn became oversaturated with spam and superficial connections. Industry-specific networks were too narrow, limiting cross-pollination of ideas. Premium networks were prohibitively expensive ($8,500+/year) or focused solely on single demographics.
              </p>
              <p>
                The Circle Network addresses these gaps with a fundamentally different approach: <span className="text-white font-semibold">quality over quantity, accessibility over exclusivity, and genuine collaboration over transactional relationships</span>.
              </p>
              <p>
                I'm personally vetting every member, facilitating introductions, and ensuring this network delivers tangible value. This is not a passive community—it's an active platform for professionals who are committed to mutual growth and success.
              </p>
              <p className="text-white font-semibold pt-4">
                Our founding members are setting the standard for what professional networking should be: direct, valuable, and results-driven.
              </p>
              <p className="text-sm text-zinc-500 pt-4">
                — Shehab Salamah<br/>
                Founder, The Circle Network
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Guarantee */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-b from-zinc-950 to-black border-b border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <Award className="w-16 h-16 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">The $10,000 Value Guarantee</h2>
          <p className="text-lg md:text-xl text-zinc-400 mb-4 max-w-2xl mx-auto">
            If The Circle Network doesn't provide at least <span className="text-amber-400 font-semibold">$10,000 in value</span> to you in your first year—through connections made, deals closed, problems solved, or time saved—we'll refund your full membership fee.
          </p>
          <p className="text-zinc-500 text-sm max-w-xl mx-auto">
            One quality introduction can generate 10x your investment. We're confident you'll receive exponentially more value than the membership cost.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 md:py-16 px-4 md:px-6 bg-black border-b border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Founding Member Pricing</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Lock in this rate forever. Regular pricing ($2,997/year) starts after the founding cohort closes.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-zinc-900 border-2 border-amber-500 rounded-2xl p-6 md:p-8 relative">
              <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                BEST VALUE
              </div>
              <div className="text-center mb-6">
                <div className="text-zinc-400 text-sm font-medium mb-2">Annual</div>
                <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-1">$2,400</div>
                <div className="text-zinc-500 text-sm">$200/month equivalent • Save $984</div>
              </div>
              <ul className="space-y-3 mb-8">
                {["Price locked forever", "Invite 5 members (skip vetting)", "Personal intro service", "All features included", "Cancel anytime"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-zinc-300">
                    <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-3 rounded-lg transition-all">
                Choose Annual
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="text-zinc-400 text-sm font-medium mb-2">Monthly</div>
                <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-1">$200</div>
                <div className="text-zinc-500 text-sm">per month • Flexible billing</div>
              </div>
              <ul className="space-y-3 mb-8">
                {["Price locked forever", "Invite 5 members (skip vetting)", "Personal intro service", "All features included", "Cancel anytime"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-zinc-300">
                    <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-lg transition-colors border border-zinc-700">
                Choose Monthly
              </button>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-zinc-500 text-sm">
              Regular price after founding cohort: <span className="text-amber-400 font-semibold">$2,997/year</span> or <span className="text-amber-400 font-semibold">$299/month</span>
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-zinc-950">
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Join?</h2>
          <p className="text-lg text-zinc-400 mb-8">
            Secure your founding member spot before applications close in {timeLeft.days} days.
          </p>
          
          <button
            onClick={() => document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-4 px-12 rounded-lg transition-all text-lg shadow-lg shadow-amber-500/20 inline-flex items-center gap-2"
          >
            Apply Now
            <ArrowRight className="w-6 h-6" />
          </button>

          <p className="text-sm text-zinc-500 mt-6">
            Questions? Email <a href="mailto:invite@thecirclenetwork.org" className="text-amber-400 hover:text-amber-300 underline">invite@thecirclenetwork.org</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-zinc-800 py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" stroke="#D4AF37" strokeWidth="2" fill="none"/>
                  <circle cx="20" cy="20" r="12" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
                  <circle cx="20" cy="20" r="6" fill="#D4AF37"/>
                </svg>
                <span className="font-bold text-lg text-white">The Circle Network</span>
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                The invite-only network where high-performers connect, collaborate, and grow together.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-zinc-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-zinc-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="text-zinc-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#about" className="text-zinc-400 hover:text-white transition-colors">About</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/terms" className="text-zinc-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="text-zinc-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/refund" className="text-zinc-400 hover:text-white transition-colors">Refund Policy</a></li>
                <li><a href="mailto:invite@thecirclenetwork.org" className="text-zinc-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500 text-center md:text-left">
              © 2024 The Circle Network. All rights reserved.
            </p>
            <p className="text-xs text-zinc-600 text-center md:text-right">
              Made with care for high-performing professionals worldwide
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}