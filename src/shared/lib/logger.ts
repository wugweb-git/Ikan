/**
 * Production-safe logger utility
 * Only logs in development mode, silent in production
 */

interface MetaEnv {
  DEV?: boolean;
  MODE?: string;
}

interface CustomImportMeta {
  env?: MetaEnv;
}

const meta = typeof import.meta !== 'undefined' ? (import.meta as unknown as CustomImportMeta) : undefined;
const isDevelopment = Boolean(meta?.env?.DEV || meta?.env?.MODE === 'development');

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};
