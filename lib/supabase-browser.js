// lib/supabase-browser.js
// Singleton Supabase client for browser to prevent "Multiple GoTrueClient instances" warning

import { createClient } from '@supabase/supabase-js';

let supabaseBrowserInstance = null;

/**
 * Get or create a singleton Supabase client for browser use
 * This prevents multiple GoTrueClient instances from being created
 */
export function getSupabaseBrowser() {
  // During SSR/build, return a mock that will be replaced at runtime
  if (typeof window === 'undefined') {
    return null;
  }

  if (!supabaseBrowserInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseBrowserInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseBrowserInstance;
}

export default getSupabaseBrowser;
