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
      throw new Error('Missing Supabase environment variables');
    }

    supabaseBrowserInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseBrowserInstance;
}

export default getSupabaseBrowserClient;
