import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { apiClient } from '../../lib/api-client';
import {
  Database, AlertTriangle, Trash2, RefreshCw, ChevronDown, ChevronRight,
  CheckCircle, XCircle, Users, HardDrive, Search, Shield, Loader2,
  Clock, ArrowRightLeft, TrendingUp, Save
} from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import { AdminLoading } from './AdminLoading';
import { AdminStatusBadge } from './AdminStatusBadge';

interface AuditData {
  timestamp: string;
  totalKeys: number;
  categorized: Record<string, { count: number; samples: { key: string; valuePreview: string }[] }>;
  uncategorizedKeys: { key: string; value: string }[];
  uncategorizedCount: number;
  orphans: { key: string; reason: string; category: string }[];
  orphanCount: number;
  inconsistencies: { issue: string; keys: string[] }[];
  growthWarnings: { prefix: string; count: number; warning: string }[];
  softDeleted: string[];
  softDeletedCount: number;
  userDataFootprint: { userId: string; email?: string; keyCount: number; prefixes: Record<string, number> }[];
  totalUsers: number;
}

interface AdminKVAuditProps {
  onBack?: () => void;
}

// ─── Section wrapper ────────────────────────────────────────────
function AuditSection({ title, icon: Icon, count, variant, children, defaultOpen = false }: {
  title: string;
  icon: React.ElementType;
  count: number;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{
            backgroundColor: variant === 'danger' ? 'var(--color-status-danger-light)' :
                             variant === 'warning' ? 'var(--color-status-warning-light)' :
                             variant === 'success' ? 'var(--color-status-success-light)' :
                             variant === 'info' ? 'var(--color-info-light)' :
                             'var(--color-bg-muted)',
            color: variant === 'danger' ? 'var(--color-status-danger)' :
                   variant === 'warning' ? 'var(--color-status-warning)' :
                   variant === 'success' ? 'var(--color-status-success)' :
                   variant === 'info' ? 'var(--color-info-default)' :
                   'var(--color-text-muted)'
          }}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              {title}
            </span>
          </div>
          <AdminStatusBadge status={variant} label={String(count)} />
        </div>
        {open ? <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} /> :
                <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />}
      </button>
      {open && (
        <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--color-border-default)' }}>
          <div className="pt-4">{children}</div>
        </div>
      )}
    </Card>
  );
}

// ─── Key badge for display ──────────────────────────────────────
function KeyBadge({ keyName }: { keyName: string }) {
  return (
    <code style={{
      fontFamily: 'monospace',
      fontSize: 'var(--text-xs)',
      backgroundColor: 'var(--color-bg-muted)',
      color: 'var(--color-text-primary)',
      padding: '2px 6px',
      borderRadius: 'var(--radius-xs)',
      wordBreak: 'break-all'
    }}>
      {keyName}
    </code>
  );
}

export function AdminKVAudit({ onBack }: AdminKVAuditProps) {
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrphans, setSelectedOrphans] = useState<Set<string>>(new Set());
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);

  // New state for enhanced features
  const [pruneDays, setPruneDays] = useState(30);
  const [pruneLoading, setPruneLoading] = useState(false);
  const [pruneResult, setPruneResult] = useState<string | null>(null);
  const [migrateLoading, setMigrateLoading] = useState(false);
  const [migrateResult, setMigrateResult] = useState<string | null>(null);
  const [snapshotSaving, setSnapshotSaving] = useState(false);
  const [snapshotResult, setSnapshotResult] = useState<string | null>(null);
  const [trends, setTrends] = useState<{ timestamp: string; score: number; totalKeys: number; orphanCount: number }[]>([]);
  const [trendsLoaded, setTrendsLoaded] = useState(false);

  const runAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCleanupResult(null);
    setSelectedOrphans(new Set());
    try {
      const res = await apiClient.runKVAudit();
      setAudit(res.audit);
    } catch (err: any) {
      setError(err?.message || 'Failed to run KV audit');
      console.error('KV Audit error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runAudit();
  }, [runAudit]);

  const toggleOrphan = (key: string) => {
    setSelectedOrphans(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAllOrphans = () => {
    if (!audit) return;
    const all = new Set(audit.orphans.map(o => o.key));
    setSelectedOrphans(all);
  };

  const handleCleanup = async (dryRun: boolean) => {
    if (selectedOrphans.size === 0) return;
    setCleanupLoading(true);
    setCleanupResult(null);
    try {
      const res = await apiClient.cleanupKVKeys(Array.from(selectedOrphans), dryRun);
      if (dryRun) {
        setCleanupResult(`Dry run: Would delete ${res.wouldDelete} key(s). Run again with "Confirm Delete" to proceed.`);
      } else {
        setCleanupResult(`Deleted ${res.deleted} key(s). ${res.failed?.length ? `${res.failed.length} failed.` : ''}`);
        // Re-run audit
        await runAudit();
      }
    } catch (err: any) {
      setCleanupResult(`Error: ${err?.message || 'Cleanup failed'}`);
    } finally {
      setCleanupLoading(false);
    }
  };

  // ─── Compute health score ──────────────────────────────
  const getHealthScore = (): { score: number; label: string; variant: 'success' | 'warning' | 'danger' } => {
    if (!audit) return { score: 100, label: 'Unknown', variant: 'success' };
    let deductions = 0;
    if (audit.orphanCount > 0) deductions += Math.min(audit.orphanCount * 5, 30);
    if (audit.uncategorizedCount > 0) deductions += Math.min(audit.uncategorizedCount * 3, 15);
    if (audit.inconsistencies.length > 0) deductions += audit.inconsistencies.length * 10;
    if (audit.growthWarnings.length > 0) deductions += audit.growthWarnings.length * 5;
    if (audit.softDeletedCount > 0) deductions += Math.min(audit.softDeletedCount * 2, 10);
    const score = Math.max(0, 100 - deductions);
    return {
      score,
      label: score >= 90 ? 'Healthy' : score >= 70 ? 'Needs attention' : 'Action required',
      variant: score >= 90 ? 'success' : score >= 70 ? 'warning' : 'danger'
    };
  };

  if (loading && !audit) {
    return <AdminLoading message="Running KV database audit..." />;
  }

  if (error && !audit) {
    return (
      <div className="space-y-6">
        <AdminHeader title="KV Database Audit" description="Scan the key-value store for orphaned and inconsistent data" onBack={onBack} />
        <Card className="p-6" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-status-danger-light)' }}>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5" style={{ color: 'var(--color-status-danger)' }} />
            <span style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-base)', color: 'var(--color-status-danger)' }}>
              {error}
            </span>
          </div>
          <Button onClick={runAudit} className="mt-4 gap-2" style={{ height: 'var(--ikan-component-button-height)' }}>
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!audit) return null;

  const health = getHealthScore();

  // Sort categories by count descending
  const sortedCategories = Object.entries(audit.categorized).sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="KV Database Audit"
        description="Multi-tenant orphan detection and data integrity analysis"
        onBack={onBack}
        actions={
          <Button
            onClick={runAudit}
            disabled={loading}
            className="gap-2"
            style={{
              height: 'var(--ikan-component-button-height)',
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Re-scan
          </Button>
        }
        stats={[
          { label: 'Total Keys', value: audit.totalKeys, icon: <Database className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} /> },
          { label: 'Orphans', value: audit.orphanCount, icon: <AlertTriangle className="w-4 h-4" style={{ color: audit.orphanCount > 0 ? 'var(--color-status-danger)' : 'var(--color-status-success)' }} /> },
          { label: 'Users', value: audit.totalUsers, icon: <Users className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} /> },
          { label: 'Health', value: `${health.score}%`, icon: <Shield className="w-4 h-4" style={{ color: health.variant === 'success' ? 'var(--color-status-success)' : health.variant === 'warning' ? 'var(--color-status-warning)' : 'var(--color-status-danger)' }} />, trend: health.score >= 90 ? 'up' as const : health.score >= 70 ? 'neutral' as const : 'down' as const },
        ]}
      />

      <p style={{
        fontFamily: 'var(--font-family-base)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-muted)'
      }}>
        Last scanned: {new Date(audit.timestamp).toLocaleString()}
      </p>

      {/* ─── Orphans ────────────────────────────────────────── */}
      <AuditSection
        title="Orphaned Keys"
        icon={AlertTriangle}
        count={audit.orphanCount}
        variant={audit.orphanCount > 0 ? 'danger' : 'success'}
        defaultOpen={audit.orphanCount > 0}
      >
        {audit.orphanCount === 0 ? (
          <div className="flex items-center gap-2" style={{ color: 'var(--color-status-success)' }}>
            <CheckCircle className="w-4 h-4" />
            <span style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }}>No orphaned keys detected</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={selectAllOrphans} style={{ height: 'var(--ikan-component-button-height)', borderRadius: 'var(--radius-md)' }}>
                Select All ({audit.orphanCount})
              </Button>
              <Button
                variant="outline" size="sm"
                onClick={() => handleCleanup(true)}
                disabled={selectedOrphans.size === 0 || cleanupLoading}
                className="gap-1"
                style={{ height: 'var(--ikan-component-button-height)', borderRadius: 'var(--radius-md)' }}
              >
                <Search className="w-3 h-3" /> Dry Run
              </Button>
              <Button
                size="sm"
                onClick={() => handleCleanup(false)}
                disabled={selectedOrphans.size === 0 || cleanupLoading}
                className="gap-1"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-status-danger)',
                  color: 'var(--color-text-inverse)'
                }}
              >
                {cleanupLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Confirm Delete ({selectedOrphans.size})
              </Button>
            </div>
            {cleanupResult && (
              <div className="p-3 rounded-lg" style={{
                backgroundColor: cleanupResult.startsWith('Error') ? 'var(--color-status-danger-light)' : 'var(--color-status-success-light)',
                border: `1px solid ${cleanupResult.startsWith('Error') ? 'var(--color-status-danger)' : 'var(--color-status-success)'}`,
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--text-sm)',
                color: cleanupResult.startsWith('Error') ? 'var(--color-status-danger)' : 'var(--color-status-success)'
              }}>
                {cleanupResult}
              </div>
            )}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {audit.orphans.map((orphan, i) => (
                <label
                  key={`${orphan.key}-${i}`}
                  className="flex items-start gap-3 p-3 rounded-lg cursor-pointer"
                  style={{
                    backgroundColor: selectedOrphans.has(orphan.key) ? 'var(--color-status-danger-light)' : 'var(--color-bg-muted)',
                    border: `1px solid ${selectedOrphans.has(orphan.key) ? 'var(--color-status-danger)' : 'transparent'}`,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedOrphans.has(orphan.key)}
                    onChange={() => toggleOrphan(orphan.key)}
                    style={{ marginTop: '2px', accentColor: 'var(--color-status-danger)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <KeyBadge keyName={orphan.key} />
                    <p style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      marginTop: '4px'
                    }}>
                      {orphan.reason}
                    </p>
                    <AdminStatusBadge status={
                      orphan.category === 'slug-dangling' ? 'warning' :
                      orphan.category === 'index-dangling' ? 'danger' :
                      orphan.category === 'entity-orphan' ? 'danger' :
                      orphan.category === 'user-data-orphan' ? 'warning' :
                      'neutral'
                    } label={orphan.category} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </AuditSection>

      {/* ─── Naming Inconsistencies ──────────────────────────── */}
      <AuditSection
        title="Naming Inconsistencies"
        icon={AlertTriangle}
        count={audit.inconsistencies.length}
        variant={audit.inconsistencies.length > 0 ? 'warning' : 'success'}
        defaultOpen={audit.inconsistencies.length > 0}
      >
        {audit.inconsistencies.length === 0 ? (
          <div className="flex items-center gap-2" style={{ color: 'var(--color-status-success)' }}>
            <CheckCircle className="w-4 h-4" />
            <span style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }}>No naming inconsistencies</span>
          </div>
        ) : (
          <div className="space-y-3">
            {audit.inconsistencies.map((inc, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-status-warning-light)', border: '1px solid var(--color-status-warning)' }}>
                <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                  {inc.issue}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {inc.keys.map(k => <KeyBadge key={k} keyName={k} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </AuditSection>

      {/* ─── Growth Warnings ────────────────────────────────── */}
      <AuditSection
        title="Growth Warnings"
        icon={HardDrive}
        count={audit.growthWarnings.length}
        variant={audit.growthWarnings.length > 0 ? 'warning' : 'success'}
      >
        {audit.growthWarnings.length === 0 ? (
          <div className="flex items-center gap-2" style={{ color: 'var(--color-status-success)' }}>
            <CheckCircle className="w-4 h-4" />
            <span style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }}>All key groups within healthy limits</span>
          </div>
        ) : (
          <div className="space-y-2">
            {audit.growthWarnings.map((w, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-status-warning-light)' }}>
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-status-warning)' }} />
                <div>
                  <KeyBadge keyName={w.prefix} />
                  <span style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                    ({w.count} keys)
                  </span>
                  <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    {w.warning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </AuditSection>

      {/* ─── Soft-Deleted ──────────────────────────────────── */}
      <AuditSection
        title="Soft-Deleted Entities"
        icon={Trash2}
        count={audit.softDeletedCount}
        variant={audit.softDeletedCount > 0 ? 'warning' : 'success'}
      >
        {audit.softDeletedCount === 0 ? (
          <div className="flex items-center gap-2" style={{ color: 'var(--color-status-success)' }}>
            <CheckCircle className="w-4 h-4" />
            <span style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }}>No soft-deleted entities lingering in KV</span>
          </div>
        ) : (
          <div className="space-y-1">
            <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              These entities have <code style={{ fontSize: 'var(--text-xs)' }}>deleted: true</code> but are still stored in KV. Consider hard-deleting.
            </p>
            {audit.softDeleted.map(k => (
              <div key={k} className="py-1"><KeyBadge keyName={k} /></div>
            ))}
          </div>
        )}
      </AuditSection>

      {/* ─── Key Categories (Inventory) ─────────────────────── */}
      <AuditSection
        title="Key Inventory"
        icon={Database}
        count={Object.keys(audit.categorized).length}
        variant="info"
      >
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                <th className="text-left py-2 pr-4" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Prefix</th>
                <th className="text-right py-2 px-4" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Count</th>
                <th className="text-left py-2 pl-4" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map(([prefix, data]) => (
                <tr key={prefix} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                  <td className="py-2 pr-4"><KeyBadge keyName={prefix} /></td>
                  <td className="py-2 px-4 text-right" style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)' }}>
                    {data.count}
                  </td>
                  <td className="py-2 pl-4">
                    <AdminStatusBadge status={
                      prefix.startsWith('user:') || prefix.startsWith('journal') || prefix.startsWith('enrollment') || prefix.startsWith('progress') || prefix.startsWith('tracker')
                        ? 'info' : prefix.startsWith('audit:') || prefix.startsWith('backup') ? 'neutral' : 'primary'
                    } label={
                      prefix.startsWith('user:') || prefix.startsWith('journal') || prefix.startsWith('enrollment') || prefix.startsWith('progress') || prefix.startsWith('tracker')
                        ? 'User Data' : prefix.startsWith('audit:') ? 'Audit Trail' : prefix.startsWith('backup') ? 'System' : prefix.startsWith('idx_') ? 'Index' : prefix.endsWith('_slug:') || prefix.endsWith('_key:')
                        ? 'Lookup' : 'Content'
                    } />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AuditSection>

      {/* ─── Audit Trail Pruning ─────────────────────────────── */}
      <AuditSection
        title="Audit Trail Pruning"
        icon={Clock}
        count={audit.categorized['audit:']?.count || 0}
        variant={(audit.categorized['audit:']?.count || 0) > 100 ? 'warning' : 'info'}
      >
        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
          Prune audit trail entries older than a specified number of days. Uses dry run by default.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>Older than</span>
            <select
              value={pruneDays}
              onChange={e => setPruneDays(Number(e.target.value))}
              style={{
                fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)',
                padding: '6px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-default)',
                backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)'
              }}
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
          <Button
            variant="outline" size="sm"
            onClick={async () => {
              setPruneLoading(true); setPruneResult(null);
              try {
                const res = await apiClient.pruneAuditTrail(pruneDays, true);
                setPruneResult(`Dry run: ${res.wouldPrune} of ${res.total} audit keys would be pruned (before ${new Date(res.cutoffDate).toLocaleDateString()}).`);
              } catch (err: any) { setPruneResult(`Error: ${err?.message}`); }
              finally { setPruneLoading(false); }
            }}
            disabled={pruneLoading}
            className="gap-1"
            style={{ height: 'var(--ikan-component-button-height)', borderRadius: 'var(--radius-md)' }}
          >
            <Search className="w-3 h-3" /> Dry Run
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              setPruneLoading(true); setPruneResult(null);
              try {
                const res = await apiClient.pruneAuditTrail(pruneDays, false);
                setPruneResult(`Pruned ${res.pruned} of ${res.total} audit keys.`);
                await runAudit();
              } catch (err: any) { setPruneResult(`Error: ${err?.message}`); }
              finally { setPruneLoading(false); }
            }}
            disabled={pruneLoading}
            className="gap-1"
            style={{
              height: 'var(--ikan-component-button-height)', borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-status-warning)', color: 'var(--color-text-inverse)'
            }}
          >
            {pruneLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Prune Now
          </Button>
        </div>
        {pruneResult && (
          <div className="p-3 rounded-lg mt-3" style={{
            backgroundColor: pruneResult.startsWith('Error') ? 'var(--color-status-danger-light)' : 'var(--color-status-success-light)',
            border: `1px solid ${pruneResult.startsWith('Error') ? 'var(--color-status-danger)' : 'var(--color-status-success)'}`,
            fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)',
            color: pruneResult.startsWith('Error') ? 'var(--color-status-danger)' : 'var(--color-status-success)'
          }}>
            {pruneResult}
          </div>
        )}
      </AuditSection>

      {/* ─── Naming Migration Helper ──────────────────────────── */}
      {audit.inconsistencies.length > 0 && (
        <AuditSection
          title="Naming Migration"
          icon={ArrowRightLeft}
          count={audit.inconsistencies.length}
          variant="info"
        >
          <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
            Resolve naming inconsistencies by migrating all keys from one prefix to another. Always dry-run first.
          </p>
          <div className="space-y-3">
            {audit.inconsistencies.map((inc, i) => {
              const prefixMatch = inc.issue.match(/(\S+:)\s.*and\s(\S+:)/);
              const fromPfx = prefixMatch ? prefixMatch[1] : '';
              const toPfx = prefixMatch ? prefixMatch[2] : '';
              return (
                <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <KeyBadge keyName={fromPfx} />
                    <ArrowRightLeft className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                    <KeyBadge keyName={toPfx} />
                    <div className="flex gap-2 ml-auto">
                      <Button
                        variant="outline" size="sm"
                        onClick={async () => {
                          setMigrateLoading(true); setMigrateResult(null);
                          try {
                            const res = await apiClient.migrateNaming(fromPfx, toPfx, true);
                            setMigrateResult(`Dry run: Would migrate ${res.wouldMigrate} key(s) from "${fromPfx}" to "${toPfx}".`);
                          } catch (err: any) { setMigrateResult(`Error: ${err?.message}`); }
                          finally { setMigrateLoading(false); }
                        }}
                        disabled={migrateLoading || !fromPfx}
                        className="gap-1"
                        style={{ height: 'var(--ikan-component-button-height)', borderRadius: 'var(--radius-md)' }}
                      >
                        <Search className="w-3 h-3" /> Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          setMigrateLoading(true); setMigrateResult(null);
                          try {
                            const res = await apiClient.migrateNaming(fromPfx, toPfx, false);
                            setMigrateResult(`Migrated ${res.migrated} key(s). ${res.errors ? `${res.errors.length} errors.` : ''}`);
                            await runAudit();
                          } catch (err: any) { setMigrateResult(`Error: ${err?.message}`); }
                          finally { setMigrateLoading(false); }
                        }}
                        disabled={migrateLoading || !fromPfx}
                        className="gap-1"
                        style={{
                          height: 'var(--ikan-component-button-height)', borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)'
                        }}
                      >
                        {migrateLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRightLeft className="w-3 h-3" />}
                        Migrate
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {migrateResult && (
            <div className="p-3 rounded-lg mt-3" style={{
              backgroundColor: migrateResult.startsWith('Error') ? 'var(--color-status-danger-light)' : 'var(--color-status-success-light)',
              border: `1px solid ${migrateResult.startsWith('Error') ? 'var(--color-status-danger)' : 'var(--color-status-success)'}`,
              fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)',
              color: migrateResult.startsWith('Error') ? 'var(--color-status-danger)' : 'var(--color-status-success)'
            }}>
              {migrateResult}
            </div>
          )}
        </AuditSection>
      )}

      {/* ─── Health Trends ───────────────────────────────────── */}
      <AuditSection
        title="Health Trends"
        icon={TrendingUp}
        count={trends.length}
        variant="info"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline" size="sm"
              onClick={async () => {
                setSnapshotSaving(true); setSnapshotResult(null);
                try {
                  await apiClient.saveAuditSnapshot({
                    score: health.score,
                    totalKeys: audit.totalKeys,
                    orphanCount: audit.orphanCount,
                    inconsistencyCount: audit.inconsistencies.length,
                    growthWarningCount: audit.growthWarnings.length,
                    softDeletedCount: audit.softDeletedCount,
                    uncategorizedCount: audit.uncategorizedCount
                  });
                  setSnapshotResult('Snapshot saved successfully.');
                  const tRes = await apiClient.getAuditTrends();
                  setTrends(tRes.snapshots || []);
                  setTrendsLoaded(true);
                } catch (err: any) { setSnapshotResult(`Error: ${err?.message}`); }
                finally { setSnapshotSaving(false); }
              }}
              disabled={snapshotSaving}
              className="gap-1"
              style={{ height: 'var(--ikan-component-button-height)', borderRadius: 'var(--radius-md)' }}
            >
              {snapshotSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save Snapshot
            </Button>
            {!trendsLoaded && (
              <Button
                variant="outline" size="sm"
                onClick={async () => {
                  try {
                    const res = await apiClient.getAuditTrends();
                    setTrends(res.snapshots || []);
                    setTrendsLoaded(true);
                  } catch (err: any) { console.error('Load trends error:', err); }
                }}
                className="gap-1"
                style={{ height: 'var(--ikan-component-button-height)', borderRadius: 'var(--radius-md)' }}
              >
                <TrendingUp className="w-3 h-3" /> Load History
              </Button>
            )}
          </div>
          {snapshotResult && (
            <div className="p-3 rounded-lg" style={{
              backgroundColor: snapshotResult.startsWith('Error') ? 'var(--color-status-danger-light)' : 'var(--color-status-success-light)',
              border: `1px solid ${snapshotResult.startsWith('Error') ? 'var(--color-status-danger)' : 'var(--color-status-success)'}`,
              fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)',
              color: snapshotResult.startsWith('Error') ? 'var(--color-status-danger)' : 'var(--color-status-success)'
            }}>
              {snapshotResult}
            </div>
          )}
          {trendsLoaded && trends.length === 0 && (
            <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              No snapshots yet. Save your first snapshot to start tracking trends.
            </p>
          )}
          {trendsLoaded && trends.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                    <th className="text-left py-2 pr-4" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Date</th>
                    <th className="text-right py-2 px-3" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Score</th>
                    <th className="text-right py-2 px-3" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Keys</th>
                    <th className="text-right py-2 pl-3" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Orphans</th>
                  </tr>
                </thead>
                <tbody>
                  {[...trends].reverse().slice(0, 15).map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                      <td className="py-2 pr-4" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                        {new Date(s.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <AdminStatusBadge
                          status={s.score >= 90 ? 'success' : s.score >= 70 ? 'warning' : 'danger'}
                          label={`${s.score}%`}
                        />
                      </td>
                      <td className="py-2 px-3 text-right" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                        {s.totalKeys}
                      </td>
                      <td className="py-2 pl-3 text-right" style={{ color: s.orphanCount > 0 ? 'var(--color-status-danger)' : 'var(--color-status-success)' }}>
                        {s.orphanCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AuditSection>

      {/* ─── Uncategorized Keys ──────────────────────────────── */}
      {audit.uncategorizedCount > 0 && (
        <AuditSection
          title="Uncategorized Keys"
          icon={Search}
          count={audit.uncategorizedCount}
          variant="warning"
        >
          <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            These keys don't match any known prefix pattern. They may be stale or from deprecated features.
          </p>
          <div className="space-y-1">
            {audit.uncategorizedKeys.map(k => (
              <div key={k.key} className="flex items-center gap-2 py-1">
                <KeyBadge keyName={k.key} />
                <span style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {k.value}
                </span>
              </div>
            ))}
            {audit.uncategorizedCount > 50 && (
              <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                ... and {audit.uncategorizedCount - 50} more
              </p>
            )}
          </div>
        </AuditSection>
      )}

      {/* ─── User Data Footprint (Multi-Tenant) ─────────────── */}
      <AuditSection
        title="User Data Footprint"
        icon={Users}
        count={audit.totalUsers}
        variant="info"
      >
        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
          Top users by KV key count. Important for multi-tenant data isolation auditing.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                <th className="text-left py-2 pr-4" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>User</th>
                <th className="text-right py-2 px-4" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Keys</th>
                <th className="text-left py-2 pl-4" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {audit.userDataFootprint.map(u => (
                <tr key={u.userId} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                  <td className="py-2 pr-4">
                    <div>
                      <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                        {u.email || 'Unknown'}
                      </span>
                      <br />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                        {u.userId.slice(0, 8)}...
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                    {u.keyCount}
                  </td>
                  <td className="py-2 pl-4">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(u.prefixes).filter(([, v]) => v > 0).map(([prefix, count]) => (
                        <span key={prefix} style={{
                          fontSize: 'var(--text-xs)',
                          backgroundColor: 'var(--color-bg-muted)',
                          color: 'var(--color-text-muted)',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-xs)',
                          fontFamily: 'monospace'
                        }}>
                          {prefix.replace(/:$/, '')}:{count}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AuditSection>
    </div>
  );
}