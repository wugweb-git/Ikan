/**
 * Centralized Supabase Client - Singleton Pattern
 * This ensures only one Supabase client instance is created and shared across the app
 * to prevent auth state inconsistencies and multiple auth listeners.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase-info';

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get the singleton Supabase client instance
 * @returns SupabaseClient - The shared Supabase client
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    console.log('🔄 Creating new Supabase client instance');
    supabaseInstance = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  }
  return supabaseInstance;
}

/**
 * Export the singleton instance directly for convenience
 * Use this for all auth operations across the app
 */
export const supabase = getSupabaseClient();

/**
 * End the session **on this browser only**.
 *
 * `supabase.auth.signOut()` defaults to `scope: 'global'`, which revokes every
 * session that user has on every device. Eleven call sites used that default,
 * and nine of them are *defensive* — they run when a refresh token looks broken
 * or a session check fails, and all they want to do is clear local state. One
 * transient failure in one tab therefore signed the user out of their phone,
 * their other browser, and any other tab, and the JWTs those held went on
 * looking valid while GoTrue answered `session_not_found`.
 *
 * Local scope is also the right behaviour for the sign-out button: logging out
 * of a laptop should not log you out of your phone. A deliberate
 * "sign out everywhere" would pass `'global'` explicitly — nothing does yet.
 */
export async function signOutLocal(scope: 'local' | 'global' = 'local') {
  return supabase.auth.signOut({ scope });
}

/**
 * Get auth headers for API requests.
 * Uses the user's JWT when available, falls back to the public anon key.
 * Use this instead of hardcoding `publicAnonKey` in fetch headers.
 */
export async function getAuthHeaders(includeContentType = false): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      // If refresh token is invalid, sign out and fall back to anon key
      if (
        error.message?.includes('Refresh Token') ||
        error.message?.includes('Invalid Refresh Token') ||
        error.message?.includes('not found')
      ) {
        console.warn('Auth: Invalid refresh token in getAuthHeaders, signing out');
        await signOutLocal().catch(() => {});
      }
      const headers: Record<string, string> = { 'Authorization': `Bearer ${publicAnonKey}` };
      if (includeContentType) headers['Content-Type'] = 'application/json';
      return headers;
    }
    const token = data.session?.access_token || publicAnonKey;
    const headers: Record<string, string> = { 'Authorization': `Bearer ${token}` };
    if (includeContentType) headers['Content-Type'] = 'application/json';
    return headers;
  } catch (err) {
    console.warn('Auth: getAuthHeaders failed, falling back to anon key:', err);
    const headers: Record<string, string> = { 'Authorization': `Bearer ${publicAnonKey}` };
    if (includeContentType) headers['Content-Type'] = 'application/json';
    return headers;
  }
}

/**
 * Reset the client instance (useful for testing or re-authentication)
 * Warning: Only use this if you know what you're doing
 */
export function resetSupabaseClient(): void {
  console.warn('⚠️ Resetting Supabase client instance');
  supabaseInstance = null;
}