'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import {
  ArrowLeft, Loader2, Clock, CheckCircle, AlertCircle,
  FileText, Users, Trash2, Calendar
} from 'lucide-react';
import Link from 'next/link';

function SimpleMarkdown({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      elements.push(<h1 key={key++} className="text-2xl font-bold text-white mt-6 mb-3">{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-xl font-bold text-white mt-5 mb-2">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-lg font-semibold text-white mt-4 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={key++} className="text-zinc-300 ml-4 list-disc mb-1">
          {renderInline(line.slice(2))}
        </li>
      );
    } else if (/^\d+\. /.test(line)) {
      const text = line.replace(/^\d+\. /, '');
      elements.push(
        <li key={key++} className="text-zinc-300 ml-4 list-decimal mb-1">
          {renderInline(text)}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<br key={key++} />);
    } else if (line.startsWith('---')) {
      elements.push(<hr key={key++} className="border-zinc-700 my-4" />);
    } else {
      elements.push(
        <p key={key++} className="text-zinc-300 mb-2 leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  }

  return <div>{elements}</div>;
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-zinc-800 text-purple-300 px-1 rounded text-sm">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

export default function BriefPointDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMeeting = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`/api/briefpoint/meetings/${params.id}`);
      if (!response.ok) throw new Error('Failed to load meeting brief');
      const data = await response.json();
      setMeeting(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) fetchMeeting();
  }, [params.id, fetchMeeting]);

  // Auto-refresh every 5 seconds while status is 'processing'
  useEffect(() => {
    if (meeting?.status !== 'processing') return;
    const interval = setInterval(fetchMeeting, 5000);
    return () => clearInterval(interval);
  }, [meeting?.status, fetchMeeting]);

  const handleDelete = async () => {
    if (!confirm('Delete this meeting brief? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const response = await fetchWithAuth(`/api/briefpoint/meetings/${params.id}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/dashboard');
      } else {
        alert('Failed to delete meeting brief.');
      }
    } catch (err) {
      alert('Failed to delete meeting brief.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Loading brief...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Brief not found</h2>
          <p className="text-zinc-400 mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const participants = meeting?.participants || [];
  const meetingDate = meeting?.meeting_time
    ? new Date(meeting.meeting_time).toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">BriefPoint</span>
          </div>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400 text-sm truncate">{meeting?.title || 'Meeting Brief'}</span>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto p-2 hover:bg-red-500/10 rounded-lg transition-colors text-zinc-600 hover:text-red-400"
            title="Delete brief (instant purge)"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Meeting Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {meeting?.status === 'completed' && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                Brief Ready
              </span>
            )}
            {meeting?.status === 'processing' && (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                Generating Brief...
              </span>
            )}
            {meeting?.status === 'failed' && (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                Failed
              </span>
            )}
            {meeting?.source === 'google_calendar' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                Google Calendar
              </span>
            )}
            {meetingDate && (
              <span className="text-xs text-zinc-500">{meetingDate}</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white leading-snug">
            {meeting?.title || 'Untitled Meeting'}
          </h1>
          {meeting?.location && (
            <p className="text-sm text-zinc-500 mt-1">{meeting.location}</p>
          )}
        </div>

        {/* Participants */}
        {participants.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants ({participants.length})
            </h3>
            <div className="space-y-2">
              {participants.map((p, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold flex-shrink-0">
                    {(p.name || p.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-white">{p.name || p.email || 'Unknown'}</span>
                    {(p.title || p.company) && (
                      <span className="text-zinc-500 ml-2">
                        {[p.title, p.company].filter(Boolean).join(' at ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing State */}
        {meeting?.status === 'processing' && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 mb-8 text-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
            <p className="text-purple-400 font-semibold mb-1">BriefPoint is generating your brief...</p>
            <p className="text-zinc-400 text-sm">This page will automatically refresh when your brief is ready.</p>
          </div>
        )}

        {/* Brief Content */}
        {meeting?.brief_md && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-zinc-800">
              <FileText className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-zinc-400">Meeting Brief</span>
            </div>
            <SimpleMarkdown content={meeting.brief_md} />
          </div>
        )}

        {/* Description */}
        {meeting?.description && !meeting?.brief_md && meeting?.status !== 'processing' && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-8">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Agenda / Description</h3>
            <p className="text-zinc-300 text-sm leading-relaxed">{meeting.description}</p>
          </div>
        )}
      </main>
    </div>
  );
}
