'use client';
import { useState, useEffect } from 'react';
import { Briefcase, Clock, CheckCircle, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import DashboardWidget from './DashboardWidget';

/**
 * My ARC™ Briefs Widget
 * Shows status of requests to the AI engine
 */
export default function ArcBriefsWidget() {
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBriefs();
  }, []);

  const fetchBriefs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/arc/briefs');
      if (!response.ok) throw new Error('Failed to load briefs');
      const data = await response.json();
      setBriefs(data.briefs || []);
    } catch (err) {
      console.error('Error fetching briefs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-amber-400 animate-pulse" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-zinc-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400';
      case 'processing':
        return 'text-amber-400';
      case 'pending':
        return 'text-zinc-500';
      default:
        return 'text-zinc-400';
    }
  };

  const formatTime = (updated_at) => {
    const date = new Date(updated_at);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <DashboardWidget
      title="My ARC™ Briefs"
      icon={Briefcase}
      size="large"
      iconColor="text-purple-400"
      iconBg="bg-purple-500/10"
    >
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-400 mb-3">Failed to load briefs</p>
          <button
            onClick={fetchBriefs}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 
                     rounded-lg text-sm text-red-300 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {briefs.map((request) => (
            <div
              key={request.id}
              className="group bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 
                       rounded-lg p-4 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(request.status)}
                    <h4 className="font-medium text-white group-hover:text-amber-400 transition-colors">
                      {request.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <span className={getStatusColor(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    <span>•</span>
                    <span>{formatTime(request.updated_at)}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}

          {briefs.length === 0 && (
            <div className="text-center py-8 text-zinc-500">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No active requests</p>
              <p className="text-xs mt-1">Use the Action Center to make a new request</p>
            </div>
          )}
        </div>
      )}
    </DashboardWidget>
  );
}
