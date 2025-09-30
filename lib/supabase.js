// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// AUTH - Magic Link Authentication
export const auth = {
  sendMagicLink: async (email, redirectTo) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo || `${process.env.NEXT_PUBLIC_APP_URL}/apply`,
      },
    });
    return { data, error };
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },
};

// INVITES
export const invites = {
  validate: async (code, email) => {
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('code', code)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();
    return { data, error };
  },

  markAsUsed: async (code, userId) => {
    const { data, error } = await supabase
      .from('invites')
      .update({ 
        status: 'used',
        used_at: new Date().toISOString(),
        invited_user_auth_id: userId
      })
      .eq('code', code);
    return { data, error };
  },
};

// WAITLIST
export const waitlist = {
  add: async (email, inviteCode) => {
    const { data, error } = await supabase
      .from('waitlist')
      .insert({ 
        email: email.toLowerCase(), 
        invite_code: inviteCode 
      })
      .select()
      .single();
    return { data, error };
  },
};

export default { supabase, auth, invites, waitlist };
