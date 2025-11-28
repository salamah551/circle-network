// lib/supabase.js
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

// Lazy initialization - safe for build time
let supabaseInstance = null;
let browserClientModule = null;

function getSupabaseClient() {
  // In browser context, always use the browser singleton to prevent multiple GoTrueClient instances
  if (typeof window !== 'undefined') {
    if (!browserClientModule) {
      // Note: Using require() here for synchronous loading to maintain compatibility with proxy
      // This is acceptable in browser context where ES modules are already loaded
      browserClientModule = require('./supabase-browser');
    }
    return browserClientModule.getSupabaseBrowserClient();
  }

  // Server-side: use separate instance
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // During build (no env vars), return null - will be created at runtime
    if (!supabaseUrl || !supabaseAnonKey) {
      if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
        // Production build time - return null, will fail at runtime if still missing
        return null;
      }
      
      // Development - show friendly error
      if (process.env.NODE_ENV !== 'production') {
        console.error('⚠️ Supabase not configured: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
        console.error('   Copy .env.example to .env.local and fill in your Supabase credentials');
        return createMockSupabaseClient();
      }
      
      throw new Error('Missing required Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

/**
 * Create a mock Supabase client for development when env vars are missing
 * Note: Server-side mock includes storage API for ops audit compatibility
 */
function createMockSupabaseClient() {
  const errorMessage = 'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY';
  
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: new Error(errorMessage) }),
      getUser: async () => ({ data: { user: null }, error: new Error(errorMessage) }),
      signInWithOtp: async () => ({ data: null, error: new Error(errorMessage) }),
      signOut: async () => ({ error: new Error(errorMessage) })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: new Error(errorMessage) }),
          limit: async () => ({ data: null, error: new Error(errorMessage) })
        }),
        limit: async () => ({ data: null, error: new Error(errorMessage) })
      }),
      insert: async () => ({ data: null, error: new Error(errorMessage) }),
      update: () => ({
        eq: async () => ({ data: null, error: new Error(errorMessage) })
      })
    }),
    storage: {
      listBuckets: async () => ({ data: null, error: new Error(errorMessage) })
    }
  };
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if environment variables are set
  if (!supabaseUrl || !supabaseAnonKey) {
    // In production, these are required
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)');
    }
    
    // In development, return mock client
    console.error('⚠️ Supabase not configured: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return createMockSupabaseClient();
  }

  // IMPORTANT: Import cookies() inside the function to avoid client-side import errors
  const { cookies } = require('next/headers');
  const cookieStore = cookies();
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

export default { supabase, auth, invites };
