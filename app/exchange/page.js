'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, TrendingUp, Plus, Filter, Search, Award,
  Users, Briefcase, Link2, DollarSign, Lightbulb, MoreHorizontal,
  Loader2, Check, Clock, Eye
} from 'lucide-react';
import LockedFeature from '@/components/LockedFeature';
import { getFeatureStatus } from '@/lib/feature-flags';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CATEGORIES = [
  { value: 'expertise', label: 'Expertise', icon: Lightbulb },
  { value: 'introduction', label: 'Introduction', icon: Users },
  { value: 'resource', label: 'Resource', icon: Link2 },
  { value: 'partnership', label: 'Partnership', icon: Briefcase },
  { value: 'investment', label: 'Investment', icon: DollarSign },
  { value: 'other', label: 'Other', icon: MoreHorizontal }
];

export default function ValueExchangePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [impactScore, setImpactScore] = useState(null);
  const [exchanges, setExchanges] = useState([]);
  const [filteredExchanges, setFilteredExchanges] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all'); // all, offer, request
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [featureStatus, setFeatureStatus] = useState(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  useEffect(() => {
    filterExchanges();
  }, [exchanges, typeFilter, categoryFilter, searchQuery]);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setCurrentUser(profile);

      const status = getFeatureStatus('value_exchange', profile);
      setFeatureStatus(status);

      if (status.unlocked || status.adminBypass) {
        await Promise.all([
          loadImpactScore(session.user.id),
          loadExchanges()
        ]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const loadImpactScore = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('impact_scores')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setImpactScore(data || { total_score: 0, connections_made: 0, value_exchanges_completed: 0 });
    } catch (error) {
      console.error('Error loading impact score:', error);
    }
  };

  const loadExchanges = async () => {
    try {
      const { data, error } = await supabase
        .from('value_exchanges')
        .select(`
          *,
          author:profiles!value_exchanges_user_id_fkey(full_name, title, company)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExchanges(data || []);
    } catch (error) {
      console.error('Error loading exchanges:', error);
    }
  };

  const filterExchanges = () => {
    let filtered = [...exchanges];

    if (typeFilter !== 'all') {
      filtered = filtered.filter(ex => ex.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(ex => ex.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.title?.toLowerCase().includes(query) ||
        ex.description?.toLowerCase().includes(query)
      );
    }

    setFilteredExchanges(filtered);
  };

  const getCategoryIcon = (category) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.icon : MoreHorizontal;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E5C77E] animate-spin" />
      </div>
    );
  }

  if (!featureStatus?.unlocked && !featureStatus?.adminBypass) {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white">
        <header className="border-b border-[#E5C77E]/10 bg-[#0A0E27]/90 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-[#E5C77E]/70 hover:text-[#E5C77E] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-light tracking-wide">Dashboard</span>
            </button>
          </div>
        </header>

        <LockedFeature
          featureName={featureStatus?.name}
          featureDescription={featureStatus?.description}
          featureValue={featureStatus?.value}
          className="min-h-[70vh]"
        >
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 h-48" />
              ))}
            </div>
          </div>
        </LockedFeature>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* Header */}
      <header className="border-b border-[#E5C77E]/10 bg-[#0A0E27]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-[#E5C77E]/70 hover:text-[#E5C77E] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-light tracking-wide">Dashboard</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E5C77E]/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#E5C77E]" />
                </div>
                <div>
                  <h1 className="text-2xl font-light tracking-wide">Value Exchange</h1>
                  <p className="text-sm text-white/40 font-light">Offer help, request expertise</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#E5C77E]/90 hover:bg-[#E5C77E] text-[#0A0E27] rounded-lg transition-all font-light"
            >
              <Plus className="w-5 h-5" />
              <span>New Exchange</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Impact Score Card */}
        <div className="bg-gradient-to-br from-[#E5C77E]/10 to-[#E5C77E]/5 border border-[#E5C77E]/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#E5C77E]/20 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-[#E5C77E]" />
              </div>
              <div>
                <h3 className="text-xl font-light text-white">Your Impact Score</h3>
                <p className="text-sm text-white/50 font-light">Contribution-based reputation</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-light text-[#E5C77E]">{impactScore?.total_score || 0}</div>
              <div className="text-sm text-white/40 font-light">Total Points</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-light text-white mb-1">{impactScore?.connections_made || 0}</div>
              <div className="text-xs text-white/50 tracking-wide font-light">CONNECTIONS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-white mb-1">{impactScore?.value_exchanges_completed || 0}</div>
              <div className="text-xs text-white/50 tracking-wide font-light">EXCHANGES</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-white mb-1">{impactScore?.help_provided || 0}</div>
              <div className="text-xs text-white/50 tracking-wide font-light">HELP PROVIDED</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-lg font-light transition-all ${
                typeFilter === 'all'
                  ? 'bg-[#E5C77E] text-[#0A0E27]'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('offer')}
              className={`px-4 py-2 rounded-lg font-light transition-all ${
                typeFilter === 'offer'
                  ? 'bg-[#E5C77E] text-[#0A0E27]'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              Offers
            </button>
            <button
              onClick={() => setTypeFilter('request')}
              className={`px-4 py-2 rounded-lg font-light transition-all ${
                typeFilter === 'request'
                  ? 'bg-[#E5C77E] text-[#0A0E27]'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              Requests
            </button>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-light focus:outline-none focus:border-[#E5C77E]/50"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search exchanges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 font-light focus:outline-none focus:border-[#E5C77E]/50"
            />
          </div>
        </div>

        {/* Exchange Grid */}
        {filteredExchanges.length === 0 ? (
          <div className="bg-white/[0.02] border border-[#E5C77E]/10 rounded-2xl p-16 text-center">
            <TrendingUp className="w-16 h-16 text-[#E5C77E]/40 mx-auto mb-4" />
            <h3 className="text-xl font-light mb-2">No exchanges found</h3>
            <p className="text-white/50 font-light">
              {searchQuery || typeFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Be the first to create an exchange'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredExchanges.map(exchange => {
              const CategoryIcon = getCategoryIcon(exchange.category);
              return (
                <div
                  key={exchange.id}
                  className="bg-white/[0.02] border border-[#E5C77E]/10 rounded-xl p-6 hover:border-[#E5C77E]/30 transition-all cursor-pointer"
                  onClick={() => router.push(`/exchange/${exchange.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-light ${
                        exchange.type === 'offer'
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                      }`}>
                        {exchange.type === 'offer' ? 'Offering' : 'Requesting'}
                      </span>
                      <div className="flex items-center gap-1.5 text-white/40 text-xs">
                        <CategoryIcon className="w-3.5 h-3.5" />
                        <span className="font-light capitalize">{exchange.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-light text-white mb-2">{exchange.title}</h3>
                  <p className="text-white/60 text-sm font-light line-clamp-2 mb-4">
                    {exchange.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="text-sm text-white/50 font-light">
                      by {exchange.author?.full_name}
                    </div>
                    <div className="flex items-center gap-2 text-[#E5C77E] text-sm font-light">
                      <Award className="w-4 h-4" />
                      <span>{exchange.impact_points || 25} points</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
