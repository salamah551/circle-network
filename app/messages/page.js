'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Send, Search, User, MessageSquare, 
  Loader2, Check, CheckCheck, MoreVertical, Trash2,
  Archive, Star, Paperclip, X
} from 'lucide-react';
import GlobalSearch from '@/components/GlobalSearch';
import LockedFeature from '@/components/LockedFeature';
import { getFeatureStatus } from '@/lib/feature-flags';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [featureStatus, setFeatureStatus] = useState(null);

  // Check auth and feature access
  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
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

      setCurrentUser(profile || { id: session.user.id });

      // Check feature status
      const status = getFeatureStatus('messaging', profile);
      setFeatureStatus(status);

      // Load conversations if unlocked or admin
      if (status.unlocked || status.adminBypass) {
        await loadConversations(session.user.id);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  // ✅ REAL-TIME: Set up live message subscriptions
  useEffect(() => {
    if (!currentUser?.id) return;
    
    console.log('🔴 Setting up real-time subscriptions for user:', currentUser.id);
    
    // Subscribe to new messages where user is recipient
    const messageChannel = supabase
      .channel('messages-realtime-new')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `to_user_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('🔴 NEW MESSAGE RECEIVED:', payload);
          handleNewMessage(payload.new);
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('🔴 MESSAGE UPDATED:', payload);
          handleMessageUpdate(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('🔴 Subscription status:', status);
      });

    // Poll every 5 seconds as fallback
    const pollInterval = setInterval(() => {
      if (currentUser?.id) {
        loadConversations(currentUser.id, true); // silent reload
      }
    }, 5000);

    return () => {
      console.log('🔴 Cleaning up subscriptions');
      supabase.removeChannel(messageChannel);
      clearInterval(pollInterval);
    };
  }, [currentUser?.id]);

  // ✅ REAL-TIME: Handle incoming messages
  const handleNewMessage = async (newMsg) => {
    console.log('📨 Processing new message:', newMsg);
    
    // If message is for current conversation, add it immediately
    if (selectedConversation) {
      const isForCurrentConvo = 
        (newMsg.from_user_id === selectedConversation.other_user.id && newMsg.to_user_id === currentUser.id) ||
        (newMsg.to_user_id === selectedConversation.other_user.id && newMsg.from_user_id === currentUser.id);
      
      if (isForCurrentConvo) {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        });
        
        // Auto-mark as read if it's for us
        if (newMsg.to_user_id === currentUser.id) {
          setTimeout(() => markAsRead(selectedConversation.other_user.id), 500);
        }
        
        // Scroll to bottom
        setTimeout(scrollToBottom, 100);
      }
    }
    
    // Always reload conversations to update unread counts
    loadConversations(currentUser.id, true);
  };

  // ✅ REAL-TIME: Handle message updates (read receipts)
  const handleMessageUpdate = (updatedMsg) => {
    console.log('📝 Message updated:', updatedMsg);
    
    // Update in current messages list
    setMessages(prev => prev.map(m => 
      m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m
    ));
    
    // Reload conversations to update unread counts
    loadConversations(currentUser.id, true);
  };

  // ✅ Load conversations with optional silent mode
  const loadConversations = async (userId, silent = false) => {
    if (!silent) {
      console.log('📂 Loading conversations...');
    }
    
    try {
      const { data: sentMessages } = await supabase
        .from('messages')
        .select('to_user_id, created_at, content, read_at')
        .eq('from_user_id', userId)
        .order('created_at', { ascending: false });

      const { data: receivedMessages } = await supabase
        .from('messages')
        .select('from_user_id, created_at, content, read_at')
        .eq('to_user_id', userId)
        .order('created_at', { ascending: false });

      const userIds = new Set();
      [...(sentMessages || []), ...(receivedMessages || [])].forEach(msg => {
        if (msg.to_user_id && msg.to_user_id !== userId) userIds.add(msg.to_user_id);
        if (msg.from_user_id && msg.from_user_id !== userId) userIds.add(msg.from_user_id);
      });

      if (userIds.size === 0) {
        setConversations([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, last_name, title, company, avatar_url, last_active_at')
        .in('id', Array.from(userIds));

      const convos = Array.from(userIds).map(otherUserId => {
        const profile = profiles?.find(p => p.id === otherUserId);
        const userMessages = [
          ...(sentMessages?.filter(m => m.to_user_id === otherUserId) || []),
          ...(receivedMessages?.filter(m => m.from_user_id === otherUserId) || [])
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const lastMessage = userMessages[0];
        const unreadCount = receivedMessages?.filter(m => 
          m.from_user_id === otherUserId && !m.read_at
        ).length || 0;

        return {
          id: otherUserId,
          other_user: {
            id: otherUserId,
            full_name: profile?.full_name || 'Unknown User',
            first_name: profile?.first_name || 'Unknown',
            title: profile?.title || '',
            company: profile?.company || '',
            avatar_url: profile?.avatar_url || null,
            last_active_at: profile?.last_active_at
          },
          last_message: lastMessage?.content || '',
          last_message_time: lastMessage?.created_at || new Date().toISOString(),
          unread_count: unreadCount
        };
      });

      convos.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
      
      setConversations(convos);
      
      if (!silent) {
        console.log('✅ Loaded', convos.length, 'conversations');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation && currentUser) {
      loadMessages(selectedConversation.other_user.id);
      setTimeout(() => {
        markAsRead(selectedConversation.other_user.id);
      }, 500);
    }
  }, [selectedConversation, currentUser]);

  const loadMessages = async (otherUserId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(from_user_id.eq.${currentUser.id},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(data || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // ✅ REAL-TIME: Mark messages as read immediately
  const markAsRead = async (otherUserId) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('to_user_id', currentUser.id)
        .eq('from_user_id', otherUserId)
        .is('read_at', null);

      if (error) {
        console.error('Error marking as read:', error);
      } else {
        console.log('✅ Marked messages as read');
        // Update local state immediately
        setConversations(prev => prev.map(c => 
          c.id === otherUserId ? { ...c, unread_count: 0 } : c
        ));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // ✅ REAL-TIME: Send message with instant update
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const messageText = newMessage.trim();
    setSending(true);

    try {
      // Optimistically add message to UI
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content: messageText,
        from_user_id: currentUser.id,
        to_user_id: selectedConversation.other_user.id,
        created_at: new Date().toISOString(),
        read_at: null,
        sending: true
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      setTimeout(scrollToBottom, 50);

      // Send to database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          from_user_id: currentUser.id,
          to_user_id: selectedConversation.other_user.id,
          content: messageText
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
        // Remove optimistic message
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      } else {
        // Replace optimistic with real message
        setMessages(prev => prev.map(m => 
          m.id === optimisticMessage.id ? data : m
        ));
        
        // Update conversation list
        loadConversations(currentUser.id, true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle URL parameters
  useEffect(() => {
    const toUserId = searchParams.get('to');
    if (toUserId && conversations.length > 0) {
      const conv = conversations.find(c => c.other_user.id === toUserId);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [searchParams, conversations]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isUserActive = (lastActiveAt) => {
    if (!lastActiveAt) return false;
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
    return new Date(lastActiveAt) > fiveMinutesAgo;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  // Check if feature is locked
  if (!featureStatus?.unlocked && !featureStatus?.adminBypass) {
    return (
      <LockedFeature
        featureName="messaging"
        featureTitle="Direct Messaging"
        featureDescription="Private, real-time conversations with any Circle member. Send messages, share files, and build meaningful connections."
        unlockDate="November 10, 2025"
        currentUser={currentUser}
      >
        {/* This won't render until unlocked */}
      </LockedFeature>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
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
              <MessageSquare className="w-6 h-6 text-amber-400" />
              <div>
                <h1 className="text-xl font-bold">Messages</h1>
                <p className="text-xs text-zinc-500">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <GlobalSearch />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations list */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-zinc-800 flex flex-col bg-zinc-950 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {/* Search */}
          <div className="p-4 border-b border-zinc-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">No conversations yet</p>
                <p className="text-sm text-zinc-600 mt-2">
                  Start a conversation from the member directory
                </p>
              </div>
            ) : (
              conversations
                .filter(c => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return c.other_user.full_name.toLowerCase().includes(query) ||
                         c.other_user.company?.toLowerCase().includes(query);
                })
                .map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-zinc-900 transition-colors border-b border-zinc-800 ${
                      selectedConversation?.id === conv.id ? 'bg-zinc-900' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      {conv.other_user.avatar_url ? (
                        <img 
                          src={conv.other_user.avatar_url} 
                          alt={conv.other_user.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-bold">
                          {getInitials(conv.other_user.full_name)}
                        </div>
                      )}
                      {isUserActive(conv.other_user.last_active_at) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm truncate">
                          {conv.other_user.full_name}
                        </span>
                        <span className="text-xs text-zinc-500 flex-shrink-0 ml-2">
                          {formatTime(conv.last_message_time)}
                        </span>
                      </div>
                      {conv.other_user.title && (
                        <p className="text-xs text-zinc-500 truncate mb-1">
                          {conv.other_user.title}
                          {conv.other_user.company && ` at ${conv.other_user.company}`}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-zinc-400 truncate">
                          {conv.last_message}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="ml-2 bg-amber-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
          {selectedConversation ? (
            <>
              {/* Conversation header */}
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    {selectedConversation.other_user.avatar_url ? (
                      <img 
                        src={selectedConversation.other_user.avatar_url} 
                        alt={selectedConversation.other_user.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-bold text-sm">
                        {getInitials(selectedConversation.other_user.full_name)}
                      </div>
                    )}
                    {isUserActive(selectedConversation.other_user.last_active_at) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedConversation.other_user.full_name}</h2>
                    <p className="text-xs text-zinc-500">
                      {isUserActive(selectedConversation.other_user.last_active_at) ? (
                        <span className="text-emerald-400">● Active now</span>
                      ) : (
                        selectedConversation.other_user.title || 'Member'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messageContainerRef}>
                {messages.map((msg, idx) => {
                  const isFromMe = msg.from_user_id === currentUser.id;
                  const showAvatar = idx === 0 || messages[idx - 1].from_user_id !== msg.from_user_id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isFromMe ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {showAvatar ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                          {isFromMe ? getInitials(currentUser.full_name || 'You') : getInitials(selectedConversation.other_user.full_name)}
                        </div>
                      ) : (
                        <div className="w-8" />
                      )}
                      <div className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isFromMe
                              ? 'bg-amber-500 text-black rounded-tr-sm'
                              : 'bg-zinc-800 text-white rounded-tl-sm'
                          } ${msg.sending ? 'opacity-50' : ''}`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-xs text-zinc-500">
                            {formatTime(msg.created_at)}
                          </span>
                          {isFromMe && (
                            msg.read_at ? (
                              <CheckCheck className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Check className="w-3 h-3 text-zinc-500" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 bg-zinc-950">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-amber-500 resize-none text-sm"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-3 bg-amber-500 text-black rounded-xl hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-600 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <MessageSquare className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-400 mb-2">No conversation selected</h3>
                <p className="text-zinc-600">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
