'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Clock, CheckCircle, AlertCircle, ChevronRight, Loader2, LogIn } from 'lucide-react';
import DashboardWidget from './DashboardWidget';
import { formatRelativeTime } from '@/lib/date-utils';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

/**
 * My ARC™ Briefs Widget
 * Shows status of requests to the AI engine
 * Fetches data from /api/arc/briefs endpoint
 */
export default function ArcBriefsWidget() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBriefs = async () => {
    try {
      const response = await fetchWithAuth('/api/arc/briefs');
      if (response.status === 401 || response.status === 403) {
        setError('reauth');
        return;
      }
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

  useEffect(() => {
    fetchBriefs();

    // Auto-refresh every 10 seconds if any brief is processing
    const interval = setInterval(() => {
      setRequests(prev => {
        if (prev.some(r => r.status === 'processing')) {
          fetchBriefs();
        }
        return prev;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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

      {error === 'reauth' ? (
        <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <LogIn className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            Your session has expired.{' '}
            <a href="/login" className="underline hover:text-amber-300">Sign in again</a> to view your briefs.
          </p>
        </div>
      ) : error && (
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
            onClick={() => router.push(`/arc/${request.id}`)}
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
                  {request.type && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      request.type === 'brief' 
                        ? 'bg-blue-500/20 text-blue-400'
                        : request.type === 'travel'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <span className={getStatusColor(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  <span>•</span>
                  <span>{formatRelativeTime(request.updated_at)}</span>
                  {request.attachments_count > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {request.attachments_count}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}

          {requests.length === 0 && (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 mx-auto mb-3 text-purple-400/50" />
              <p className="text-white font-medium mb-2">No briefs yet</p>
              <p className="text-sm text-zinc-400 mb-4">
                Try asking ARC to analyze your next contract or trip.
              </p>
              <button
                onClick={() => {
                  const input = document.getElementById('arc-action-input');
                  if (input) {
                    input.focus();
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Show a subtle toast notification
                    const toast = document.createElement('div');
                    toast.className = 'fixed bottom-4 right-4 bg-purple-500/90 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
                    toast.textContent = 'Type your brief and press Enter to submit.';
                    document.body.appendChild(toast);
                    setTimeout(() => {
                      toast.style.opacity = '0';
                      toast.style.transition = 'opacity 0.3s ease-out';
                      setTimeout(() => toast.remove(), 300);
                    }, 3000);
                  }
                }}
                className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
              >
                Request a brief
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </DashboardWidget>
  );
}
