'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, Clock, Star, User, Filter, Search, BookOpen } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'product', label: 'Product' },
  { value: 'technical', label: 'Technical' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'sales', label: 'Sales' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Other' }
];

export default function ExpertSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadSessions();
  }, [selectedCategory]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/expert-sessions?${params}`);
      const data = await response.json();

      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = searchQuery === '' || 
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.expert?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleBookSession = (session) => {
    setSelectedSession(session);
    setShowBookingModal(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2" data-testid="text-page-title">Expert Sessions</h1>
              <p className="text-zinc-400" data-testid="text-page-description">
                Book one-on-one time with Circle Network experts
              </p>
            </div>
            <Link
              href="/expert-sessions/manage"
              className="px-4 py-2 bg-[#D4AF37] text-black rounded-md hover:bg-[#E5C77E] transition-colors"
              data-testid="link-manage-sessions"
            >
              Offer Your Expertise
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sessions or experts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                data-testid="input-search"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white focus:outline-none focus:border-[#D4AF37]"
              data-testid="select-category"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 animate-pulse">
                <div className="h-6 bg-zinc-800 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-zinc-800 rounded w-1/2 mb-6"></div>
                <div className="h-20 bg-zinc-800 rounded mb-4"></div>
                <div className="h-10 bg-zinc-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-zinc-300 mb-2" data-testid="text-empty-state">
              No sessions available
            </h3>
            <p className="text-zinc-500" data-testid="text-empty-description">
              {searchQuery ? 'Try adjusting your search' : 'Be the first to offer your expertise!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map(session => (
              <div
                key={session.id}
                className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 hover:border-[#D4AF37]/30 transition-all"
                data-testid={`card-session-${session.id}`}
              >
                {/* Expert Info */}
                <div className="flex items-center gap-3 mb-4">
                  {session.expert?.profile_image_url ? (
                    <img
                      src={session.expert.profile_image_url}
                      alt={session.expert.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate" data-testid={`text-expert-name-${session.id}`}>
                      {session.expert?.full_name}
                    </p>
                    <p className="text-sm text-zinc-400 truncate" data-testid={`text-expert-title-${session.id}`}>
                      {session.expert?.title}
                    </p>
                  </div>
                </div>

                {/* Session Info */}
                <h3 className="text-lg font-semibold text-white mb-2" data-testid={`text-session-title-${session.id}`}>
                  {session.title}
                </h3>
                
                {session.category && (
                  <span className="inline-block px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-xs rounded-full mb-3">
                    {session.category}
                  </span>
                )}

                <p className="text-zinc-400 text-sm mb-4 line-clamp-2" data-testid={`text-session-description-${session.id}`}>
                  {session.description || 'No description provided'}
                </p>

                <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{session.duration_minutes} min</span>
                  </div>
                  {session.bookings?.[0]?.count > 0 && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{session.bookings[0].count} booked</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleBookSession(session)}
                  className="w-full px-4 py-2 bg-[#D4AF37] text-black rounded-md hover:bg-[#E5C77E] transition-colors font-medium"
                  data-testid={`button-book-${session.id}`}
                >
                  Book Session
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSession && (
        <BookingModal
          session={selectedSession}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSession(null);
          }}
          onSuccess={() => {
            loadSessions();
          }}
        />
      )}
    </div>
  );
}

function BookingModal({ session, onClose, onSuccess }) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/expert-sessions/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          scheduled_at: scheduledAt,
          booker_notes: notes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book session');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg max-w-md w-full p-6 border border-zinc-800">
        <h2 className="text-xl font-bold text-white mb-4" data-testid="text-modal-title">
          Book: {session.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Preferred Date & Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-[#D4AF37]"
              data-testid="input-datetime"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Notes for {session.expert?.full_name} (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What would you like to discuss?"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
              data-testid="input-notes"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm" data-testid="text-error">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors"
              data-testid="button-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#D4AF37] text-black rounded-md hover:bg-[#E5C77E] transition-colors disabled:opacity-50"
              data-testid="button-submit"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
