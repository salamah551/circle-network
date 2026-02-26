'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function WelcomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tier = searchParams.get('tier') || 'core';
  const [isLoading, setIsLoading] = useState(false);

  // Determine tier-specific content
  const isInnerCircle = tier.toLowerCase() === 'founding' || tier.toLowerCase() === 'inner circle';
  
  const content = isInnerCircle ? {
    headline: 'Welcome to the Inner Circle, Founder.',
    subheadline: 'Your role in shaping our collective begins now. Before you enter, let\'s calibrate your experience.',
    ctaText: 'Begin Calibration',
    tierBadge: 'Inner Circle (Founding Member)'
  } : {
    headline: 'Welcome, Charter Member.',
    subheadline: 'We\'re thrilled to have you in our foundational community. Let\'s personalize your experience to unlock its full potential.',
    ctaText: 'Begin Personalization',
    tierBadge: 'Core (Charter Member)'
  };

  const handleContinue = () => {
    setIsLoading(true);
    router.push('/welcome/quiz');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full text-center">
        {/* Tier Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-semibold mb-8">
          <Sparkles className="w-4 h-4" />
          <span>{content.tierBadge}</span>
        </div>

        {/* Main Content */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          {content.headline}
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          {content.subheadline}
        </p>

        {/* CTA Button */}
        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-lg rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black"
        >
          <span>{content.ctaText}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Optional: Skip link (if needed) */}
        <div className="mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-zinc-500 hover:text-zinc-400 text-sm transition-colors focus:outline-none focus:text-zinc-300"
          >
            Skip for now →
          </button>
        </div>
      </div>
    </div>
  );
}
