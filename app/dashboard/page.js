'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, MessageSquare, TrendingUp, Calendar, 
  ArrowRight, Loader2, LogOut, Settings, 
  Sparkles, Target, Mail, Bell, X, Save,
  User, Briefcase, MapPin, Link as LinkIcon,
  Linkedin, Twitter, Globe, Bookmark
} from 'lucide-react';
import { getRecommendations } from '@/lib/recommendations';
import PreLaunchBanner from '@/components/PreLaunchBanner';
import FeatureLockedCard from '@/components/FeatureLockedCard';
import { isFeatureAvailable } from '@/lib/feature-flags';
import GlobalSearch from '@/components/GlobalSearch';
import OnboardingCarousel from '@/components/OnboardingCarousel';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Profile Edit Modal Component
function ProfileEditModal({ profile, onClose, onSave }) {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    title: profile?.title || '',
    company: profile?.company || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    expertise: profile?.expertise || [],
    needs: profile?.needs || [],
    challenges: profile?.challenges || '',
    linkedin: profile?.linkedin || '',
    twitter: profile?.twitter || '',
    website: profile?.website || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const fullName = formData.full_name || 
        `${formData.first_name} ${formData.last_name}`.trim();
      
      await onSave({
        ...formData,
        full_name: fullName,
        updated_at: new Date().toISOString()
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit Your Profile</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              Basic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                />
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              Professional Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Expertise */}
          <div>
            <h3 className="text-lg font-bold mb-4">Expertise & Needs</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Areas of Expertise</label>
                <input
                  type="text"
                  value={formData.expertise.join(', ')}
                  onChange={(e) => setFormData({...formData, expertise: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                  placeholder="Comma-separated"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">What You Need Help With</label>
                <input
                  type="text"
                  value={formData.needs.join(', ')}
                  onChange={(e) => setFormData({...formData, needs: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                  placeholder="Comma-separated"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-amber-400" />
              Social Links
            </h3>
            <div className="space-y-4">
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                placeholder="LinkedIn URL"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
              />
              <input
                type="url"
                value={formData.twitter}
                onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                placeholder="Twitter URL"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
              />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                placeholder="Website URL"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 text-black font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Notifications Component - FIXED VERSION
function Notifications({ userId }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (userId) {
      loadNotifications();
      
      // Real-time subscription
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `to_user_id=eq.${userId}` },
          () => loadNotifications()
        )
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'messages', filter: `to_user_id=eq.${userId}` },
          () => loadNotifications()
        )
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'intro_requests', filter: `target_member_id=eq.${userId}` },
          () => loadNotifications()
        )
        .subscribe();

      // Polling fallback (every 30 seconds)
      const pollInterval = setInterval(() => {
        loadNotifications();
      }, 30000);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(pollInterval);
      };
    }
  }, [userId]);

  const loadNotifications = async () => {
    try {
      const allNotifications = [];

      const { data: messages } = await supabase
        .from('messages')
        .select('*, from:profiles!messages_from_user_id_fkey(full_name)')
        .eq('to_user_id', userId)
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (messages) {
        messages.forEach(m => {
          allNotifications.push({
            id: m.id,
            type: 'message',
            title: `New message from ${m.from?.full_name || 'A member'}`,
            description: m.content.substring(0, 100),
            time: m.created_at,
            link: '/messages',
            unread: true
          });
        });
      }

      const { data: intros } = await supabase
        .from('intro_requests')
        .select('*, requester:profiles!intro_requests_requester_id_fkey(full_name)')
        .eq('target_member_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

      if (intros) {
        intros.forEach(i => {
          allNotifications.push({
            id: `intro-${i.id}`,
            type: 'intro',
            title: `${i.requester?.full_name || 'Someone'} wants an introduction`,
            description: i.message.substring(0, 100),
            time: i.created_at,
            link: '/messages',
            unread: true
          });
        });
      }

      allNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(allNotifications.slice(0, 10));
      setUnreadCount(allNotifications.filter(n => n.unread).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNotificationClick = async (notif) => {
    // Mark as read based on type
    try {
      if (notif.type === 'message') {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('id', notif.id);
      } else if (notif.type === 'intro') {
        const introId = notif.id.replace('intro-', '');
        // Update intro_requests to mark as viewed (you may need to add a viewed_at column)
        // For now, we'll just update the status or you can add a viewed_at timestamp column
        await supabase
          .from('intro_requests')
          .update({ status: 'viewed' })
          .eq('id', introId);
      }
      
      // Reload notifications immediately to update the UI
      await loadNotifications();
      
      // Navigate and close panel
      router.push(notif.link);
      setShowPanel(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Still navigate even if marking as read fails
      router.push(notif.link);
      setShowPanel(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
          
          {/* IMPROVED MOBILE STYLING */}
          <div className="absolute right-0 sm:right-0 left-0 sm:left-auto top-full mt-2 mx-4 sm:mx-0 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900">
              <h3 className="font-bold">Notifications</h3>
              <button onClick={() => setShowPanel(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {notifications.map(notif => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className="w-full text-left p-4 hover:bg-zinc-800 active:bg-zinc-750 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-white line-clamp-1">{notif.title}</p>
                        {notif.unread && <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-1">{notif.description}</p>
                      <p className="text-xs text-zinc-500">{formatTime(notif.time)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-zinc-800 bg-zinc-900 sticky bottom-0">
                <button
                  onClick={async () => {
                    // Mark all as read
                    const messageIds = notifications
                      .filter(n => n.type === 'message')
                      .map(n => n.id);
                    
                    if (messageIds.length > 0) {
                      await supabase
                        .from('messages')
                        .update({ read_at: new Date().toISOString() })
                        .in('id', messageIds);
                    }
                    
                    await loadNotifications();
                  }}
                  className="w-full text-center text-sm text-amber-400 hover:text-amber-300 font-medium py-2"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeRequests: 0,
    unreadMessages: 0,
    upcomingEvents: 0,
    invitesRemaining: 0,
    pendingIntros: 0
  });
  const [recommendations, setRecommendations] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  // Real-time activity feed subscription
  useEffect(() => {
    if (!user?.id) return;

    // Set up real-time subscription for activity updates
    const profilesChannel = supabase
      .channel('activity-profiles')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        () => loadActivity(user.id)
      )
      .subscribe();

    const requestsChannel = supabase
      .channel('activity-requests')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'requests' },
        () => loadActivity(user.id)
      )
      .subscribe();

    const eventsChannel = supabase
      .channel('activity-events')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'events' },
        () => loadActivity(user.id)
      )
      .subscribe();

    // Also refresh every 60 seconds as fallback
    const intervalId = setInterval(() => {
      loadActivity(user.id);
    }, 60000);

    return () => {
      profilesChannel.unsubscribe();
      requestsChannel.unsubscribe();
      eventsChannel.unsubscribe();
      clearInterval(intervalId);
    };
  }, [user?.id]);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      setUser(session.user);
      const userProfile = await loadProfile(session.user.id);
      await loadStats(session.user.id);
      await loadRecommendations(session.user.id, userProfile);
      await loadActivity(session.user.id);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
      setStats(prev => ({
        ...prev,
        invitesRemaining: data.invites_remaining || 0
      }));
      
      if (!data.onboarding_completed) {
        setShowOnboarding(true);
      }
      
      return data;
    }
    return null;
  };

  const handleOnboardingComplete = async () => {
    if (user?.id) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
      
      setShowOnboarding(false);
    }
  };

  const loadStats = async (userId) => {
    const { count: memberCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .neq('id', userId);

    const { count: requestCount } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('to_user_id', userId)
      .is('read_at', null);

    // Get pending intros count
    const { count: introsCount } = await supabase
      .from('strategic_intros')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending');

    setStats(prev => ({
      ...prev,
      totalMembers: memberCount || 0,
      activeRequests: requestCount || 0,
      unreadMessages: messageCount || 0,
      upcomingEvents: 0,
      pendingIntros: introsCount || 0
    }));
  };

  const loadRecommendations = async (userId, userProfile) => {
    try {
      const { data: allMembers, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .eq('status', 'active');

      if (!error && allMembers && userProfile) {
        const recs = getRecommendations(userProfile, allMembers, 3);
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const loadActivity = async (userId) => {
    try {
      const activities = [];
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get new members (last 24h)
      const { data: newMembers } = await supabase
        .from('profiles')
        .select('id, full_name, title, created_at')
        .gte('created_at', oneDayAgo.toISOString())
        .neq('id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (newMembers) {
        newMembers.forEach(member => {
          activities.push({
            id: `member-${member.id}`,
            type: 'member_joined',
            title: `${member.full_name} joined`,
            description: member.title || 'New member',
            time: member.created_at,
            icon: 'users'
          });
        });
      }

      // Get new requests (last 24h)
      const { data: newRequests } = await supabase
        .from('requests')
        .select('id, title, category, created_at, profiles!requests_user_id_fkey(full_name)')
        .gte('created_at', oneDayAgo.toISOString())
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5);

      if (newRequests) {
        newRequests.forEach(request => {
          activities.push({
            id: `request-${request.id}`,
            type: 'request_posted',
            title: `${request.profiles?.full_name || 'Someone'} posted a request`,
            description: request.title,
            time: request.created_at,
            icon: 'target',
            category: request.category
          });
        });
      }

      // Get new events (last 24h)
      const { data: newEvents } = await supabase
        .from('events')
        .select('id, title, event_type, created_at, profiles!events_created_by_fkey(full_name)')
        .gte('created_at', oneDayAgo.toISOString())
        .eq('status', 'upcoming')
        .order('created_at', { ascending: false })
        .limit(5);

      if (newEvents) {
        newEvents.forEach(event => {
          activities.push({
            id: `event-${event.id}`,
            type: 'event_created',
            title: `${event.profiles?.full_name || 'Someone'} created an event`,
            description: event.title,
            time: event.created_at,
            icon: 'calendar',
            eventType: event.event_type
          });
        });
      }

      // Sort all activities by time and take top 10
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivity(activities.slice(0, 10));
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSaveProfile = async (updatedData) => {
    const { error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', user.id);
    
    if (!error) {
      await loadProfile(user.id);
      setShowProfileModal(false);
      alert('Profile updated successfully!');
    } else {
      alert('Failed to update profile');
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
      <PreLaunchBanner />
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#D4AF37" strokeWidth="2" fill="none"/>
                <circle cx="20" cy="20" r="12" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
                <circle cx="20" cy="20" r="6" fill="#D4AF37"/>
              </svg>
              <div>
                <span className="font-bold text-lg block leading-none">The Circle</span>
                <span className="text-xs text-amber-400">FOUNDING MEMBER</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Notifications userId={user?.id} />
              <GlobalSearch />
              <button 
                onClick={() => router.push('/settings')}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-zinc-400" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-black font-bold text-xl">
              {(profile?.first_name || profile?.full_name || 'M')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Welcome back, {profile?.first_name || profile?.full_name?.split(' ')[0] || 'Member'}
              </h1>
              <p className="text-zinc-500 mt-1">Here's what's happening in your network</p>
            </div>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <button
            onClick={() => router.push('/impact')}
            className="group relative bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-500/30 rounded-2xl p-6 hover:from-emerald-500/20 hover:via-teal-500/20 hover:to-amber-500/20 hover:border-emerald-400/50 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-amber-400/0 group-hover:from-emerald-400/10 group-hover:to-amber-400/10 transition-all duration-300" />
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Your Impact</h3>
              <p className="text-white/60 text-sm">View your Circle Score</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/intros')}
            className="group relative bg-gradient-to-br from-amber-500/10 via-amber-600/10 to-yellow-500/10 border border-amber-500/30 rounded-2xl p-6 hover:from-amber-500/20 hover:via-amber-600/20 hover:to-yellow-500/20 hover:border-amber-400/50 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-yellow-400/0 group-hover:from-amber-400/10 group-hover:to-yellow-400/10 transition-all duration-300" />
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                Strategic Intros
                {stats.pendingIntros > 0 && (
                  <span className="px-2.5 py-0.5 bg-amber-500 text-black text-xs rounded-full font-bold">
                    {stats.pendingIntros}
                  </span>
                )}
              </h3>
              <p className="text-white/60 text-sm">AI-curated connections</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/members')}
            className="group relative bg-zinc-900/50 border border-zinc-700 rounded-2xl p-6 hover:bg-zinc-800/50 hover:border-amber-500/50 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-amber-600/0 group-hover:from-amber-400/10 group-hover:to-amber-600/10 transition-all duration-300" />
            <div className="relative">
              <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Members</h3>
              <p className="text-white/60 text-sm">Browse the directory</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/messages')}
            className="group relative bg-zinc-900/50 border border-zinc-700 rounded-2xl p-6 hover:bg-zinc-800/50 hover:border-purple-500/50 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-purple-600/0 group-hover:from-purple-400/10 group-hover:to-purple-600/10 transition-all duration-300" />
            <div className="relative">
              <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                Messages 
                {stats.unreadMessages > 0 && (
                  <span className="px-2.5 py-0.5 bg-purple-500 text-white text-xs rounded-full animate-pulse">
                    {stats.unreadMessages}
                  </span>
                )}
              </h3>
              <p className="text-white/60 text-sm">Chat with members</p>
            </div>
          </button>

          {isFeatureAvailable('requests') ? (
            <button
              onClick={() => router.push('/requests')}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all text-left"
            >
              <Target className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Requests</h3>
              <p className="text-white/60 text-sm">Browse asks & offers</p>
            </button>
          ) : (
            <FeatureLockedCard 
              title="Requests" 
              description="Browse asks & offers from members"
            />
          )}

          {isFeatureAvailable('events') ? (
            <button
              onClick={() => router.push('/events')}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all text-left"
            >
              <Calendar className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Events</h3>
              <p className="text-white/60 text-sm">Upcoming meetups</p>
            </button>
          ) : (
            <FeatureLockedCard 
              title="Events" 
              description="Join upcoming meetups and networking events"
            />
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="group bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 rounded-xl p-6 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent mb-1">{stats.totalMembers}</div>
            <div className="text-sm text-zinc-500">Active Members</div>
          </div>

          <div className="group bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 rounded-xl p-6 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent mb-1">{stats.unreadMessages}</div>
            <div className="text-sm text-zinc-500">Unread Messages</div>
          </div>

          <div className="group bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 hover:border-green-500/50 rounded-xl p-6 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent mb-1">{stats.activeRequests}</div>
            <div className="text-sm text-zinc-500">Open Requests</div>
          </div>

          <div className="group bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 rounded-xl p-6 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent mb-1">{stats.upcomingEvents}</div>
            <div className="text-sm text-zinc-500">Upcoming Events</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Quick Actions
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/intros')}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:from-amber-500/20 hover:to-yellow-500/20 border border-amber-500/30 rounded-lg transition-colors group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      Strategic Intros
                      {stats.pendingIntros > 0 && (
                        <span className="px-2 py-0.5 bg-amber-500 text-black text-xs rounded-full font-bold">
                          {stats.pendingIntros}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-zinc-500">AI-curated connections</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                </button>

                <button
                  onClick={() => router.push('/members')}
                  className="flex items-center gap-4 p-4 bg-zinc-800 hover:bg-zinc-750 rounded-lg transition-colors group"
                >
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold mb-1">Browse Members</div>
                    <div className="text-sm text-zinc-500">Discover and connect</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                </button>

                {isFeatureAvailable('requests') ? (
                  <button
                    onClick={() => router.push('/requests')}
                    className="flex items-center gap-4 p-4 bg-zinc-800 hover:bg-zinc-750 rounded-lg transition-colors group"
                  >
                    <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold mb-1">Post a Request</div>
                      <div className="text-sm text-zinc-500">Get help from members</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-green-400 transition-colors" />
                  </button>
                ) : (
                  <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg opacity-60">
                    <div className="flex items-center gap-3">
                      <Target className="w-6 h-6 text-zinc-500" />
                      <div className="text-left flex-1">
                        <div className="font-semibold text-zinc-400 mb-1">Post a Request</div>
                        <div className="text-xs text-zinc-600">Unlocks Nov 1</div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => router.push('/messages')}
                  className="flex items-center gap-4 p-4 bg-zinc-800 hover:bg-zinc-750 rounded-lg transition-colors group"
                >
                  <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold mb-1 flex items-center gap-2">My Messages {stats.unreadMessages > 0 && <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">{stats.unreadMessages}</span>}</div>
                    <div className="text-sm text-zinc-500">View conversations</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                </button>

                <button
                  onClick={() => router.push('/saved')}
                  className="flex items-center gap-4 p-4 bg-zinc-800 hover:bg-zinc-750 rounded-lg transition-colors group"
                >
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bookmark className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold mb-1">Saved Items</div>
                    <div className="text-sm text-zinc-500">View saved content</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                </button>

                {isFeatureAvailable('events') ? (
                  <button
                    onClick={() => router.push('/events')}
                    className="flex items-center gap-4 p-4 bg-zinc-800 hover:bg-zinc-750 rounded-lg transition-colors group"
                  >
                    <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold mb-1">View Events</div>
                      <div className="text-sm text-zinc-500">Join upcoming events</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 transition-colors" />
                  </button>
                ) : (
                  <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg opacity-60">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-zinc-500" />
                      <div className="text-left flex-1">
                        <div className="font-semibold text-zinc-400 mb-1">View Events</div>
                        <div className="text-xs text-zinc-600">Unlocks Nov 1</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Profile */}
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Your Profile</h3>
              <div className="space-y-3 mb-4">
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Name</div>
                  <div className="font-semibold">{profile?.full_name || 'Not set'}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Title</div>
                  <div className="font-semibold">{profile?.title || 'Not set'}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Company</div>
                  <div className="font-semibold">{profile?.company || 'Not set'}</div>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Edit Profile
              </button>
            </div>

            {/* Member Status */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Member Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Membership</span>
                  <span className="text-amber-400 font-semibold text-sm">
                    {profile?.is_founding_member ? 'Founding' : 'Regular'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Rate</span>
                  <span className="text-white font-semibold text-sm">$199/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Invites Left</span>
                  <span className="text-white font-semibold text-sm">{stats.invitesRemaining}</span>
                </div>
              </div>
              <button
                onClick={() => router.push('/invite')}
                className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Invite Members
              </button>
            </div>

            {/* Saved Items - Quick Link */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-400" />
                Saved Items
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                Access all your saved members, events, and requests in one place.
              </p>
              <button
                onClick={() => router.push('/saved')}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Bookmark className="w-4 h-4" />
                View Saved Items
              </button>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Recent Activity
              </h3>
              
              {recentActivity.length === 0 ? (
                <p className="text-sm text-zinc-500">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map((activity) => {
                    const timeAgo = new Date(activity.time).toLocaleDateString();
                    let icon;
                    switch (activity.icon) {
                      case 'users':
                        icon = <Users className="w-4 h-4 text-blue-400" />;
                        break;
                      case 'target':
                        icon = <Target className="w-4 h-4 text-purple-400" />;
                        break;
                      case 'calendar':
                        icon = <Calendar className="w-4 h-4 text-emerald-400" />;
                        break;
                      default:
                        icon = <TrendingUp className="w-4 h-4 text-zinc-400" />;
                    }
                    
                    return (
                      <div key={activity.id} className="flex gap-3 items-start pb-3 border-b border-zinc-800 last:border-0 last:pb-0">
                        <div className="flex-shrink-0 mt-1">{icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium line-clamp-1">{activity.title}</p>
                          <p className="text-xs text-zinc-400 line-clamp-1">{activity.description}</p>
                          <p className="text-xs text-zinc-600 mt-1">{timeAgo}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Contact Us */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                Need Help?
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                Have questions or need support? We're here to help.
              </p>
              <button
                onClick={() => router.push('/contact')}
                className="w-full block text-center bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Onboarding Carousel - Show on first visit */}
      {showOnboarding && (
        <OnboardingCarousel
          onComplete={handleOnboardingComplete}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
