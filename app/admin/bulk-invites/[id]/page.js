'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Mail, Eye, MousePointer, UserCheck, 
  TrendingUp, Clock, Loader2, Search, Download,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CampaignDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (campaignId) {
      checkAdminAndLoad();
    }
  }, [campaignId]);

  useEffect(() => {
    filterRecipients();
  }, [recipients, searchQuery, statusFilter]);

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

      await loadCampaign();
      await loadRecipients();
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  const loadCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_invite_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      setCampaign(data);
    } catch (error) {
      console.error('Error loading campaign:', error);
    }
  };

  const loadRecipients = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_invite_recipients')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipients(data || []);
    } catch (error) {
      console.error('Error loading recipients:', error);
    }
  };

  const filterRecipients = () => {
    let filtered = [...recipients];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.email?.toLowerCase().includes(query) ||
        r.first_name?.toLowerCase().includes(query) ||
        r.last_name?.toLowerCase().includes(query)
      );
    }

    setFilteredRecipients(filtered);
  };

  const exportRecipients = () => {
    const csvContent = [
      ['First Name', 'Last Name', 'Email', 'Status', 'Invite Code', 'Sequence Stage', 'Last Email', 'Opened', 'Clicked', 'Converted'],
      ...filteredRecipients.map(r => [
        r.first_name,
        r.last_name,
        r.email,
        r.status,
        r.invite_code,
        r.sequence_stage,
        r.last_email_sent ? new Date(r.last_email_sent).toLocaleDateString() : 'Not sent',
        r.opened_at ? 'Yes' : 'No',
        r.clicked_at ? 'Yes' : 'No',
        r.converted_at ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${campaign?.name}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
          <button
            onClick={() => router.push('/admin/bulk-invites')}
            className="mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  const statusCounts = {
    pending: recipients.filter(r => r.status === 'pending').length,
    sent: recipients.filter(r => r.status === 'sent').length,
    opened: recipients.filter(r => r.status === 'opened').length,
    clicked: recipients.filter(r => r.status === 'clicked').length,
    converted: recipients.filter(r => r.status === 'converted').length,
    unsubscribed: recipients.filter(r => r.status === 'unsubscribed').length
  };

  const conversionRate = campaign.total_sent > 0 
    ? ((campaign.total_converted / campaign.total_sent) * 100).toFixed(1) 
    : 0;

  const openRate = campaign.total_sent > 0
    ? ((campaign.total_opened / campaign.total_sent) * 100).toFixed(1)
    : 0;

  const clickRate = campaign.total_sent > 0
    ? ((campaign.total_clicked / campaign.total_sent) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/bulk-invites')}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Campaigns
              </button>
              <div>
                <h1 className="text-2xl font-bold">{campaign.name}</h1>
                <p className="text-sm text-zinc-400">
                  Created {new Date(campaign.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={exportRecipients}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Campaign Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Mail className="w-6 h-6 text-blue-400" />
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                campaign.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-zinc-700 text-zinc-400'
              }`}>
                {campaign.status}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{campaign.total_recipients}</div>
            <div className="text-sm text-zinc-500">Total Recipients</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <Eye className="w-6 h-6 text-purple-400 mb-2" />
            <div className="text-3xl font-bold text-white mb-1">{openRate}%</div>
            <div className="text-sm text-zinc-500">Open Rate</div>
            <div className="text-xs text-zinc-600 mt-1">{campaign.total_opened} opened</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <MousePointer className="w-6 h-6 text-amber-400 mb-2" />
            <div className="text-3xl font-bold text-white mb-1">{clickRate}%</div>
            <div className="text-sm text-zinc-500">Click Rate</div>
            <div className="text-xs text-zinc-600 mt-1">{campaign.total_clicked} clicked</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <UserCheck className="w-6 h-6 text-emerald-400 mb-2" />
            <div className="text-3xl font-bold text-white mb-1">{conversionRate}%</div>
            <div className="text-sm text-zinc-500">Conversion Rate</div>
            <div className="text-xs text-zinc-600 mt-1">{campaign.total_converted} converted</div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Recipient Status</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="text-center p-4 bg-zinc-800 rounded-lg">
                <div className="text-2xl font-bold text-white mb-1">{count}</div>
                <div className="text-xs text-zinc-500 capitalize">{status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search recipients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'pending', 'sent', 'opened', 'clicked', 'converted', 'unsubscribed'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-amber-500 text-black font-medium'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="ml-2 px-2 py-0.5 bg-black/20 rounded-full text-xs">
                    {statusCounts[status] || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recipients Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800 border-b border-zinc-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Recipient</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Sequence</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Engagement</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Last Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredRecipients.map(recipient => (
                  <tr key={recipient.id} className="hover:bg-zinc-850 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">
                          {recipient.first_name} {recipient.last_name}
                        </div>
                        <div className="text-sm text-zinc-500">{recipient.email}</div>
                        <div className="text-xs text-zinc-600 font-mono mt-1">{recipient.invite_code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        recipient.status === 'converted'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : recipient.status === 'clicked'
                          ? 'bg-amber-500/20 text-amber-400'
                          : recipient.status === 'opened'
                          ? 'bg-purple-500/20 text-purple-400'
                          : recipient.status === 'sent'
                          ? 'bg-blue-500/20 text-blue-400'
                          : recipient.status === 'unsubscribed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-zinc-700 text-zinc-400'
                      }`}>
                        {recipient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">
                        Email {recipient.sequence_stage + 1} of 4
                      </div>
                      <div className="text-xs text-zinc-500">
                        {recipient.next_email_scheduled && recipient.sequence_stage < 4
                          ? `Next: ${new Date(recipient.next_email_scheduled).toLocaleDateString()}`
                          : 'Sequence complete'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {recipient.opened_at && (
                          <div className="flex items-center gap-1 text-xs text-purple-400">
                            <Eye className="w-4 h-4" />
                            Opened
                          </div>
                        )}
                        {recipient.clicked_at && (
                          <div className="flex items-center gap-1 text-xs text-amber-400">
                            <MousePointer className="w-4 h-4" />
                            Clicked
                          </div>
                        )}
                        {recipient.converted_at && (
                          <div className="flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle className="w-4 h-4" />
                            Converted
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-400">
                        {recipient.last_email_sent
                          ? new Date(recipient.last_email_sent).toLocaleDateString()
                          : 'Not sent'
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredRecipients.length === 0 && (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl mt-4">
            <Mail className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No recipients found</h3>
            <p className="text-zinc-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );

}
