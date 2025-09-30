// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const auth = {
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },
};

export const invites = {
  validate: async (code) => {
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('code', code)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();
    return { data, error };
  },

  markAsUsed: async (code) => {
    const { data, error } = await supabase
      .from('invites')
      .update({ status: 'used' })
      .eq('code', code);
    return { data, error };
  },
};

export const waitlist = {
  add: async (email, inviteCode) => {
    const { data, error } = await supabase
      .from('waitlist')
      .insert({ email, invite_code: inviteCode })
      .select()
      .single();
    return { data, error };
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },
};