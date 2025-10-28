'use client';
import { Award, MessageSquare, TrendingUp, Calendar, Eye } from 'lucide-react';
import DashboardWidget from './DashboardWidget';

/**
 * Community Highlights Widget
 * Shows recent community activity and highlights
 */
export default function CommunityHighlightsWidget() {
  const mockHighlights = [
    {
      id: 1,
      type: 'achievement',
      icon: Award,
      title: 'Member Milestone',
      description: '5 members closed funding rounds this week',
      time: '2 days ago',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400'
    },
    {
      id: 2,
      type: 'discussion',
      icon: MessageSquare,
      title: 'Hot Topic',
      description: 'AI ethics debate trending in the feed',
      time: '3 days ago',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400'
    },
    {
      id: 3,
      type: 'trending',
      icon: TrendingUp,
      title: 'Popular Resource',
      description: 'New market report shared by 15 members',
      time: '4 days ago',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400'
    },
    {
      id: 4,
      type: 'event',
      icon: Calendar,
      title: 'Upcoming Event',
      description: 'Virtual networking session next Tuesday',
      time: 'In 5 days',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-400'
    }
  ];

  return (
    <DashboardWidget
      title="Community Highlights"
      icon={Eye}
      size="default"
      iconColor="text-pink-400"
      iconBg="bg-pink-500/10"
    >
      <div className="space-y-3">
        {mockHighlights.map((highlight) => {
          const Icon = highlight.icon;
          return (
            <div
              key={highlight.id}
              className="group bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 
                       rounded-lg p-4 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${highlight.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${highlight.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white mb-1 group-hover:text-pink-400 transition-colors">
                    {highlight.title}
                  </h4>
                  <p className="text-sm text-zinc-400 mb-2 leading-relaxed">
                    {highlight.description}
                  </p>
                  <p className="text-xs text-zinc-500">{highlight.time}</p>
                </div>
              </div>
            </div>
          );
        })}

        {mockHighlights.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No highlights yet</p>
          </div>
        )}
      </div>
    </DashboardWidget>
  );
}
