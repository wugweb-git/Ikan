/**
 * System Event Logger
 * Server-side logging infrastructure for application events
 */

import * as kv from "./kv_store.tsx";

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface SystemLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  details?: any;
  stack_trace?: string;
  user_id?: string;
}

/**
 * System Logger class
 */
export class SystemLogger {
  private source: string;
  
  constructor(source: string) {
    this.source = source;
  }
  
  /**
   * Log a debug message
   */
  debug(message: string, details?: any) {
    this.log('DEBUG', message, details);
  }
  
  /**
   * Log an info message
   */
  info(message: string, details?: any) {
    this.log('INFO', message, details);
  }
  
  /**
   * Log a warning
   */
  warn(message: string, details?: any) {
    this.log('WARN', message, details);
  }
  
  /**
   * Log an error
   */
  error(message: string, error?: Error | any, details?: any) {
    const stack_trace = error?.stack || undefined;
    const errorDetails = {
      ...details,
      error: error?.message || error,
      code: error?.code
    };
    this.log('ERROR', message, errorDetails, stack_trace);
  }
  
  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, details?: any, stack_trace?: string) {
    const logEntry: SystemLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      source: this.source,
      message,
      details,
      stack_trace
    };
    
    // Console output with color coding
    const prefix = this.getColoredPrefix(level);
    console.log(`${prefix} [${this.source}] ${message}`, details || '');
    
    if (stack_trace) {
      console.log(stack_trace);
    }
    
    // Store in KV asynchronously
    this.saveLog(logEntry).catch(err => {
      console.error('Failed to save system log:', err);
    });
  }
  
  /**
   * Get colored prefix for console output
   */
  private getColoredPrefix(level: LogLevel): string {
    const timestamp = new Date().toISOString();
    switch (level) {
      case 'DEBUG': return `🔍 ${timestamp} [DEBUG]`;
      case 'INFO':  return `ℹ️  ${timestamp} [INFO]`;
      case 'WARN':  return `⚠️  ${timestamp} [WARN]`;
      case 'ERROR': return `❌ ${timestamp} [ERROR]`;
    }
  }
  
  /**
   * Save log entry to KV store
   */
  private async saveLog(log: SystemLog): Promise<void> {
    try {
      // Store with timestamp-based key
      const key = `system-log:${log.timestamp}:${log.id}`;
      await kv.set(key, log);
      
      // Prune old logs
      await this.pruneOldLogs();
    } catch (error) {
      console.error('Error saving system log:', error);
    }
  }
  
  /**
   * Prune old system logs (keep last 5000)
   */
  private async pruneOldLogs(): Promise<void> {
    try {
      const allLogs = await kv.getByPrefix('system-log:');
      if (allLogs.length > 5000) {
        const sorted = allLogs.sort((a: any, b: any) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        const toDelete = sorted.slice(0, allLogs.length - 5000);
        for (const log of toDelete) {
          await kv.del(`system-log:${log.timestamp}:${log.id}`);
        }
      }
    } catch (error) {
      console.error('Error pruning logs:', error);
    }
  }
}

/**
 * Get system logs (for admin panel)
 */
export async function getSystemLogs(
  level?: LogLevel,
  source?: string,
  limit: number = 200
): Promise<SystemLog[]> {
  try {
    let logs = await kv.getByPrefix('system-log:');
    
    // Filter by level
    if (level) {
      logs = logs.filter((log: SystemLog) => log.level === level);
    }
    
    // Filter by source
    if (source) {
      logs = logs.filter((log: SystemLog) => log.source === source);
    }
    
    // Sort by timestamp (newest first)
    const sorted = logs.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return sorted.slice(0, limit);
  } catch (error) {
    console.error('Error fetching system logs:', error);
    return [];
  }
}

/**
 * Create a logger instance
 */
export function createLogger(source: string): SystemLogger {
  return new SystemLogger(source);
}

// Export default logger instances
export const authLogger = new SystemLogger('Auth');
export const dbLogger = new SystemLogger('Database');
export const apiLogger = new SystemLogger('API');
export const kvLogger = new SystemLogger('KV Store');
export const emailLogger = new SystemLogger('Email');
export const smsLogger = new SystemLogger('SMS');
export const whatsappLogger = new SystemLogger('WhatsApp');
export const paymentLogger = new SystemLogger('Payment');
