'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Plus, Search, MessageSquare, 
  CheckCircle, Clock, User, Send, X, TrendingUp,
  Lightbulb, Target, Briefcase, Users, Loader2
} from 'lucide-react';
import GlobalSearch from '@/components/GlobalSearch';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CATEGORIES = [
  { value: 'all', label: 'All Requests', icon: TrendingUp },
  { value: 'fundraising', label: 'Fundraising', icon: TrendingUp },
  { value: 'hiring', label: 'Hiring', icon: Users },
  { value: 'partnerships', label: 'Partnerships', icon: Briefcase },
  { value: 'advice', label: 'Advice', icon: Lightbulb },
  { value: 'intros', label: 'Introductions', icon: Users },
  { value: 'other', label: 'Other', icon: Target },
];

export default function RequestsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('open');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [replies, setReplies] = useState([]);
  
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: 'advice'
  });
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, selectedCategory, selectedStatus]);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      setCurrentUser(session.user);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setCurrentUserProfile(profile);
      await loadRequests();
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          profile:profiles!requests_user_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading requests:', error);
        setRequests([]);
        return;
      }

      const requestsWithReplies = await Promise.all(
        (data || []).map(async (request) => {
          const { count } = await supabase
            .from('request_replies')
            .select('*', { count: 'exact', head: true })
            .eq('request_id', request.id);
          
          return {
            ...request,
            reply_count: count || 0
          };
        })
      );

      setRequests(requestsWithReplies);
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    }
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
    } catch (error) {
      console.error('Error loading replies:', error);
      setReplies([]);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(req => req.category === selectedCategory);
    }

    filtered = filtered.filter(req => req.status === selectedStatus);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        req.title?.toLowerCase().includes(query) ||
        req.description?.toLowerCase().includes(query) ||
        req.profile?.full_name?.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const createRequest = async () => {
    if (!newRequest.title.trim() || !newRequest.description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('requests')
        .insert({
          user_id: currentUser.id,
          title: newRequest.title,
          description: newRequest.description,
          category: newRequest.category,
          status: 'open'
        });

      if (error) throw error;

      setShowNewRequestModal(false);
      setNewRequest({ title: '', description: '', category: 'advice' });
      await loadRequests();
    } catch (error) {
      console.error('Error creating request:', error);
      alert(`Failed to create request: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async () => {
    if (!replyContent.trim() || !selectedRequest) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('request_replies')
        .insert({
          request_id: selectedRequest.id,
          user_id: currentUser.id,
          content: replyContent
        });

      if (error) throw error;

      // Send email notification to request owner (fire-and-forget)
      if (selectedRequest.user_id !== currentUser.id) {
        fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'request_reply',
            recipientEmail: selectedRequest.profile?.email,
            recipientName: selectedRequest.profile?.full_name,
            senderName: currentUserProfile?.full_name || 'A member',
            requestTitle: selectedRequest.title,
            replyPreview: replyContent
          })
        }).catch(emailError => {
          console.error('Email notification failed:', emailError);
        });
      }

      setReplyContent('');
      await loadReplies(selectedRequest.id);
      await loadRequests();
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  const markAsResolved = async (requestId) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
      await loadRequests();
    } catch (error) {
      console.error('Error marking as resolved:', error);
    }
  };

  const openRequestModal = async (request) => {
    setSelectedRequest(request);
    await loadReplies(request.id);
    setShowReplyModal(true);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <h1 className="text-2xl font-bold">Requests Board</h1>
            </div>
            <GlobalSearch />
            
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              New Request
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Status Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedStatus('open')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                selectedStatus === 'open'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Open ({requests.filter(r => r.status === 'open').length})
            </button>
            <button
              onClick={() => setSelectedStatus('resolved')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                selectedStatus === 'resolved'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Resolved ({requests.filter(r => r.status === 'resolved').length})
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
              <Lightbulb className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No requests found</h3>
              <p className="text-zinc-500 mb-6">
                {selectedStatus === 'open' 
                  ? 'Be the first to post a request!'
                  : 'No resolved requests yet.'
                }
              </p>
              {selectedStatus === 'open' && (
                <button
                  onClick={() => setShowNewRequestModal(true)}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-xl transition-all"
                >
                  Post Your First Request
                </button>
              )}
            </div>
          ) : (
            filteredRequests.map(request => (
              <div
                key={request.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-850 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-black" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold">{request.title}</h3>
                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-full">
                          {request.category}
                        </span>
                      </div>
                      
                      <p className="text-zinc-400 text-sm mb-2">
                        by {request.profile?.full_name || 'Unknown'} • {request.profile?.title || ''} {request.profile?.company ? `at ${request.profile.company}` : ''}
                      </p>
                      
                      <p className="text-zinc-300 mb-4">{request.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <span>{formatDate(request.created_at)}</span>
                        <button
                          onClick={() => openRequestModal(request)}
                          className="flex items-center gap-1 hover:text-amber-400 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {request.reply_count || 0} replies
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openRequestModal(request)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg transition-all text-sm"
                    >
                      View & Reply
                    </button>
                    
                    {request.user_id === currentUser?.id && request.status === 'open' && (
                      <button
                        onClick={() => markAsResolved(request.id)}
                        className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-lg transition-all text-sm"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Post a Request</h3>
              <button
                onClick={() => setShowNewRequestModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Category</label>
                <select
                  value={newRequest.category}
                  onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Title</label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="What do you need help with?"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Description</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Provide more details..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[150px]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewRequestModal(false)}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createRequest}
                disabled={!newRequest.title.trim() || !newRequest.description.trim() || submitting}
                className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-medium rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Post Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Detail & Reply Modal */}
      {showReplyModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold">{selectedRequest.title}</h3>
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-full">
                      {selectedRequest.category}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    by {selectedRequest.profile?.full_name || 'Unknown'} • {formatDate(selectedRequest.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-zinc-300">{selectedRequest.description}</p>
            </div>

            {/* Replies */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {replies.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">No replies yet. Be the first to help!</p>
                </div>
              ) : (
                replies.map(reply => (
                  <div key={reply.id} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <p className="font-semibold">{reply.profile?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-zinc-500">
                          {reply.profile?.title || ''} {reply.profile?.company ? `at ${reply.profile.company}` : ''}
                        </p>
                      </div>
                      <span className="ml-auto text-xs text-zinc-500">
                        {formatDate(reply.created_at)}
                      </span>
                    </div>
                    <p className="text-zinc-300 whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input */}
            <div className="p-6 border-t border-zinc-800">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts or offer help..."
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3 min-h-[100px]"
              />
              <button
                onClick={submitReply}
                disabled={!replyContent.trim() || submitting}
                className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-medium rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Post Reply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
