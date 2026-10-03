import { CircleCheck, CircleX, Database, Loader2 } from 'lucide-react';
import { cn } from '../../ui/utils';
import { AdminDataTable, type Column } from '../../ui/kit/AdminDataTable';
import { AuditSection } from './KVAuditParts';
import type { SchemaData, SchemaEntry, SchemaRelation } from './types';

/** Schema & Relations: registry, live counts and parent → child relation health. */

const CELL = 'text-xs px-[10px] py-2';
const NUM = `${CELL} text-right tabular-nums`;
const HEAD = 'text-[var(--color-text-muted)] font-bold';
const HEAD_RIGHT = `${HEAD} [&>div]:justify-end`;

const relationColumns: Column<SchemaRelation>[] = [
  {
    header: 'Relation', className: `${CELL} whitespace-nowrap`, headerClassName: HEAD,
    render: r => (
      <span className="inline-flex items-center gap-1.5">
        {r.healthy
          ? <CircleCheck className="w-3 h-3 text-[var(--color-status-success)]" />
          : <CircleX className="w-3 h-3 text-[var(--color-status-danger)]" />}
        {r.label}
      </span>
    ),
  },
  { header: 'Join field', className: `${CELL} text-[var(--color-text-muted)] font-mono`, headerClassName: `${HEAD} font-sans`, render: r => r.joinFields[0] },
  { header: 'Children', className: NUM, headerClassName: HEAD_RIGHT, render: r => r.childCount },
  { header: 'Parents', className: NUM, headerClassName: HEAD_RIGHT, render: r => r.parentCount },
  { header: 'No ref', className: NUM, headerClassName: HEAD_RIGHT, render: r => <span className={r.missingRef ? 'text-[var(--color-status-warning)]' : undefined}>{r.missingRef}</span> },
  { header: 'Exempt', className: `${NUM} text-[var(--color-text-muted)]`, headerClassName: HEAD_RIGHT, render: r => r.exempt },
  {
    header: 'Dangling', className: NUM, headerClassName: HEAD_RIGHT,
    render: r => <span className={r.dangling ? 'font-semibold text-[var(--color-status-danger)]' : undefined}>{r.dangling}</span>,
  },
];

const RISK_TONE: Record<string, string> = {
  high: 'bg-[var(--color-status-danger-light)] text-[var(--color-status-danger)]',
  medium: 'bg-[var(--color-status-warning-light)] text-[var(--color-status-warning)]',
};

function registryColumns(liveCounts: Record<string, number>): Column<SchemaEntry>[] {
  return [
    { header: 'Prefix', className: `${CELL} font-mono whitespace-nowrap`, headerClassName: `${HEAD} font-sans`, render: s => s.prefix },
    {
      header: 'Live', className: NUM, headerClassName: HEAD_RIGHT,
      render: s => {
        const n = liveCounts[s.prefix] ?? 0;
        return <span className={n === 0 ? 'text-[var(--color-text-muted)]' : undefined}>{n}</span>;
      },
    },
    { header: 'Category', className: `${CELL} whitespace-normal text-[var(--color-text-muted)]`, headerClassName: HEAD, render: s => s.category },
    { header: 'Owner', className: `${CELL} whitespace-nowrap text-[var(--color-text-muted)]`, headerClassName: HEAD, render: s => s.owner },
    {
      header: 'Risk', className: CELL, headerClassName: HEAD,
      render: s => (
        <span className={cn('text-xs px-2 py-0.5 rounded-[var(--radius-pill)]', RISK_TONE[s.orphanRisk] ?? 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]')}>
          {s.orphanRisk}
        </span>
      ),
    },
  ];
}

export function SchemaSection({ schema, schemaLoading }: { schema: SchemaData | null; schemaLoading: boolean }) {
  const unhealthy = schema?.relations.some(r => !r.healthy) || (schema?.unregisteredPrefixes.length ?? 0) > 0;
  return (
    <AuditSection
      title="Schema & Relations"
      icon={Database}
      count={schema?.totalPrefixes ?? 0}
      variant={unhealthy ? 'warning' : 'success'}
    >
      {schemaLoading && !schema ? (
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading schema…</span>
        </div>
      ) : !schema ? (
        <p className="text-sm text-[var(--color-text-muted)]">Schema unavailable.</p>
      ) : (
        <div className="space-y-6">

          {/* Relations — how records actually link, and whether they hold */}
          <div>
            <p className="text-sm font-semibold mb-1">Parent → child relations</p>
            <p className="text-xs text-[var(--color-text-muted)] mb-3">
              Joined on value fields, not key structure. "Exempt" are references that legitimately have no parent record.
            </p>
            <AdminDataTable
              columns={relationColumns}
              data={schema.relations}
              getRowKey={r => r.label}
              showToolbar={false}
              paginate={false}
              mobileLayout="table"
            />
          </div>

          {/* Unregistered prefixes — the exact condition that caused the purge incident */}
          {schema.unregisteredPrefixes.length > 0 && (
            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-status-warning-light)]">
              <p className="text-sm font-semibold text-[var(--color-status-warning)] mb-1.5">
                {schema.unregisteredPrefixes.length} unregistered prefix{schema.unregisteredPrefixes.length === 1 ? '' : 'es'}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                Live keys with no KEY_REGISTRY entry. Register each one — unregistered prefixes are what the purge tool
                offers to delete as "uncategorised", which is how the assessment slug index was lost.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {schema.unregisteredPrefixes.map(u => (
                  <span key={u.prefix} className="font-mono text-xs px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--color-bg-card)]">
                    {u.prefix} ({u.count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Registry */}
          <div>
            <p className="text-sm font-semibold mb-3">Registry ({schema.totalPrefixes} prefixes)</p>
            <AdminDataTable
              columns={registryColumns(schema.liveCounts)}
              data={schema.schema}
              getRowKey={s => s.prefix}
              showToolbar={false}
              paginate={false}
              mobileLayout="table"
              maxHeight={420}
            />
          </div>
        </div>
      )}
    </AuditSection>
  );
}
