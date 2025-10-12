'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Users,
  DollarSign,
  TrendingUp,
  Mail,
  UserCheck,
  ArrowRight,
  Loader2,
  Upload,
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminDashboard() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingApplications: 0,
    foundingMembers: 0,
    totalRevenue: 0,
    activeInvites: 0,
    thisMonthSignups: 0,
    openRequests: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { session }, error: sessErr } = await supabase.auth.getSession();
        if (sessErr || !session) {
          router.push('/login');
          return;
        }

        // Verify admin
        const { data: profile, error: profErr } = await supabase
          .from('profiles')
          .select('is_admin, email')
          .eq('id', session.user.id)
          .single();

        if (profErr || !profile?.is_admin) {
          router.push('/dashboard');
          return;
        }

        if (!mounted) return;
        setIsAdmin(true);

        await Promise.all([loadStats(), loadRecentActivity()]);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Unexpected error');
        router.push('/login');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function loadStats() {
    try {
      const [{ count: totalMembers }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);

      const { count: activeMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: pendingApplications } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: foundingMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_founding_member', true)
        .eq('status', 'active');

      const { count: activeInvites } = await supabase
        .from('invites')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count: thisMonthSignups } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());

      const { count: openRequests } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Revenue model (founding: $199, regular: $249)
      const foundingRevenue = (foundingMembers || 0) * 199;
      const regularRevenue = Math.max((activeMembers || 0) - (foundingMembers || 0), 0) * 249;

      setStats({
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        pendingApplications: pendingApplications || 0,
        foundingMembers: foundingMembers || 0,
        totalRevenue: foundingRevenue + regularRevenue,
        activeInvites: activeInvites || 0,
        thisMonthSignups: thisMonthSignups || 0,
        openRequests: openRequests || 0,
      });
    } catch (e) {
      console.error('Error loading stats:', e);
    }
  }

  async function loadRecentActivity() {
    try {
      const { data: recentMembers } = await supabase
        .from('profiles')
        .select('full_name, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(recentMembers || []);
    } catch (e) {
      console.error('Error loading activity:', e);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#D4AF37" strokeWidth="2" />
                <circle cx="20" cy="20" r="12" stroke="#D4AF37" strokeWidth="1.5" />
                <circle cx="20" cy="20" r="6" fill="#D4AF37" />
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
            <Users class
