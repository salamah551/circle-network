'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Edit, Trash2, Calendar, Clock, Users } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CATEGORIES = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'product', label: 'Product' },
  { value: 'technical', label: 'Technical' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'sales', label: 'Sales' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Other' }
];

export default function ManageSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (authSession?.user) {
        setUserId(authSession.user.id);

        // Load my sessions
        const sessionsRes = await fetch(`/api/expert-sessions?expert_id=${authSession.user.id}`);
        const sessionsData = await sessionsRes.json();
        if (sessionsData.sessions) {
          setSessions(sessionsData.sessions);
        }

        // Load my bookings (as expert)
        const bookingsRes = await fetch('/api/expert-sessions/book?type=hosting');
        const bookingsData = await bookingsRes.json();
        if (bookingsData.bookings) {
          setBookings(bookingsData.bookings);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2" data-testid="text-page-title">
                Manage Your Sessions
              </h1>
              <p className="text-zinc-400" data-testid="text-page-description">
                Offer your expertise to Circle Network members
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/expert-sessions"
                className="px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors"
                data-testid="link-browse"
              >
                Browse Sessions
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#D4AF37] text-black rounded-md hover:bg-[#E5C77E] transition-colors flex items-center gap-2"
                data-testid="button-create-session"
              >
                <Plus className="w-4 h-4" />
                Create Session
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* My Sessions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6" data-testid="text-my-sessions">My Offerings</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 animate-pulse">
                  <div className="h-6 bg-zinc-800 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-800">
              <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400" data-testid="text-no-sessions">
                You haven't created any sessions yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className="bg-zinc-900 rounded-lg p-6 border border-zinc-800"
                  data-testid={`card-session-${session.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1" data-testid={`text-title-${session.id}`}>
                        {session.title}
                      </h3>
                      {session.category && (
                        <span className="inline-block px-2 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-xs rounded-full">
                          {session.category}
                        </span>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${session.is_active ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-400'}`}>
                      {session.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <p className="text-zinc-400 text-sm mb-4" data-testid={`text-description-${session.id}`}>
                    {session.description || 'No description'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{session.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{session.max_bookings_per_week}/week max</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="flex-1 px-3 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors text-sm"
                      data-testid={`button-edit-${session.id}`}
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30 transition-colors text-sm"
                      data-testid={`button-delete-${session.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6" data-testid="text-upcoming-bookings">Upcoming Bookings</h2>
          {bookings.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-800">
              <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400" data-testid="text-no-bookings">No upcoming bookings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div
                  key={booking.id}
                  className="bg-zinc-900 rounded-lg p-6 border border-zinc-800"
                  data-testid={`card-booking-${booking.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {booking.session?.title}
                      </h3>
                      <p className="text-zinc-400 text-sm mb-2">
                        with {booking.booker?.full_name}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(booking.scheduled_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      {booking.booker_notes && (
                        <p className="text-zinc-400 text-sm mt-3 italic">
                          "{booking.booker_notes}"
                        </p>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      booking.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateSessionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadData();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function CreateSessionModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
    category: 'other',
    max_bookings_per_week: 5
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/expert-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg max-w-2xl w-full p-6 border border-zinc-800 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6" data-testid="text-modal-title">
          Create Expert Session
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Session Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g., 30min Product Strategy Consultation"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
              data-testid="input-title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="What will you cover in this session?"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
              data-testid="input-description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                required
                min="15"
                max="120"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-[#D4AF37]"
                data-testid="input-duration"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-[#D4AF37]"
                data-testid="select-category"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Max/Week *
              </label>
              <input
                type="number"
                value={formData.max_bookings_per_week}
                onChange={(e) => setFormData({ ...formData, max_bookings_per_week: parseInt(e.target.value) })}
                required
                min="1"
                max="20"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-[#D4AF37]"
                data-testid="input-max-bookings"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm" data-testid="text-error">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
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
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
