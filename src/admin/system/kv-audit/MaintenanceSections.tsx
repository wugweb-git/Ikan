import { ArrowRightLeft, Clock, Flame, Loader2, Search, Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { cn } from '../../ui/utils';
import { AdminStatusBadge } from '../../ui/kit/AdminStatusBadge';
import { useIsMobile } from '../../ui/hooks/useIsMobile';
import { AuditSection, BTN, BTN_DANGER, BTN_PRIMARY, BTN_WARNING, KeyBadge, ResultBanner, SectionIntro } from './KVAuditParts';
import type { AuditData, SchemaData } from './types';
import type { KVAuditData } from './useKVAuditData';

/** Write tools: prefix sync, audit-trail pruning, naming migration, uncategorised keys, purge by prefix. */

const FIELD = 'text-sm rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] text-[var(--color-text-primary)]';

export function PrefixSyncSection({ schema, kv }: { schema: SchemaData | null; kv: KVAuditData }) {
  const liveCounts = schema?.liveCounts || {};
  const equipDrift = Math.max(0, (liveCounts['equip:'] || 0) - (liveCounts['equip_program:'] || 0));
  const assessmentDrift = Math.max(0, (liveCounts['assessment_def:'] || 0) - (liveCounts['assessment:'] || 0));
  const syncDrift = equipDrift + assessmentDrift;
  const { sync } = kv;
  return (
    <AuditSection
      title="Admin/User Prefix Sync"
      icon={ArrowRightLeft}
      count={syncDrift}
      variant={syncDrift > 0 ? 'warning' : 'success'}
      defaultOpen={syncDrift > 0}
    >
      <div className="space-y-4">
        <SectionIntro>
          Admin creates content under one prefix (e.g. <KeyBadge keyName="equip:" />) but users read
          from a separate mirror prefix (e.g. <KeyBadge keyName="equip_program:" />) — a single-tenant
          app's admin-write/user-read split, not multi-tenancy. This tool copies admin records to the
          user-facing prefixes so content becomes visible. Count above is the raw record-count gap
          between each pair (approximate — a real sync check would compare ids, not just counts).
        </SectionIntro>
        <div className="p-3 rounded-lg bg-[var(--color-bg-muted)] border border-[var(--color-border-default)] text-xs text-[var(--color-text-muted)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2"><KeyBadge keyName="equip:" /> → <KeyBadge keyName="equip_program:" /> (Programs){equipDrift > 0 && <span className="text-[var(--color-status-warning)]"> — {equipDrift} gap</span>}</div>
            <div className="flex items-center gap-2"><KeyBadge keyName="assessment_def:" /> → <KeyBadge keyName="assessment:" /> (Assessments){assessmentDrift > 0 && <span className="text-[var(--color-status-warning)]"> — {assessmentDrift} gap</span>}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => kv.handleSync(true)} disabled={sync.busy} className={cn('gap-1', BTN)}>
            <Search className="w-3 h-3" /> Dry Run
          </Button>
          <Button size="sm" onClick={() => kv.handleSync(false)} disabled={sync.busy} className={cn('gap-1', BTN, BTN_PRIMARY)}>
            {sync.busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRightLeft className="w-3 h-3" />}
            Sync Now
          </Button>
        </div>
        <ResultBanner result={sync.result} />
      </div>
    </AuditSection>
  );
}

export function PruneSection({ audit, kv }: { audit: AuditData; kv: KVAuditData }) {
  const auditCount = audit.categorized['audit:']?.count || 0;
  const { prune } = kv;
  return (
    <AuditSection
      title="Audit Trail Pruning"
      icon={Clock}
      count={auditCount}
      variant={auditCount > 100 ? 'warning' : 'info'}
    >
      <SectionIntro className="mb-3">
        Prune audit trail entries older than a specified number of days. Uses dry run by default.
      </SectionIntro>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-primary)]">Older than</span>
          <select
            value={kv.pruneDays}
            onChange={e => kv.setPruneDays(Number(e.target.value))}
            className={cn(FIELD, 'px-3 py-1.5')}
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
        <Button variant="outline" size="sm" onClick={() => kv.handlePrune(true)} disabled={prune.busy} className={cn('gap-1', BTN)}>
          <Search className="w-3 h-3" /> Dry Run
        </Button>
        <Button size="sm" onClick={() => kv.handlePrune(false)} disabled={prune.busy} className={cn('gap-1', BTN, BTN_WARNING)}>
          {prune.busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          Prune Now
        </Button>
      </div>
      <ResultBanner result={prune.result} className="mt-3" />
    </AuditSection>
  );
}

export function NamingMigrationSection({ audit, kv }: { audit: AuditData; kv: KVAuditData }) {
  if (audit.inconsistencies.length === 0) return null;
  const { migrate } = kv;
  return (
    <AuditSection
      title="Naming Migration"
      icon={ArrowRightLeft}
      count={audit.inconsistencies.length}
      variant="info"
    >
      <SectionIntro className="mb-3">
        Resolve naming inconsistencies by migrating all keys from one prefix to another. Always dry-run first.
      </SectionIntro>
      <div className="space-y-3">
        {audit.inconsistencies.map((inc, i) => {
          const prefixMatch = inc.issue.match(/(\S+:)\s.*and\s(\S+:)/);
          const fromPfx = prefixMatch ? prefixMatch[1] : '';
          const toPfx = prefixMatch ? prefixMatch[2] : '';
          return (
            <div key={i} className="p-3 rounded-lg bg-[var(--color-bg-muted)] border border-[var(--color-border-default)]">
              <div className="flex items-center gap-2 flex-wrap">
                <KeyBadge keyName={fromPfx} />
                <ArrowRightLeft className="w-3 h-3 text-[var(--color-text-muted)]" />
                <KeyBadge keyName={toPfx} />
                <div className="flex gap-2 ml-auto">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => kv.handleMigrate(fromPfx, toPfx, true)}
                    disabled={migrate.busy || !fromPfx}
                    className={cn('gap-1', BTN)}
                  >
                    <Search className="w-3 h-3" /> Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => kv.handleMigrate(fromPfx, toPfx, false)}
                    disabled={migrate.busy || !fromPfx}
                    className={cn('gap-1', BTN, BTN_PRIMARY)}
                  >
                    {migrate.busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRightLeft className="w-3 h-3" />}
                    Migrate
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ResultBanner result={migrate.result} className="mt-3" />
    </AuditSection>
  );
}

export function UncategorizedSection({ audit, kv }: { audit: AuditData; kv: KVAuditData }) {
  if (audit.uncategorizedCount <= 0) return null;

  // Auto-detect prefix clusters from uncategorized keys
  const prefixGroups: Record<string, { keys: { key: string; value: string }[]; count: number }> = {};
  for (const k of audit.uncategorizedKeys) {
    const colonIdx = k.key.indexOf(':');
    const detectedPrefix = colonIdx > 0 ? k.key.substring(0, colonIdx + 1) : k.key;
    if (!prefixGroups[detectedPrefix]) prefixGroups[detectedPrefix] = { keys: [], count: 0 };
    prefixGroups[detectedPrefix].keys.push(k);
    prefixGroups[detectedPrefix].count++;
  }
  const sortedGroups = Object.entries(prefixGroups).sort((a, b) => b[1].count - a[1].count);
  const sampledTotal = audit.uncategorizedKeys.length;
  const actualTotal = audit.uncategorizedCount;

  return (
    <AuditSection title="Uncategorized Keys" icon={Search} count={audit.uncategorizedCount} variant="warning">
      <SectionIntro className="mb-3">
        These keys don't match any known prefix pattern. They have been auto-grouped by detected prefix.
        {actualTotal > sampledTotal && (
          <span> Showing {sampledTotal} of {actualTotal} keys.</span>
        )}
      </SectionIntro>
      <div className="space-y-3">
        {sortedGroups.map(([prefix, group]) => {
          const estimatedCount = actualTotal > sampledTotal
            ? Math.round((group.count / sampledTotal) * actualTotal)
            : group.count;
          return (
            <div key={prefix} className="p-3 rounded-lg bg-[var(--color-bg-muted)] border border-[var(--color-border-default)]">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <KeyBadge keyName={prefix} />
                  <AdminStatusBadge
                    status="warning"
                    label={actualTotal > sampledTotal ? `~${estimatedCount} keys` : `${group.count} keys`}
                  />
                </div>
                <Button
                  variant="outline" size="sm"
                  onClick={() => kv.choosePurgePrefix(prefix)}
                  className={cn('gap-1 text-xs', BTN)}
                >
                  <Flame className="w-3 h-3" /> Purge
                </Button>
              </div>
              <div className="space-y-1 max-h-[150px] overflow-y-auto">
                {group.keys.slice(0, 5).map(k => (
                  <div key={k.key} className="flex items-start gap-2 py-0.5">
                    <code className="font-mono text-[11px] text-[var(--color-text-muted)] break-all">{k.key}</code>
                    <span className="text-[11px] text-[var(--color-text-muted)] shrink-0">{k.value}</span>
                  </div>
                ))}
                {group.keys.length > 5 && (
                  <p className="text-[11px] text-[var(--color-text-muted)]">... and {group.count - 5} more sampled</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AuditSection>
  );
}

export function PurgeByPrefixSection({ kv }: { kv: KVAuditData }) {
  const isMobile = useIsMobile();
  const { purge, purgePrefix, purgeConfirm } = kv;
  return (
    <AuditSection title="Purge by Prefix" icon={Flame} count={0} variant="danger">
      <div className="space-y-4">
        <SectionIntro>
          Delete all KV keys matching a given prefix. Use with extreme caution. Always dry-run first.
        </SectionIntro>
        <div className={cn('flex items-center gap-3', isMobile ? 'flex-col items-stretch' : 'flex-wrap')}>
          <input
            type="text"
            value={purgePrefix}
            onChange={e => kv.choosePurgePrefix(e.target.value)}
            placeholder="e.g. activity: or active_sessions:"
            className={cn(FIELD, 'font-mono px-3 py-2', isMobile ? 'min-w-full' : 'min-w-[280px]')}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              onClick={kv.handlePurgeDryRun}
              disabled={purge.busy || !purgePrefix || purgePrefix.length < 2}
              className={cn('gap-1', BTN)}
            >
              {purge.busy && !purgeConfirm ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />} Dry Run
            </Button>
            {purgeConfirm && (
              <Button size="sm" onClick={kv.handlePurgeConfirm} disabled={purge.busy} className={cn('gap-1', BTN, BTN_DANGER)}>
                {purge.busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Flame className="w-3 h-3" />}
                Confirm Purge
              </Button>
            )}
          </div>
        </div>
        <ResultBanner result={purge.result} tone={purgeConfirm ? 'warning' : 'success'} />
      </div>
    </AuditSection>
  );
}
