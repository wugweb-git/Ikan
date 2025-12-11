/**
 * Environment configuration
 * Centralizes all environment variables and API routes
 * Uses Vite's import.meta.env for environment variables
 */

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string = ''): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env[key] as string) || fallback;
  }
  return fallback;
};

// Supabase configuration
export const SUPABASE_PROJECT_ID = getEnvVar('VITE_SUPABASE_PROJECT_ID', 'jpfvoevxegnknxoqmwye');
export const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', '');
export const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

// API configuration
export const API_BASE_URL = `${SUPABASE_URL}/functions/v1/make-server-cc205da9`;

// Helper to escape regex special characters
const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// API route patterns for caching
export const API_ROUTE_PATTERNS = {
  api: new RegExp('^' + escapeRegex(SUPABASE_URL) + '/functions/v1/make-server-cc205da9/.*', 'i'),
  storage: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i
};

// App configuration
export const APP_CONFIG = {
  name: 'iKan Mental Health',
  version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  environment: getEnvVar('MODE', 'development'),
  isDevelopment: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.DEV === true : false,
  isProduction: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.PROD === true : false
};
