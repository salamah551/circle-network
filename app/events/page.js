'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Plus, Calendar as CalendarIcon, MapPin, 
  Users, Clock, X, Check, User, Loader2, Video,
  Building2, Globe
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function EventsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('upcoming');
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventRsvps, setEventRsvps] = useState([]);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    max_attendees: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, selectedFilter]);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      setCurrentUser(session.user);
      await loadEvents(session.user.id);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const loadEvents = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          host:profiles!events_host_id_fkey(*),
          rsvps:event_rsvps(count),
          user_rsvp:event_rsvps!event_rsvps_event_id_fkey(status)
        `)
        .eq('user_rsvp.user_id', userId)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadEventRsvps = async (eventId) => {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('*, user:profiles!event_rsvps_user_id_fkey(*)')
        .eq('event_id', eventId)
        .eq('status', 'attending');

      if (error) throw error;
      setEventRsvps(data || []);
    } catch (error) {
      console.error('Error loading RSVPs:', error);
    }
  };

  const filterEvents = () => {
    const now = new Date();
    let filtered = [...events];

    if (selectedFilter === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.event_date) >= now);
    } else if (selectedFilter === 'past') {
      filtered = filtered.filter(event => new Date(event.event_date) < now);
    } else if (selectedFilter === 'my-events') {
      filtered = filtered.filter(event => event.host_id === currentUser?.id);
    } else if (selectedFilter === 'attending') {
      filtered = filtered.filter(event => 
        event.user_rsvp && event.user_rsvp[0]?.status === 'attending'
      );
    }

    setFilteredEvents(filtered);
  };

  const createEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.description.trim() || !newEvent.event_date) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          host_id: currentUser.id,
          title: newEvent.title,
          description: newEvent.description,
          event_date: newEvent.event_date,
          location: newEvent.location,
          max_attendees: newEvent.max_attendees ? parseInt(newEvent.max_attendees) : null,
          status: 'active'
        });

      if (error) throw error;

      setShowNewEventModal(false);
      setNewEvent({
        title: '',
        description: '',
        event_date: '',
        location: '',
        max_attendees: ''
      });
      await loadEvents(currentUser.id);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRsvp = async (eventId, status) => {
    try {
      // Check if already RSVPed
      const { data: existing } = await supabase
        .from('event_rsvps')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', currentUser.id)
        .single();

      if (existing) {
        // Update existing RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .update({ status })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .insert({
            event_id: eventId,
            user_id: currentUser.id,
            status
          });

        if (error) throw error;
      }

      await loadEvents(currentUser.id);
      if (selectedEvent && selectedEvent.id === eventId) {
        await loadEventRsvps(eventId);
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
      alert('Failed to update RSVP');
    }
  };

  const openEventDetail = async (event) => {
    setSelectedEvent(event);
    await loadEventRsvps(event.id);
    setShowEventDetailModal(true);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const isEventFull = (event) => {
    if (!event.max_attendees) return false;
    return event.rsvps[0]?.count >= event.max_attendees;
  };

  const getUserRsvpStatus = (event) => {
    return event.user_rsvp && event.user_rsvp[0]?.status;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0A0F1E]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <h1 className="text-2xl font-bold text-white">Events</h1>
            </div>
            
            <button
              onClick={() => setShowNewEventModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedFilter('upcoming')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'upcoming'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setSelectedFilter('attending')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'attending'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
            }`}
          >
            I'm Attending
          </button>
          <button
            onClick={() => setSelectedFilter('my-events')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'my-events'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
            }`}
          >
            My Events
          </button>
          <button
            onClick={() => setSelectedFilter('past')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'past'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
            }`}
          >
            Past Events
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <CalendarIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
              <p className="text-white/60 mb-6">
                {selectedFilter === 'upcoming' 
                  ? 'No upcoming events scheduled.'
                  : selectedFilter === 'my-events'
                  ? "You haven't created any events yet."
                  : selectedFilter === 'attending'
                  ? "You haven't RSVP'd to any events."
                  : 'No past events.'}
              </p>
              <button
                onClick={() => setShowNewEventModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all"
              >
                Create Your First Event
              </button>
            </div>
          ) : (
            filteredEvents.map(event => {
              const userRsvpStatus = getUserRsvpStatus(event);
              const eventFull = isEventFull(event);
              
              return (
                <div
                  key={event.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => openEventDetail(event)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                        <p className="text-white/60 text-sm mb-3">
                          Hosted by {event.host.full_name}
                        </p>
                      </div>
                      {userRsvpStatus === 'attending' && (
                        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-full">
                          Attending
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <CalendarIcon className="w-4 h-4" />
                        {formatDate(event.event_date)}
                      </div>
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Clock className="w-4 h-4" />
                        {formatTime(event.event_date)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Users className="w-4 h-4" />
                        {event.rsvps[0]?.count || 0}
                        {event.max_attendees && ` / ${event.max_attendees}`} attending
                      </div>
                    </div>

                    <p className="text-white/80 text-sm line-clamp-3 mb-4">
                      {event.description}
                    </p>

                    {eventFull && userRsvpStatus !== 'attending' && (
                      <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm text-center">
                        Event Full
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* New Event Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0F1E] border border-white/20 rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Create Event</h3>
              <button
                onClick={() => setShowNewEventModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 text-sm">Event Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Monthly Founder Meetup"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">Description *</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="What's this event about? Who should attend?"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={newEvent.event_date}
                  onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Address or Zoom link"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">Max Attendees (Optional)</label>
                <input
                  type="number"
                  value={newEvent.max_attendees}
                  onChange={(e) => setNewEvent({ ...newEvent, max_attendees: e.target.value })}
                  placeholder="Leave blank for unlimited"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewEventModal(false)}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createEvent}
                disabled={!newEvent.title.trim() || !newEvent.description.trim() || !newEvent.event_date || submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Event'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0F1E] border border-white/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-white mb-3">{selectedEvent.title}</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{selectedEvent.host.full_name}</p>
                      <p className="text-white/60 text-sm">
                        {selectedEvent.host.title} at {selectedEvent.host.company}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventDetailModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 space-y-3">
                <div className="flex items-center gap-3 text-white">
                  <CalendarIcon className="w-5 h-5 text-emerald-400" />
                  <span>{formatDate(selectedEvent.event_date)}</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span>{formatTime(selectedEvent.event_date)}</span>
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-3 text-white">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-white">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>
                    {selectedEvent.rsvps[0]?.count || 0}
                    {selectedEvent.max_attendees && ` / ${selectedEvent.max_attendees}`} attending
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-3">About This Event</h4>
                <p className="text-white/80 whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>

              {/* Attendees */}
              {eventRsvps.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-3">
                    Attendees ({eventRsvps.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {eventRsvps.map(rsvp => (
                      <div
                        key={rsvp.id}
                        className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{rsvp.user.full_name}</p>
                          <p className="text-xs text-white/60 truncate">
                            {rsvp.user.title} at {rsvp.user.company}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RSVP Buttons */}
              <div className="flex gap-3">
                {getUserRsvpStatus(selectedEvent) === 'attending' ? (
                  <>
                    <button
                      onClick={() => handleRsvp(selectedEvent.id, 'not_attending')}
                      className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all"
                    >
                      Cancel RSVP
                    </button>
                    <button
                      className="flex-1 px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl cursor-default"
                    >
                      <Check className="w-5 h-5 inline mr-2" />
                      You're Attending
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRsvp(selectedEvent.id, 'attending')}
                    disabled={isEventFull(selectedEvent)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEventFull(selectedEvent) ? 'Event Full' : 'RSVP to Attend'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}