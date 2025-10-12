'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Users, DollarSign,
  Mail, Calendar, Crown, Loader2, Download
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    mrr: 0,
    totalMembers: 0,
    activeMembers: 0,
    foundingMembers: 0,
    churnRate: 0,
    conversionRate: 0,
    avgResponseTime: 0,
    totalRequests: 0,
    fulfilledRequests: 0,
    totalMessages: 0
  });
  const [growthData, setGrowthData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      loadAnalytics();
    }
  }, [timeRange]);

  const checkAdminAndLoad = async () => {
    try {
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

      await loadAnalytics();
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  const loadAnalytics = async () => {
    try {
      // Calculate date range
      const now = new Date();
      const daysAgo = parseInt(timeRange);
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // Total members
      const { count: totalMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Active members
      const { count: activeMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Founding members
      const { count: foundingMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_founding_member', true)
        .eq('status', 'active');

      // Calculate MRR
      const foundingRevenue = (foundingMembers || 0) * 199;
      const regularRevenue = ((activeMembers || 0) - (foundingMembers || 0)) * 249;
      const mrr = foundingRevenue + regularRevenue;
      const totalRevenue = mrr * 12;

      // Requests analytics
      const { count: totalRequests } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      const { count: fulfilledRequests } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'fulfilled')
        .gte('created_at', startDate.toISOString());

      // Messages analytics
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Conversion rate (applications to members)
      const { count: totalApps } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true });

      const conversionRate = totalApps > 0 ? ((activeMembers / totalApps) * 100).toFixed(1) : 0;

      // Growth data for chart
      const growthByDay = [];
      for (let i = daysAgo; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .lte('created_at', date.toISOString());
        
        growthByDay.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          members: count || 0
        });
      }

      setMetrics({
        totalRevenue,
        mrr,
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        foundingMembers: foundingMembers || 0,
        churnRate: 0, // Calculate based on your needs
        conversionRate,
        avgResponseTime: 2.4, // Placeholder
        totalRequests: totalRequests || 0,
        fulfilledRequests: fulfilledRequests || 0,
        totalMessages: totalMessages || 0
      });

      setGrowthData(growthByDay);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const exportData = () => {
    const csvContent = `
Metric,Value
Total Members,${metrics.totalMembers}
Active Members,${metrics.activeMembers}
Founding Members,${metrics.foundingMembers}
MRR,$${metrics.mrr}
Annual Revenue,$${metrics.totalRevenue}
Conversion Rate,${metrics.conversionRate}%
Total Requests,${metrics.totalRequests}
Fulfilled Requests,${metrics.fulfilledRequests}
Total Messages,${metrics.totalMessages}
    `.trim();

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `circle-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Admin
              </button>
              <h1 className="text-2xl font-bold">Analytics</h1>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="365d">Last year</option>
              </select>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-emerald-400" />
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              ${metrics.mrr.toLocaleString()}
            </div>
            <div className="text-sm text-zinc-500">Monthly Recurring Revenue</div>
            <div className="mt-2 text-xs text-zinc-400">
              ${metrics.totalRevenue.toLocaleString()}/year projected
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-xs text-emerald-400 font-semibold">+{metrics.activeMembers}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{metrics.totalMembers}</div>
            <div className="text-sm text-zinc-500">Total Members</div>
            <div className="mt-2 text-xs text-zinc-400">
              {metrics.activeMembers} active
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Crown className="w-8 h-8 text-amber-400" />
              <span className="text-xs text-zinc-400">{((metrics.foundingMembers / 500) * 100).toFixed(1)}%</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{metrics.foundingMembers}</div>
            <div className="text-sm text-zinc-500">Founding Members</div>
            <div className="mt-2 text-xs text-zinc-400">
              {500 - metrics.foundingMembers} spots left
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-xs text-emerald-400 font-semibold">{metrics.conversionRate}%</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{metrics.conversionRate}%</div>
            <div className="text-sm text-zinc-500">Conversion Rate</div>
            <div className="mt-2 text-xs text-zinc-400">
              Applications to members
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Requests</h3>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{metrics.totalRequests}</div>
                <div className="text-sm text-zinc-500">Total requests</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-emerald-400">{metrics.fulfilledRequests}</div>
                <div className="text-xs text-zinc-500">Fulfilled</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Fulfillment Rate:</span>
                <span className="text-emerald-400 font-semibold">
                  {metrics.totalRequests > 0 ? ((metrics.fulfilledRequests / metrics.totalRequests) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Messages</h3>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{metrics.totalMessages}</div>
                <div className="text-sm text-zinc-500">Total messages</div>
              </div>
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Avg per member:</span>
                <span className="text-blue-400 font-semibold">
                  {metrics.activeMembers > 0 ? (metrics.totalMessages / metrics.activeMembers).toFixed(1) : 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Response Time</h3>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{metrics.avgResponseTime}h</div>
                <div className="text-sm text-zinc-500">Average response</div>
              </div>
              <TrendingDown className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Target:</span>
                <span className="text-emerald-400 font-semibold">&lt; 4h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Member Growth</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {growthData.map((day, idx) => {
              const maxMembers = Math.max(...growthData.map(d => d.members));
              const height = (day.members / maxMembers) * 100;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-amber-500 to-amber-600 rounded-t hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer relative group"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-zinc-700 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.members} members
                    </div>
                  </div>
                  {idx % Math.ceil(growthData.length / 8) === 0 && (
                    <span className="text-xs text-zinc-500 rotate-0">{day.date}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">Revenue Breakdown</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-white">Founding Members</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">${(metrics.foundingMembers * 199).toLocaleString()}</div>
                  <div className="text-xs text-zinc-500">{metrics.foundingMembers} × $199</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-white">Regular Members</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">
                    ${((metrics.activeMembers - metrics.foundingMembers) * 249).toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {metrics.activeMembers - metrics.foundingMembers} × $249
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">Total MRR</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    ${metrics.mrr.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">Key Insights</h2>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-emerald-400 font-semibold mb-1">Strong Conversion</p>
                    <p className="text-sm text-zinc-300">
                      {metrics.conversionRate}% of applicants become members - above industry average of 15%
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-400 font-semibold mb-1">High Engagement</p>
                    <p className="text-sm text-zinc-300">
                      Members are active - {metrics.totalMessages} messages and {metrics.totalRequests} requests in {timeRange}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-400 font-semibold mb-1">Founding Window Closing</p>
                    <p className="text-sm text-zinc-300">
                      {500 - metrics.foundingMembers} founding spots left - 
                      {((metrics.foundingMembers / 500) * 100).toFixed(1)}% capacity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}

