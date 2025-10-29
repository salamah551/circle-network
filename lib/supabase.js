// lib/supabase.js
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

// Lazy initialization - safe for build time
let supabaseInstance = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // During build (no env vars), return null - will be created at runtime
    if (!supabaseUrl || !supabaseAnonKey) {
      if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
        // Build time - return dummy client
        return null;
      }
      throw new Error('Missing Supabase environment variables');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export const supabase = new Proxy({}, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    if (!client) {
      // Build time safety
      return () => null;
    }
    return client[prop];
  }
});

// Server-side Supabase client with cookie support for API routes
export function getSupabaseServerClient() {
  // IMPORTANT: Import cookies() inside the function to avoid client-side import errors
  const { cookies } = require('next/headers');
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component - cookies already sent
          }
        },
      },
    }
  );
}

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
    const { data, error} = await supabase
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

// WAITLIST (DEPRECATED - kept for backwards compatibility)
// Waitlist functionality has been removed in favor of direct invite-based access
export const waitlist = {
  add: async (email, inviteCode) => {
    console.warn('waitlist.add() is deprecated and no longer functional');
    return { 
      data: null, 
      error: new Error('Waitlist functionality has been deprecated. Use invite-based access instead.') 
    };
  },
};

export default { supabase, auth, invites, waitlist };
