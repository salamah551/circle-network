'use client';
import { useState, useEffect } from 'react';
import { Award, MessageSquare, TrendingUp, Calendar, Eye, Star, Loader2, AlertCircle } from 'lucide-react';
import DashboardWidget from './DashboardWidget';

/**
 * Community Highlights Widget
 * Shows recent community activity and highlights
 * Fetches data from /api/community/highlights endpoint
 */
export default function CommunityHighlightsWidget() {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const response = await fetch('/api/community/highlights');
        if (!response.ok) {
          throw new Error('Failed to fetch community highlights');
        }
        const data = await response.json();
        setHighlights(data);
      } catch (err) {
        console.error('Error fetching community highlights:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.floor(Math.abs(diffMs) / 86400000);

    if (diffMs > 0) {
      // Future date
      return `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else {
      // Past date
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  const getIconComponent = (iconKey) => {
    const icons = {
      award: Award,
      message: MessageSquare,
      trending: TrendingUp,
      calendar: Calendar,
      star: Star
    };
    return icons[iconKey] || Award;
  };

  const getIconColors = (type) => {
    const colors = {
      achievement: { bg: 'bg-amber-500/10', color: 'text-amber-400' },
      discussion: { bg: 'bg-blue-500/10', color: 'text-blue-400' },
      trending: { bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
      event: { bg: 'bg-purple-500/10', color: 'text-purple-400' },
      spotlight: { bg: 'bg-pink-500/10', color: 'text-pink-400' }
    };
    return colors[type] || colors.achievement;
  };

  return (
    <DashboardWidget
      title="Community Highlights"
      icon={Eye}
      size="default"
      iconColor="text-pink-400"
      iconBg="bg-pink-500/10"
    >
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Failed to load community highlights. Please try again later.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {highlights.map((highlight) => {
            const Icon = getIconComponent(highlight.iconKey);
            const colors = getIconColors(highlight.type);
            return (
              <div
                key={highlight.id}
                className="group bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 
                         rounded-lg p-4 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${colors.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white mb-1 group-hover:text-pink-400 transition-colors">
                      {highlight.title}
                    </h4>
                    <p className="text-sm text-zinc-400 mb-2 leading-relaxed">
                      {highlight.description}
                    </p>
                    <p className="text-xs text-zinc-500">{formatTime(highlight.time)}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {highlights.length === 0 && (
            <div className="text-center py-8 text-zinc-500">
              <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No highlights yet</p>
            </div>
          )}
        </div>
      )}
    </DashboardWidget>
  );
}
