'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Search, Filter, UserCheck, UserX, 
  Mail, Linkedin, Crown, Loader2, 
  MoreVertical, Check, X
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminMembersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showActions, setShowActions] = useState(null);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery, statusFilter]);

  const checkAdminAndLoad = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', session.user.id)
        .single();

      if (!profile?.email.includes('@thecirclenetwork.org')) {
        router.push('/dashboard');
        return;
      }

      await loadMembers();
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.full_name?.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query) ||
        m.company?.toLowerCase().includes(query)
      );
    }

    setFilteredMembers(filtered);
  };

  const updateMemberStatus = async (memberId, newStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', memberId);

      if (error) throw error;
      await loadMembers();
      setShowActions(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update member status');
    }
  };

  const deleteMember = async (memberId) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      await loadMembers();
      setShowActions(null);
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member');
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
              <h1 className="text-2xl font-bold">Members Management</h1>
            </div>
            <div className="text-amber-400 font-semibold">
              {filteredMembers.length} members
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'active', 'pending', 'inactive'].map(status => (
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

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800 border-b border-zinc-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Member</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredMembers.map(member => (
                  <tr key={member.id} className="hover:bg-zinc-850 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                          {member.full_name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <div className="font-medium text-white">{member.full_name}</div>
                          <div className="text-sm text-zinc-500">{member.email}</div>
                          <div className="text-xs text-zinc-600">{member.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        member.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : member.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {member.is_founding_member ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-semibold">
                          <Crown className="w-3 h-3" />
                          Founding
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-sm">Regular</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-400">
                        {new Date(member.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {member.linkedin_url && (
                          <a
                            href={member.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <Linkedin className="w-4 h-4 text-zinc-400" />
                          </a>
                        )}
                        <div className="relative">
                          <button
                            onClick={() => setShowActions(showActions === member.id ? null : member.id)}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-zinc-400" />
                          </button>
                          
                          {showActions === member.id && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50">
                              {member.status !== 'active' && (
                                <button
                                  onClick={() => updateMemberStatus(member.id, 'active')}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors flex items-center gap-2 text-emerald-400 rounded-t-lg"
                                >
                                  <Check className="w-4 h-4" />
                                  Activate
                                </button>
                              )}
                              {member.status !== 'inactive' && (
                                <button
                                  onClick={() => updateMemberStatus(member.id, 'inactive')}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors flex items-center gap-2 text-amber-400"
                                >
                                  <UserX className="w-4 h-4" />
                                  Deactivate
                                </button>
                              )}
                              <button
                                onClick={() => deleteMember(member.id)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors flex items-center gap-2 text-red-400 rounded-b-lg"
                              >
                                <X className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl mt-8">
            <UserX className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No members found</h3>
            <p className="text-zinc-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}