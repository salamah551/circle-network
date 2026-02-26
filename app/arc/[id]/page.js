'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import {
  ArrowLeft, Loader2, Clock, CheckCircle, AlertCircle,
  FileText, Paperclip, Crown
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

  return <div className="prose-custom">{elements}</div>;
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-zinc-800 text-amber-300 px-1 rounded text-sm">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

const TYPE_LABELS = { brief: 'Brief', travel: 'Travel', intel: 'Intel' };
const TYPE_COLORS = {
  brief: 'bg-blue-500/20 text-blue-400',
  travel: 'bg-purple-500/20 text-purple-400',
  intel: 'bg-emerald-500/20 text-emerald-400'
};

export default function ArcBriefPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBrief = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`/api/arc/briefs/${params.id}`);
      if (!response.ok) throw new Error('Failed to load brief');
      const data = await response.json();
      setBrief(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) fetchBrief();
  }, [params.id, fetchBrief]);

  // Auto-refresh every 5 seconds while status is 'processing'
  // (Faster than the widget's 10s since the user is actively waiting on this page)
  useEffect(() => {
    if (brief?.status !== 'processing') return;
    const interval = setInterval(fetchBrief, 5000);
    return () => clearInterval(interval);
  }, [brief?.status, fetchBrief]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-4" />
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const typeLabel = TYPE_LABELS[brief?.type] || 'Brief';
  const typeColor = TYPE_COLORS[brief?.type] || TYPE_COLORS.brief;
  const attachments = brief?.arc_request_attachments || [];

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
            <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-sm">ARC™ Hub</span>
          </div>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400 text-sm truncate">{brief?.title || 'Brief'}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Brief Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColor}`}>
              {typeLabel}
            </span>
            {brief?.status === 'completed' && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                Completed
              </span>
            )}
            {brief?.status === 'processing' && (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                Processing...
              </span>
            )}
            {brief?.status === 'failed' && (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                Failed
              </span>
            )}
            <span className="text-xs text-zinc-500">
              {brief?.created_at ? new Date(brief.created_at).toLocaleString() : ''}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white leading-snug">
            {brief?.title || brief?.prompt || 'Untitled Brief'}
          </h1>
          {attachments.length > 0 && (
            <div className="flex items-center gap-2 mt-3 text-sm text-zinc-500">
              <Paperclip className="w-4 h-4" />
              <span>{attachments.length} attachment{attachments.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Processing State */}
        {brief?.status === 'processing' && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8 text-center">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
            <p className="text-amber-400 font-semibold mb-1">ARC™ is working on this...</p>
            <p className="text-zinc-400 text-sm">This page will automatically refresh when your brief is ready.</p>
          </div>
        )}

        {/* Result */}
        {brief?.result_md && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-zinc-800">
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-zinc-400">ARC™ Response</span>
            </div>
            <SimpleMarkdown content={brief.result_md} />
          </div>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments
            </h3>
            <div className="space-y-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-3 px-4 py-3 bg-zinc-900 rounded-lg"
                >
                  <FileText className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  <span className="text-sm text-zinc-300 truncate">{att.file_name}</span>
                  {att.file_size && (
                    <span className="text-xs text-zinc-600 ml-auto flex-shrink-0">
                      {(att.file_size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
