'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Bookmark, ArrowLeft, Loader2, Users, Calendar,
  Target, MessageSquare, Trash2, ExternalLink
} from 'lucide-react';
import PreLaunchBanner from '@/components/PreLaunchBanner';
import GlobalSearch from '@/components/GlobalSearch';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SavedItems() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [savedItems, setSavedItems] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadSavedItems();

    // Subscribe to changes
    const subscription = supabase
      .channel('saved_items_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'saved_items' },
        () => loadSavedItems()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadSavedItems = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('saved_items')
        .select(`
          *,
          member:profiles!saved_items_member_id_fkey(id, full_name, title, company),
          event:events!saved_items_event_id_fkey(id, title, event_date, event_type),
          request:requests!saved_items_request_id_fkey(id, title, category, status)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      setSavedItems(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading saved items:', error);
      setIsLoading(false);
    }
  };

  const unsaveItem = async (itemId) => {
    try {
      await supabase
        .from('saved_items')
        .delete()
        .eq('id', itemId);

      setSavedItems(savedItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing saved item:', error);
    }
  };

  const navigateToItem = (item) => {
    if (item.item_type === 'member') {
      router.push(`/members?id=${item.member_id}`);
    } else if (item.item_type === 'event') {
      router.push(`/events?id=${item.event_id}`);
    } else if (item.item_type === 'request') {
      router.push(`/requests?id=${item.request_id}`);
    }
  };

  const filteredItems = activeTab === 'all' 
    ? savedItems 
    : savedItems.filter(item => item.item_type === activeTab);

  const getIcon = (type) => {
    switch (type) {
      case 'member': return Users;
      case 'event': return Calendar;
      case 'request': return Target;
      default: return Bookmark;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'member': return 'text-blue-400';
      case 'event': return 'text-purple-400';
      case 'request': return 'text-emerald-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <PreLaunchBanner />

      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Dashboard
              </button>
              <div>
                <h1 className="text-2xl font-bold">Saved Items</h1>
                <p className="text-sm text-zinc-400">Your bookmarked members, events, and requests</p>
              </div>
            </div>
            <GlobalSearch />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'member', label: 'Members' },
            { id: 'event', label: 'Events' },
            { id: 'request', label: 'Requests' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-black font-medium'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
            <h3 className="text-xl font-bold text-zinc-400 mb-2">No saved items</h3>
            <p className="text-zinc-500">
              {activeTab === 'all' 
                ? 'Start bookmarking members, events, and requests to find them here'
                : `No saved ${activeTab}s yet`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map(item => {
              const Icon = getIcon(item.item_type);
              const colorClass = getTypeColor(item.item_type);
              
              return (
                <div
                  key={item.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg bg-zinc-800 ${colorClass}`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${colorClass} bg-zinc-800`}>
                            {item.item_type}
                          </span>
                          <span className="text-xs text-zinc-500">
                            Saved {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {item.item_type === 'member' && item.member && (
                          <>
                            <h3 className="text-lg font-bold mb-1">{item.member.full_name}</h3>
                            <p className="text-zinc-400">
                              {item.member.title}
                              {item.member.company && ` at ${item.member.company}`}
                            </p>
                          </>
                        )}

                        {item.item_type === 'event' && item.event && (
                          <>
                            <h3 className="text-lg font-bold mb-1">{item.event.title}</h3>
                            <p className="text-zinc-400">
                              {new Date(item.event.event_date).toLocaleDateString()} · {item.event.event_type}
                            </p>
                          </>
                        )}

                        {item.item_type === 'request' && item.request && (
                          <>
                            <h3 className="text-lg font-bold mb-1">{item.request.title}</h3>
                            <p className="text-zinc-400">
                              {item.request.category} · {item.request.status}
                            </p>
                          </>
                        )}

                        {item.notes && (
                          <p className="text-sm text-zinc-500 mt-2 italic">"{item.notes}"</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateToItem(item)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                        title="View item"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => unsaveItem(item.id)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
