'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, MessageSquare, TrendingUp, Calendar, 
  ArrowRight, Loader2, LogOut, Settings, 
  Sparkles, Target, Bell, Search, X, Mail
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
  totalMembers: 0,
  activeRequests: 0,
  unreadMessages: 0,
  upcomingEvents: 0,
  invitesRemaining: 0  // ✅ ADD THIS LINE
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
      await loadStats();
      await loadNotifications(session.user.id);
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
    // ✅ ADD THESE LINES - Update stats with invite count
    setStats(prev => ({
      ...prev,
      invitesRemaining: data.invites_remaining || 0
    }));
  }
};

  const loadStats = async () => {
    // Load member count
    const { count: memberCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Load active requests count
    const { count: requestCount } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    setStats({
      totalMembers: memberCount || 0,
      activeRequests: requestCount || 0,
      unreadMessages: 0,
      upcomingEvents: 0
    });
  };

  const loadNotifications = async (userId) => {
    // Mock notifications for now - you can replace with real data
    setNotifications([
      {
        id: 1,
        type: 'new_member',
        title: '3 new members joined',
        description: 'Welcome the newest Circle members',
        time: '2 hours ago',
        read: false
      },
      {
        id: 2,
        type: 'request',
        title: '5 new requests posted',
        description: 'Check out what members need help with',
        time: '5 hours ago',
        read: false
      },
      {
        id: 3,
        type: 'event',
        title: 'Virtual Roundtable this Friday',
        description: 'Don\'t forget to RSVP',
        time: '1 day ago',
        read: true
      }
    ]);
  };

  const markNotificationAsRead = async (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

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
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5 text-zinc-400" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                      <h3 className="font-bold text-white">Notifications</h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-zinc-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                          <p className="text-zinc-500">No notifications yet</p>
                        </div>
                      ) : (
                       notifications.map(notif => (
  <div
    key={notif.id}
    onClick={() => {
      markNotificationAsRead(notif.id);
      // Route based on notification type
      if (notif.type === 'request') router.push('/requests');
      else if (notif.type === 'event') router.push('/events');
      else if (notif.type === 'new_member') router.push('/members');
    }}
    className={`p-4 border-b border-zinc-800 hover:bg-zinc-800 cursor-pointer transition-colors ${
      !notif.read ? 'bg-zinc-850' : ''
    }`}
  >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                !notif.read ? 'bg-amber-400' : 'bg-transparent'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white text-sm mb-1">
                                  {notif.title}
                                </p>
                                <p className="text-zinc-400 text-xs mb-1">
                                  {notif.description}
                                </p>
                                <p className="text-zinc-500 text-xs">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Member'}
          </h1>
          <p className="text-zinc-400">Here's what's happening in your network</p>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          <button
            onClick={() => router.push('/settings')}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all text-left"
          >
            <Settings className="w-8 h-8 text-white/60 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Settings</h3>
            <p className="text-white/60 text-sm">Manage your profile</p>
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
                  onClick={() => router.push('/requests/new')}
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

            {/* Recent Activity */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b border-zinc-800">
                  <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-zinc-300 mb-1">
                      <span className="font-semibold text-white">3 new members</span> joined The Circle
                    </p>
                    <p className="text-xs text-zinc-500">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pb-4 border-b border-zinc-800">
                  <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-zinc-300 mb-1">
                      <span className="font-semibold text-white">5 new requests</span> posted on the board
                    </p>
                    <p className="text-xs text-zinc-500">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-zinc-300 mb-1">
                      <span className="font-semibold text-white">Virtual Roundtable</span> scheduled for Friday
                    </p>
                    <p className="text-xs text-zinc-500">1 day ago</p>
                  </div>
                </div>
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
                  <div className="font-semibold">{profile?.full_name}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Title</div>
                  <div className="font-semibold">{profile?.title}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Company</div>
                  <div className="font-semibold">{profile?.company}</div>
                </div>
              </div>
              <button
                onClick={() => router.push('/profile')}
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
                  <span className="text-amber-400 font-semibold text-sm">Founding</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Rate</span>
                  <span className="text-white font-semibold text-sm">$199/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Invites Left</span>
                  <span className="text-white font-semibold text-sm">5</span>
                </div>
              </div>
              <button
                onClick={() => router.push('/invite')}
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
              <button
                onClick={() => router.push('/contact')}
                className="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


