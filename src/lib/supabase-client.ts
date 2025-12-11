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
 * Reset the client instance (useful for testing or re-authentication)
 * Warning: Only use this if you know what you're doing
 */
export function resetSupabaseClient(): void {
  console.warn('⚠️ Resetting Supabase client instance');
  supabaseInstance = null;
}
