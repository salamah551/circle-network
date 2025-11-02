'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import {
  Headphones, ArrowLeft, Search, Filter, Clock,
  CheckCircle2, XCircle, AlertTriangle, Loader2,
  MessageSquare, User
} from 'lucide-react';

// Use singleton browser client to prevent "Multiple GoTrueClient instances" warning
const supabase = getSupabaseBrowserClient();

const STATUS_COLORS = {
  open: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  closed: 'bg-zinc-700 text-zinc-400 border-zinc-600'
};

const PRIORITY_COLORS = {
  low: 'text-zinc-400',
  normal: 'text-blue-400',
  high: 'text-amber-400',
  urgent: 'text-red-400'
};

export default function SupportTicketsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

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

    await loadTickets();
    setIsLoading(false);
  };

  const loadTickets = async () => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        member:profiles!support_tickets_member_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTickets(data);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    setSaving(true);
    const { error } = await supabase
      .from('support_tickets')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (!error) {
      await loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    }
    setSaving(false);
  };

  const saveAdminNotes = async () => {
    if (!selectedTicket) return;

    setSaving(true);
    const { error } = await supabase
      .from('support_tickets')
      .update({ 
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedTicket.id);

    if (!error) {
      await loadTickets();
      alert('Notes saved successfully');
    }
    setSaving(false);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.member?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
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
                  <Headphones className="w-6 h-6 text-amber-400" />
                  Support Tickets
                </h1>
                <p className="text-sm text-zinc-400 mt-1">
                  {filteredTickets.length} tickets
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by subject or member..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900 rounded-xl border border-zinc-800">
                <Headphones className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-400 mb-2">No tickets found</h3>
                <p className="text-zinc-500">Try adjusting your filters</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setAdminNotes(ticket.admin_notes || '');
                  }}
                  className={`bg-zinc-900 border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedTicket?.id === ticket.id
                      ? 'border-amber-500 bg-zinc-800'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white">{ticket.subject}</h3>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${STATUS_COLORS[ticket.status]}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-400 mb-2">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {ticket.member?.full_name || 'Unknown'}
                    </span>
                    <span className={`flex items-center gap-1 ${PRIORITY_COLORS[ticket.priority]}`}>
                      <AlertTriangle className="w-4 h-4" />
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 line-clamp-2">{ticket.message}</p>
                  <p className="text-xs text-zinc-600 mt-2">
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {selectedTicket && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-fit sticky top-24">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">{selectedTicket.subject}</h2>
                  <p className="text-sm text-zinc-400">
                    From: {selectedTicket.member?.full_name} ({selectedTicket.member?.email})
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded border ${STATUS_COLORS[selectedTicket.status]}`}>
                  {selectedTicket.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Message</label>
                <div className="p-4 bg-black rounded-lg border border-zinc-800">
                  <p className="text-zinc-300">{selectedTicket.message}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['open', 'in_progress', 'resolved', 'closed'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateTicketStatus(selectedTicket.id, status)}
                      disabled={saving}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        selectedTicket.status === status
                          ? 'bg-amber-500 text-black'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Admin Notes (Internal)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Add internal notes about this ticket..."
                />
                <button
                  onClick={saveAdminNotes}
                  disabled={saving}
                  className="mt-3 w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
