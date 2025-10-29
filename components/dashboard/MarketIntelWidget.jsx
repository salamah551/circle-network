'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Loader2, AlertCircle } from 'lucide-react';
import DashboardWidget from './DashboardWidget';

/**
 * Market Intel Widget
 * Shows competitive intelligence and market insights
 */
export default function MarketIntelWidget() {
  const [intel, setIntel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIntel();
  }, []);

  const fetchIntel = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/market-intel');
      if (!response.ok) throw new Error('Failed to load market intel');
      const data = await response.json();
      setIntel(data.intel || []);
    } catch (err) {
      console.error('Error fetching market intel:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const getCategoryFromSource = (source) => {
    // Map source to category-like display
    if (source.includes('Market')) return 'Market Trend';
    if (source.includes('Industry')) return 'Industry';
    if (source.includes('Trend')) return 'Industry Trend';
    return source;
  };

  return (
    <DashboardWidget
      title="Market Intel"
      icon={TrendingUp}
      size="default"
      iconColor="text-emerald-400"
      iconBg="bg-emerald-500/10"
    >
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-2/3" />
                <div className="h-3 bg-zinc-800 rounded w-full" />
                <div className="h-3 bg-zinc-800 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-400 mb-3">Failed to load market intel</p>
          <button
            onClick={fetchIntel}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 
                     rounded-lg text-sm text-red-300 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {intel.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 
                       border-l-2 border-l-emerald-500
                       hover:border-emerald-500/30 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="font-medium text-white">{item.title}</h4>
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm text-zinc-400 mb-3 leading-relaxed">
                {item.summary}
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded">
                  {getCategoryFromSource(item.source)}
                </span>
              </div>
            </div>
          ))}

          {intel.length === 0 && (
            <div className="text-center py-8 text-zinc-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No market intel available</p>
            </div>
          )}
        </div>
      )}
    </DashboardWidget>
  );
}
