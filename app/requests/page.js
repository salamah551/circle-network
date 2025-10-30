'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import {
  ArrowLeft, Plus, Search, MessageSquare, CheckCircle, Clock,
  Send, X, Lightbulb, Target, Briefcase, Users, Loader2, Crown,
  Filter, ChevronDown
} from 'lucide-react';
import { showToast } from '@/components/Toast.jsx';

const supabase = getSupabaseBrowserClient();

const CATEGORIES = [
  { value: 'all', label: 'All', icon: Target },
  { value: 'fundraising', label: 'Fundraising', icon: Target },
  { value: 'hiring', label: 'Hiring', icon: Users },
  { value: 'partnerships', label: 'Partnerships', icon: Briefcase },
  { value: 'advice', label: 'Advice', icon: Lightbulb },
  { value: 'intros', label: 'Introductions', icon: Users },
  { value: 'other', label: 'Other', icon: Target }
];

function categoryBadgeClasses(v) {
  switch (v) {
    case 'fundraising': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25';
    case 'hiring': return 'bg-blue-500/15 text-blue-400 border border-blue-500/25';
    case 'partnerships': return 'bg-purple-500/15 text-purple-400 border border-purple-500/25';
    case 'advice': return 'bg-amber-500/15 text-amber-400 border border-amber-500/25';
    case 'intros': return 'bg-pink-500/15 text-pink-400 border border-pink-500/25';
    case 'other': return 'bg-zinc-700/20 text-zinc-300 border border-zinc-600/30';
    default: return 'bg-zinc-700/20 text-zinc-300 border border-zinc-600/30';
  }
}

export default function RequestsPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [myProfile, setMyProfile] = useState(null);

  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('open'); // 'all' | 'open' | 'resolved'
  const [filterOpen, setFilterOpen] = useState(false);

  // Composer
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newReq, setNewReq] = useState({ title: '', description: '', category: 'advice' });

  // Thread/replies
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [replyBusy, setReplyBusy] = useState(false);

  const realtimeChannelRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        setMe(session.user);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setMyProfile(profile || null);

        await loadRequests();

        // Real-time subscriptions
        const channel = supabase.channel('requests-realtime');

        // New request created
        channel.on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'requests' },
          async (payload) => {
            const row = payload.new;
            // hydrate profile
            const { data: p } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', row.user_id)
              .single();

            setRequests((prev) => [{ ...row, profile: p, replies: [{ count: 0 }] }, ...prev]);
          }
        );

        // Request status updated (e.g., resolved)
        channel.on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'requests' },
          (payload) => {
            setRequests((prev) =>
              prev.map((r) => (r.id === payload.new.id ? { ...r, ...payload.new } : r))
            );
          }
        );

        // New reply added
        channel.on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'request_replies' },
          async (payload) => {
            const reply = payload.new;

            // Update reply count on list
            setRequests((prev) =>
              prev.map((r) =>
                r.id === reply.request_id
                  ? { ...r, replies: [{ count: ((r.replies?.[0]?.count || 0) + 1) }] }
                  : r
              )
            );

            // If I'm the owner, show toast
            const req = requests.find((r) => r.id === reply.request_id);
            if (req && req.user_id === me?.id && reply.user_id !== me?.id) {
              showToast({
                title: 'New reply to your request',
                description: 'Someone just replied to your request.',
                type: 'info'
              });
            }

            // If thread modal is open, append the live reply
            if (replyModalOpen && activeRequest?.id === reply.request_id) {
              const { data: commenter } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', reply.user_id)
                .single();

              setReplies((prev) => [...prev, { ...reply, profile: commenter }]);
            }
          }
        );

        realtimeChannelRef.current = channel.subscribe();

        setIsLoading(false);
      } catch (e) {
        console.error('Auth/init error:', e);
        setIsLoading(false);
      }
    })();

    return () => {
      if (realtimeChannelRef.current) {
        try {
          realtimeChannelRef.current.unsubscribe();
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          profile:profiles!requests_user_id_fkey(*),
          replies:request_replies(count)
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setRequests(data || []);
    } catch (e) {
      console.error('Error loading requests:', e);
      setRequests([]);
    }
  };

  const filtered = useMemo(() => {
    let arr = [...requests];

    if (category !== 'all') arr = arr.filter((r) => r.category === category);
    if (status !== 'all') arr = arr.filter((r) => r.status === status);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter((r) =>
        (r.title || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.profile?.full_name || '').toLowerCase().includes(q)
      );
    }
    return arr;
  }, [requests, category, status, searchQuery]);

  const openReplyModal = async (req) => {
    setActiveRequest(req);
    setReplyModalOpen(true);
    setReplyText('');
    await loadReplies(req.id);
  };

  const loadReplies = async (requestId) => {
    try {
      const { data, error } = await supabase
        .from('request_replies')
        .select(`
          *,
          profile:profiles!request_replies_user_id_fkey(*)
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (e) {
      console.error('Error loading replies:', e);
      setReplies([]);
    }
  };

  const submitReply = async () => {
    if (!replyText.trim() || !activeRequest) return;
    setReplyBusy(true);
    try {
      const { error } = await supabase
        .from('request_replies')
        .insert({
          request_id: activeRequest.id,
          user_id: me.id,
          content: replyText.trim()
        });
      if (error) throw error;
      setReplyText('');
      // Live insert handled by realtime; still refresh counts defensively
      await loadRequests();
    } catch (e) {
      console.error('Reply error:', e);
      alert('Failed to reply');
    } finally {
      setReplyBusy(false);
    }
  };

  const markResolved = async (requestId) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: 'resolved' })
        .eq('id', requestId)
        .eq('user_id', me.id);
      if (error) throw error;
      setReplyModalOpen(false);
    } catch (e) {
      console.error('Resolve error:', e);
      alert('Failed to mark as resolved');
    }
  };

  const submitNewRequest = async () => {
    if (!newReq.title.trim() || !newReq.description.trim()) {
      alert('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newReq.title.trim(),
          description: newReq.description.trim(),
          category: newReq.category
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create request');
      }

      setShowNewRequestModal(false);
      setNewReq({ title: '', description: '', category: 'advice' });
      // Realtime will add; also refresh defensively
      await loadRequests();
    } catch (e) {
      console.error('Create request error:', e);
      alert(e.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-zinc-900 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Member Requests</h1>
                <p className="text-sm text-zinc-400">Ask for help, share opportunities, and get advice—live updates</p>
              </div>
            </div>

            <button
              onClick={() => setShowNewRequestModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Request</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Filters */}
        <div className="grid gap-3 md:grid-cols-3 md:items-center mb-6">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by title, description, or member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-500 text-white placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Compact filter toggle (mobile) */}
          <div className="md:justify-self-end">
            <button
              onClick={() => setFilterOpen((s) => !s)}
              className="w-full md:w-auto px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 flex items-center justify-center gap-2 hover:bg-zinc-800"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter rows */}
          <div className={`md:col-span-3 grid gap-3 ${filterOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'} overflow-hidden transition-all`}>
            <div className="min-h-0">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const active = category === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                        active ? 'bg-amber-500 text-black font-semibold' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {c.label}
                    </button>
                  );
                })}
                <div className="mx-2 h-6 w-px bg-zinc-800" />
                {['all', 'open', 'resolved'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-3 py-2 rounded-lg capitalize transition-all ${
                      status === s ? 'bg-zinc-800 text-white font-semibold' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="mb-4 text-sm text-zinc-500">
          Showing {filtered.length} {filtered.length === 1 ? 'request' : 'requests'}
        </div>

        {/* List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No requests found</h3>
              <p className="text-zinc-400 mb-6">Try adjusting your filters or be the first to post a request.</p>
              <button
                onClick={() => setShowNewRequestModal(true)}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Post a Request
              </button>
            </div>
          ) : (
            filtered.map((req) => (
              <div
                key={req.id}
                className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                onClick={() => openReplyModal(req)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {req.profile?.photo_url ? (
                        <img
                          src={req.profile.photo_url}
                          alt={req.profile.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                          <span className="text-lg font-bold text-black">
                            {req.profile?.full_name?.[0] || 'U'}
                          </span>
                        </div>
                      )}
                      {req.profile?.is_founding_member && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                          <Crown className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{req.profile?.full_name || 'Member'}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            req.status === 'open'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      {(req.profile?.title || req.profile?.company) && (
                        <p className="text-sm text-zinc-400 mb-2">
                          {req.profile?.title && req.profile?.company
                            ? `${req.profile.title} at ${req.profile.company}`
                            : (req.profile?.title || req.profile?.company)}
                        </p>
                      )}
                      <h4 className="text-lg font-semibold mb-2">{req.title}</h4>
                      <p className="text-zinc-300 line-clamp-2">{req.description}</p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryBadgeClasses(req.category)}`}>
                    {CATEGORIES.find((c) => c.value === req.category)?.label || 'Other'}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{req.replies?.[0]?.count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openReplyModal(req);
                    }}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Reply
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 relative">
            <button
              onClick={() => setShowNewRequestModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold mb-6">Post a Request</h2>

            <div className="space-y-5">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newReq.category}
                  onChange={(e) => setNewReq((s) => ({ ...s, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                >
                  {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newReq.title}
                  onChange={(e) => setNewReq((s) => ({ ...s, title: e.target.value }))}
                  placeholder="e.g., Looking for a technical co-founder"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white placeholder-zinc-500"
                  maxLength={100}
                />
                <div className="text-xs text-zinc-500 mt-1">{newReq.title.length}/100</div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newReq.description}
                  onChange={(e) => setNewReq((s) => ({ ...s, description: e.target.value }))}
                  placeholder="Describe what you need help with..."
                  rows={6}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white placeholder-zinc-500 resize-none"
                  maxLength={1000}
                />
                <div className="text-xs text-zinc-500 mt-1">{newReq.description.length}/1000</div>
              </div>

              <button
                onClick={submitNewRequest}
                disabled={submitting || !newReq.title.trim() || !newReq.description.trim()}
                className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-400 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {submitting ? 'Posting...' : 'Post Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModalOpen && activeRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full p-6 relative">
            <button
              onClick={() => setReplyModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              {activeRequest.profile?.photo_url ? (
                <img
                  src={activeRequest.profile.photo_url}
                  alt={activeRequest.profile.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <span className="text-lg font-bold text-black">
                    {activeRequest.profile?.full_name?.[0] || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{activeRequest.profile?.full_name || 'Member'}</h3>
                  {activeRequest.profile?.is_founding_member && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded">
                      Founding Member
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      activeRequest.status === 'open'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {activeRequest.status}
                  </span>
                </div>
                {(activeRequest.profile?.title || activeRequest.profile?.company) && (
                  <p className="text-sm text-zinc-400">
                    {activeRequest.profile?.title && activeRequest.profile?.company
                      ? `${activeRequest.profile.title} at ${activeRequest.profile.company}`
                      : (activeRequest.profile?.title || activeRequest.profile?.company)}
                  </p>
                )}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2">{activeRequest.title}</h2>
            <p className="text-zinc-300 leading-relaxed mb-6">{activeRequest.description}</p>

            {/* Replies */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
              </h3>

              {replies.length === 0 ? (
                <div className="text-center py-6 text-zinc-500">
                  No replies yet. Be the first to help!
                </div>
              ) : (
                replies.map((r) => (
                  <div key={r.id} className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {r.profile?.photo_url ? (
                        <img
                          src={r.profile.photo_url}
                          alt={r.profile.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                          {(r.profile?.full_name?.[0] || 'U').toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <span className="text-zinc-300 font-medium">{r.profile?.full_name || 'Member'}</span>
                          <span>• {new Date(r.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <p className="text-sm text-zinc-200 mt-1 whitespace-pre-wrap">{r.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply composer */}
            {activeRequest.status === 'open' ? (
              <div className="border-t border-zinc-800 pt-6">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Share advice, offer help, or make an introduction..."
                    className="flex-1 px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    maxLength={500}
                  />
                  <button
                    onClick={submitReply}
                    disabled={replyBusy || !replyText.trim()}
                    className="px-4 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-400 text-black font-semibold rounded-lg flex items-center gap-2"
                  >
                    {replyBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Reply
                  </button>
                </div>
                <div className="text-xs text-zinc-500 mt-1">{replyText.length}/500</div>

                {activeRequest.user_id === me?.id && (
                  <div className="mt-4">
                    <button
                      onClick={() => markResolved(activeRequest.id)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Resolved
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-t border-zinc-800 pt-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">
                    This request has been marked as resolved
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}