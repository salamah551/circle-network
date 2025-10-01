'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  Search, Filter, MapPin, Building2, Briefcase, 
  Star, MessageSquare, ArrowRight, X, Check,
  Loader2, LogOut, Settings, Bell, Home, Users,
  Calendar, Target, SlidersHorizontal
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MembersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [savedMembers, setSavedMembers] = useState([]);
  
  const [filters, setFilters] = useState({
    expertise: [],
    location: '',
    company: '',
    needs: []
  });

  const expertiseOptions = [
    'Fundraising', 'Sales', 'Marketing', 'Product', 'Engineering',
    'Operations', 'Finance', 'Legal', 'HR', 'Design',
    'Data Analytics', 'Business Development', 'Strategy', 'Consulting'
  ];

  const needsOptions = [
    'Investor Introductions', 'Hiring Talent', 'Strategic Advice',
    'Partnership Opportunities', 'Customer Introductions', 'Technical Guidance',
    'Market Insights', 'Operational Help', 'Growth Strategy', 'Exit Planning'
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, members]);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      setUser(session.user);
      await loadMembers();
      await loadSavedMembers(session.user.id);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    }
  };

  const loadMembers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMembers(data);
      setFilteredMembers(data);
    }
  };

  const loadSavedMembers = async (userId) => {
    const { data } = await supabase
      .from('saved_members')
      .select('saved_member_id')
      .eq('user_id', userId);

    if (data) {
      setSavedMembers(data.map(item => item.saved_member_id));
    }
  };

  const applyFilters = () => {
    let filtered = [...members];

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member => 
        member.full_name?.toLowerCase().includes(query) ||
        member.title?.toLowerCase().includes(query) ||
        member.company?.toLowerCase().includes(query) ||
        member.bio?.toLowerCase().includes(query)
      );
    }

    // Expertise filter
    if (filters.expertise.length > 0) {
      filtered = filtered.filter(member =>
        member.expertise?.some(exp => filters.expertise.includes(exp))
      );
    }

    // Location filter
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      filtered = filtered.filter(member =>
        member.location?.toLowerCase().includes(loc)
      );
    }

    // Company filter
    if (filters.company) {
      const comp = filters.company.toLowerCase();
      filtered = filtered.filter(member =>
        member.company?.toLowerCase().includes(comp)
      );
    }

    // Needs filter
    if (filters.needs.length > 0) {
      filtered = filtered.filter(member =>
        member.needs?.some(need => filters.needs.includes(need))
      );
    }

    setFilteredMembers(filtered);
  };

  const toggleExpertise = (expertise) => {
    setFilters(prev => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter(e => e !== expertise)
        : [...prev.expertise, expertise]
    }));
  };

  const toggleNeeds = (need) => {
    setFilters(prev => ({
      ...prev,
      needs: prev.needs.includes(need)
        ? prev.needs.filter(n => n !== need)
        : [...prev.needs, need]
    }));
  };

  const clearFilters = () => {
    setFilters({
      expertise: [],
      location: '',
      company: '',
      needs: []
    });
    setSearchQuery('');
  };

  const toggleSaveMember = async (memberId) => {
    if (savedMembers.includes(memberId)) {
      await supabase
        .from('saved_members')
        .delete()
        .eq('user_id', user.id)
        .eq('saved_member_id', memberId);
      
      setSavedMembers(prev => prev.filter(id => id !== memberId));
    } else {
      await supabase
        .from('saved_members')
        .insert({ user_id: user.id, saved_member_id: memberId });
      
      setSavedMembers(prev => [...prev, memberId]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const activeFiltersCount = 
    filters.expertise.length + 
    filters.needs.length + 
    (filters.location ? 1 : 0) + 
    (filters.company ? 1 : 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#D4AF37" strokeWidth="2" fill="none"/>
                <circle cx="20" cy="20" r="12" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
                <circle cx="20" cy="20" r="6" fill="#D4AF37"/>
              </svg>
              <div>
                <span className="font-bold text-lg block leading-none">The Circle</span>
                <span className="text-xs text-amber-400">MEMBER DIRECTORY</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5 text-zinc-400" />
              </button>
              <button className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-zinc-400" />
              </button>
              <button 
                onClick={() => router.push('/settings')}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-zinc-400" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members by name, title, company, or skills..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg border transition-colors flex items-center gap-2 ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-amber-500 border-amber-500 text-black'
                  : 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden md:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-black text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-zinc-800 bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
              <div className="space-y-6">
                {/* Expertise Filter */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-3">Expertise</label>
                  <div className="flex flex-wrap gap-2">
                    {expertiseOptions.map(exp => (
                      <button
                        key={exp}
                        onClick={() => toggleExpertise(exp)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          filters.expertise.includes(exp)
                            ? 'bg-amber-500 text-black font-semibold'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Needs Filter */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-3">Looking For Help With</label>
                  <div className="flex flex-wrap gap-2">
                    {needsOptions.map(need => (
                      <button
                        key={need}
                        onClick={() => toggleNeeds(need)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          filters.needs.includes(need)
                            ? 'bg-amber-500 text-black font-semibold'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {need}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location & Company */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-400 mb-2">Location</label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                      placeholder="e.g., San Francisco, New York"
                      className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-400 mb-2">Company</label>
                    <input
                      type="text"
                      value={filters.company}
                      onChange={(e) => setFilters({...filters, company: e.target.value})}
                      placeholder="e.g., Google, startup"
                      className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors text-sm"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold transition-colors text-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {filteredMembers.length} Members
            </h1>
            <p className="text-zinc-400 text-sm">
              {activeFiltersCount > 0 && `Filtered by ${activeFiltersCount} criteria`}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-sm transition-colors">
              View Saved ({savedMembers.length})
            </button>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <div 
              key={member.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-amber-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1 group-hover:text-amber-400 transition-colors">
                    {member.full_name}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-2 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {member.title}
                  </p>
                  <p className="text-sm text-zinc-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {member.company}
                  </p>
                  {member.location && (
                    <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {member.location}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleSaveMember(member.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    savedMembers.includes(member.id)
                      ? 'bg-amber-500 text-black'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  <Star className={`w-4 h-4 ${savedMembers.includes(member.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {member.bio && (
                <p className="text-sm text-zinc-400 mb-4 line-clamp-3">
                  {member.bio}
                </p>
              )}

              {member.expertise && member.expertise.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-zinc-500 mb-2">Expertise</p>
                  <div className="flex flex-wrap gap-1">
                    {member.expertise.slice(0, 3).map((exp, i) => (
                      <span key={i} className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-xs">
                        {exp}
                      </span>
                    ))}
                    {member.expertise.length > 3 && (
                      <span className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded text-xs">
                        +{member.expertise.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/members/${member.id}`)}
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                >
                  View Profile
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push(`/messages/new?to=${member.id}`)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No members found</h3>
            <p className="text-zinc-500 mb-4">Try adjusting your filters or search query</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}