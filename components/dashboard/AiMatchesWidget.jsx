'use client';
import { Users, Sparkles, Building2, Target, ArrowRight } from 'lucide-react';
import DashboardWidget from './DashboardWidget';
import Link from 'next/link';

/**
 * AI-Curated Matches Widget
 * Shows AI-matched members with complementary goals/expertise
 */
export default function AiMatchesWidget() {
  const mockMatches = [
    {
      id: 1,
      name: 'Sarah Chen',
      title: 'VP of Engineering',
      company: 'TechCorp',
      matchScore: 94,
      reason: 'Shared interest in AI/ML infrastructure',
      industry: 'Technology',
      avatar: null
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      title: 'Managing Partner',
      company: 'Venture Capital Fund',
      matchScore: 89,
      reason: 'Mutual focus on early-stage SaaS investments',
      industry: 'Finance',
      avatar: null
    },
    {
      id: 3,
      name: 'Emily Thompson',
      title: 'Chief Strategy Officer',
      company: 'Global Logistics Inc',
      matchScore: 87,
      reason: 'Complementary expertise in supply chain optimization',
      industry: 'Logistics',
      avatar: null
    }
  ];

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <DashboardWidget
      title="AI-Curated Matches"
      icon={Sparkles}
      size="large"
      iconColor="text-amber-400"
      iconBg="bg-amber-500/10"
    >
      <p className="text-sm text-zinc-400 mb-4">
        Based on your goals and interests, we suggest connecting with these members
      </p>

      <div className="space-y-3">
        {mockMatches.map((match) => (
          <div
            key={match.id}
            className="group bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 
                     rounded-lg p-4 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 
                           rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-sm">
                  {getInitials(match.name)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-medium text-white group-hover:text-amber-400 transition-colors">
                      {match.name}
                    </h4>
                    <p className="text-sm text-zinc-400">
                      {match.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 
                               text-xs font-bold rounded-full flex-shrink-0">
                    <Sparkles className="w-3 h-3" />
                    {match.matchScore}%
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                  <Building2 className="w-3 h-3" />
                  <span>{match.company}</span>
                  <span>•</span>
                  <span>{match.industry}</span>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <Target className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <p className="text-zinc-400 leading-relaxed">{match.reason}</p>
                </div>
              </div>
            </div>

            {/* Action button (appears on hover) */}
            <div className="mt-3 pt-3 border-t border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href={`/members/${match.id}`}
                className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                View Profile & Connect
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}

        {mockMatches.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No matches available yet</p>
            <p className="text-xs mt-1">Complete your profile to get personalized matches</p>
          </div>
        )}
      </div>
    </DashboardWidget>
  );
}
