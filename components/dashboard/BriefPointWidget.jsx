'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, CheckCircle, AlertCircle, ChevronRight, Loader2, LogIn, Plus, Link as LinkIcon } from 'lucide-react';
import DashboardWidget from './DashboardWidget';
import { formatRelativeTime } from '@/lib/date-utils';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

/**
 * BriefPoint Widget
 * Shows upcoming meeting briefs and daily usage on the dashboard.
 * Fetches data from /api/briefpoint/meetings and /api/briefpoint/usage.
 */
export default function BriefPointWidget() {
  const router = useRouter();
  const [meetings, setMeetings] = useState([]);
  const [usage, setUsage] = useState({ used: 0, limit: 5, remaining: 5 });
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const meetingsRef = useRef([]);

  const fetchData = async () => {
    try {
      const [meetingsRes, usageRes] = await Promise.all([
        fetchWithAuth('/api/briefpoint/meetings'),
        fetchWithAuth('/api/briefpoint/usage'),
      ]);

      if (meetingsRes.status === 401 || meetingsRes.status === 403) {
        setError('reauth');
        return;
      }

      if (meetingsRes.ok) {
        const data = await meetingsRes.json();
        const sliced = Array.isArray(data) ? data.slice(0, 5) : [];
        setMeetings(sliced);
        meetingsRef.current = sliced;
        setCalendarConnected(Array.isArray(data) && data.some(m => m.source === 'google_calendar'));
      }

      if (usageRes.ok) {
        setUsage(await usageRes.json());
      }
    } catch (err) {
      console.error('Error fetching BriefPoint data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Keep a ref to the latest meetings so the interval can check without stale closure
  useEffect(() => {
    fetchData();

    // Auto-refresh every 10 seconds if any meeting is still processing
    const interval = setInterval(() => {
      if (meetingsRef.current.some(m => m.status === 'processing')) {
        fetchData();
      }
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
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-emerald-400';
      case 'processing': return 'text-amber-400';
      case 'failed': return 'text-red-400';
      default: return 'text-zinc-500';
    }
  };

  return (
    <DashboardWidget
      title="BriefPoint"
      icon={Calendar}
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
          <p className="text-sm">Failed to load BriefPoint data. Please try again later.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {/* Daily usage + actions bar */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-500">
              {usage.used}/{usage.limit} briefs used today
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/briefpoint/new')}
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium"
              >
                <Plus className="w-3 h-3" />
                New Brief
              </button>
              {!calendarConnected && (
                <button
                  onClick={() => router.push('/briefpoint')}
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  <LinkIcon className="w-3 h-3" />
                  Connect Calendar
                </button>
              )}
            </div>
          </div>

          {/* Usage progress bar */}
          <div className="w-full bg-zinc-800 rounded-full h-1 mb-3">
            <div
              className="bg-purple-500 h-1 rounded-full transition-all"
              style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
            />
          </div>

          {/* Meeting list */}
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => router.push(`/briefpoint/${meeting.id}`)}
              className="group bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800
                       rounded-lg p-4 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(meeting.status)}
                    <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors truncate">
                      {meeting.title || 'Untitled Meeting'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <span className={getStatusColor(meeting.status)}>
                      {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                    </span>
                    <span>•</span>
                    <span>{formatRelativeTime(meeting.meeting_time)}</span>
                    {meeting.source === 'google_calendar' && (
                      <>
                        <span>•</span>
                        <span className="text-xs text-purple-400/70">Calendar</span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </div>
          ))}

          {meetings.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-purple-400/50" />
              <p className="text-white font-medium mb-2">No meeting briefs yet</p>
              <p className="text-sm text-zinc-400 mb-4">
                Submit a meeting to get AI-powered participant intelligence and talking points.
              </p>
              <button
                onClick={() => router.push('/briefpoint/new')}
                className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 font-medium"
              >
                <Plus className="w-3 h-3" />
                Create your first brief
              </button>
            </div>
          )}
        </div>
      )}
    </DashboardWidget>
  );
}
