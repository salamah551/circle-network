// lib/supabase-admin.ts
// Singleton Supabase admin client for server-side operations
// Uses service role key for elevated permissions

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * Get or create a singleton Supabase admin client with service role permissions
 * 
 * Required environment variables:
 * - SUPABASE_URL: The Supabase project URL (server-side only, not NEXT_PUBLIC_*)
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for admin operations
 * 
 * @throws Error if either SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    // Use SUPABASE_URL for admin operations (no fallback to public URL)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      throw new Error(
        'Missing SUPABASE_URL environment variable.\n' +
        'This is required for server-side admin operations.\n' +
        'Set SUPABASE_URL in your environment variables (not NEXT_PUBLIC_SUPABASE_URL).\n' +
        'Example: SUPABASE_URL=https://your-project.supabase.co'
      );
    }

    if (!supabaseServiceRoleKey) {
      throw new Error(
        'Missing SUPABASE_SERVICE_ROLE_KEY.\n' +
        'This is required for server-side admin operations.\n' +
        'Find it in: Supabase Dashboard → Project Settings → API → service_role key (secret)\n' +
        '⚠️  IMPORTANT: Never expose this key to the browser or commit it to git!'
      );
    }

    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Log configuration in development for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('✓ Supabase Admin client initialized');
      console.log(`  URL: ${supabaseUrl}`);
      console.log('  Key: service_role_***');
    }
  }

  return supabaseAdminInstance;
}

export default getSupabaseAdmin;
