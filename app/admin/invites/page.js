'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Plus, Mail, Copy, Check, X, 
  Clock, UserCheck, Loader2, Search, Eye,
  RefreshCw, Send
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminInvitesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [invites, setInvites] = useState([]);
  const [filteredInvites, setFilteredInvites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInvite, setNewInvite] = useState({ email: '', firstName: '', lastName: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  useEffect(() => {
    filterInvites();
  }, [invites, searchQuery, statusFilter]);

  const checkAdminAndLoad = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', session.user.id)
        .single();

      const adminEmails = ['nahdasheh@gmail.com', 'invite@thecirclenetwork.org'];
if (!adminEmails.includes(profile?.email)) {
  router.push('/dashboard');
  return;
}

      await loadInvites();
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  const loadInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Error loading invites:', error);
    }
  };

  const filterInvites = () => {
    let filtered = [...invites];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.email?.toLowerCase().includes(query) ||
        i.invite_code?.toLowerCase().includes(query) ||
        i.first_name?.toLowerCase().includes(query) ||
        i.last_name?.toLowerCase().includes(query)
      );
    }

    setFilteredInvites(filtered);
  };

  const generateInviteCode = () => {
    return `FOUNDING-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };

  const createInvite = async () => {
    if (!newInvite.email || !newInvite.firstName || !newInvite.lastName) {
      alert('Please fill all fields');
      return;
    }

    setIsCreating(true);
    try {
      const session = await supabase.auth.getSession();
      const inviteCode = generateInviteCode();

      const { error } = await supabase
        .from('invites')
        .insert({
          email: newInvite.email.toLowerCase(),
          first_name: newInvite.firstName,
          last_name: newInvite.lastName,
          invite_code: inviteCode,
          status: 'pending',
          created_by: session.data.session.user.id
        });

      if (error) throw error;

      // Send invite email
      await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newInvite.email,
          firstName: newInvite.firstName,
          inviteCode: inviteCode
        })
      });

      await loadInvites();
      setShowCreateModal(false);
      setNewInvite({ email: '', firstName: '', lastName: '' });
      alert('Invite sent successfully!');
    } catch (error) {
      console.error('Error creating invite:', error);
      alert('Failed to create invite');
    } finally {
      setIsCreating(false);
    }
  };

  const resendInvite = async (invite) => {
    try {
      await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: invite.email,
          firstName: invite.first_name,
          inviteCode: invite.invite_code
        })
      });

      alert('Invite resent successfully!');
    } catch (error) {
      console.error('Error resending invite:', error);
      alert('Failed to resend invite');
    }
  };

  const revokeInvite = async (inviteId) => {
    if (!confirm('Are you sure you want to revoke this invite?')) return;

    try {
      const { error } = await supabase
        .from('invites')
        .update({ status: 'revoked' })
        .eq('id', inviteId);

      if (error) throw error;
      await loadInvites();
    } catch (error) {
      console.error('Error revoking invite:', error);
      alert('Failed to revoke invite');
    }
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const pendingInvites = invites.filter(i => i.status === 'pending');
  const acceptedInvites = invites.filter(i => i.status === 'accepted');
  const expiredInvites = invites.filter(i => i.status === 'expired');

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
              <h1 className="text-2xl font-bold">Invites</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Invite
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-amber-400 mb-1">{pendingInvites.length}</div>
            <div className="text-sm text-zinc-500">Pending</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{acceptedInvites.length}</div>
            <div className="text-sm text-zinc-500">Accepted</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-red-400 mb-1">{expiredInvites.length}</div>
            <div className="text-sm text-zinc-500">Expired</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by email or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'pending', 'accepted', 'expired', 'revoked'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  statusFilter === status
                    ? 'bg-amber-500 text-black font-medium'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Invites List */}
        <div className="space-y-4">
          {filteredInvites.map(invite => (
            <div key={invite.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {invite.first_name?.charAt(0) || 'I'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {invite.first_name} {invite.last_name}
                      </h3>
                      <p className="text-zinc-400 text-sm">{invite.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded-lg">
                      <Mail className="w-4 h-4 text-amber-400" />
                      <span className="text-white font-mono text-sm">{invite.invite_code}</span>
                      <button
                        onClick={() => copyInviteCode(invite.invite_code)}
                        className="ml-2 text-zinc-400 hover:text-white transition-colors"
                      >
                        {copiedCode === invite.invite_code ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      invite.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400'
                        : invite.status === 'accepted'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {invite.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>Created: {new Date(invite.created_at).toLocaleDateString()}</span>
                    {invite.expires_at && (
                      <span>Expires: {new Date(invite.expires_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {invite.status === 'pending' && (
                    <>
                      <button
                        onClick={() => resendInvite(invite)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Resend
                      </button>
                      <button
                        onClick={() => revokeInvite(invite.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                      >
                        <X className="w-4 h-4" />
                        Revoke
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInvites.length === 0 && (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
            <Mail className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No invites found</h3>
            <p className="text-zinc-400 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors"
            >
              Create Your First Invite
            </button>
          </div>
        )}
      </div>

      {/* Create Invite Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Create Invite</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={newInvite.firstName}
                  onChange={(e) => setNewInvite({...newInvite, firstName: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={newInvite.lastName}
                  onChange={(e) => setNewInvite({...newInvite, lastName: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({...newInvite, email: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createInvite}
                disabled={isCreating}
                className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Invite
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

