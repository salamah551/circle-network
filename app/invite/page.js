'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, Mail, Copy, Check, Loader2, Send } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function InvitePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      setUser(session.user);
      await loadProfile(session.user.id);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/invites/send', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session.access_token}`
        },
        body: JSON.stringify({ 
          email: inviteEmail,
          invitedBy: user.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      setSuccess(`Invite sent to ${inviteEmail}!`);
      setInviteEmail('');
      await loadProfile(user.id); // Refresh to update invite count
    } catch (err) {
      console.error('Invite error:', err);
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const invitesLeft = 5; // This should come from your profile data

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Invite Members</h1>
          <p className="text-zinc-400 text-lg mb-2">
            Share The Circle with founders you trust
          </p>
          <p className="text-amber-400 font-semibold">
            {invitesLeft} invites remaining
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-400">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-6">Send an Invite</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="founder@startup.com"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSending || invitesLeft === 0}
              className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Invite...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Invite
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">About Founding Member Invites</h3>
          <ul className="space-y-3 text-zinc-400">
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>You have <strong className="text-white">5 priority invites</strong> as a founding member</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Your invites <strong className="text-white">skip the vetting process</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Invited members get the <strong className="text-white">founding member rate ($199/mo)</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Help build The Circle by inviting <strong className="text-white">founders you trust</strong></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}