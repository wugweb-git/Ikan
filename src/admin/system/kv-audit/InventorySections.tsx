import { Database, Loader2, Save, TrendingUp, Users } from 'lucide-react';
import { Button } from '../../ui/button';
import { cn } from '../../ui/utils';
import { AdminDataTable, type Column } from '../../ui/kit/AdminDataTable';
import { AdminStatusBadge, type StatusVariant } from '../../ui/kit/AdminStatusBadge';
import { useIsMobile } from '../../ui/hooks/useIsMobile';
import { AuditSection, BTN, KeyBadge, ResultBanner, SectionIntro } from './KVAuditParts';
import type { AuditData, HealthScore, TrendSnapshot, UserFootprint } from './types';
import type { KVAuditData } from './useKVAuditData';

/** Read-only inventories: key prefixes, health trend snapshots, per-user footprint. */

const HEAD = 'text-[var(--color-text-primary)] h-auto';
const HEAD_RIGHT = `${HEAD} [&>div]:justify-end`;
const STRONG = 'font-medium text-[var(--color-text-primary)]';

function prefixType(prefix: string): { status: StatusVariant; label: string } {
  const isUserData = prefix.startsWith('user:') || prefix.startsWith('journal') || prefix.startsWith('enrollment') || prefix.startsWith('progress') || prefix.startsWith('tracker');
  const status: StatusVariant = isUserData ? 'info' : prefix.startsWith('audit:') || prefix.startsWith('backup') ? 'neutral' : 'primary';
  const label = isUserData ? 'User Data'
    : prefix.startsWith('audit:') ? 'Audit Trail'
    : prefix.startsWith('backup') ? 'System'
    : prefix.startsWith('idx_') ? 'Index'
    : prefix.endsWith('_slug:') || prefix.endsWith('_key:') ? 'Lookup'
    : 'Content';
  return { status, label };
}

type CategoryRow = { prefix: string; count: number };

const inventoryColumns: Column<CategoryRow>[] = [
  { header: 'Prefix', className: 'py-2 pr-4', headerClassName: HEAD, render: r => <KeyBadge keyName={r.prefix} /> },
  { header: 'Count', className: `py-2 px-4 text-right ${STRONG}`, headerClassName: HEAD_RIGHT, render: r => r.count },
  {
    header: 'Type', className: 'py-2 pl-4', headerClassName: HEAD,
    render: r => { const t = prefixType(r.prefix); return <AdminStatusBadge status={t.status} label={t.label} />; },
  },
];

export function KeyInventorySection({ audit }: { audit: AuditData }) {
  const isMobile = useIsMobile();
  // Sort categories by count descending
  const rows: CategoryRow[] = Object.entries(audit.categorized)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([prefix, data]) => ({ prefix, count: data.count }));
  return (
    <AuditSection title="Key Inventory" icon={Database} count={Object.keys(audit.categorized).length} variant="info">
      {isMobile ? (
        <div className="divide-y divide-[var(--color-border-default)]">
          {rows.map(({ prefix, count }) => {
            const t = prefixType(prefix);
            return (
              <div key={prefix} className="py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <KeyBadge keyName={prefix} />
                  <span className={cn('text-sm', STRONG)}>{count}</span>
                </div>
                <AdminStatusBadge status={t.status} label={t.label} />
              </div>
            );
          })}
        </div>
      ) : (
        <AdminDataTable columns={inventoryColumns} data={rows} getRowKey={r => r.prefix} showToolbar={false} paginate={false} mobileLayout="table" />
      )}
    </AuditSection>
  );
}

const scoreStatus = (score: number): StatusVariant => (score >= 90 ? 'success' : score >= 70 ? 'warning' : 'danger');
const orphanTone = (n: number) => (n > 0 ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-status-success)]');

const trendColumns: Column<TrendSnapshot>[] = [
  { header: 'Date', className: 'py-2 pr-4 text-xs text-[var(--color-text-muted)]', headerClassName: `${HEAD} text-sm`, render: s => new Date(s.timestamp).toLocaleString() },
  { header: 'Score', className: 'py-2 px-3 text-right', headerClassName: HEAD_RIGHT, render: s => <AdminStatusBadge status={scoreStatus(s.score)} label={`${s.score}%`} /> },
  { header: 'Keys', className: `py-2 px-3 text-right ${STRONG}`, headerClassName: HEAD_RIGHT, render: s => s.totalKeys },
  { header: 'Orphans', className: 'py-2 pl-3 text-right', headerClassName: HEAD_RIGHT, render: s => <span className={orphanTone(s.orphanCount)}>{s.orphanCount}</span> },
];

export function HealthTrendsSection({ audit, health, kv }: { audit: AuditData; health: HealthScore; kv: KVAuditData }) {
  const isMobile = useIsMobile();
  const { snapshot, trends, trendsLoaded } = kv;
  const recent = [...trends].reverse().slice(0, 15);
  return (
    <AuditSection title="Health Trends" icon={TrendingUp} count={trends.length} variant="info">
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline" size="sm"
            onClick={() => kv.handleSaveSnapshot(audit, health)}
            disabled={snapshot.busy}
            className={cn('gap-1', BTN)}
          >
            {snapshot.busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save Snapshot
          </Button>
          {!trendsLoaded && (
            <Button variant="outline" size="sm" onClick={kv.loadTrends} className={cn('gap-1', BTN)}>
              <TrendingUp className="w-3 h-3" /> Load History
            </Button>
          )}
        </div>
        <ResultBanner result={snapshot.result} />
        {trendsLoaded && trends.length === 0 && (
          <SectionIntro>No snapshots yet. Save your first snapshot to start tracking trends.</SectionIntro>
        )}
        {trendsLoaded && trends.length > 0 && (
          isMobile ? (
            <div className="divide-y divide-[var(--color-border-default)]">
              {recent.map((s, i) => (
                <div key={i} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">{new Date(s.timestamp).toLocaleString()}</span>
                    <AdminStatusBadge status={scoreStatus(s.score)} label={`${s.score}%`} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Keys: <span className={STRONG}>{s.totalKeys}</span></span>
                    <span className={orphanTone(s.orphanCount)}>Orphans: {s.orphanCount}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AdminDataTable columns={trendColumns} data={recent} getRowKey={(_, i) => String(i)} showToolbar={false} paginate={false} mobileLayout="table" />
          )
        )}
      </div>
    </AuditSection>
  );
}

function PrefixChips({ prefixes }: { prefixes: Record<string, number> }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(prefixes).filter(([, v]) => v > 0).map(([prefix, count]) => (
        <span key={prefix} className="text-xs font-mono bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] px-1.5 py-px rounded-[var(--radius-xs)]">
          {prefix.replace(/:$/, '')}:{count}
        </span>
      ))}
    </div>
  );
}

function UserCell({ u }: { u: UserFootprint }) {
  return (
    <div>
      <span className={STRONG}>{u.email || 'Unknown'}</span>
      <br />
      <span className="text-xs text-[var(--color-text-muted)] font-mono">{u.userId.slice(0, 8)}...</span>
    </div>
  );
}

const footprintColumns: Column<UserFootprint>[] = [
  { header: 'User', className: 'py-2 pr-4', headerClassName: HEAD, render: u => <UserCell u={u} /> },
  { header: 'Keys', className: `py-2 px-4 text-right ${STRONG}`, headerClassName: HEAD_RIGHT, render: u => u.keyCount },
  { header: 'Breakdown', className: 'py-2 pl-4 whitespace-normal', headerClassName: HEAD, render: u => <PrefixChips prefixes={u.prefixes} /> },
];

export function UserFootprintSection({ audit }: { audit: AuditData }) {
  const isMobile = useIsMobile();
  return (
    <AuditSection title="User Data Footprint" icon={Users} count={audit.totalUsers} variant="info">
      <SectionIntro className="mb-3">
        Top users by KV key count. Important for multi-tenant data isolation auditing.
      </SectionIntro>
      {isMobile ? (
        <div className="divide-y divide-[var(--color-border-default)]">
          {audit.userDataFootprint.map(u => (
            <div key={u.userId} className="py-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <UserCell u={u} />
                <span className={STRONG}>{u.keyCount} keys</span>
              </div>
              <PrefixChips prefixes={u.prefixes} />
            </div>
          ))}
        </div>
      ) : (
        <AdminDataTable columns={footprintColumns} data={audit.userDataFootprint} getRowKey={u => u.userId} showToolbar={false} paginate={false} mobileLayout="table" />
      )}
    </AuditSection>
  );
}
