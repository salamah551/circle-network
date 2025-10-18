'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Plus, Search, MessageSquare, CheckCircle, Clock, 
  User, Send, X, TrendingUp, Lightbulb, Target, Briefcase, 
  Users, Loader2, ThumbsUp, ExternalLink, Filter, Crown
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CATEGORIES = [
  { value: 'all', label: 'All Requests', icon: TrendingUp, color: 'zinc' },
  { value: 'fundraising', label: 'Fundraising', icon: TrendingUp, color: 'emerald' },
  { value: 'hiring', label: 'Hiring', icon: Users, color: 'blue' },
  { value: 'partnerships', label: 'Partnerships', icon: Briefcase, color: 'purple' },
  { value: 'advice', label: 'Advice', icon: Lightbulb, color: 'amber' },
  { value: 'intros', label: 'Introductions', icon: Users, color: 'pink' },
  { value: 'other', label: 'Other', icon: Target, color: 'zinc' },
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
          profile:profiles!requests_user_id_fkey(
            id, 
            full_name, 
            title, 
            company, 
            photo_url,
            is_founding_member
          ),
          replies:request_replies(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(r => r.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.title?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.profile?.full_name?.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const submitNewRequest = async () => {
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
          title: newRequest.title.trim(),
          description: newRequest.description.trim(),
          category: newRequest.category,
          status: 'open'
        });

      if (error) throw error;

      setShowNewRequestModal(false);
      setNewRequest({ title: '', description: '', category: 'advice' });
      await loadRequests();
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  const openReplyModal = async (request) => {
    setSelectedRequest(request);
    setShowReplyModal(true);
    await loadReplies(request.id);
  };

  const loadReplies = async (requestId) => {
    try {
      const { data, error } = await supabase
        .from('request_replies')
        .select(`
          *,
          profile:profiles!request_replies_user_id_fkey(
            id,
            full_name,
            title,
            company,
            photo_url,
            is_founding_member
          )
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const submitReply = async () => {
    if (!replyContent.trim()) {
      alert('Please enter a reply');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('request_replies')
        .insert({
          request_id: selectedRequest.id,
          user_id: currentUser.id,
          content: replyContent.trim()
        });

      if (error) throw error;

      setReplyContent('');
      await loadReplies(selectedRequest.id);
      await loadRequests(); // Refresh to update reply count
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
        .update({ status: 'resolved' })
        .eq('id', requestId)
        .eq('user_id', currentUser.id); // Only owner can resolve

      if (error) throw error;
      await loadRequests();
      setShowReplyModal(false);
    } catch (error) {
      console.error('Error resolving request:', error);
      alert('Failed to mark as resolved');
    }
  };

  const getCategoryInfo = (categoryValue) => {
    return CATEGORIES.find(c => c.value === categoryValue) || CATEGORIES[0];
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
                <p className="text-sm text-zinc-400">Ask for help, share opportunities, get advice</p>
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

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-500 text-white placeholder-zinc-500"
            />
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2">
            {['all', 'open', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${
                  selectedStatus === status
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-zinc-500">
          Showing {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No requests found</h3>
              <p className="text-zinc-400 mb-6">
                {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Be the first to post a request!'}
              </p>
              {!searchQuery && selectedCategory === 'all' && selectedStatus === 'all' && (
                <button
                  onClick={() => setShowNewRequestModal(true)}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Post a Request
                </button>
              )}
            </div>
          ) : (
            filteredRequests.map((request) => {
              const categoryInfo = getCategoryInfo(request.category);
              const CategoryIcon = categoryInfo.icon;
              const replyCount = request.replies?.[0]?.count || 0;

              return (
                <div
                  key={request.id}
                  className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                  onClick={() => openReplyModal(request)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {request.profile?.photo_url ? (
                          <img
                            src={request.profile.photo_url}
                            alt={request.profile.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                            <span className="text-lg font-bold text-black">
                              {request.profile?.full_name?.[0] || '?'}
                            </span>
                          </div>
                        )}
                        {request.profile?.is_founding_member && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                            <Crown className="w-3 h-3 text-black" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">
                            {request.profile?.full_name || 'Unknown User'}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            request.status === 'open'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-zinc-700 text-zinc-400'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 mb-3">
                          {request.profile?.title} at {request.profile?.company}
                        </p>
                        <h4 className="text-lg font-semibold mb-2">{request.title}</h4>
                        <p className="text-zinc-400 line-clamp-2">{request.description}</p>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-${categoryInfo.color}-500/10 border border-${categoryInfo.color}-500/20`}>
                      <CategoryIcon className={`w-4 h-4 text-${categoryInfo.color}-400`} />
                      <span className={`text-xs font-semibold text-${categoryInfo.color}-400`}>
                        {categoryInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openReplyModal(request);
                      }}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Reply
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
            <button
              onClick={() => setShowNewRequestModal(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-bold mb-6">Post a Request</h2>

            <div className="space-y-6">
              {/* Category Select */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newRequest.category}
                  onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                >
                  {CATEGORIES.filter(c => c.value !== 'all').map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="e.g., Looking for a technical co-founder"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white placeholder-zinc-500"
                  maxLength={100}
                />
                <p className="text-xs text-zinc-500 mt-1">
                  {newRequest.title.length}/100 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Describe what you need help with..."
                  rows={6}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white placeholder-zinc-500 resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-zinc-500 mt-1">
                  {newRequest.description.length}/1000 characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={submitNewRequest}
                disabled={submitting || !newRequest.title.trim() || !newRequest.description.trim()}
                className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Post Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
            <button
              onClick={() => setShowReplyModal(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Request Details */}
            <div className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                {selectedRequest.profile?.photo_url ? (
                  <img
                    src={selectedRequest.profile.photo_url}
                    alt={selectedRequest.profile.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-black">
                      {selectedRequest.profile?.full_name?.[0] || '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">
                      {selectedRequest.profile?.full_name || 'Unknown User'}
                    </h3>
                    {selectedRequest.profile?.is_founding_member && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded">
                        Founding Member
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400">
                    {selectedRequest.profile?.title} at {selectedRequest.profile?.company}
                  </p>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3">{selectedRequest.title}</h2>
              <p className="text-zinc-300 leading-relaxed">{selectedRequest.description}</p>
            </div>

            {/* Replies */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
              </h3>

              {replies.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  No replies yet. Be the first to help!
                </div>
              ) : (
                replies.map((reply) => (
                  <div key={reply.id} className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {reply.profile?.photo_url ? (
                        <img
                          src={reply.profile.photo_url}
                          alt={reply.profile.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {reply.profile?.full_name?.[0] || '?'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {reply.profile?.full_name || 'Unknown User'}
                          </span>
                          {reply.profile?.is_founding_member && (
                            <Crown className="w-4 h-4 text-amber-400" />
                          )}
                          <span className="text-xs text-zinc-500">
                            {new Date(reply.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 mb-2">
                          {reply.profile?.title} at {reply.profile?.company}
                        </p>
                        <p className="text-zinc-200 leading-relaxed">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Form */}
            {selectedRequest.status === 'open' && (
              <div className="border-t border-zinc-800 pt-6">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Share your advice, offer help, or make an introduction..."
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white placeholder-zinc-500 resize-none mb-4"
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-500">
                    {replyContent.length}/500 characters
                  </p>
                  <div className="flex items-center gap-3">
                    {selectedRequest.user_id === currentUser.id && (
                      <button
                        onClick={() => markAsResolved(selectedRequest.id)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Resolved
                      </button>
                    )}
                    <button
                      onClick={submitReply}
                      disabled={submitting || !replyContent.trim()}
                      className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedRequest.status === 'resolved' && (
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