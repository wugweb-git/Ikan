/**
 * useOfflineSync - Offline data sync hook for iKan PWA
 * 
 * Queues writes (mood entries, assessment responses, block responses)
 * when offline, and syncs them when connectivity is restored.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from './api';

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
/** Items that exhausted their retries. Kept so user data is recoverable rather than dropped. */
const DEAD_LETTER_KEY = 'ikan-offline-sync-dead-letter';
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
        // MoodJournal queues `{...payload, ...extraFields}` flattened, so every
        // custom check-in template answer arrives as a top-level key. Destructuring
        // a fixed set dropped all of them on any entry that synced through the
        // queue — the same class of bug as the assessment_response case below.
        const { date, mood, note, emotions, energy, stress, contextTags, ...extraFields } = item.payload;
        await apiClient.createJournalEntry(date, mood, note, emotions, energy, stress, contextTags, extraFields);
        return true;
      }

      case 'assessment_response': {
        // maxScore/sectionScores used to be silently dropped here even though
        // the queued payload carries them (see AssessmentFlow.tsx's queueItem
        // calls) — any response that synced through this path instead of the
        // direct online call permanently lost its score breakdown.
        // `engineResult` joins that list for the same reason: AssessmentFlow
        // queues it, and a field destructured here but not forwarded is lost
        // permanently for anything that syncs offline rather than online.
        // `startedAt`/`durationSeconds` join the list for the same reason as
        // `engineResult` before them: a field destructured here but not
        // forwarded is lost permanently for anything that syncs offline. A run
        // completed on a train would keep its answers and silently lose its
        // timing.
        const { assessmentId, responses, status, score, interpretation, severityHint, maxScore, sectionScores, slug, engineResult, startedAt, durationSeconds } = item.payload;
        await apiClient.saveAssessmentResponse(assessmentId, responses, status, score, interpretation, severityHint, maxScore, sectionScores, slug, engineResult, { startedAt, durationSeconds });
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

/**
 * Invalidate a specific offline cache entry (e.g. after a delete/mutation).
 */
export function invalidateOfflineCache(key: string): void {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch {
    // ignore
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
    const exhausted: SyncItem[] = [];

    for (const item of currentQueue) {
      const ok = await executeSync(item);
      if (!ok) {
        if (item.retries < MAX_RETRIES) {
          failed.push({ ...item, retries: item.retries + 1 });
        } else {
          // Previously this dropped the item with a console.warn and the user's
          // entry was gone. Park it instead so it is recoverable.
          exhausted.push(item);
        }
      }
    }

    // Re-read at write time. This used to `saveQueue(failed)` against the
    // snapshot taken before the awaits above, so anything queued WHILE the sync
    // was running — a journal entry written on a slow connection, say — was
    // silently overwritten and lost. Keep whatever arrived in the meantime.
    const processedIds = new Set(currentQueue.map((i) => i.id));
    const arrivedDuringSync = loadQueue().filter((i) => !processedIds.has(i.id));
    const nextQueue = [...failed, ...arrivedDuringSync];

    if (exhausted.length > 0) {
      // Dead-letter store: out of the retry loop so it cannot block the queue,
      // but still on disk so nothing the user wrote is destroyed outright.
      try {
        const prior: SyncItem[] = JSON.parse(localStorage.getItem(DEAD_LETTER_KEY) || '[]');
        localStorage.setItem(DEAD_LETTER_KEY, JSON.stringify([...prior, ...exhausted]));
      } catch {
        console.warn('Failed to park exhausted sync items');
      }
      console.warn(
        `${exhausted.length} sync item(s) exceeded ${MAX_RETRIES} retries and were moved to ${DEAD_LETTER_KEY}`
      );
    }

    saveQueue(nextQueue);
    setQueue(nextQueue);

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