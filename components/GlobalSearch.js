'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, MessageSquare, Calendar, Target, X, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    members: [],
    events: [],
    requests: [],
    messages: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setCurrentUserId(session.user.id);
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ members: [], events: [], requests: [], messages: [] });
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  const performSearch = async (searchQuery) => {
    if (!currentUserId) return;
    
    setIsSearching(true);
    const q = searchQuery.toLowerCase();

    try {
      const [membersData, eventsData, requestsData, messagesData] = await Promise.all([
        // Search members
        supabase
          .from('profiles')
          .select('id, full_name, title, company, bio')
          .neq('id', currentUserId)
          .eq('status', 'active')
          .or(`full_name.ilike.%${q}%,title.ilike.%${q}%,company.ilike.%${q}%,bio.ilike.%${q}%`)
          .limit(5),

        // Search events
        supabase
          .from('events')
          .select('id, title, event_type, event_date, host:profiles!events_host_id_fkey(full_name)')
          .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
          .order('event_date', { ascending: true })
          .limit(5),

        // Search requests
        supabase
          .from('requests')
          .select('id, title, category, status, created_at, profile:profiles!requests_user_id_fkey(full_name)')
          .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
          .order('created_at', { ascending: false })
          .limit(5),

        // Search messages (conversations)
        supabase
          .from('messages')
          .select('id, content, sender:profiles!messages_sender_id_fkey(id, full_name), recipient:profiles!messages_recipient_id_fkey(id, full_name), created_at')
          .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
          .ilike('content', `%${q}%`)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      setResults({
        members: membersData.data || [],
        events: eventsData.data || [],
        requests: requestsData.data || [],
        messages: messagesData.data || []
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (type, item) => {
    setIsOpen(false);
    setQuery('');
    
    switch (type) {
      case 'member':
        router.push(`/members?id=${item.id}`);
        break;
      case 'event':
        router.push(`/events?id=${item.id}`);
        break;
      case 'request':
        router.push(`/requests?id=${item.id}`);
        break;
      case 'message':
        const otherId = item.sender.id === currentUserId ? item.recipient.id : item.sender.id;
        router.push(`/messages?to=${otherId}`);
        break;
    }
  };

  const totalResults = 
    results.members.length + 
    results.events.length + 
    results.requests.length + 
    results.messages.length;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
      >
        <Search className="w-4 h-4 text-zinc-400" />
        <span className="text-sm text-zinc-400">Search</span>
        <kbd className="hidden sm:inline-flex px-2 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-500">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-20">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members, events, requests, messages..."
              className="flex-1 bg-transparent text-white placeholder-zinc-500 focus:outline-none"
            />
            {isSearching && <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-zinc-800 rounded transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          {query.trim().length < 2 ? (
            <div className="p-8 text-center text-zinc-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Type at least 2 characters to search</p>
              <p className="text-sm mt-2">Search across members, events, requests, and messages</p>
            </div>
          ) : totalResults === 0 && !isSearching ? (
            <div className="p-8 text-center text-zinc-500">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Members */}
              {results.members.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Members ({results.members.length})
                  </h3>
                  <div className="space-y-2">
                    {results.members.map(member => (
                      <button
                        key={member.id}
                        onClick={() => handleResultClick('member', member)}
                        className="w-full p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors"
                      >
                        <div className="font-medium text-white">{member.full_name}</div>
                        {member.title && (
                          <div className="text-sm text-zinc-400">
                            {member.title} {member.company && `at ${member.company}`}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {results.events.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Events ({results.events.length})
                  </h3>
                  <div className="space-y-2">
                    {results.events.map(event => (
                      <button
                        key={event.id}
                        onClick={() => handleResultClick('event', event)}
                        className="w-full p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors"
                      >
                        <div className="font-medium text-white">{event.title}</div>
                        <div className="text-sm text-zinc-400">
                          {new Date(event.event_date).toLocaleDateString()} · {event.host?.full_name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Requests */}
              {results.requests.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Requests ({results.requests.length})
                  </h3>
                  <div className="space-y-2">
                    {results.requests.map(request => (
                      <button
                        key={request.id}
                        onClick={() => handleResultClick('request', request)}
                        className="w-full p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors"
                      >
                        <div className="font-medium text-white">{request.title}</div>
                        <div className="text-sm text-zinc-400">
                          {request.category} · {request.profile?.full_name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {results.messages.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Messages ({results.messages.length})
                  </h3>
                  <div className="space-y-2">
                    {results.messages.map(message => {
                      const otherPerson = message.sender.id === currentUserId 
                        ? message.recipient 
                        : message.sender;
                      
                      return (
                        <button
                          key={message.id}
                          onClick={() => handleResultClick('message', message)}
                          className="w-full p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors"
                        >
                          <div className="font-medium text-white">{otherPerson.full_name}</div>
                          <div className="text-sm text-zinc-400 truncate">
                            {message.content.substring(0, 60)}...
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
