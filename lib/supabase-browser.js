// lib/supabase-browser.js
// Singleton Supabase browser client to prevent "Multiple GoTrueClient instances" warning

import { createClient } from '@supabase/supabase-js';

let supabaseBrowserInstance = null;

/**
 * Get or create a singleton Supabase browser client
 * This prevents the "Multiple GoTrueClient instances" warning
 */
export function getSupabaseBrowserClient() {
  if (!supabaseBrowserInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // During build time (server-side rendering without env vars), return mock
      // At runtime, will check again with actual env vars
      if (typeof window === 'undefined') {
        console.warn('⚠️ Supabase not configured during build - will retry at runtime');
        return createMockSupabaseClient();
      }
      
      // In browser without env vars, show friendly error
      console.error('⚠️ Supabase not configured: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
      console.error('   Copy .env.example to .env.local and fill in your Supabase credentials');
      
      // Return a mock client that throws helpful errors
      return createMockSupabaseClient();
    }

    supabaseBrowserInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseBrowserInstance;
}

/**
 * Create a mock Supabase client for development when env vars are missing
 * This prevents hard crashes and shows friendly error messages
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

export default getSupabaseBrowserClient;
