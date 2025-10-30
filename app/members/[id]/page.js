'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, MapPin, Building2, Briefcase, Star, 
  MessageSquare, Send, Linkedin, Globe, Mail,
  Loader2, Check, X, Users, Target, Lightbulb, User
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MemberProfilePage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params?.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [member, setMember] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [introMessage, setIntroMessage] = useState('');
  const [directMessage, setDirectMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, [memberId]);

  const checkAuthAndLoadProfile = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      setCurrentUser(session.user);
      await loadMemberProfile();
      await checkIfSaved(session.user.id);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const loadMemberProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', memberId)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    setMember(data);
  };

  const checkIfSaved = async (userId) => {
    const { data, error } = await supabase
      .from('saved_members')
      .select('id')
      .eq('user_id', userId)
      .eq('saved_member_id', memberId)
      .single();

    if (data) {
      setIsSaved(true);
    }
  };

  const toggleSave = async () => {
    if (!currentUser) return;

    if (isSaved) {
      await supabase
        .from('saved_members')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('saved_member_id', memberId);
      setIsSaved(false);
    } else {
      await supabase
        .from('saved_members')
        .insert({
          user_id: currentUser.id,
          saved_member_id: memberId
        });
      setIsSaved(true);
    }
  };

  const handleRequestIntro = async () => {
    if (!introMessage.trim() || !currentUser) return;

    setSending(true);
    try {
      // Create intro request
      const { error } = await supabase
        .from('intro_requests')
        .insert({
          requester_id: currentUser.id,
          target_member_id: memberId,
          message: introMessage,
          status: 'pending'
        });

      if (error) throw error;

      setShowIntroModal(false);
      setIntroMessage('');
      alert('Introduction request sent successfully!');
    } catch (error) {
      console.error('Error sending intro request:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!directMessage.trim() || !currentUser) return;

    setSending(true);
    try {
      // Send message using existing messages table structure
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          from_user_id: currentUser.id,
          to_user_id: memberId,
          content: directMessage
        });

      if (msgError) throw msgError;

      setShowMessageModal(false);
      setDirectMessage('');
      router.push('/messages');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Loading member profile...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="mb-6 w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-700">
            <User className="w-12 h-12 text-zinc-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Member not found</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            This member profile doesn't exist or may have been removed. 
            Check out our directory to discover other members.
          </p>
          <button
            onClick={() => router.push('/members')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/members')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Directory</span>
            </button>
            
            <nav className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/messages')}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Messages
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                {member.full_name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-white/60 mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{member.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{member.company}</span>
                </div>
                {member.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{member.location}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {member.linkedin_url && (
                  <a
                    href={member.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white transition-all text-sm"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white transition-all text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={toggleSave}
                className={`p-3 rounded-lg transition-all ${
                  isSaved
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border-white/10'
                } border`}
              >
                <Star className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setShowIntroModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all"
          >
            <Users className="w-5 h-5" />
            Request Introduction
          </button>
          
          <button
            onClick={() => setShowMessageModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-emerald-500/50 text-white font-medium rounded-xl transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            Send Message
          </button>
        </div>

        {/* Bio Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">About</h2>
          <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
            {member.bio}
          </p>
        </div>

        {/* Expertise & Needs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Expertise */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Areas of Expertise</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.expertise?.map((item, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Needs */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Looking For Help With</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.needs?.map((item, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Challenges */}
        {member.challenges && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Current Challenges</h2>
            <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
              {member.challenges}
            </p>
          </div>
        )}
      </div>

      {/* Request Introduction Modal */}
      {showIntroModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Request Introduction</h3>
              <button
                onClick={() => setShowIntroModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-white/60 mb-6">
              Tell {member.full_name.split(' ')[0]} why you'd like to connect. Your request will be reviewed and you'll be introduced if approved.
            </p>

            <textarea
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
              placeholder="Hi! I'd love to connect because..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-6 min-h-[150px]"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowIntroModal(false)}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestIntro}
                disabled={!introMessage.trim() || sending}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Send Message</h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-white/60 mb-6">
              Send a direct message to {member.full_name.split(' ')[0]}
            </p>

            <textarea
              value={directMessage}
              onChange={(e) => setDirectMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-6 min-h-[150px]"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!directMessage.trim() || sending}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}