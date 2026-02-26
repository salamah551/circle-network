'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import {
  Crown, Loader2, Menu, X, LogOut, Activity, Sparkles, Users, Target,
  MessageSquare, Mail, Settings,
  Rss, UserCheck
} from 'lucide-react';

// Dashboard widgets
import ActionCenter from '@/components/dashboard/ActionCenter';
import ArcBriefsWidget from '@/components/dashboard/ArcBriefsWidget';
import MarketIntelWidget from '@/components/dashboard/MarketIntelWidget';
import AiMatchesWidget from '@/components/dashboard/AiMatchesWidget';
import CommunityHighlightsWidget from '@/components/dashboard/CommunityHighlightsWidget';

// Personalization
import { getPersonalizedLayout, getPersonalizedWelcome } from '@/lib/dashboardPersonalization';

const widgetComponents = {
  ActionCenter,
  ArcBriefsWidget,
  MarketIntelWidget,
  AiMatchesWidget,
  CommunityHighlightsWidget
};

export default function PersonalizedDashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [widgetLayout, setWidgetLayout] = useState([]);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    connections: 0,
    messages: 0,
    introsPending: 0,
    introsAccepted: 0
  });

  useEffect(() => {
    // Only redirect if auth state is fully resolved (not loading)
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      // Get personalized layout based on needs assessment
      const layout = getPersonalizedLayout(profile?.needs_assessment);
      setWidgetLayout(layout.widgets);
      
      // Get personalized welcome message
      const displayName = profile?.first_name
        || profile?.full_name?.split(' ')[0]
        || user?.email?.split('@')[0]
        || 'there';
      const welcome = getPersonalizedWelcome(
        profile?.needs_assessment,
        displayName
      );
      setWelcomeMessage(welcome);

      // Get stats from API endpoint
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    try {
      const statsResponse = await fetch('/api/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        // Fallback to zeros on API error
        console.error('Failed to fetch dashboard stats');
        setStats({
          connections: 0,
          messages: 0,
          introsPending: 0,
          introsAccepted: 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback to zeros on error
      setStats({
        connections: 0,
        messages: 0,
        introsPending: 0,
        introsAccepted: 0
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const isFoundingMember = profile?.membership_tier === 'founding' || profile?.is_founding_member;
  const isEliteMember = profile?.membership_tier === 'elite';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Crown className="w-8 h-8 text-black" />
          </div>
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  // If not loading and no user, the useEffect will handle redirect to login
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-zinc-950 border-r border-zinc-800 flex-col overflow-y-auto">
        <div className="p-6 border-b border-zinc-800 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-black" />
            </div>
            <span className="text-lg font-bold">Circle Network</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
              {(profile?.first_name?.[0] || profile?.full_name?.[0] || user?.email?.[0] || 'M').toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name || profile?.first_name || user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
            <Rss className="w-5 h-5" />
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

          <Link
            href="/contact"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>Contact Us</span>
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-800 flex-shrink-0">
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
          <div className="border-t border-zinc-800 p-4 space-y-1 max-h-[80vh] overflow-y-auto">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-900 text-white font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Activity className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/intros"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400"
              onClick={() => setMobileMenuOpen(false)}
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
              onClick={() => setMobileMenuOpen(false)}
            >
              <Users className="w-5 h-5" />
              <span>Members</span>
            </Link>
            <Link
              href="/feed"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Rss className="w-5 h-5" />
              <span>Feed</span>
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 text-zinc-400"
              onClick={() => setMobileMenuOpen(false)}
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
              onClick={() => setMobileMenuOpen(false)}
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent">
                {welcomeMessage}
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
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:ring-offset-2 focus:ring-offset-black"
            >
              <UserCheck className="w-5 h-5" />
              <span>View Profile</span>
            </Link>
          </div>

          {/* Personalized Widget Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-auto">
            {widgetLayout.map((widget, index) => {
              const WidgetComponent = widgetComponents[widget.component];
              return WidgetComponent ? (
                <div
                  key={widget.component}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  className="animate-fadeIn"
                >
                  <WidgetComponent />
                </div>
              ) : null;
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
