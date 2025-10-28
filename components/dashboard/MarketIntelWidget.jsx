'use client';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import DashboardWidget from './DashboardWidget';

/**
 * Market Intel Widget
 * Shows competitive intelligence and market insights
 */
export default function MarketIntelWidget() {
  const mockIntel = [
    {
      id: 1,
      title: 'SaaS Market Growth',
      insight: 'Enterprise SaaS expected to grow 23% in Q4',
      trend: 'up',
      category: 'Market Trend',
      urgency: 'high'
    },
    {
      id: 2,
      title: 'Competitor Activity',
      insight: 'Major competitor announced Series B funding',
      trend: 'neutral',
      category: 'Competition',
      urgency: 'medium'
    },
    {
      id: 3,
      title: 'Industry Shift',
      insight: 'AI adoption accelerating in target sector',
      trend: 'up',
      category: 'Industry',
      urgency: 'high'
    }
  ];

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-400" />;
    return <Activity className="w-4 h-4 text-zinc-400" />;
  };

  const getUrgencyColor = (urgency) => {
    if (urgency === 'high') return 'border-l-amber-500';
    if (urgency === 'medium') return 'border-l-blue-500';
    return 'border-l-zinc-700';
  };

  return (
    <DashboardWidget
      title="Market Intel"
      icon={TrendingUp}
      size="default"
      iconColor="text-emerald-400"
      iconBg="bg-emerald-500/10"
    >
      <div className="space-y-3">
        {mockIntel.map((item) => (
          <div
            key={item.id}
            className={`bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 
                     border-l-2 ${getUrgencyColor(item.urgency)}
                     hover:border-emerald-500/30 transition-all duration-200 cursor-pointer`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-medium text-white">{item.title}</h4>
              {getTrendIcon(item.trend)}
            </div>
            <p className="text-sm text-zinc-400 mb-3 leading-relaxed">
              {item.insight}
            </p>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded">
                {item.category}
              </span>
              {item.urgency === 'high' && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded">
                  High Priority
                </span>
              )}
            </div>
          </div>
        ))}

        {mockIntel.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No market intel available</p>
          </div>
        )}
      </div>
    </DashboardWidget>
  );
}
