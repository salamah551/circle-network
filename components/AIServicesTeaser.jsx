'use client';
import { useState } from 'react';
import { Zap, TrendingUp, Shield, Gem, ArrowRight, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AIServicesTeaser({ userTier = 'founding', isElite = false }) {
  const [showDetails, setShowDetails] = useState(false);

  const services = [
    {
      icon: TrendingUp,
      title: 'AI Competitive Intelligence',
      description: 'Know what your competitors are doing before they do it',
      standardPrice: '$10,000/month',
      memberPrice: isElite ? '$8,000/month' : '$9,000/month',
      savings: isElite ? '$2,000/month' : '$1,000/month',
      features: [
        'Daily competitive briefs',
        'Real-time alerts',
        'Strategic analysis reports'
      ]
    },
    {
      icon: Shield,
      title: 'AI Reputation Guardian',
      description: 'Protect your name before damage happens',
      standardPrice: '$7,000/month',
      memberPrice: isElite ? '$6,000/month' : '$6,500/month',
      savings: isElite ? '$1,000/month' : '$500/month',
      features: [
        '24/7 reputation monitoring',
        'Dark web surveillance',
        'Automated threat alerts'
      ]
    },
    {
      icon: Gem,
      title: 'Deal Flow Alert Service',
      description: 'See investment opportunities before they\'re public',
      standardPrice: '$3,000/month',
      memberPrice: isElite ? '$2,000/month' : '$2,500/month',
      savings: isElite ? '$1,000/month' : '$500/month',
      features: [
        'Weekly curated deals',
        'AI-powered analysis',
        'Pre-public opportunities'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 via-zinc-900 to-blue-500/10 border border-purple-500/20 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 animate-pulse" />
        
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-7 h-7 text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Circle AI Services</h2>
              <p className="text-zinc-400">
                Enterprise-grade AI tools exclusively for Circle Network members
              </p>
            </div>
          </div>

          {isElite && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400 font-semibold">
                Elite Member Benefit: Save up to 33% on all AI services
              </span>
            </div>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-purple-400 text-sm font-semibold hover:text-purple-300 transition-colors flex items-center gap-2"
          >
            {showDetails ? 'Hide Details' : 'Learn More'}
            <ArrowRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="grid md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          {services.map((service, i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <service.icon className="w-6 h-6 text-purple-400" />
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
              <p className="text-sm text-zinc-400 mb-4">{service.description}</p>
              
              <div className="space-y-2 mb-4">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-zinc-500">
                    <span className="text-emerald-400">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl font-bold text-purple-400">{service.memberPrice}</span>
                  <span className="text-xs text-zinc-600 line-through">{service.standardPrice}</span>
                </div>
                <div className="text-xs text-emerald-400 font-semibold">
                  Save {service.savings}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bundle Offer for Elite */}
      {isElite && showDetails && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border-2 border-amber-500/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-amber-400 mb-2">Elite Bundle Offer</h3>
              <p className="text-zinc-300 mb-3">
                Get all 3 AI services for <strong className="text-white">$14,000/month</strong> (save $2,000/month)
              </p>
              <p className="text-sm text-zinc-400 mb-4">
                Or prepay annually: <strong className="text-amber-400">$150,000/year</strong> (save $18,000)
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-all"
              >
                Request Early Access
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Non-Elite CTA */}
      {!isElite && showDetails && (
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
          <Lock className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Upgrade to Elite for Priority Access</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Elite members get 20-33% discounts plus first access to all AI services
          </p>
          <Link
            href="/settings/billing"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-800 border border-zinc-700 text-white font-semibold rounded-lg hover:bg-zinc-700 transition-all"
          >
            Upgrade to Elite
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
