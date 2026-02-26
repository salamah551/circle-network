'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Loader2, AlertCircle, LogIn } from 'lucide-react';
import DashboardWidget from './DashboardWidget';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

/**
 * Market Intel Widget
 * Shows competitive intelligence and market insights
 * Fetches data from /api/market-intel endpoint
 */
export default function MarketIntelWidget() {
  const [intel, setIntel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIntel = async () => {
      try {
        const response = await fetchWithAuth('/api/market-intel');
        if (response.status === 401 || response.status === 403) {
          setError('reauth');
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch market intel');
        }
        const data = await response.json();
        setIntel(data);
      } catch (err) {
        console.error('Error fetching market intel:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIntel();
  }, []);

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
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      )}

      {error === 'reauth' ? (
        <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <LogIn className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            Your session has expired.{' '}
            <a href="/login" className="underline hover:text-amber-300">Sign in again</a> to view market intel.
          </p>
        </div>
      ) : error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Failed to load market intel. Please try again later.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {intel.map((item) => (
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

          {intel.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-emerald-400/50" />
              <p className="text-white font-medium mb-2">No intel yet</p>
              <p className="text-sm text-zinc-400 mb-4">
                Ask ARC™ for market intelligence on any industry, competitor, or trend.
              </p>
              <Link
                href="/help/arc"
                className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Learn about ARC™ Intel
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </DashboardWidget>
  );
}
