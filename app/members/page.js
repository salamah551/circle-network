'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Search, User, Building2, 
  MapPin, Briefcase, Loader2, Star, MessageSquare
} from 'lucide-react';
import { updateUserActivity, isUserActive } from '@/lib/update-activity';
import GlobalSearch from '@/components/GlobalSearch';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MembersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuthAndLoadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery]);

  const checkAuthAndLoadMembers = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      setCurrentUser(session.user);
      // Update current user activity
      await updateUserActivity(session.user.id);
      await loadMembers(session.user.id);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const loadMembers = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading members:', error);
        setMembers([]);
        return;
      }

      setMembers(data || []);
    } catch (error) {
      console.error('Error loading members:', error);
      setMembers([]);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member =>
        member.full_name?.toLowerCase().includes(query) ||
        member.title?.toLowerCase().includes(query) ||
        member.company?.toLowerCase().includes(query) ||
        member.bio?.toLowerCase().includes(query) ||
        member.expertise?.some(exp => exp.toLowerCase().includes(query))
      );
    }

    setFilteredMembers(filtered);
  };

  const getInitials = (name) => {
    if (!name) return 'M';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <h1 className="text-2xl font-bold">Member Directory</h1>
            </div>
            <GlobalSearch />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search members by name, title, company, expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
            </span>
          </div>
        </div>

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <User className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No members found</h3>
            <p className="text-zinc-500">
              {searchQuery ? 'Try adjusting your search criteria' : 'Members will appear here once they join'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map(member => (
              <div
                key={member.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-850 hover:border-amber-500/30 transition-all cursor-pointer group"
                onClick={() => router.push(`/members/${member.id}`)}
              >
                {/* Avatar & Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0 text-black font-bold text-xl">
                    {getInitials(member.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                      {member.full_name}
                    </h3>
                    {member.is_founding_member && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-full">
                        <Star className="w-3 h-3 fill-current" />
                        Founding Member
                      </span>
                    )}
                    {isUserActive(member.last_active_at) && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-full ml-2">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        Active Now
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Company */}
                <div className="space-y-2 mb-4">
                  {member.title && (
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Briefcase className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      <span className="text-sm truncate">{member.title}</span>
                    </div>
                  )}
                  {member.company && (
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Building2 className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      <span className="text-sm truncate">{member.company}</span>
                    </div>
                  )}
                  {member.location && (
                    <div className="flex items-center gap-2 text-zinc-300">
                      <MapPin className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      <span className="text-sm truncate">{member.location}</span>
                    </div>
                  )}
                </div>

                {/* Bio Preview */}
                {member.bio && (
                  <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                    {member.bio}
                  </p>
                )}

                {/* Expertise Tags */}
                {member.expertise && member.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {member.expertise.slice(0, 3).map((exp, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs rounded-full"
                      >
                        {exp}
                      </span>
                    ))}
                    {member.expertise.length > 3 && (
                      <span className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs rounded-full">
                        +{member.expertise.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-zinc-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/members/${member.id}`);
                    }}
                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors text-sm"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/messages?user=${member.id}`);
                    }}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
