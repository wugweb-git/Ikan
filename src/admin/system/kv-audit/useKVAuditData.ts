import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '../../../shared/api/api';
import { useAdminResource } from '../../ui/hooks/useAdminResource';
import type { AuditData, HealthScore, SchemaData, TrendSnapshot } from './types';

/**
 * Every KV audit API call, plus the inline result message each maintenance
 * tool shows. Results are inline text (not toasts): these are operator tools
 * whose dry-run output has to stay on screen next to the button.
 */

type Setter = (msg: string | null) => void;

/** One maintenance tool: a busy flag + its inline result line. */
function useOp() {
  const [busy, setBusy] = useState(false);
  const [result, setResultState] = useState<string | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const setResult = useCallback<Setter>((msg) => {
    if (mounted.current) setResultState(msg);
  }, []);

  /**
   * Runs `fn`; a throw becomes `Error: <message>` in the result line.
   * `clear: false` keeps the previous result visible while running.
   */
  const run = useCallback(async (
    fn: (set: Setter) => Promise<void>,
    opts: { clear?: boolean; fallback?: string } = {},
  ) => {
    setBusy(true);
    if (opts.clear !== false) setResultState(null);
    try {
      await fn(setResult);
    } catch (err) {
      const message = (err as { message?: string } | null)?.message;
      setResult(`Error: ${opts.fallback ? message || opts.fallback : message}`);
    } finally {
      if (mounted.current) setBusy(false);
    }
  }, [setResult]);

  return { busy, result, setResult, run };
}

export type KVOp = ReturnType<typeof useOp>;

export function useKVAuditData() {
  // ── Loads ──────────────────────────────────────────────
  const auditRes = useAdminResource<AuditData | null>(
    async () => (await apiClient.runKVAudit()).audit as AuditData,
    { initialData: null, toastOnError: false, errorMessage: (err) => (err as { message?: string } | null)?.message || 'Failed to run KV audit', errorTitle: 'KV Audit error' },
  );
  // Schema + live relation health. Loaded alongside the audit so the mapping is
  // inspectable in the UI rather than only via SQL. Failure → "Schema unavailable."
  const schemaRes = useAdminResource<SchemaData | null>(
    async () => (await apiClient.getKVSchema()) as SchemaData,
    { initialData: null, toastOnError: false, errorTitle: 'KV schema error' },
  );

  // ── Orphan selection + cleanup ─────────────────────────
  const [selectedOrphans, setSelectedOrphans] = useState<Set<string>>(new Set());
  const cleanup = useOp();

  const { setResult: setCleanupResult } = cleanup;
  const { reload: reloadAudit } = auditRes;
  const runAudit = useCallback(async () => {
    setCleanupResult(null);
    setSelectedOrphans(new Set());
    await reloadAudit();
  }, [setCleanupResult, reloadAudit]);

  const toggleOrphan = (key: string) => {
    setSelectedOrphans(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAllOrphans = () => {
    if (!auditRes.data) return;
    setSelectedOrphans(new Set(auditRes.data.orphans.map(o => o.key)));
  };

  const handleCleanup = async (dryRun: boolean) => {
    if (selectedOrphans.size === 0) return;
    await cleanup.run(async (set) => {
      const res = await apiClient.cleanupKVKeys(Array.from(selectedOrphans), dryRun);
      if (dryRun) {
        set(`Dry run: Would delete ${res.wouldDelete} key(s). Run again with "Confirm Delete" to proceed.`);
      } else {
        set(`Deleted ${res.deleted} key(s). ${res.failed?.length ? `${res.failed.length} failed.` : ''}`);
        await runAudit();
      }
    }, { fallback: 'Cleanup failed' });
  };

  // ── Legacy activity keys ───────────────────────────────
  const activityPurge = useOp();
  const [activityPurgeConfirm, setActivityPurgeConfirm] = useState(false);

  const handleActivityPurge = (dryRun: boolean) => activityPurge.run(async (set) => {
    const res = await apiClient.purgeActivityKeys(dryRun);
    if (dryRun) {
      set(
        `Dry run: Found ${res.legacyKeysFound} legacy keys to migrate.\n` +
        `Breakdown: ${JSON.stringify(res.breakdown)}\n` +
        `Sample keys: ${(res.sampleKeys || []).slice(0, 5).join(', ')}`
      );
    } else {
      set(`Migrated & deleted ${res.deleted} legacy keys. Merged: ${JSON.stringify(res.merged)}`);
      setActivityPurgeConfirm(false);
      // Re-run audit to reflect changes (not awaited, as before)
      void runAudit();
    }
  }, { fallback: 'Failed to purge' });

  // ── Admin/user prefix sync ─────────────────────────────
  const sync = useOp();
  const handleSync = (dryRun: boolean) => sync.run(async (set) => {
    const res = await apiClient.syncPrefixes(dryRun);
    if (dryRun) {
      set(`Dry run: Would sync ${res.synced} record(s). ${res.actions?.length ? res.actions.join(', ') : 'Everything is in sync.'}`);
    } else {
      set(`Synced ${res.synced} record(s) to user-facing prefixes.`);
      await runAudit();
    }
  });

  // ── Audit trail pruning ────────────────────────────────
  const prune = useOp();
  const [pruneDays, setPruneDays] = useState(30);
  const handlePrune = (dryRun: boolean) => prune.run(async (set) => {
    const res = await apiClient.pruneAuditTrail(pruneDays, dryRun);
    if (dryRun) {
      set(`Dry run: ${res.wouldPrune} of ${res.total} audit keys would be pruned (before ${new Date(res.cutoffDate).toLocaleDateString()}).`);
    } else {
      set(`Pruned ${res.pruned} of ${res.total} audit keys.`);
      await runAudit();
    }
  });

  // ── Naming migration ───────────────────────────────────
  const migrate = useOp();
  const handleMigrate = (fromPfx: string, toPfx: string, dryRun: boolean) => migrate.run(async (set) => {
    const res = await apiClient.migrateNaming(fromPfx, toPfx, dryRun);
    if (dryRun) {
      set(`Dry run: Would migrate ${res.wouldMigrate} key(s) from "${fromPfx}" to "${toPfx}".`);
    } else {
      set(`Migrated ${res.migrated} key(s). ${res.errors ? `${res.errors.length} errors.` : ''}`);
      await runAudit();
    }
  });

  // ── Health trends ──────────────────────────────────────
  const snapshot = useOp();
  const [trends, setTrends] = useState<TrendSnapshot[]>([]);
  const [trendsLoaded, setTrendsLoaded] = useState(false);

  const handleSaveSnapshot = (audit: AuditData, health: HealthScore) => snapshot.run(async (set) => {
    await apiClient.saveAuditSnapshot({
      score: health.score,
      totalKeys: audit.totalKeys,
      orphanCount: audit.orphanCount,
      inconsistencyCount: audit.inconsistencies.length,
      growthWarningCount: audit.growthWarnings.length,
      softDeletedCount: audit.softDeletedCount,
      uncategorizedCount: audit.uncategorizedCount,
    });
    set('Snapshot saved successfully.');
    const tRes = await apiClient.getAuditTrends();
    setTrends(tRes.snapshots || []);
    setTrendsLoaded(true);
  });

  const loadTrends = async () => {
    try {
      const res = await apiClient.getAuditTrends();
      setTrends(res.snapshots || []);
      setTrendsLoaded(true);
    } catch (err) {
      console.error('Load trends error:', err);
    }
  };

  // ── Purge by prefix ────────────────────────────────────
  const purge = useOp();
  const [purgePrefix, setPurgePrefixState] = useState('');
  const [purgeConfirm, setPurgeConfirm] = useState(false);

  /** Pick/type a prefix: resets any pending confirmation and the last result. */
  const choosePurgePrefix = (prefix: string) => {
    setPurgePrefixState(prefix);
    purge.setResult(null);
    setPurgeConfirm(false);
  };

  const handlePurgeDryRun = async () => {
    if (!purgePrefix || purgePrefix.length < 2) return;
    setPurgeConfirm(false);
    await purge.run(async (set) => {
      const res = await apiClient.purgeKVPrefix(purgePrefix, true);
      if (res.wouldDelete === 0) {
        set(`No keys found with prefix "${purgePrefix}".`);
      } else {
        set(`Dry run: Would delete ${res.wouldDelete} key(s) with prefix "${purgePrefix}".${res.sampleKeys?.length ? ` Samples: ${res.sampleKeys.slice(0, 3).join(', ')}` : ''}`);
        setPurgeConfirm(true);
      }
    });
  };

  const handlePurgeConfirm = async () => {
    if (!purgePrefix) return;
    await purge.run(async (set) => {
      const res = await apiClient.purgeKVPrefix(purgePrefix, false);
      set(`Purged ${res.deleted} of ${res.total} keys with prefix "${purgePrefix}".${res.failed ? ` ${res.failed} failed.` : ''}`);
      setPurgeConfirm(false);
      await runAudit();
    }, { clear: false });
  };

  return {
    audit: auditRes.data,
    auditLoading: auditRes.loading,
    auditError: auditRes.error,
    runAudit,
    schema: schemaRes.data,
    schemaLoading: schemaRes.loading,

    selectedOrphans, toggleOrphan, selectAllOrphans, cleanup, handleCleanup,
    activityPurge, activityPurgeConfirm, setActivityPurgeConfirm, handleActivityPurge,
    sync, handleSync,
    prune, pruneDays, setPruneDays, handlePrune,
    migrate, handleMigrate,
    snapshot, trends, trendsLoaded, handleSaveSnapshot, loadTrends,
    purge, purgePrefix, purgeConfirm, choosePurgePrefix, handlePurgeDryRun, handlePurgeConfirm,
  };
}

export type KVAuditData = ReturnType<typeof useKVAuditData>;
