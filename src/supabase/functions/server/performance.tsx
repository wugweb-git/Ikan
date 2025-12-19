/**
 * Performance Monitoring Middleware
 * Tracks system performance metrics
 */

import * as kv from "./kv_store.tsx";

export interface PerformanceMetrics {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  memory_total: number;
  memory_used: number;
  active_connections: number;
  requests_per_minute: number;
  avg_response_time: number;
  error_rate: number;
}

interface RequestMetric {
  timestamp: string;
  duration_ms: number;
  success: boolean;
}

// In-memory storage for real-time metrics
let recentRequests: RequestMetric[] = [];
let activeConnections = 0;

/**
 * Track a request for performance metrics
 */
export function trackRequest(duration_ms: number, success: boolean) {
  const metric: RequestMetric = {
    timestamp: new Date().toISOString(),
    duration_ms,
    success
  };
  
  recentRequests.push(metric);
  
  // Keep only last 5 minutes of requests
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  recentRequests = recentRequests.filter(r => 
    new Date(r.timestamp).getTime() > fiveMinutesAgo
  );
}

/**
 * Increment active connection counter
 */
export function incrementConnections() {
  activeConnections++;
}

/**
 * Decrement active connection counter
 */
export function decrementConnections() {
  activeConnections = Math.max(0, activeConnections - 1);
}

/**
 * Get current performance metrics
 */
export async function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  // Get Deno memory usage
  const memoryUsage = Deno.memoryUsage();
  const memoryUsedMB = memoryUsage.heapUsed / 1024 / 1024;
  const memoryTotalMB = memoryUsage.heapTotal / 1024 / 1024;
  const memoryPercent = (memoryUsedMB / memoryTotalMB) * 100;
  
  // Calculate requests per minute
  const oneMinuteAgo = Date.now() - 60 * 1000;
  const requestsLastMinute = recentRequests.filter(r => 
    new Date(r.timestamp).getTime() > oneMinuteAgo
  );
  
  // Calculate average response time
  const avgResponseTime = requestsLastMinute.length > 0
    ? requestsLastMinute.reduce((sum, r) => sum + r.duration_ms, 0) / requestsLastMinute.length
    : 0;
  
  // Calculate error rate
  const errors = requestsLastMinute.filter(r => !r.success).length;
  const errorRate = requestsLastMinute.length > 0
    ? (errors / requestsLastMinute.length) * 100
    : 0;
  
  // Note: CPU usage is not directly available in Deno
  // For production, consider using system monitoring tools
  const metrics: PerformanceMetrics = {
    timestamp: new Date().toISOString(),
    cpu_usage: 0, // Placeholder - needs system-level monitoring
    memory_usage: Math.round(memoryPercent),
    memory_total: Math.round(memoryTotalMB),
    memory_used: Math.round(memoryUsedMB),
    active_connections: activeConnections,
    requests_per_minute: requestsLastMinute.length,
    avg_response_time: Math.round(avgResponseTime),
    error_rate: Math.round(errorRate * 100) / 100
  };
  
  // Store metrics snapshot every minute
  await saveMetricsSnapshot(metrics);
  
  return metrics;
}

/**
 * Save metrics snapshot to KV store
 */
async function saveMetricsSnapshot(metrics: PerformanceMetrics): Promise<void> {
  try {
    const key = `metrics:${metrics.timestamp}`;
    await kv.set(key, metrics);
    
    // Prune old metrics (keep last 24 hours)
    await pruneOldMetrics();
  } catch (error) {
    console.error('Error saving metrics snapshot:', error);
  }
}

/**
 * Prune old metrics (keep last 24 hours)
 */
async function pruneOldMetrics(): Promise<void> {
  try {
    const allMetrics = await kv.getByPrefix('metrics:');
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    for (const metric of allMetrics) {
      const metricTime = new Date(metric.timestamp).getTime();
      if (metricTime < oneDayAgo) {
        await kv.del(`metrics:${metric.timestamp}`);
      }
    }
  } catch (error) {
    console.error('Error pruning metrics:', error);
  }
}

/**
 * Get historical metrics
 */
export async function getMetricsHistory(hours: number = 1): Promise<PerformanceMetrics[]> {
  try {
    const allMetrics = await kv.getByPrefix('metrics:');
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    
    const filtered = allMetrics.filter((m: PerformanceMetrics) => 
      new Date(m.timestamp).getTime() > cutoffTime
    );
    
    return filtered.sort((a: PerformanceMetrics, b: PerformanceMetrics) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error fetching metrics history:', error);
    return [];
  }
}

/**
 * Initialize performance monitoring
 * Call this on server startup
 */
export function initPerformanceMonitoring() {
  // Record metrics every minute
  setInterval(async () => {
    try {
      await getPerformanceMetrics();
    } catch (error) {
      console.error('Error recording metrics:', error);
    }
  }, 60 * 1000); // Every 60 seconds
  
  console.log('Performance monitoring initialized');
}
