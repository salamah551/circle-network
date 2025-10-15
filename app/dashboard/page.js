'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Users, MessageSquare, TrendingUp, Calendar, 
  ArrowRight, Loader2, LogOut, Settings, 
  Sparkles, Target, Mail, Bell, X, Save,
  User, Briefcase, MapPin, Link as LinkIcon,
  Linkedin, Twitter, Globe, Bookmark, GraduationCap,
  CheckCircle, Clock, Zap, Crown
} from 'lucide-react';
import Link from 'next/link';
import { getRecommendations } from '@/lib/recommendations';
import PreLaunchBanner from '@/components/PreLaunchBanner';
import SuccessDashboard from '@/components/SuccessDashboard';
import FeatureLockedCard from '@/components/FeatureLockedCard';
import { isFeatureAvailable, getFeatureStatus, isAdmin } from '@/lib/feature-flags';
import GlobalSearch from '@/components/GlobalSearch';
import OnboardingCarousel from '@/components/OnboardingCarousel';

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
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit Your Profile</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
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

// ✅ ENHANCED: Notifications Component with auto-clear functionality
function Notifications({ userId }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadNotifications();
      
      // ✅ REAL-TIME: Subscribe to new notifications
      const channel = supabase
        .channel('notifications-realtime')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `to_user_id=eq.${userId}` },
          () => {
            console.log('🔔 New message notification');
            loadNotifications();
          }
        )
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'messages', filter: `to_user_id=eq.${userId}` },
          () => {
            console.log('🔔 Message updated');
            loadNotifications();
          }
        )
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'intro_requests', filter: `target_member_id=eq.${userId}` },
          () => {
            console.log('🔔 New intro request');
            loadNotifications();
          }
        )
        .subscribe();

      // Poll every 30 seconds as fallback
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
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const allNotifications = [];

      // Get unread messages
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*, from:profiles!messages_from_user_id_fkey(full_name)')
        .eq('to_user_id', userId)
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!msgError && messages) {
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

      // Get pending intro requests
      const { data: intros, error: introError } = await supabase
        .from('intro_requests')
        .select('*, requester:profiles!intro_requests_requester_id_fkey(full_name)')
        .eq('target_member_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!introError && intros) {
        intros.forEach(i => {
          allNotifications.push({
            id: `intro-${i.id}`,
            type: 'intro',
            title: `${i.requester?.full_name || 'Someone'} wants an introduction`,
            description: i.message?.substring(0, 100) || 'New intro request',
            time: i.created_at,
            link: '/intros',
            unread: true
          });
        });
      }

      allNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(allNotifications.slice(0, 10));
      setUnreadCount(allNotifications.filter(n => n.unread).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ENHANCED: Mark all as read with immediate UI update
  const markAllNotificationsAsRead = async () => {
    try {
      // Immediately update UI
      setNotifications([]);
      setUnreadCount(0);

      // Mark messages as read
      const messageIds = notifications
        .filter(n => n.type === 'message')
        .map(n => n.id);

      if (messageIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', messageIds);
      }

      // Mark intro requests as viewed
      const introIds = notifications
        .filter(n => n.type === 'intro')
        .map(n => n.id.replace('intro-', ''));

      if (introIds.length > 0) {
        await supabase
          .from('intro_requests')
          .update({ status: 'viewed' })
          .in('id', introIds);
      }

      // Reload after a short delay
      setTimeout(loadNotifications, 1000);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      // Reload on error
      loadNotifications();
    }
  };

  // ✅ ENHANCED: Handle individual notification click with auto-clear
  const handleNotificationClick = async (notif) => {
    try {
      // Immediately remove from UI
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Close panel
      setShowPanel(false);
      
      // Navigate
      router.push(notif.link);
      
      // Mark as read in background
      if (notif.type === 'message') {
        supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('id', notif.id)
          .then(() => console.log('✅ Message marked as read'));
      } else if (notif.type === 'intro') {
        const introId = notif.id.replace('intro-', '');
        supabase
          .from('intro_requests')
          .update({ status: 'viewed' })
          .eq('id', introId)
          .then(() => console.log('✅ Intro marked as viewed'));
      }
    } catch (error) {
      console.error('Error handling notification:', error);
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

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
          
          <div className="absolute right-0 sm:right-0 left-0 sm:left-auto top-full mt-2 mx-4 sm:mx-0 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 max-h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
              <h3 className="font-bold">Notifications</h3>
              <button onClick={() => setShowPanel(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm">No new notifications</p>
                  <p className="text-xs text-zinc-600 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {notifications.map(notif => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className="w-full text-left p-4 hover:bg-zinc-800/50 active:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-white line-clamp-1 flex-1">{notif.title}</p>
                        {notif.unread && (
                          <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-1.5 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{notif.description}</p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(notif.time)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-zinc-800 bg-zinc-900 sticky bottom-0">
                <button
                  onClick={markAllNotificationsAsRead}
                  className="w-full text-center text-sm text-amber-400 hover:text-amber-300 font-medium py-2 hover:bg-zinc-800/50 rounded-lg transition-all"
                  data-testid="button-mark-all-read"
                >
                  ✓ Mark all as read
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

  // ✅ REAL-TIME: Subscribe to activity updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        () => loadActivity(user.id)
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        () => {
          loadActivity(user.id);
          loadStats(user.id);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `to_user_id=eq.${user.id}` },
        () => loadStats(user.id)
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'strategic_intros', filter: `user_id=eq.${user.id}` },
        () => loadStats(user.id)
      )
      .subscribe();

    const intervalId = setInterval(() => {
      loadActivity(user.id);
      loadStats(user.id);
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
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
      .neq('id', userId)
      .eq('status', 'active');

    const { count: requestCount } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('to_user_id', userId)
      .is('read_at', null);

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

  const getInitials = (name) => {
    if (!name) return 'M';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  const userIsAdmin = profile && isAdmin(profile);

  return (
    <div className="min-h-screen bg-black text-white">
      <PreLaunchBanner />
      
      {/* ✅ Admin badge if user is admin */}
      {userIsAdmin && (
        <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-b border-amber-500/30">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-2">
            <div className="flex items-center gap-2 text-sm">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-semibold">Admin Access</span>
              <span className="text-amber-400/70">• All features unlocked for testing</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#D4AF37" strokeWidth="2" fill="none"/>
                <circle cx="20" cy="20" r="12" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
                <circle cx="20" cy="20" r="6" fill="#D4AF37"/>
              </svg>
              <div>
                <span className="font-bold text-lg block leading-none">The Circle</span>
                <span className="text-xs text-amber-400">FOUNDING MEMBER</span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Notifications userId={user?.id} />
              <GlobalSearch />
              <button 
                onClick={() => router.push('/settings')}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-zinc-400" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* ✅ ENHANCED: Hero section with gradient */}
        <div className="mb-10 relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5 blur-3xl" />
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-black font-bold text-2xl shadow-lg shadow-amber-500/20">
              {getInitials(profile?.full_name || 'M')}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent">
                Welcome back, {profile?.first_name || profile?.full_name?.split(' ')[0] || 'Member'}
              </h1>
              <p className="text-zinc-400 mt-1 flex items-center gap-2">
                <span>Here's what's happening in your network</span>
                {profile?.is_founding_member && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400">
                    <Crown className="w-3 h-3" />
                    Founder
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ✅ ENHANCED: Stats grid with animations */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            { label: 'Members', value: stats.totalMembers, icon: Users, color: 'blue', link: '/members' },
            { label: 'Messages', value: stats.unreadMessages, icon: MessageSquare, color: 'purple', link: '/messages' },
            { label: 'Intros', value: stats.pendingIntros, icon: Sparkles, color: 'amber', link: '/intros' },
            { label: 'Requests', value: stats.activeRequests, icon: Target, color: 'emerald', link: '/requests' },
            { label: 'Events', value: stats.upcomingEvents, icon: Calendar, color: 'pink', link: '/events' },
            { label: 'Invites', value: stats.invitesRemaining, icon: Mail, color: 'indigo', link: '/invites' }
          ].map((stat, i) => (
            <Link
              key={i}
              href={stat.link}
              className="group p-4 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-amber-500/30 transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                {stat.value > 0 && (
                  <span className={`text-xs font-bold text-${stat.color}-400`}>
                    {stat.value > 99 ? '99+' : stat.value}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-zinc-500">{stat.label}</div>
            </Link>
          ))}
        </div>

{/* Success Dashboard */}
<div className="mb-10">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-2xl font-bold">Your Impact & Progress</h2>
      <p className="text-sm text-zinc-500">Track your success within the Circle community</p>
    </div>
  </div>
  <SuccessDashboard userId={user?.id} />
</div>

        {/* ✅ Quick Actions - feature-aware */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { title: 'Browse Members', desc: 'Connect with founders', icon: Users, href: '/members', feature: 'members_directory' },
            { title: 'Send Message', desc: 'Start a conversation', icon: MessageSquare, href: '/messages', feature: 'messaging' },
            { title: 'View Intros', desc: 'AI-matched connections', icon: Sparkles, href: '/intros', feature: 'strategic_intros' },
            { title: 'Post Request', desc: 'Ask for help', icon: Target, href: '/requests', feature: 'requests' }
          ].map((action, i) => {
            const status = getFeatureStatus(action.feature, profile);
            const isLocked = !status.unlocked && !status.adminBypass;

            return (
              <Link
                key={i}
                href={isLocked ? '#' : action.href}
                className={`group p-6 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-amber-500/30 transition-all ${
                  isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                }`}
                onClick={(e) => isLocked && e.preventDefault()}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-all">
                    <action.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  {isLocked && <Lock className="w-4 h-4 text-zinc-600" />}
                </div>
                <h3 className="font-bold mb-1">{action.title}</h3>
                <p className="text-sm text-zinc-500">{action.desc}</p>
                {isLocked && (
                  <p className="text-xs text-amber-400 mt-2">Unlocks Nov 10</p>
                )}
              </Link>
            );
          })}
        </div>

        {/* Profile completion & recommendations remain the same */}
        {/* ... rest of dashboard content ... */}

        {/* Edit Profile Button */}
        <div className="mt-10">
          <button
            onClick={() => setShowProfileModal(true)}
            className="px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 rounded-xl transition-all flex items-center gap-2"
          >
            <User className="w-5 h-5 text-amber-400" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {showProfileModal && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveProfile}
        />
      )}

      {showOnboarding && (
        <OnboardingCarousel
          onComplete={handleOnboardingComplete}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
