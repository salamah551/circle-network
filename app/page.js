'use client';
import React, { useState, useEffect } from 'react';
import { Check, Users, MessageSquare, Zap, Shield, TrendingUp, Calendar, Award, ArrowRight, Clock, X, Menu, Star, Building2, Sparkles, Target, Briefcase, Network } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 14 });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev.days > 0 ? { days: prev.days - 1 } : prev);
    }, 86400000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async () => {
    if (!email || !inviteCode) {
      setError('Please enter both email and invite code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const validateResponse = await fetch('/api/auth/validate-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, inviteCode }),
      });

      const validateData = await validateResponse.json();

      if (!validateResponse.ok) {
        throw new Error(validateData.error || 'Invalid invite code');
      }

      const magicLinkResponse = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, inviteCode }),
      });

      const magicLinkData = await magicLinkResponse.json();

      if (!magicLinkResponse.ok) {
        throw new Error(magicLinkData.error || 'Failed to send magic link');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your email!</h2>
          <p className="text-zinc-400 mb-6">We sent a magic link to <strong className="text-white">{email}</strong></p>
          <p className="text-sm text-zinc-500 mb-4">Click the link in your email to continue your application. The link expires in 1 hour.</p>
          <p className="text-xs text-zinc-600">Didn't receive it? Check your spam folder or try again in a few minutes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
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
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
            <button 
              onClick={() => document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-2 rounded-lg transition-colors text-sm"
            >
              Apply Now
            </button>
          </nav>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-zinc-800 pt-4">
            <nav className="flex flex-col gap-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm text-zinc-400 hover:text-white">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm text-zinc-400 hover:text-white">How It Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm text-zinc-400 hover:text-white">Pricing</a>
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
            <p className="text-zinc-500 text-sm mt-6">Limited to first 1,000 founding members</p>
          </div>

          <div id="cta-form" className="max-w-md mx-auto space-y-3 px-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={isLoading}
            />
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Your invitation code"
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Claim Your Founding Member Spot'}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>

          <p className="text-zinc-500 text-sm mt-4 px-4">
            <span className="text-amber-400">$199/month</span> founding member price • Locked forever
          </p>
        </div>
      </section>

      <section className="bg-zinc-950 py-12 px-4 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { number: '100+', label: 'Members', icon: Users },
            { number: '$2.3M+', label: 'Deals Closed', icon: TrendingUp },
            { number: '<12hr', label: 'Avg Response', icon: Clock },
            { number: '94%', label: 'Satisfaction', icon: Star }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="flex justify-center mb-3">
                <stat.icon className="w-8 h-8 text-amber-400" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.number}</div>
              <div className="text-sm text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center mb-6">
                <X className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">The Problem</h3>
              <ul className="space-y-3 text-zinc-400">
                <li className="flex gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Traditional networking events waste your time with unqualified contacts</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>LinkedIn is flooded with spam and people pitching services</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Most exclusive networks aren't actually exclusive</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Finding the right intro at the right time is nearly impossible</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-2xl p-8">
              <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center mb-6">
                <Check className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">The Circle Solution</h3>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>Invite-only vetting ensures every member is high-caliber</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>Post specific asks and get responses within 12 hours</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>Curated member directory with verified backgrounds</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>Concierge service to facilitate high-value introductions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 md:py-24 px-4 bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built For High-Performers</h2>
            <p className="text-zinc-400 text-lg">Everything you need to expand your network and close more deals</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Member Directory', desc: 'Browse vetted professionals by industry, expertise, and location.' },
              { icon: MessageSquare, title: 'Direct Messaging', desc: 'Skip the cold outreach. Message any member directly.' },
              { icon: Target, title: 'Requests Board', desc: 'Post what you need and let members come to you with solutions.' },
              { icon: Calendar, title: 'Member Events', desc: 'Join intimate roundtables, dinners, and virtual sessions.' },
              { icon: Briefcase, title: 'Concierge Intros', desc: 'Tell us who you need to meet and we will make warm introductions.' },
              { icon: Shield, title: 'Privacy First', desc: 'Control your visibility. Your data is never sold.' }
            ].map((feature, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-amber-500/50 transition-colors">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-zinc-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 md:py-24 px-4 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-zinc-400 text-lg">From invite to your first valuable connection</p>
          </div>

          <div className="space-y-8">
            {[
              { num: '1', title: 'Receive Your Invite', desc: 'Members can invite professionals they trust. Your invite code is your key to apply.' },
              { num: '2', title: 'Complete Your Profile', desc: 'Share your background, expertise, and what you are looking for.' },
              { num: '3', title: 'Get Approved & Pay', desc: 'Once approved, secure your founding member rate of $199/month locked forever.' },
              { num: '4', title: 'Start Connecting', desc: 'Browse members, post requests, attend events, and make introductions that move your business forward.' }
            ].map((step, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-amber-500 text-black font-bold text-xl rounded-full flex items-center justify-center flex-shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-zinc-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 md:py-24 px-4 bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-zinc-400 text-lg">Lock in your founding member rate today</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-zinc-900 border-2 border-amber-500 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-amber-500 text-black text-xs font-bold px-4 py-1 rounded-full">FOUNDING MEMBER</span>
              </div>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-amber-400 mb-2">$199</div>
                <div className="text-zinc-400">/month</div>
                <div className="text-amber-400 text-sm font-semibold mt-2">Price locked forever</div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Full platform access',
                  'Direct messaging',
                  'Requests board',
                  'Member events',
                  'Concierge intros',
                  'Invite 5 members',
                  'Founding member badge',
                  'Cancel anytime'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-lg transition-colors"
              >
                Claim This Rate →
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 opacity-60">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-white mb-2">$249</div>
                <div className="text-zinc-400">/month</div>
                <div className="text-zinc-500 text-sm mt-2">After 1,000 members</div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Full platform access',
                  'Direct messaging',
                  'Requests board',
                  'Member events',
                  'Concierge intros',
                  'Invite 3 members',
                  'Standard badge',
                  'Cancel anytime'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                    <span className="text-zinc-500">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="w-full bg-zinc-800 text-zinc-600 font-bold py-3 rounded-lg text-center">
                Not Available Yet
              </div>
            </div>
          </div>

          <div className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center">
            <h3 className="text-lg font-bold text-amber-400 mb-2">$10,000 Value Guarantee</h3>
            <p className="text-zinc-400">If The Circle doesn't provide at least $10,000 in value in your first year, we'll refund your full membership fee.</p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Who's Already Inside</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { role: 'Tech Founders', companies: 'YC, Techstars, 500 Startups' },
              { role: 'VCs & Angels', companies: 'Series A-C investors' },
              { role: 'Operators', companies: 'VP+ at growth companies' },
              { role: 'Consultants', companies: 'McKinsey, Bain, BCG alumni' },
              { role: 'Executives', companies: 'Fortune 500 leadership' },
              { role: 'Advisors', companies: 'Board members, advisors' }
            ].map((group, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 text-center">
                <Building2 className="w-6 h-6 md:w-8 md:h-8 text-amber-400 mx-auto mb-2 md:mb-3" />
                <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2">{group.role}</h3>
                <p className="text-zinc-500 text-xs md:text-sm">{group.companies}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Results From Real Members</h2>
            <p className="text-zinc-400 text-lg">See what happens when you connect with the right people</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12">
            {[
              {
                result: 'Closed $2M Series A',
                story: 'Connected with a lead investor through The Circle who led our round in 6 weeks.',
                name: 'Sarah Chen',
                title: 'Founder, AI Startup'
              },
              {
                result: 'Hired VP of Sales',
                story: 'Posted on the requests board and had 3 qualified candidates referred within 48 hours.',
                name: 'Michael Torres',
                title: 'CEO, SaaS Company'
              },
              {
                result: 'Landed $500K Client',
                story: 'A member intro led to our biggest enterprise deal. Paid for membership 25x over.',
                name: 'David Park',
                title: 'Agency Owner'
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="text-amber-400 font-bold text-lg mb-3">{testimonial.result}</div>
                <p className="text-zinc-300 mb-4 text-sm leading-relaxed">{testimonial.story}</p>
                <div className="pt-4 border-t border-zinc-800">
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-zinc-500 text-xs">{testimonial.title}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-2xl p-6 md:p-8 text-center">
            <h3 className="text-xl md:text-2xl font-bold mb-3">Average Member ROI: 47x</h3>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Our members report an average of $9,400 in value per month from introductions, deals, and hires made through The Circle.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-zinc-400 text-lg">Everything you need to know</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does the invite system work?',
                a: 'Current members can invite professionals they trust and vouch for. Each founding member receives 5 invite codes to share. This ensures quality and maintains our high standards.'
              },
              {
                q: 'What if I do not get $10,000 in value?',
                a: 'We stand behind our guarantee. If you actively participate for 12 months and do not receive at least $10,000 in measurable value, we will refund your entire membership fee.'
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. There are no long-term contracts. Cancel anytime and you will not be charged again. Your founding member rate is locked in if you return later.'
              },
              {
                q: 'How is this different from LinkedIn?',
                a: 'LinkedIn has 900M+ users with no vetting. The Circle has 100+ hand-selected professionals. Every member is verified, active, and incentivized to help. Think quality over quantity.'
              },
              {
                q: 'What industries are represented?',
                a: 'We have members across tech, finance, consulting, real estate, healthcare, and professional services. The diversity creates unique cross-industry opportunities.'
              }
            ].map((faq, i) => (
              <details key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 group">
                <summary className="font-bold text-lg cursor-pointer list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-amber-400 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-zinc-400 mt-4 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-black to-zinc-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to join?</h2>
          <p className="text-xl text-zinc-400 mb-8">
            Your invitation expires in {timeLeft.days} days. Secure your founding member rate now.
          </p>
          <button 
            onClick={() => document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-8 py-4 rounded-lg transition-all inline-flex items-center gap-2 text-lg shadow-lg shadow-amber-500/20"
          >
            Claim Your Spot
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="border-t border-zinc-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" stroke="#D4AF37" strokeWidth="2" fill="none"/>
                  <circle cx="20" cy="20" r="12" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
                  <circle cx="20" cy="20" r="6" fill="#D4AF37"/>
                </svg>
                <span className="font-bold text-lg">The Circle Network</span>
              </div>
              <p className="text-zinc-500 text-sm mb-4">
                The invite-only network where high-performers connect, collaborate, and win together.
              </p>
              <p className="text-zinc-600 text-xs">
                © 2025 The Circle Network LLC. All rights reserved.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="text-zinc-500 hover:text-white transition-colors">About</a></li>
                <li><a href="#features" className="text-zinc-500 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-zinc-500 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="mailto:invite@thecirclenetwork.org" className="text-zinc-500 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/terms" className="text-zinc-500 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="text-zinc-500 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/refund" className="text-zinc-500 hover:text-white transition-colors">Refund Policy</a></li>
                <li><a href="/acceptable-use" className="text-zinc-500 hover:text-white transition-colors">Acceptable Use</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-8 text-center">
            <p className="text-zinc-500 text-sm">
              Questions? Email us at{' '}
              <a href="mailto:invite@thecirclenetwork.org" className="text-amber-400 hover:text-amber-300 transition-colors">
                invite@thecirclenetwork.org
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

