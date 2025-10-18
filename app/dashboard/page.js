'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import {
  ArrowRight, Sparkles, Users, MessageSquare, Bell, Settings,
  TrendingUp, Shield, BarChart3, Crown, Lock, ChevronRight,
  UserCheck, Calendar, Award, Target, Zap, Eye, DollarSign,
  Clock, AlertCircle, CheckCircle, Menu, X, LogOut, Plus,
  Search, Filter, ArrowUpRight, Activity, Briefcase, Mail, Loader2
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Real-time Activity Feed Component
function ActivityFeed({ userId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [userId]);

  const loadActivities = async () => {
    try {
      // Get recent activities from multiple sources
      const [
        { data: recentIntros },
        { data: recentMessages },
        { data: recentRequests },
        { data: recentPosts }
      ] = await Promise.all([
        // Strategic intros
        supabase
          .from('strategic_intros')
          .select('*, member:profiles!strategic_intros_member_id_fkey(full_name)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Messages
        supabase
          .from('messages')
          .select('*, sender:profiles!messages_from_user_id_fkey(full_name)')
          .eq('to_user_id', userId)
          .eq('read', false)
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Request replies
        supabase
          .from('request_replies')
          .select(`
            *,
            request:requests!request_replies_request_id_fkey(
              title,
              user_id
            ),
            replier:profiles!request_replies_user_id_fkey(full_name)
          `)
          .eq('request.user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Feed post likes/comments on user's posts
        supabase
          .from('feed_post_likes')
          .select(`
            *,
            post:feed_posts!feed_post_likes_post_id_fkey(user_id),
            liker:profiles!feed_post_likes_user_id_fkey(full_name)
          `)
          .eq('post.user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      // Combine and sort by created_at
      const combined = [];

      // Add intros
      recentIntros?.forEach(intro => {
        combined.push({
          type: 'intro',
          icon: Sparkles,
          iconBg: 'bg-amber-500/20',
          iconColor: 'text-amber-400',
          title: 'New intro available',
          description: `${intro.member?.full_name || 'Someone'} (${intro.match_score}% match)`,
          time: intro.created_at
        });
      });

      // Add messages
      recentMessages?.forEach(msg => {
        combined.push({
          type: 'message',
          icon: MessageSquare,
          iconBg: 'bg-blue-500/20',
          iconColor: 'text-blue-400',
          title: 'New message',
          description: `${msg.sender?.full_name || 'Someone'} sent you a message`,
          time: msg.created_at
        });
      });

      // Add request replies
      recentRequests?.forEach(reply => {
        combined.push({
          type: 'reply',
          icon: UserCheck,
          iconBg: 'bg-emerald-500/20',
          iconColor: 'text-emerald-400',
          title: 'New reply to your request',
          description: `${reply.replier?.full_name || 'Someone'} replied to "${reply.request?.title}"`,
          time: reply.created_at
        });
      });

      // Add post likes
      recentPosts?.forEach(like => {
        combined.push({
          type: 'like',
          icon: UserCheck,
          iconBg: 'bg-pink-500/20',
          iconColor: 'text-pink-400',
          title: 'Post liked',
          description: `${like.liker?.full_name || 'Someone'} liked your post`,
          time: like.created_at
        });
      });

      // Sort by time and take top 5
      combined.sort((a, b) => new Date(b.time) - new Date(a.time));
      setActivities(combined.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error loading activities:', error);
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} ${Math.floor(seconds / 60) === 1 ? 'minute' : 'minutes'} ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${Math.floor(seconds / 3600) === 1 ? 'hour' : 'hours'} ago`;
    return `${Math.floor(seconds / 86400)} ${Math.floor(seconds / 86400) === 1 ? 'day' : 'days'} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No recent activity yet</p>
        <p className="text-sm mt-1">Start connecting with members to see activity here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activity.icon;
        return (
          <div key={index} className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <div className={`w-10 h-10 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${activity.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm mb-1">
                <strong className="text-white">{activity.title}:</strong> {activity.description}
              </p>
              <p className="text-xs text-zinc-500">{getTimeAgo(activity.time)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    connections: 0,
    messages: 0,
    introsPending: 0,
    introsAccepted: 0
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
      } else {
        setProfile(profileData);
      }

      // Get stats (mock for now - you'll replace with real queries)
      setStats({
        connections: 12,
        messages: 5,
        introsPending: 3,
        introsAccepted: 8
      });

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isFoundingMember = profile?.membership_tier === 'founding' || profile?.is_founding_member;
  const isEliteMember = profile?.membership_tier === 'elite';
  const canAccessEliteFeatures = isFoundingMember || isEliteMember;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Crown className="w-8 h-8 text-black" />
          </div>
          <p className="text-zinc-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-zinc-950 border-r border-zinc-800 flex-col">
        <div className="p-6 border-b border-zinc-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-black" />
            </div>
            <span className="text-lg font-bold">Circle Network</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-900 text-white font-medium transition-colors"
          >
            <Activity className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          
          <Link
            href="/intros"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors relative"
          >
            <Sparkles className="w-5 h-5" />
            <span>Strategic Intros</span>
            {stats.introsPending > 0 && (
              <span className="ml-auto px-2 py-0.5 bg-amber-500 text-black text-xs font-bold rounded-full">
                {stats.introsPending}
              </span>
            )}
          </Link>

          <Link
            href="/members"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Members</span>
          </Link>
          <Link
  href="/requests"
  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
>
  <Target className="w-5 h-5" />
  <span>Requests</span>
</Link>

<Link
  href="/feed"
  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
>
  <Sparkles className="w-5 h-5" />
  <span>Feed</span>
</Link>

          <Link
            href="/messages"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors relative"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Messages</span>
            {stats.messages > 0 && (
              <span className="ml-auto px-2 py-0.5 bg-emerald-500 text-black text-xs font-bold rounded-full">
                {stats.messages}
              </span>
            )}
          </Link>

          <div className="my-4 border-t border-zinc-800"></div>

          {/* Elite AI Features - Locked/Unlocked */}
          <Link
            href="/deal-flow"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
              canAccessEliteFeatures
                ? 'hover:bg-zinc-900 text-zinc-400 hover:text-white'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Deal Flow Alerts</span>
            {!canAccessEliteFeatures && (
              <Lock className="w-4 h-4 ml-auto text-zinc-600" />
            )}
            {canAccessEliteFeatures && (
              <span className="ml-auto px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded">
                Elite
              </span>
            )}
          </Link>

          <Link
            href="/reputation"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
              canAccessEliteFeatures
                ? 'hover:bg-zinc-900 text-zinc-400 hover:text-white'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>Reputation Guardian</span>
            {!canAccessEliteFeatures && (
              <Lock className="w-4 h-4 ml-auto text-zinc-600" />
            )}
            {canAccessEliteFeatures && (
              <span className="ml-auto px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded">
                Elite
              </span>
            )}
          </Link>

          <Link
            href="/intelligence"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
              canAccessEliteFeatures
                ? 'hover:bg-zinc-900 text-zinc-400 hover:text-white'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Competitive Intel</span>
            {!canAccessEliteFeatures && (
              <Lock className="w-4 h-4 ml-auto text-zinc-600" />
            )}
            {canAccessEliteFeatures && (
              <span className="ml-auto px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded">
                Elite
              </span>
            )}
          </Link>

          <div className="my-4 border-t border-zinc-800"></div>

          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-zinc-950 border-b border-zinc-800">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold">Circle Network</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-zinc-900 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-zinc-800 p-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-900 text-white font-medium"
            >
              <Activity className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/intros"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400"
            >
              <Sparkles className="w-5 h-5" />
              <span>Strategic Intros</span>
              {stats.introsPending > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-amber-500 text-black text-xs font-bold rounded-full">
                  {stats.introsPending}
                </span>
              )}
            </Link>
            <Link
              href="/members"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400"
            >
              <Users className="w-5 h-5" />
              <span>Members</span>
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Messages</span>
              {stats.messages > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-emerald-500 text-black text-xs font-bold rounded-full">
                  {stats.messages}
                </span>
              )}
            </Link>
            <div className="my-2 border-t border-zinc-800"></div>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-red-400 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {profile?.first_name || 'Member'}
              </h1>
              <p className="text-zinc-400 flex items-center gap-2 flex-wrap">
                {isFoundingMember && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-semibold">
                    <Crown className="w-4 h-4" />
                    Founding Member
                  </span>
                )}
                {isEliteMember && !isFoundingMember && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-semibold">
                    <Sparkles className="w-4 h-4" />
                    Elite Member
                  </span>
                )}
                <span className="text-sm">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </p>
            </div>
            <Link
              href="/profile"
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>View Profile</span>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.connections}</div>
              <div className="text-sm text-zinc-400">Active Connections</div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.introsPending}</div>
              <div className="text-sm text-zinc-400">Pending Intros</div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.messages}</div>
              <div className="text-sm text-zinc-400">Unread Messages</div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-400" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.introsAccepted}</div>
              <div className="text-sm text-zinc-400">Accepted Intros</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Link
              href="/intros"
              className="group bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 rounded-xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Review Weekly Intros</h3>
              <p className="text-sm text-zinc-400 mb-4">
                {stats.introsPending} AI-matched connections waiting for your review
              </p>
              {stats.introsPending > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
                  Action Required
                </span>
              )}
            </Link>

            <Link
              href="/members"
              className="group bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-zinc-950 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Browse Members</h3>
              <p className="text-sm text-zinc-400">
                Explore 250+ accomplished professionals in the network
              </p>
            </Link>

            <Link
              href="/messages"
              className="group bg-gradient-to-br from-blue-500/10 via-zinc-900 to-zinc-950 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Check Messages</h3>
              <p className="text-sm text-zinc-400 mb-4">
                {stats.messages} unread conversations waiting for you
              </p>
              {stats.messages > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                  {stats.messages} New
                </span>
              )}
            </Link>
          </div>

          {/* Elite AI Features Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-400" />
                Elite AI Features
              </h2>
              {!canAccessEliteFeatures && (
                <Link
                  href="/#pricing"
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Elite
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Deal Flow Alerts Card */}
              <LockedFeatureCard
                icon={TrendingUp}
                title="AI Deal Flow Alerts"
                description="Get notified the moment investment opportunities matching your criteria emerge—before they hit the market."
                status={canAccessEliteFeatures ? 'coming-soon' : 'locked'}
                launchDate="Q1 2026"
                href="/deal-flow"
                isFoundingMember={isFoundingMember}
              />

              {/* Reputation Guardian Card */}
              <LockedFeatureCard
                icon={Shield}
                title="Reputation Guardian"
                description="24/7 AI monitoring of your online reputation with instant alerts for potential threats."
                status={canAccessEliteFeatures ? 'coming-soon' : 'locked'}
                launchDate="Q1 2026"
                href="/reputation"
                isFoundingMember={isFoundingMember}
              />

              {/* Competitive Intelligence Card */}
              <LockedFeatureCard
                icon={BarChart3}
                title="AI Competitive Intelligence"
                description="Weekly intelligence reports on competitors, market trends, and strategic opportunities."
                status={canAccessEliteFeatures ? 'coming-soon' : 'locked'}
                launchDate="Q1 2026"
                href="/intelligence"
                isFoundingMember={isFoundingMember}
              />
            </div>
          </div>

         {/* Recent Activity */}
<div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-6 md:p-8 border border-zinc-800">
  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
    <Activity className="w-6 h-6 text-zinc-400" />
    Recent Activity
  </h2>
  <ActivityFeed userId={user.id} />
</div>
        </div>
      </main>
    </div>
  );
}

// Locked Feature Card Component
function LockedFeatureCard({ icon: Icon, title, description, status, launchDate, href, isFoundingMember }) {
  const isLocked = status === 'locked';
  const isComingSoon = status === 'coming-soon';

  if (isLocked) {
    return (
      <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-xl p-6 border border-zinc-800 opacity-75">
        <div className="absolute top-4 right-4">
          <Lock className="w-5 h-5 text-zinc-600" />
        </div>
        
        <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2 text-zinc-300">{title}</h3>
        <p className="text-sm text-zinc-500 mb-4 leading-relaxed">{description}</p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <Clock className="w-4 h-4" />
            <span>Launching {launchDate}</span>
          </div>
          
          <div className="pt-3 border-t border-zinc-800">
            <div className="text-xs text-red-400 font-semibold mb-2 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              ELITE MEMBERS ONLY
            </div>
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 rounded-lg transition-all text-sm font-semibold"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Elite
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isComingSoon) {
    return (
      <Link
        href={href}
        className="group relative bg-gradient-to-br from-purple-500/10 via-zinc-900 to-black rounded-xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all"
      >
        <div className="absolute top-4 right-4">
          <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        </div>
        
        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{description}</p>
        
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-semibold">
            <Clock className="w-3 h-3" />
            Coming {launchDate}
          </span>
          
          {isFoundingMember && (
            <div className="pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <Crown className="w-4 h-4" />
                <span>INCLUDED IN YOUR FOUNDING MEMBERSHIP</span>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                You'll get full access when this launches—no additional cost.
              </p>
            </div>
          )}
        </div>
      </Link>
    );
  }

  return null;
}