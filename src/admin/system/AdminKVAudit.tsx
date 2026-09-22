import { AlertTriangle, Database, Loader2, RefreshCw, Shield, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { AdminPageLayout } from '../shell/AdminPageLayout';
import { AdminLoading } from '../ui/kit/AdminLoading';
import { useKVAuditData } from './kv-audit/useKVAuditData';
import { getHealthScore } from './kv-audit/types';
import { BTN, BTN_PRIMARY } from './kv-audit/KVAuditParts';
import { SchemaSection } from './kv-audit/SchemaSection';
import { GrowthWarningsSection, InconsistenciesSection, OrphansSection, SoftDeletedSection } from './kv-audit/IntegritySections';
import { NamingMigrationSection, PrefixSyncSection, PruneSection, PurgeByPrefixSection, UncategorizedSection } from './kv-audit/MaintenanceSections';
import { HealthTrendsSection, KeyInventorySection, UserFootprintSection } from './kv-audit/InventorySections';

/** KV Database Audit — orphan detection, schema/relation health and maintenance tools. */
export function AdminKVAudit() {
  const kv = useKVAuditData();
  const { audit, auditLoading, auditError, runAudit, schema } = kv;

  const health = getHealthScore(audit);
  const healthColor = health.variant === 'success' ? 'text-[var(--color-status-success)]'
    : health.variant === 'warning' ? 'text-[var(--color-status-warning)]'
    : 'text-[var(--color-status-danger)]';

  return (
    <AdminPageLayout
      title="KV Database Audit"
      description={audit || !auditError
        ? 'Multi-tenant orphan detection and data integrity analysis'
        : 'Scan the key-value store for orphaned and inconsistent data'}
      maxWidth="none"
      loading={auditLoading && !audit}
      loadingFallback={<AdminLoading message="Running KV database audit..." />}
      error={audit ? null : auditError}
      onRetry={runAudit}
      actions={audit && (
        <Button onClick={runAudit} disabled={auditLoading} className={cn('gap-2', BTN, BTN_PRIMARY)}>
          {auditLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Re-scan
        </Button>
      )}
      stats={audit ? [
        { label: 'Total Keys', value: audit.totalKeys, icon: <Database className="w-4 h-4 text-[var(--color-info-default)]" /> },
        { label: 'Orphans', value: audit.orphanCount, icon: <AlertTriangle className={cn('w-4 h-4', audit.orphanCount > 0 ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-status-success)]')} /> },
        { label: 'Users', value: audit.totalUsers, icon: <Users className="w-4 h-4 text-[var(--color-text-muted)]" /> },
        { label: 'Health', value: `${health.score}%`, icon: <Shield className={cn('w-4 h-4', healthColor)} />, trend: health.score >= 90 ? 'up' as const : health.score >= 70 ? 'neutral' as const : 'down' as const },
      ] : undefined}
    >
      {audit && (
        <>
          <p className="text-xs text-[var(--color-text-muted)]">
            Last scanned: {new Date(audit.timestamp).toLocaleString()}
          </p>
          <SchemaSection schema={schema} schemaLoading={kv.schemaLoading} />
          <OrphansSection audit={audit} kv={kv} />
          <InconsistenciesSection audit={audit} />
          <GrowthWarningsSection audit={audit} kv={kv} />
          <SoftDeletedSection audit={audit} />
          <PrefixSyncSection schema={schema} kv={kv} />
          <KeyInventorySection audit={audit} />
          <PruneSection audit={audit} kv={kv} />
          <NamingMigrationSection audit={audit} kv={kv} />
          <HealthTrendsSection audit={audit} health={health} kv={kv} />
          <UncategorizedSection audit={audit} kv={kv} />
          <PurgeByPrefixSection kv={kv} />
          <UserFootprintSection audit={audit} />
        </>
      )}
    </AdminPageLayout>
  );
}
