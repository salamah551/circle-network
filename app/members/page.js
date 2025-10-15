'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Search, User, Building2, 
  MapPin, Briefcase, Loader2, Star, MessageSquare, Lock
} from 'lucide-react';
import Link from 'next/link';
import { updateUserActivity, isUserActive } from '@/lib/update-activity';
import GlobalSearch from '@/components/GlobalSearch';
import LockedFeature from '@/components/LockedFeature';
import { getFeatureStatus } from '@/lib/feature-flags';

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
  const [featureStatus, setFeatureStatus] = useState(null);

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

      // Get user profile for feature check
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
      }

      const userProfile = profile || { id: session.user.id };
      setCurrentUser(userProfile);
      
      // Update current user activity
      await updateUserActivity(session.user.id);

      // Check feature status
      const status = getFeatureStatus('members_directory', userProfile);
      setFeatureStatus(status);

      // Load members if unlocked or admin
      if (status.unlocked || status.adminBypass) {
        await loadMembers(session.user.id);
      }

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
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Loading members...</p>
        </div>
      </div>
    );
  }

  // Check if feature is locked
  if (!featureStatus?.unlocked && !featureStatus?.adminBypass) {
    return (
      <LockedFeature
        featureName="members_directory"
        featureTitle="Member Directory"
        featureDescription="Browse and connect with all 250 founding members. Search by expertise, filter by industry, and send direct messages to build meaningful relationships."
        unlockDate="November 10, 2025"
        currentUser={currentUser}
      >
        {/* This won't render until unlocked */}
      </LockedFeature>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <User className="w-6 h-6 text-amber-400" />
              <div>
                <h1 className="text-xl font-bold">Member Directory</h1>
                <p className="text-xs text-zinc-500">
                  {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>
            </div>
            <GlobalSearch />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Search & Filter */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name, company, expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-amber-500 text-white"
            />
          </div>
        </div>

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-16">
            <User className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-400 mb-2">
              {searchQuery ? 'No members found' : 'No members yet'}
            </h3>
            <p className="text-zinc-600">
              {searchQuery ? 'Try a different search term' : 'Members will appear here as they join'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map(member => (
              <div
                key={member.id}
                className="group p-6 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-amber-500/30 transition-all hover:scale-[1.02]"
              >
                {/* Member Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative flex-shrink-0">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-bold text-xl">
                        {getInitials(member.full_name)}
                      </div>
                    )}
                    {isUserActive(member.last_active_at) && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-lg truncate">{member.full_name}</h3>
                      {member.is_founding_member && (
                        <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      )}
                    </div>
                    {member.title && (
                      <p className="text-sm text-zinc-400 truncate flex items-center gap-1">
                        <Briefcase className="w-3 h-3 flex-shrink-0" />
                        {member.title}
                      </p>
                    )}
                    {member.company && (
                      <p className="text-sm text-zinc-400 truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 flex-shrink-0" />
                        {member.company}
                      </p>
                    )}
                    {member.location && (
                      <p className="text-sm text-zinc-500 truncate flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {member.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {member.bio && (
                  <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                    {member.bio}
                  </p>
                )}

                {/* Expertise Tags */}
                {member.expertise && member.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {member.expertise.slice(0, 3).map((exp, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400"
                      >
                        {exp}
                      </span>
                    ))}
                    {member.expertise.length > 3 && (
                      <span className="px-2 py-1 bg-zinc-800 rounded-full text-xs text-zinc-500">
                        +{member.expertise.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-zinc-800">
                  <Link
                    href={`/profile/${member.id}`}
                    className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-center rounded-lg transition-colors text-sm font-medium"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/messages?to=${member.id}`}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition-colors"
                    title="Send message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
