'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Lock, Plus, Users, DollarSign, 
  Briefcase, FileText, TrendingUp, Loader2, Shield,
  Clock, CheckCircle
} from 'lucide-react';
import LockedFeature from '@/components/LockedFeature';
import { getFeatureStatus } from '@/lib/feature-flags';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ROOM_TYPES = [
  { value: 'investment', label: 'Investment', icon: DollarSign, color: 'emerald' },
  { value: 'partnership', label: 'Partnership', icon: Users, color: 'blue' },
  { value: 'acquisition', label: 'Acquisition', icon: Briefcase, color: 'amber' },
  { value: 'other', label: 'Other', icon: FileText, color: 'zinc' }
];

export default function DealRoomsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [dealRooms, setDealRooms] = useState([]);
  const [featureStatus, setFeatureStatus] = useState(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

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

      const status = getFeatureStatus('deal_rooms', profile);
      setFeatureStatus(status);

      if (status.unlocked || status.adminBypass) {
        await loadDealRooms(session.user.id);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const loadDealRooms = async (userId) => {
    try {
      // Get rooms where user is a member
      const { data: memberships, error: memberError } = await supabase
        .from('deal_room_members')
        .select('room_id')
        .eq('user_id', userId);

      if (memberError) throw memberError;

      const roomIds = memberships.map(m => m.room_id);

      if (roomIds.length === 0) {
        setDealRooms([]);
        return;
      }

      const { data, error } = await supabase
        .from('deal_rooms')
        .select(`
          *,
          creator:profiles!deal_rooms_created_by_fkey(full_name),
          members:deal_room_members(count)
        `)
        .in('id', roomIds)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDealRooms(data || []);
    } catch (error) {
      console.error('Error loading deal rooms:', error);
    }
  };

  const getRoomTypeInfo = (type) => {
    return ROOM_TYPES.find(t => t.value === type) || ROOM_TYPES[3];
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 h-64" />
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
                  <Lock className="w-5 h-5 text-[#E5C77E]" />
                </div>
                <div>
                  <h1 className="text-2xl font-light tracking-wide">Deal Rooms</h1>
                  <p className="text-sm text-white/40 font-light">Secure collaboration spaces</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/deals/create')}
              className="flex items-center gap-2 px-4 py-2 bg-[#E5C77E]/90 hover:bg-[#E5C77E] text-[#0A0E27] rounded-lg transition-all font-light"
            >
              <Plus className="w-5 h-5" />
              <span>New Deal Room</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Info Banner */}
        <div className="bg-[#E5C77E]/5 border border-[#E5C77E]/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-[#E5C77E] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-light mb-2">Secure & Private</h3>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                Deal Rooms are end-to-end encrypted spaces for investments, partnerships, and acquisitions. 
                Optional NDAs, document sharing, voting, and commitment tracking included.
              </p>
            </div>
          </div>
        </div>

        {/* Deal Rooms Grid */}
        {dealRooms.length === 0 ? (
          <div className="bg-white/[0.02] border border-[#E5C77E]/10 rounded-2xl p-16 text-center">
            <div className="w-20 h-20 bg-[#E5C77E]/10 border border-[#E5C77E]/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-[#E5C77E]" />
            </div>
            <h3 className="text-2xl font-light mb-3">No Deal Rooms Yet</h3>
            <p className="text-white/50 font-light max-w-md mx-auto mb-6">
              Create your first private deal room to collaborate on investments, partnerships, or acquisitions with trusted members.
            </p>
            <button
              onClick={() => router.push('/deals/create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E5C77E]/90 hover:bg-[#E5C77E] text-[#0A0E27] rounded-lg transition-all font-light"
            >
              <Plus className="w-5 h-5" />
              <span>Create Deal Room</span>
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {dealRooms.map(room => {
              const typeInfo = getRoomTypeInfo(room.type);
              const TypeIcon = typeInfo.icon;
              
              return (
                <div
                  key={room.id}
                  className="bg-white/[0.02] border border-[#E5C77E]/10 rounded-xl p-6 hover:border-[#E5C77E]/30 transition-all cursor-pointer group"
                  onClick={() => router.push(`/deals/${room.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-${typeInfo.color}-500/10 rounded-lg flex items-center justify-center`}>
                        <TypeIcon className={`w-6 h-6 text-${typeInfo.color}-400`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-light text-white group-hover:text-[#E5C77E] transition-colors">
                          {room.name}
                        </h3>
                        <span className={`text-xs text-${typeInfo.color}-400 font-light`}>
                          {typeInfo.label}
                        </span>
                      </div>
                    </div>
                    
                    {room.nda_required && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
                        <Shield className="w-3 h-3 text-amber-400" />
                        <span className="text-xs text-amber-400 font-light">NDA</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {room.description && (
                    <p className="text-white/60 text-sm font-light line-clamp-2 mb-4">
                      {room.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-white/5">
                    {room.target_amount && (
                      <div>
                        <div className="text-xs text-white/40 font-light mb-1">Target</div>
                        <div className="text-white font-light">{formatCurrency(room.target_amount)}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-white/40 font-light mb-1">Members</div>
                      <div className="flex items-center gap-1 text-white font-light">
                        <Users className="w-4 h-4" />
                        <span>{room.members[0]?.count || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="text-sm text-white/50 font-light">
                      {room.status === 'active' ? (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          {room.status === 'completed' ? 'Completed' : 'Archived'}
                        </span>
                      )}
                    </div>
                    {room.deadline && (
                      <div className="flex items-center gap-1.5 text-xs text-white/40">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Due {new Date(room.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
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
