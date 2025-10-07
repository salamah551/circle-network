'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, MessageSquare, TrendingUp, Calendar, 
  ArrowRight, Loader2, LogOut, Settings, 
  Sparkles, Target, Mail, Bell, X, Save,
  User, Briefcase, MapPin, Link as LinkIcon,
  Linkedin, Twitter, Globe
} from 'lucide-react';

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

// Notifications Component
function Notifications({ userId }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (userId) {
      loadNotifications();
      
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `to_user_id=eq.${userId}` },
          () => loadNotifications()
        )
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'intro_requests', filter: `target_member_id=eq.${userId}` },
          () => loadNotifications()
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
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
          
          <div className="absolute right-0 top-full mt-2 w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
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
                      onClick={() => {
                        router.push(notif.link);
                        setShowPanel(false);
                      }}
                      className="w-full text-left p-4 hover:bg-zinc-800 transition-colors"
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
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeRequests: 0,
    unreadMessages: 0,
    upcomingEvents: 0,
    invitesRemaining: 0
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      setUser(session.user);
      await loadProfile(session.user.id);
      await loadStats(session.user.id);
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

    setStats(prev => ({
      ...prev,
      totalMembers: memberCount || 0,
      activeRequests: requestCount || 0,
      unreadMessages: messageCount || 0,
      upcomingEvents: 0
    }));
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
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {profile?.first_name || profile?.full_name?.split(' ')[0] || 'Member'}
          </h1>
          <p className="text-zinc-400">Here's what's happening in your network</p>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => router.push('/members')}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all text-left"
          >
            <Users className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Members</h3>
            <p className="text-white/60 text-sm">Browse the directory</p>
          </button>

          <button
            onClick={() => router.push('/messages')}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all text-left"
          >
            <MessageSquare className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Messages</h3>
            <p className="text-white/60 text-sm">Chat with members</p>
          </button>

          <button
            onClick={() => router.push('/requests')}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all text-left"
          >
            <Target className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Requests</h3>
            <p className="text-white/60 text-sm">Browse asks & offers</p>
          </button>

          <button
            onClick={() => router.push('/events')}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all text-left"
          >
            <Calendar className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Events</h3>
            <p className="text-white/60 text-sm">Upcoming meetups</p>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.totalMembers}</div>
            <div className="text-sm text-zinc-500">Active Members</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.unreadMessages}</div>
            <div className="text-sm text-zinc-500">Unread Messages</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.activeRequests}</div>
            <div className="text-sm text-zinc-500">Open Requests</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.upcomingEvents}</div>
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

                <button
                  onClick={() => router.push('/messages')}
                  className="flex items-center gap-4 p-4 bg-zinc-800 hover:bg-zinc-750 rounded-lg transition-colors group"
                >
                  <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold mb-1">My Messages</div>
                    <div className="text-sm text-zinc-500">View conversations</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                </button>

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
                onClick={() => router.push('/admin/invites')}
                className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Invite Members
              </button>
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
              <a
                href="mailto:support@thecirclenetwork.org"
                className="w-full block text-center bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Contact Us
              </a>
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
    </div>
  );
}
