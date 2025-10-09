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

import { uploadMessageAttachment, getMessageAttachments } from '@/lib/message-uploads';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  // Set up real-time subscription AFTER currentUser is loaded
  useEffect(() => {
    if (!currentUser) return;
    
    // Subscribe to messages where user is sender OR receiver
    const subscription = supabase
      .channel('messages-realtime')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages'
        },
        (payload) => {
          const newMsg = payload.new;
          // Only process if message involves current user
          if (newMsg.from_user_id === currentUser.id || newMsg.to_user_id === currentUser.id) {
            handleNewMessage(payload);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if there's a 'to' parameter in URL (from profile page)
    const toUserId = searchParams.get('to');
    if (toUserId && conversations.length > 0) {
      const conv = conversations.find(c => c.other_user.id === toUserId);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [searchParams, conversations]);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      setCurrentUser(session.user);
      await loadConversations(session.user.id);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const loadConversations = async (userId) => {
    try {
      // Get all messages involving the user
      const { data: userMessages, error } = await supabase
        .from('messages')
        .select('*, from_user:profiles!messages_from_user_id_fkey(*), to_user:profiles!messages_to_user_id_fkey(*)')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation (thread_id or other user)
      const conversationsMap = new Map();

      userMessages.forEach(msg => {
        const otherUserId = msg.from_user_id === userId ? msg.to_user_id : msg.from_user_id;
        const otherUser = msg.from_user_id === userId ? msg.to_user : msg.from_user;
        
        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            id: otherUserId,
            other_user: otherUser,
            last_message: msg,
            unread_count: 0,
            messages: []
          });
        }

        const conv = conversationsMap.get(otherUserId);
        conv.messages.push(msg);
        
        // Count unread messages
        if (msg.to_user_id === userId && !msg.read_at) {
          conv.unread_count++;
        }
      });

      const conversationsList = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.last_message.created_at) - new Date(a.last_message.created_at));

      setConversations(conversationsList);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (otherUserId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, from_user:profiles!messages_from_user_id_fkey(*), to_user:profiles!messages_to_user_id_fkey(*)')
        .or(`and(from_user_id.eq.${currentUser.id},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Load attachments for each message
      const messagesWithAttachments = await Promise.all(
        (data || []).map(async (msg) => {
          const attachments = await getMessageAttachments(msg.id);
          return { ...msg, attachments };
        })
      );
      
      setMessages(messagesWithAttachments);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markAsRead = async (otherUserId) => {
    try {
      const unreadMessages = messages.filter(
        msg => msg.to_user_id === currentUser.id && msg.from_user_id === otherUserId && !msg.read_at
      );

      if (unreadMessages.length === 0) return;

      const messageIds = unreadMessages.map(msg => msg.id);

      const response = await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds })
      });

      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }

      // Update local state
      setConversations(prevConvs => 
        prevConvs.map(conv => 
          conv.id === otherUserId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleNewMessage = async (payload) => {
    const newMsg = payload.new;
    
    // Determine the other user in this message
    const otherUserId = newMsg.from_user_id === currentUser.id ? newMsg.to_user_id : newMsg.from_user_id;
    
    // If message is in current conversation, add it immediately
    if (selectedConversation && 
        (newMsg.from_user_id === selectedConversation.id || newMsg.to_user_id === selectedConversation.id)) {
      const attachments = await getMessageAttachments(newMsg.id);
      setMessages(prev => [...prev, { ...newMsg, attachments }]);
      if (newMsg.to_user_id === currentUser.id) {
        markAsRead(newMsg.from_user_id);
      }
    }
    
    // Update conversations list (reload to get latest data)
    await loadConversations(currentUser.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          from_user_id: currentUser.id,
          to_user_id: selectedConversation.id,
          content: newMessage.trim(),
          thread_id: selectedConversation.thread_id || null
        })
        .select('*, from_user:profiles!messages_from_user_id_fkey(*), to_user:profiles!messages_to_user_id_fkey(*)')
        .single();

      if (error) throw error;

      // Upload file if selected
      if (selectedFile) {
        try {
          await uploadMessageAttachment(selectedFile, data.id, currentUser.id);
          setSelectedFile(null);
          // Reload messages to show attachment immediately
          await loadMessages(selectedConversation.id);
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          alert('Message sent but file upload failed');
        }
      } else {
        // Add message to state only if no file upload (reload already done above)
        setMessages(prev => [...prev, data]);
      }
      setNewMessage('');
      loadConversations(currentUser.id);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(conv => 
    conv.other_user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0A0F1E]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <h1 className="text-2xl font-bold text-white">Messages</h1>
            </div>
            
            <nav className="flex items-center gap-4">
              <GlobalSearch />
              <button
                onClick={() => router.push('/members')}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Directory
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-white/20 mb-4" />
                  <p className="text-white/60">No conversations yet</p>
                  <button
                    onClick={() => router.push('/members')}
                    className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm"
                  >
                    Browse members to start chatting
                  </button>
                </div>
              ) : (
                filteredConversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 border-b border-white/5 hover:bg-white/5 transition-colors text-left ${
                      selectedConversation?.id === conv.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-white truncate">
                            {conv.other_user.full_name}
                          </h3>
                          <span className="text-xs text-white/40 ml-2 flex-shrink-0">
                            {formatTime(conv.last_message.created_at)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-white/60 truncate">
                            {conv.last_message.from_user_id === currentUser.id && 'You: '}
                            {conv.last_message.content}
                          </p>
                          {conv.unread_count > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full flex-shrink-0">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            {!selectedConversation ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 text-lg">Select a conversation to start messaging</p>
                </div>
              </div>
            ) : (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {selectedConversation.other_user.full_name}
                      </h3>
                      <p className="text-xs text-white/60">
                        {selectedConversation.other_user.title} at {selectedConversation.other_user.company}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => router.push(`/members/${selectedConversation.id}`)}
                    className="text-emerald-400 hover:text-emerald-300 text-sm"
                  >
                    View Profile
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => {
                    const isMe = msg.from_user_id === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isMe
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {msg.attachments.map(att => (
                                  att.file_type?.startsWith('image/') ? (
                                    <img
                                      key={att.id}
                                      src={att.file_url}
                                      alt={att.file_name}
                                      className="rounded-lg max-w-xs"
                                    />
                                  ) : (
                                    <a
                                      key={att.id}
                                      href={att.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm underline opacity-80 hover:opacity-100"
                                    >
                                      📎 {att.file_name}
                                    </a>
                                  )
                                ))}
                              </div>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 text-xs text-white/40 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span>{formatTime(msg.created_at)}</span>
                            {isMe && (
                              msg.read_at ? 
                                <CheckCheck className="w-3 h-3 text-emerald-400" /> :
                                <Check className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-white/10">
                  {selectedFile && (
                    <div className="mb-3 p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Paperclip className="w-4 h-4" />
                        <span>{selectedFile.name}</span>
                        <span className="text-white/40">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert('File size must be less than 5MB');
                            return;
                          }
                          setSelectedFile(file);
                        }
                      }}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-white/60 hover:text-white"
                      title="Attach file or image"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      rows="3"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={(!newMessage.trim() && !selectedFile) || sending}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
