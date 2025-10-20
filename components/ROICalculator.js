'use client';
import { useState } from 'react';
import { TrendingUp, DollarSign, Users, Zap } from 'lucide-react';

export default function ROICalculator() {
  const [scenario, setScenario] = useState('intro');

  const scenarios = {
    intro: {
      title: 'One warm intro to investor',
      cost: 2497,
      value: 250000,
      description: 'Skip 6 months of cold outreach. Get a warm intro that actually gets answered.',
      icon: Users,
      color: 'emerald'
    },
    hire: {
      title: 'One quality hire referral',
      cost: 2497,
      value: 50000,
      description: 'Save $50K+ in recruiter fees. Get pre-vetted candidates from trusted members.',
      icon: TrendingUp,
      color: 'blue'
    },
    deal: {
      title: 'One partnership closed',
      cost: 2497,
      value: 500000,
      description: 'Average first-year value of partnerships formed through Circle.',
      icon: Zap,
      color: 'purple'
    },
    advice: {
      title: 'Expert advice or deal insight',
      cost: 2497,
      value: 100000,
      description: 'Avoid costly mistakes. Get insights from founders who\'ve been there.',
      icon: DollarSign,
      color: 'amber'
    }
  };

  const current = scenarios[scenario];
  const Icon = current.icon;
  const roi = Math.round((current.value / current.cost - 1) * 100);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">What's One Connection Worth?</h3>
        <p className="text-zinc-400">Estimated value based on similar elite networks</p>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {Object.entries(scenarios).map(([key, s]) => {
          const ScenarioIcon = s.icon;
          return (
            <button
              key={key}
              onClick={() => setScenario(key)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                scenario === key
                  ? `border-${s.color}-500 bg-${s.color}-500/10`
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <ScenarioIcon className={`w-5 h-5 mb-2 ${scenario === key ? `text-${s.color}-400` : 'text-zinc-500'}`} />
              <div className={`text-sm font-semibold ${scenario === key ? 'text-white' : 'text-zinc-400'}`}>
                {s.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Calculation Display */}
      <div className="bg-black border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon className={`w-8 h-8 text-${current.color}-400`} />
          <div className="flex-1">
            <div className="text-lg font-bold">{current.title}</div>
            <div className="text-sm text-zinc-500">{current.description}</div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400">Annual Investment:</span>
            <span className="text-xl font-bold">${current.cost.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400">Estimated Value:</span>
            <span className={`text-xl font-bold text-${current.color}-400`}>${current.value.toLocaleString()}</span>
          </div>
          <div className="border-t border-zinc-800 pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Return on Investment:</span>
              <div className="text-right">
                <div className={`text-3xl font-bold text-${current.color}-400`}>{roi}x</div>
                <div className="text-xs text-zinc-500">in first month</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-purple-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
        <p className="text-sm text-zinc-300">
          <span className="font-semibold text-emerald-400">Just one valuable connection</span> pays for an entire year of membership
        </p>
      </div>
    </div>
  );
}
