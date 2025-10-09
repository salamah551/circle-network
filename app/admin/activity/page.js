'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Activity, ArrowLeft, User, Calendar, Filter,
  Search, Loader2, Eye, Trash2, UserCheck, Mail,
  CreditCard, FileText
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ACTION_ICONS = {
  'subscription_cancelled': CreditCard,
  'refund_issued': CreditCard,
  'application_approved': UserCheck,
  'application_rejected': Trash2,
  'invite_sent': Mail,
  'member_status_updated': User,
  'member_deleted': Trash2,
  'invite_revoked': Trash2
};

export default function ActivityLogsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_admin) {
      router.push('/dashboard');
      return;
    }

    await loadActivities();
    setIsLoading(false);
  };

  const loadActivities = async () => {
    const { data, error } = await supabase
      .from('admin_activity_log')
      .select(`
        *,
        admin:profiles!admin_activity_log_admin_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(200);

    if (!error && data) {
      setActivities(data);
    }
  };

  const getFilteredActivities = () => {
    let filtered = [...activities];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(activity =>
        activity.admin?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.admin?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.action?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(activity => activity.action === actionFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      if (dateFilter === 'today') {
        filterDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === 'week') {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'month') {
        filterDate.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter(activity => 
        new Date(activity.created_at) >= filterDate
      );
    }

    return filtered;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActionColor = (action) => {
    if (action.includes('approved') || action.includes('sent')) return 'text-emerald-400';
    if (action.includes('rejected') || action.includes('deleted') || action.includes('cancelled')) return 'text-red-400';
    if (action.includes('updated')) return 'text-blue-400';
    return 'text-amber-400';
  };

  const filteredActivities = getFilteredActivities();
  const uniqueActions = [...new Set(activities.map(a => a.action))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Activity className="w-6 h-6 text-amber-400" />
                  Activity Logs
                </h1>
                <p className="text-sm text-zinc-400 mt-1">
                  {filteredActivities.length} activities
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by admin or action..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900 rounded-xl border border-zinc-800">
              <Activity className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-zinc-400 mb-2">No activities found</h3>
              <p className="text-zinc-500">Try adjusting your filters</p>
            </div>
          ) : (
            filteredActivities.map((activity) => {
              const Icon = ACTION_ICONS[activity.action] || FileText;
              
              return (
                <div
                  key={activity.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-amber-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Icon className={`w-5 h-5 ${getActionColor(activity.action)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <p className="font-semibold text-white mb-1">
                            {activity.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-sm text-zinc-400">
                            by <span className="text-white">{activity.admin?.full_name || 'Unknown Admin'}</span>
                            {activity.admin?.email && (
                              <span className="text-zinc-500"> ({activity.admin.email})</span>
                            )}
                          </p>
                        </div>
                        <span className="text-xs text-zinc-500 whitespace-nowrap">
                          {formatTime(activity.created_at)}
                        </span>
                      </div>

                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-2 p-3 bg-black rounded-lg">
                          <pre className="text-xs text-zinc-400 overflow-x-auto">
                            {JSON.stringify(activity.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
