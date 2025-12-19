/**
 * API Logging Middleware
 * Captures all requests/responses for monitoring and debugging
 */

import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";

export interface APILogEntry {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
  duration_ms: number;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  request_body?: any;
  response_body?: any;
  error?: string;
}

/**
 * Middleware to log all API requests and responses
 */
export async function apiLogger(c: Context, next: () => Promise<void>) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  // Capture request details
  const method = c.req.method;
  const endpoint = c.req.path;
  const ip_address = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const user_agent = c.req.header('user-agent') || 'unknown';
  
  // Get user ID if authenticated
  const token = c.req.header('Authorization')?.split(' ')[1];
  let user_id: string | undefined;
  
  if (token && c.get('userId')) {
    user_id = c.get('userId');
  }
  
  // Capture request body (for POST/PUT)
  let request_body: any;
  if (method === 'POST' || method === 'PUT') {
    try {
      const bodyText = await c.req.text();
      request_body = bodyText ? JSON.parse(bodyText) : null;
      // Re-create request with body for downstream handlers
      c.req.raw = new Request(c.req.url, {
        method: c.req.method,
        headers: c.req.raw.headers,
        body: bodyText
      });
    } catch (e) {
      // Body is not JSON or empty
      request_body = null;
    }
  }
  
  let status = 200;
  let response_body: any;
  let error: string | undefined;
  
  try {
    // Call next middleware/handler
    await next();
    
    // Capture response status
    status = c.res.status;
    
    // Try to capture response body (only for successful responses)
    if (status < 400) {
      try {
        const responseClone = c.res.clone();
        const responseText = await responseClone.text();
        response_body = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        // Response is not JSON or can't be cloned
        response_body = null;
      }
    }
  } catch (e: any) {
    // Capture errors
    status = 500;
    error = e.message || 'Internal server error';
    console.error('Request error:', e);
  }
  
  const duration_ms = Date.now() - startTime;
  
  // Create log entry
  const logEntry: APILogEntry = {
    id: requestId,
    timestamp: new Date().toISOString(),
    method,
    endpoint,
    status,
    duration_ms,
    user_id,
    ip_address,
    user_agent,
    request_body,
    response_body,
    error
  };
  
  // Store log entry asynchronously (don't block response)
  saveAPILog(logEntry).catch(err => {
    console.error('Failed to save API log:', err);
  });
  
  // Add request ID to response headers
  c.res.headers.set('X-Request-ID', requestId);
}

/**
 * Save API log to KV store
 */
async function saveAPILog(log: APILogEntry): Promise<void> {
  try {
    // Store with timestamp-based key for chronological ordering
    const key = `api-log:${log.timestamp}:${log.id}`;
    await kv.set(key, log);
    
    // Also maintain a rolling index (last 1000 logs)
    await pruneOldLogs();
  } catch (error) {
    console.error('Error saving API log:', error);
  }
}

/**
 * Prune old API logs (keep last 1000)
 */
async function pruneOldLogs(): Promise<void> {
  try {
    const allLogs = await kv.getByPrefix('api-log:');
    if (allLogs.length > 1000) {
      // Sort by timestamp (oldest first)
      const sorted = allLogs.sort((a: any, b: any) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      // Delete oldest logs
      const toDelete = sorted.slice(0, allLogs.length - 1000);
      for (const log of toDelete) {
        await kv.del(`api-log:${log.timestamp}:${log.id}`);
      }
    }
  } catch (error) {
    console.error('Error pruning logs:', error);
  }
}

/**
 * Get API logs (for admin panel)
 */
export async function getAPILogs(limit: number = 100): Promise<APILogEntry[]> {
  try {
    const logs = await kv.getByPrefix('api-log:');
    // Sort by timestamp (newest first)
    const sorted = logs.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sorted.slice(0, limit);
  } catch (error) {
    console.error('Error fetching API logs:', error);
    return [];
  }
}
