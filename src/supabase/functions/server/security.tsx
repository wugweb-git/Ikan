/**
 * Security Monitoring Middleware
 * Session tracking, audit logging, and threat detection
 */

import { Context } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_dual_write.ts";

// Simple console logger to avoid circular dependencies
const securityLogger = {
  info: (msg: string, data?: any) => console.log(`ℹ️  [Security] ${msg}`, data || ''),
  warn: (msg: string, data?: any) => console.log(`⚠️  [Security] ${msg}`, data || ''),
  error: (msg: string, error?: any) => console.error(`❌ [Security] ${msg}`, error || '')
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

export interface ActiveSession {
  id: string;
  user_id: string;
  user_email: string;
  ip_address: string;
  user_agent: string;
  started_at: string;
  last_activity: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource: string;
  resource_id?: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  details?: any;
}

export interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access' | 'rate_limit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip_address?: string;
  user_id?: string;
  user_email?: string;
  timestamp: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

/**
 * Track user session
 */
export async function trackSession(c: Context): Promise<void> {
  const userId = c.get('userId');
  if (!userId) return;
  
  const user = c.get('user');
  const ip_address = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const user_agent = c.req.header('user-agent') || 'unknown';
  
  try {
    // Get or create session
    const sessionKey = `session:${userId}`;
    let session = await kv.get(sessionKey) as ActiveSession | null;
    
    if (!session) {
      // Create new session
      session = {
        id: crypto.randomUUID(),
        user_id: userId,
        user_email: user?.email || 'unknown',
        ip_address,
        user_agent,
        started_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      };
      
      await kv.set(sessionKey, session);
      securityLogger.info(`New session created for user ${userId}`, { session });
    } else {
      // Update last activity
      session.last_activity = new Date().toISOString();
      await kv.set(sessionKey, session);
    }
  } catch (error) {
    securityLogger.error('Error tracking session', error);
  }
}

/**
 * Log audit entry
 */
export async function logAudit(
  userId: string,
  userEmail: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const auditEntry: AuditLog = {
    id: crypto.randomUUID(),
    user_id: userId,
    user_email: userEmail,
    action,
    resource,
    resource_id: resourceId,
    ip_address: ipAddress || 'unknown',
    user_agent: userAgent || 'unknown',
    timestamp: new Date().toISOString(),
    details
  };
  
  try {
    const key = `audit:${auditEntry.timestamp}:${auditEntry.id}`;
    await kv.set(key, auditEntry);
    
    securityLogger.info(`Audit: ${action} on ${resource}`, { 
      user: userEmail, 
      resource_id: resourceId 
    });
    
    // Prune old audit logs (keep last 10000)
    await pruneOldAuditLogs();
  } catch (error) {
    securityLogger.error('Error logging audit entry', error);
  }
}

/**
 * Create security alert
 */
export async function createSecurityAlert(
  type: SecurityAlert['type'],
  severity: SecurityAlert['severity'],
  description: string,
  options?: {
    ip_address?: string;
    user_id?: string;
    user_email?: string;
  }
): Promise<void> {
  const alert: SecurityAlert = {
    id: crypto.randomUUID(),
    type,
    severity,
    description,
    ip_address: options?.ip_address,
    user_id: options?.user_id,
    user_email: options?.user_email,
    timestamp: new Date().toISOString(),
    resolved: false
  };
  
  try {
    const key = `alert:${alert.timestamp}:${alert.id}`;
    await kv.set(key, alert);
    
    securityLogger.warn(`Security Alert [${severity}]: ${description}`, { alert });
    
    // Prune old alerts (keep last 1000)
    await pruneOldAlerts();
  } catch (error) {
    securityLogger.error('Error creating security alert', error);
  }
}

/**
 * Track failed login attempt
 */
export async function trackFailedLogin(email: string, ipAddress: string): Promise<void> {
  const key = `failed-login:${email}:${ipAddress}`;
  const attempts = (await kv.get(key) as number) || 0;
  const newAttempts = attempts + 1;
  
  await kv.set(key, newAttempts);
  
  // Create alert if too many attempts
  if (newAttempts >= 5) {
    await createSecurityAlert(
      'failed_login',
      'high',
      `${newAttempts} failed login attempts for ${email}`,
      { ip_address: ipAddress, user_email: email }
    );
  }
  
  // Clear failed attempts after 15 minutes
  setTimeout(async () => {
    await kv.del(key);
  }, 15 * 60 * 1000);
}

/**
 * Check if IP is rate limited
 */
export async function checkRateLimit(ipAddress: string, endpoint: string): Promise<boolean> {
  const key = `rate-limit:${ipAddress}:${endpoint}`;
  const requests = (await kv.get(key) as number) || 0;
  
  if (requests >= 100) {
    await createSecurityAlert(
      'rate_limit',
      'medium',
      `Rate limit exceeded for ${endpoint}`,
      { ip_address: ipAddress }
    );
    return true; // Rate limited
  }
  
  await kv.set(key, requests + 1);
  
  // Reset after 1 minute
  setTimeout(async () => {
    await kv.del(key);
  }, 60 * 1000);
  
  return false; // Not rate limited
}

/**
 * Get active sessions
 */
export async function getActiveSessions(): Promise<ActiveSession[]> {
  try {
    const sessions = await kv.getByPrefix('session:');
    
    // Filter out expired sessions (inactive for > 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const active = sessions.filter((s: ActiveSession) => 
      new Date(s.last_activity).getTime() > oneDayAgo
    );
    
    return active.sort((a: ActiveSession, b: ActiveSession) => 
      new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
    );
  } catch (error) {
    securityLogger.error('Error fetching active sessions', error);
    return [];
  }
}

/**
 * Terminate session
 */
export async function terminateSession(userId: string): Promise<void> {
  try {
    await kv.del(`session:${userId}`);
    securityLogger.info(`Session terminated for user ${userId}`);
  } catch (error) {
    securityLogger.error('Error terminating session', error);
  }
}

/**
 * Get audit logs
 */
export async function getAuditLogs(limit: number = 200): Promise<AuditLog[]> {
  try {
    const logs = await kv.getByPrefix('audit:');
    const sorted = logs.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sorted.slice(0, limit);
  } catch (error) {
    securityLogger.error('Error fetching audit logs', error);
    return [];
  }
}

/**
 * Get security alerts
 */
export async function getSecurityAlerts(includeResolved: boolean = false): Promise<SecurityAlert[]> {
  try {
    let alerts = await kv.getByPrefix('alert:');
    
    if (!includeResolved) {
      alerts = alerts.filter((a: SecurityAlert) => !a.resolved);
    }
    
    const sorted = alerts.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return sorted;
  } catch (error) {
    securityLogger.error('Error fetching security alerts', error);
    return [];
  }
}

/**
 * Resolve security alert
 */
export async function resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
  try {
    const alerts = await kv.getByPrefix('alert:');
    const alert = alerts.find((a: SecurityAlert) => a.id === alertId);
    
    if (alert) {
      alert.resolved = true;
      alert.resolved_at = new Date().toISOString();
      alert.resolved_by = resolvedBy;
      
      const key = `alert:${alert.timestamp}:${alert.id}`;
      await kv.set(key, alert);
      
      securityLogger.info(`Alert ${alertId} resolved by ${resolvedBy}`);
    }
  } catch (error) {
    securityLogger.error('Error resolving alert', error);
  }
}

/**
 * Prune old audit logs
 */
async function pruneOldAuditLogs(): Promise<void> {
  try {
    const allLogs = await kv.getByPrefix('audit:');
    if (allLogs.length > 10000) {
      const sorted = allLogs.sort((a: any, b: any) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      const toDelete = sorted.slice(0, allLogs.length - 10000);
      for (const log of toDelete) {
        await kv.del(`audit:${log.timestamp}:${log.id}`);
      }
    }
  } catch (error) {
    securityLogger.error('Error pruning audit logs', error);
  }
}

/**
 * Prune old alerts
 */
async function pruneOldAlerts(): Promise<void> {
  try {
    const allAlerts = await kv.getByPrefix('alert:');
    if (allAlerts.length > 1000) {
      const sorted = allAlerts.sort((a: any, b: any) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      const toDelete = sorted.slice(0, allAlerts.length - 1000);
      for (const alert of toDelete) {
        await kv.del(`alert:${alert.timestamp}:${alert.id}`);
      }
    }
  } catch (error) {
    securityLogger.error('Error pruning alerts', error);
  }
}