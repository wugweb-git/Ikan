/**
 * useOfflineSync - Offline data sync hook for iKan PWA
 * 
 * Queues writes (mood entries, assessment responses, block responses)
 * when offline, and syncs them when connectivity is restored.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../lib/api-client';

// ─── Types ───────────────────────────────────────────────────
export type SyncItemType = 'mood_entry' | 'assessment_response' | 'block_response' | 'day_complete';

export interface SyncItem {
  id: string;
  type: SyncItemType;
  payload: any;
  createdAt: number;
  retries: number;
}

export interface OfflineSyncState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncedAt: number | null;
}

const SYNC_QUEUE_KEY = 'ikan-offline-sync-queue';
const LAST_SYNCED_KEY = 'ikan-last-synced';
const MAX_RETRIES = 3;

// ─── Queue persistence ──────────────────────────────────────

function loadQueue(): SyncItem[] {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: SyncItem[]) {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    console.warn('Failed to persist sync queue');
  }
}

// ─── Sync executor ──────────────────────────────────────────

async function executeSync(item: SyncItem): Promise<boolean> {
  try {
    switch (item.type) {
      case 'mood_entry': {
        const { date, mood, note, emotions, energy, stress, contextTags } = item.payload;
        await apiClient.createJournalEntry(date, mood, note, emotions, energy, stress, contextTags);
        return true;
      }

      case 'assessment_response': {
        const { assessmentId, responses, status, score, interpretation, severityHint } = item.payload;
        await apiClient.saveAssessmentResponse(assessmentId, responses, status, score, interpretation, severityHint);
        return true;
      }

      case 'block_response': {
        const { equipId, dayNum, blockId, response } = item.payload;
        await apiClient.saveBlockResponse(equipId, dayNum, blockId, response);
        return true;
      }

      case 'day_complete': {
        const { equipId, dayNum } = item.payload;
        await apiClient.completeDay(equipId, dayNum);
        return true;
      }

      default:
        console.warn(`Unknown sync item type: ${item.type}`);
        return true; // discard unknown items
    }
  } catch (error) {
    console.error(`Sync failed for ${item.type} (${item.id}):`, error);
    return false;
  }
}

// ─── Cache helpers (read-through cache for offline reads) ───

const CACHE_PREFIX = 'ikan-ocache-';

export function cacheForOffline(key: string, data: any, ttlMs: number = 24 * 60 * 60 * 1000) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({
      data,
      expiresAt: Date.now() + ttlMs,
    }));
  } catch {
    // quota exceeded — evict oldest entries
    evictOldestCache();
  }
}

export function readOfflineCache<T = any>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
}

function evictOldestCache() {
  try {
    const keys = Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_PREFIX));
    
    if (keys.length === 0) return;

    // evict the first 5
    keys.slice(0, 5).forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

// ─── React Hook ─────────────────────────────────────────────

export function useOfflineSync(): OfflineSyncState & {
  queueItem: (type: SyncItemType, payload: any) => void;
  syncNow: () => Promise<void>;
  clearQueue: () => void;
} {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<SyncItem[]>(loadQueue);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(() => {
    const v = localStorage.getItem(LAST_SYNCED_KEY);
    return v ? parseInt(v, 10) : null;
  });

  const syncingRef = useRef(false);

  // Network listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !syncingRef.current) {
      syncNow();
    }
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  const queueItem = useCallback((type: SyncItemType, payload: any) => {
    const item: SyncItem = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      payload,
      createdAt: Date.now(),
      retries: 0,
    };

    setQueue(prev => {
      const next = [...prev, item];
      saveQueue(next);
      return next;
    });
  }, []);

  const syncNow = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setIsSyncing(true);

    const currentQueue = loadQueue();
    const failed: SyncItem[] = [];

    for (const item of currentQueue) {
      const ok = await executeSync(item);
      if (!ok) {
        if (item.retries < MAX_RETRIES) {
          failed.push({ ...item, retries: item.retries + 1 });
        } else {
          console.warn(`Dropping sync item after ${MAX_RETRIES} retries:`, item.id);
        }
      }
    }

    saveQueue(failed);
    setQueue(failed);

    const now = Date.now();
    setLastSyncedAt(now);
    localStorage.setItem(LAST_SYNCED_KEY, now.toString());

    setIsSyncing(false);
    syncingRef.current = false;
  }, []);

  const clearQueue = useCallback(() => {
    saveQueue([]);
    setQueue([]);
  }, []);

  return {
    isOnline,
    pendingCount: queue.length,
    isSyncing,
    lastSyncedAt,
    queueItem,
    syncNow,
    clearQueue,
  };
}
