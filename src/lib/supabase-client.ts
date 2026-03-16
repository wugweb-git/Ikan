/**
 * Centralized Supabase Client - Singleton Pattern
 * This ensures only one Supabase client instance is created and shared across the app
 * to prevent auth state inconsistencies and multiple auth listeners.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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
        await supabase.auth.signOut().catch(() => {});
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