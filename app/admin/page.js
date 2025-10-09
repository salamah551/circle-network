'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, DollarSign, TrendingUp, Mail, 
  UserCheck, UserX, Calendar, Target,
  ArrowRight, Loader2, Upload
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingApplications: 0,
    foundingMembers: 0,
    totalRevenue: 0,
    activeInvites: 0,
    thisMonthSignups: 0,
    openRequests: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      // Check if user is admin
      // ✅ Check if user is admin from DATABASE
const { data: profile } = await supabase
  .from('profiles')
  .select('is_admin, email')
  .eq('id', session.user.id)
  .single();

if (!profile || profile.is_admin !== true) {
  console.log('🚫 Not admin, redirecting to dashboard');
  router.push('/dashboard');
  return;
}

console.log('✅ Admin verified:', profile.email);
      setIsAdmin(true);
      await loadStats();
      await loadRecentActivity();
      setIsLoading(false);
    } catch (error) {
      console.error('Admin check error:', error);
      router.push('/login');
    }
  };

  const loadStats = async () => {
    try {
      // Total members
      const { count: totalMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Active members
      const { count: activeMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Pending applications
      const { count: pendingApplications } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Founding members
      const { count: foundingMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_founding_member', true)
        .eq('status', 'active');

      // Active invites
      const { count: activeInvites } = await supabase
        .from('invites')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // This month signups
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count: thisMonthSignups } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());

      // Open requests
      const { count: openRequests } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Calculate revenue (founding: $199, regular: $249)
      const foundingRevenue = (foundingMembers || 0) * 199;
      const regularRevenue = ((activeMembers || 0) - (foundingMembers || 0)) * 249;
      const totalRevenue = foundingRevenue + regularRevenue;

      setStats({
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        pendingApplications: pendingApplications || 0,
        foundingMembers: foundingMembers || 0,
        totalRevenue,
        activeInvites: activeInvites || 0,
        thisMonthSignups: thisMonthSignups || 0,
        openRequests: openRequests || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const { data: recentMembers } = await supabase
        .from('profiles')
        .select('full_name, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(recentMembers || []);
    } catch (error) {
      console.error('Error loading activity:', error);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#D4AF37" strokeWidth="2" fill="none"/>
                <circle cx="20" cy="20" r="12" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
                <circle cx="20" cy="20" r="6" fill="#D4AF37"/>
              </svg>
              <div>
                <span className="font-bold text-lg block leading-none">Admin Panel</span>
                <span className="text-xs text-amber-400">The Circle Network</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm"
            >
              Back to Member Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-zinc-400">Manage your Circle community</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-xs text-zinc-500">Total</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.totalMembers}</div>
            <div className="text-sm text-zinc-500">Total Members</div>
            <div className="mt-2 text-xs text-emerald-400">
              {stats.activeMembers} active
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-emerald-400" />
              <span className="text-xs text-zinc-500">MRR</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-zinc-500">Monthly Revenue</div>
            <div className="mt-2 text-xs text-amber-400">
              {stats.foundingMembers} founding @ $199
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-xs text-zinc-500">Growth</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.thisMonthSignups}</div>
            <div className="text-sm text-zinc-500">New This Month</div>
            <div className="mt-2 text-xs text-zinc-400">
              {stats.pendingApplications} pending
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Mail className="w-8 h-8 text-amber-400" />
              <span className="text-xs text-zinc-500">Invites</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.activeInvites}</div>
            <div className="text-sm text-zinc-500">Active Invites</div>
            <div className="mt-2 text-xs text-zinc-400">
              {stats.openRequests} open requests
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => router.push('/admin/members')}
            className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 rounded-xl p-6 transition-all text-left group"
          >
            <Users className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
              Manage Members
            </h3>
            <p className="text-zinc-500 text-sm mb-3">View and manage all members</p>
            <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
          </button>

          <button
            onClick={() => router.push('/admin/invites')}
            className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 rounded-xl p-6 transition-all text-left group"
          >
            <Mail className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
              Invites
            </h3>
            <p className="text-zinc-500 text-sm mb-3">Create and track invites</p>
            <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
          </button>

          <button
            onClick={() => router.push('/admin/bulk-invites')}
            className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 rounded-xl p-6 transition-all text-left group"
          >
            <Upload className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
              Bulk Invites
            </h3>
            <p className="text-zinc-500 text-sm mb-3">CSV upload & email campaigns</p>
            <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
          </button>

          <button
            onClick={() => router.push('/admin/applications')}
            className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 rounded-xl p-6 transition-all text-left group"
          >
            <UserCheck className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
              Applications
            </h3>
            <p className="text-zinc-500 text-sm mb-3">Review pending applications</p>
            {stats.pendingApplications > 0 && (
              <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                {stats.pendingApplications} pending
              </span>
            )}
          </button>

          <button
            onClick={() => router.push('/admin/analytics')}
            className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 rounded-xl p-6 transition-all text-left group"
          >
            <TrendingUp className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
              Analytics
            </h3>
            <p className="text-zinc-500 text-sm mb-3">View detailed analytics</p>
            <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6">Recent Member Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                    {activity.full_name?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{activity.full_name}</p>
                    <p className="text-zinc-500 text-sm">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  activity.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

}

