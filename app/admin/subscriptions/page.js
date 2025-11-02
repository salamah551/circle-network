'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import {
  CreditCard, DollarSign, AlertCircle, CheckCircle,
  XCircle, RefreshCw, Download, Search, Loader2, ArrowLeft
} from 'lucide-react';

// Use singleton browser client to prevent "Multiple GoTrueClient instances" warning
const supabase = getSupabaseBrowserClient();

export default function SubscriptionsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

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

    await loadSubscriptions();
    setIsLoading(false);
  };

  const loadSubscriptions = async () => {
    const response = await fetch('/api/admin/subscriptions');
    if (response.ok) {
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    }
  };

  const handleCancelSubscription = async (subscriptionId, memberId) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    setActionLoading(subscriptionId);
    const response = await fetch('/api/admin/subscriptions/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId, memberId })
    });

    if (response.ok) {
      await loadSubscriptions();
      alert('Subscription cancelled successfully');
    } else {
      alert('Failed to cancel subscription');
    }
    setActionLoading(null);
  };

  const handleRefund = async (chargeId, subscriptionId) => {
    if (!confirm('Are you sure you want to issue a full refund?')) return;

    setActionLoading(subscriptionId);
    const response = await fetch('/api/admin/subscriptions/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chargeId })
    });

    if (response.ok) {
      alert('Refund issued successfully');
      await loadSubscriptions();
    } else {
      alert('Failed to issue refund');
    }
    setActionLoading(null);
  };

  const exportSubscriptions = () => {
    const csv = [
      ['Member', 'Email', 'Plan', 'Status', 'Amount', 'Created', 'Current Period End'].join(','),
      ...filteredSubscriptions.map(sub => [
        sub.memberName,
        sub.memberEmail,
        sub.plan,
        sub.status,
        `$${sub.amount}`,
        new Date(sub.created).toLocaleDateString(),
        sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.memberEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                  <CreditCard className="w-6 h-6 text-amber-400" />
                  Subscription Management
                </h1>
                <p className="text-sm text-zinc-400 mt-1">
                  {filteredSubscriptions.length} subscriptions
                </p>
              </div>
            </div>
            <button
              onClick={exportSubscriptions}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by member name or email..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="canceled">Canceled</option>
            <option value="past_due">Past Due</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        {/* Subscriptions List */}
        <div className="space-y-4">
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900 rounded-xl border border-zinc-800">
              <CreditCard className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-zinc-400 mb-2">No subscriptions found</h3>
              <p className="text-zinc-500">Try adjusting your filters</p>
            </div>
          ) : (
            filteredSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{sub.memberName}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        sub.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : sub.status === 'canceled'
                          ? 'bg-zinc-700 text-zinc-400'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-zinc-400 mb-4">{sub.memberEmail}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-zinc-500">Plan</span>
                        <p className="font-semibold">{sub.plan}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Amount</span>
                        <p className="font-semibold text-amber-400">${sub.amount}/{sub.interval}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Created</span>
                        <p className="font-semibold">
                          {new Date(sub.created).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Current Period End</span>
                        <p className="font-semibold">
                          {sub.currentPeriodEnd 
                            ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {sub.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleCancelSubscription(sub.id, sub.memberId)}
                          disabled={actionLoading === sub.id}
                          className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm disabled:opacity-50"
                        >
                          {actionLoading === sub.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Cancel'
                          )}
                        </button>
                        {sub.latestCharge && (
                          <button
                            onClick={() => handleRefund(sub.latestCharge, sub.id)}
                            disabled={actionLoading === sub.id}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                          >
                            Refund
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
