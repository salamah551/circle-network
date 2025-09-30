'use client';
import React, { useState, useEffect } from 'react';
import { Check, Users, MessageSquare, Zap, Shield, TrendingUp, Calendar, Award, ArrowRight, Clock, X, Menu, Star, Building2, Sparkles } from 'lucide-react';

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
      // Step 1: Validate invite code
      const validateResponse = await fetch('/api/auth/validate-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, inviteCode }),
      });

      const validateData = await validateResponse.json();

      if (!validateResponse.ok) {
        throw new Error(validateData.error || 'Invalid invite code');
      }

      // Step 2: Send magic link
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
            <a href="#about" className="text-sm text-zinc-400 hover:text-white transition-colors">About</a>
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

      {/* Keep all your other sections below - Stats, Problem/Solution, Features, etc. - they're fine as-is */}
    </div>
  );
}
