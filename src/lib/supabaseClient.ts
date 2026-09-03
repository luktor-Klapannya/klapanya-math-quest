import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from Vite environment variables (Never hardcode secrets or service-role keys)
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any)?.env : {};
const supabaseUrl = metaEnv?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv?.VITE_SUPABASE_ANON_KEY || '';

let clientInstance: SupabaseClient | null = null;

/**
 * Checks if Supabase production credentials are configured in the environment.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
}

/**
 * Returns the shared browser Supabase client instance.
 * If credentials are not provided, returns null gracefully without throwing.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.warn('[SupabaseClient] Initialization error:', err);
      return null;
    }
  }

  return clientInstance;
}
