import { AlertTriangle, Flame, HardDrive, Loader2, Search, Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { cn } from '../../ui/utils';
import { AdminStatusBadge, type StatusVariant } from '../../ui/kit/AdminStatusBadge';
import { AllClear, AuditSection, BTN, BTN_DANGER, KeyBadge, ResultBanner } from './KVAuditParts';
import type { AuditData } from './types';
import type { KVAuditData } from './useKVAuditData';

/** Integrity findings: orphans, naming inconsistencies, growth warnings, soft-deletes. */

const ORPHAN_STATUS: Record<string, StatusVariant> = {
  'slug-dangling': 'warning',
  'index-dangling': 'danger',
  'entity-orphan': 'danger',
  'user-data-orphan': 'warning',
};

export function OrphansSection({ audit, kv }: { audit: AuditData; kv: KVAuditData }) {
  const { selectedOrphans, cleanup } = kv;
  return (
    <AuditSection
      title="Orphaned Keys"
      icon={AlertTriangle}
      count={audit.orphanCount}
      variant={audit.orphanCount > 0 ? 'danger' : 'success'}
      defaultOpen={audit.orphanCount > 0}
    >
      {audit.orphanCount === 0 ? (
        <AllClear>No orphaned keys detected</AllClear>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={kv.selectAllOrphans} className={BTN}>
              Select All ({audit.orphanCount})
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={() => kv.handleCleanup(true)}
              disabled={selectedOrphans.size === 0 || cleanup.busy}
              className={cn('gap-1', BTN)}
            >
              <Search className="w-3 h-3" /> Dry Run
            </Button>
            <Button
              size="sm"
              onClick={() => kv.handleCleanup(false)}
              disabled={selectedOrphans.size === 0 || cleanup.busy}
              className={cn('gap-1', BTN, BTN_DANGER)}
            >
              {cleanup.busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Confirm Delete ({selectedOrphans.size})
            </Button>
          </div>
          <ResultBanner result={cleanup.result} />
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {audit.orphans.map((orphan, i) => {
              const selected = selectedOrphans.has(orphan.key);
              return (
                <label
                  key={`${orphan.key}-${i}`}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-all duration-150 ease-in-out',
                    selected
                      ? 'bg-[var(--color-status-danger-light)] border-[var(--color-status-danger)]'
                      : 'bg-[var(--color-bg-muted)] border-transparent',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => kv.toggleOrphan(orphan.key)}
                    className="mt-0.5 accent-[var(--color-status-danger)]"
                  />
                  <div className="flex-1 min-w-0">
                    <KeyBadge keyName={orphan.key} />
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{orphan.reason}</p>
                    <AdminStatusBadge status={ORPHAN_STATUS[orphan.category] ?? 'neutral'} label={orphan.category} />
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </AuditSection>
  );
}

export function InconsistenciesSection({ audit }: { audit: AuditData }) {
  return (
    <AuditSection
      title="Naming Inconsistencies"
      icon={AlertTriangle}
      count={audit.inconsistencies.length}
      variant={audit.inconsistencies.length > 0 ? 'warning' : 'success'}
      defaultOpen={audit.inconsistencies.length > 0}
    >
      {audit.inconsistencies.length === 0 ? (
        <AllClear>No naming inconsistencies</AllClear>
      ) : (
        <div className="space-y-3">
          {audit.inconsistencies.map((inc, i) => (
            <div key={i} className="p-3 rounded-lg bg-[var(--color-status-warning-light)] border border-[var(--color-status-warning)]">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{inc.issue}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {inc.keys.map(k => <KeyBadge key={k} keyName={k} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </AuditSection>
  );
}

const SMALL_BTN = 'text-xs';

function ActivityKeyMigration({ kv }: { kv: KVAuditData }) {
  const { activityPurge, activityPurgeConfirm } = kv;
  return (
    <div className="mt-4 p-4 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-default)]">
      <div className="flex items-start gap-3">
        <Flame className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-status-warning)]" />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-medium">Migrate &amp; Purge Legacy Activity Keys</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Merges old per-event keys (<KeyBadge keyName="user_activity:uid:ts" />, <KeyBadge keyName="activity:ts:uid" />, <KeyBadge keyName="analytics:ts-rand" />)
              into capped arrays (<KeyBadge keyName="user_activity:uid" />, <KeyBadge keyName="activity:daily:date" />, <KeyBadge keyName="analytics:daily:date" />) then deletes the originals.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={activityPurge.busy}
              onClick={() => kv.handleActivityPurge(true)}
              className={SMALL_BTN}
            >
              {activityPurge.busy ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Search className="w-3 h-3 mr-1" />}
              Dry Run
            </Button>
            {!activityPurgeConfirm ? (
              <Button
                variant="outline"
                size="sm"
                disabled={activityPurge.busy}
                onClick={() => kv.setActivityPurgeConfirm(true)}
                className={cn(SMALL_BTN, 'text-[var(--color-status-danger)] hover:text-[var(--color-status-danger)] border-[var(--color-status-danger)]')}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Migrate &amp; Purge
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={activityPurge.busy}
                onClick={() => kv.handleActivityPurge(false)}
                className={cn(SMALL_BTN, 'bg-[var(--color-status-danger)] hover:bg-[var(--color-status-danger)] text-white')}
              >
                {activityPurge.busy ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                Confirm — This is irreversible
              </Button>
            )}
          </div>
          {activityPurge.result && (
            <pre className="p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap font-mono bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] max-h-[200px]">
              {activityPurge.result}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

export function GrowthWarningsSection({ audit, kv }: { audit: AuditData; kv: KVAuditData }) {
  return (
    <AuditSection
      title="Growth Warnings"
      icon={HardDrive}
      count={audit.growthWarnings.length}
      variant={audit.growthWarnings.length > 0 ? 'warning' : 'success'}
    >
      {audit.growthWarnings.length === 0 ? (
        <AllClear>All key groups within healthy limits</AllClear>
      ) : (
        <div className="space-y-2">
          {audit.growthWarnings.map((w, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-status-warning-light)]">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-status-warning)]" />
              <div>
                <KeyBadge keyName={w.prefix} />
                <span className="text-sm text-[var(--color-text-muted)] ml-2">({w.count} keys)</span>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">{w.warning}</p>
              </div>
            </div>
          ))}
          <ActivityKeyMigration kv={kv} />
        </div>
      )}
    </AuditSection>
  );
}

export function SoftDeletedSection({ audit }: { audit: AuditData }) {
  return (
    <AuditSection
      title="Soft-Deleted Entities"
      icon={Trash2}
      count={audit.softDeletedCount}
      variant={audit.softDeletedCount > 0 ? 'warning' : 'success'}
    >
      {audit.softDeletedCount === 0 ? (
        <AllClear>No soft-deleted entities lingering in KV</AllClear>
      ) : (
        <div className="space-y-1">
          <p className="text-sm text-[var(--color-text-muted)] mb-2">
            These entities have <code className="text-xs">deleted: true</code> but are still stored in KV. Consider hard-deleting.
          </p>
          {audit.softDeleted.map(k => (
            <div key={k} className="py-1"><KeyBadge keyName={k} /></div>
          ))}
        </div>
      )}
    </AuditSection>
  );
}
