'use client';
import { useState, useEffect } from 'react';
import { Briefcase, Clock, CheckCircle, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import DashboardWidget from './DashboardWidget';

/**
 * My ARC™ Briefs Widget
 * Shows status of requests to the AI engine
 * Fetches data from /api/arc/briefs endpoint
 */
export default function ArcBriefsWidget() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBriefs = async () => {
      try {
        const response = await fetch('/api/arc/briefs');
        if (!response.ok) {
          throw new Error('Failed to fetch ARC briefs');
        }
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        console.error('Error fetching ARC briefs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBriefs();
  }, []);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
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

  return (
    <DashboardWidget
      title="My ARC™ Briefs"
      icon={Briefcase}
      size="large"
      iconColor="text-purple-400"
      iconBg="bg-purple-500/10"
    >
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Failed to load ARC briefs. Please try again later.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {requests.map((request) => (
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

          {requests.length === 0 && (
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
