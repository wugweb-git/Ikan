/**
 * Production-safe logger utility
 * Only logs in development mode, silent in production
 */

const isDevelopment = 
  (typeof import.meta !== 'undefined' && import.meta.env?.DEV) || 
  (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'development') ||
  false;

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
