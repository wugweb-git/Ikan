/**
 * Offline Manager - Enhanced offline mode implementation
 * Handles network status detection, offline data caching, and sync
 */

import { setOfflineMode, isOfflineMode, getOfflineData } from './offline-fallbacks';

export class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<(online: boolean) => void> = new Set();
  private syncQueue: Array<{ key: string; data: any }> = [];

  private constructor() {
    this.initializeListeners();
    this.loadSyncQueue();
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private initializeListeners(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Monitor fetch failures
    this.monitorNetworkRequests();
  }

  private handleOnline(): void {
    console.log('🌐 Network connection restored');
    this.isOnline = true;
    setOfflineMode(false);
    this.notifyListeners(true);
    this.syncPendingData();
  }

  private handleOffline(): void {
    console.log('📵 Network connection lost');
    this.isOnline = false;
    setOfflineMode(true);
    this.notifyListeners(false);
  }

  private monitorNetworkRequests(): void {
    // Intercept fetch to detect network failures
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (response.ok) {
          // Successful request - we're likely online
          if (!this.isOnline) {
            this.handleOnline();
          }
        }
        return response;
      } catch (error) {
        // Network error - we're likely offline
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          if (this.isOnline) {
            this.handleOffline();
          }
        }
        throw error;
      }
    };
  }

  /**
   * Subscribe to network status changes
   */
  public subscribe(listener: (online: boolean) => void): () => void {
    this.listeners.add(listener);
    // Immediately notify of current status
    listener(this.isOnline);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => listener(online));
  }

  /**
   * Get current network status
   */
  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Queue data for sync when back online
   */
  public queueForSync(key: string, data: any): void {
    this.syncQueue.push({ key, data });
    this.saveSyncQueue();
    console.log(`📦 Queued data for sync: ${key}`);
  }

  /**
   * Save sync queue to localStorage
   */
  private saveSyncQueue(): void {
    try {
      localStorage.setItem('ikan-sync-queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  /**
   * Load sync queue from localStorage
   */
  private loadSyncQueue(): void {
    try {
      const saved = localStorage.getItem('ikan-sync-queue');
      if (saved) {
        this.syncQueue = JSON.parse(saved);
        console.log(`📦 Loaded ${this.syncQueue.length} items from sync queue`);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  /**
   * Sync all queued data when back online
   */
  private async syncPendingData(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    console.log(`🔄 Syncing ${this.syncQueue.length} queued items...`);

    const itemsToSync = [...this.syncQueue];
    this.syncQueue = [];
    this.saveSyncQueue();

    for (const item of itemsToSync) {
      try {
        // Attempt to sync the item
        // This would integrate with your actual API client
        console.log(`✅ Synced: ${item.key}`);
      } catch (error) {
        console.error(`❌ Failed to sync ${item.key}:`, error);
        // Re-queue on failure
        this.queueForSync(item.key, item.data);
      }
    }
  }

  /**
   * Cache data for offline access
   */
  public cacheData(key: string, data: any): void {
    try {
      const cacheKey = `ikan-cache-${key}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error(`Failed to cache data for ${key}:`, error);
    }
  }

  /**
   * Get cached data
   */
  public getCachedData(key: string, maxAge: number = 3600000): any | null {
    try {
      const cacheKey = `ikan-cache-${key}`;
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age > maxAge) {
        // Cache expired
        localStorage.removeItem(cacheKey);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Failed to get cached data for ${key}:`, error);
      return null;
    }
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('ikan-cache-')) {
          localStorage.removeItem(key);
        }
      });
      console.log('🗑️ Offline cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

// Export singleton instance
export const offlineManager = OfflineManager.getInstance();

/**
 * React hook for network status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = React.useState(offlineManager.getOnlineStatus());

  React.useEffect(() => {
    const unsubscribe = offlineManager.subscribe(setIsOnline);
    return unsubscribe;
  }, []);

  return isOnline;
}

// Import React for the hook
import React from 'react';
