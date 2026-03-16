import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { Activity, CircleCheck, CircleAlert, RefreshCw, Trash2, Search, ShieldAlert } from 'lucide-react';
import { AdminHeader } from './AdminHeader';

interface HealthResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  duration?: number;
  count?: number;
}

interface SuspectItem {
  id: string;
  title: string;
  type: 'assessment' | 'resource' | 'professional' | 'equip';
  reason: string;
  raw?: any;
}

// Patterns that indicate test/CRUD/demo/seed data
const TEST_PATTERNS = [
  /\btest\b/i, /\bcrud\b/i, /\bdemo\b/i, /\bsample\b/i,
  /\bfake\b/i, /\bdummy\b/i, /\bplaceholder\b/i, /\btesting\b/i,
  /\bexample\b/i, /\bfoo\b/i, /\bbar\b/i, /\bbaz\b/i,
  /\blorem\s?ipsum/i, /\babc123\b/i, /\bseed\b/i
];

function isSuspect(text: string | undefined | null): string | null {
  if (!text) return null;
  for (const pattern of TEST_PATTERNS) {
    if (pattern.test(text)) {
      return `Matches "${pattern.source}"`;
    }
  }
  return null;
}

export function AdminCRUDTesting({ onBack }: { onBack?: () => void }) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<{
    status: string;
    latency: string;
    timestamp: string;
    serverTime?: string;
  } | null>(null);
  const [results, setResults] = useState<HealthResult[]>([]);
  const [suspects, setSuspects] = useState<SuspectItem[]>([]);
  const [scanComplete, setScanComplete] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const start = performance.now();
      const result = await apiClient.healthCheck();
      const duration = performance.now() - start;

      setHealthData({
        status: result.status === 'ok' ? 'Healthy' : 'Unhealthy',
        latency: `${Math.round(duration)}ms`,
        timestamp: new Date().toISOString(),
        serverTime: result.timestamp
      });

      if (result.status === 'ok') {
        showToast('success', 'Health Check', 'System is operational');
      } else {
        showToast('error', 'Health Check', 'System is reporting issues');
      }
    } catch (err) {
      setHealthData({ status: 'Error', latency: '-', timestamp: new Date().toISOString() });
      showToast('error', 'Health Check Failed', String(err));
    } finally {
      setLoading(false);
    }
  };

  const runReadOnlyAudit = async () => {
    setLoading(true);
    const auditResults: HealthResult[] = [];

    // Health check
    const healthStart = performance.now();
    try {
      const result = await apiClient.healthCheck();
      const duration = performance.now() - healthStart;
      setHealthData({
        status: result.status === 'ok' ? 'Healthy' : 'Unhealthy',
        latency: `${Math.round(duration)}ms`,
        timestamp: new Date().toISOString(),
        serverTime: result.timestamp
      });
      auditResults.push({
        name: 'API Health Check',
        status: 'success',
        message: `Server responded in ${Math.round(duration)}ms`,
        duration: Math.round(duration)
      });
    } catch (err) {
      auditResults.push({
        name: 'API Health Check',
        status: 'error',
        message: `Health check failed: ${err instanceof Error ? err.message : String(err)}`,
        duration: Math.round(performance.now() - healthStart)
      });
    }

    // Read-only entity counts
    const entities: { name: string; label: string; fetcher: () => Promise<unknown[]> }[] = [
      { name: 'assessments', label: 'Assessments', fetcher: () => apiClient.getAssessments() },
      { name: 'equip', label: 'Equip Programs', fetcher: () => apiClient.getEquipPrograms() },
      { name: 'resources', label: 'Resources', fetcher: () => apiClient.getResources() },
      { name: 'professionals', label: 'Professionals', fetcher: () => apiClient.getProfessionals() },
    ];

    for (const entity of entities) {
      const start = performance.now();
      try {
        const data = await entity.fetcher();
        const duration = performance.now() - start;
        const count = Array.isArray(data) ? data.length : 0;
        auditResults.push({
          name: `Read ${entity.label}`,
          status: 'success',
          message: `Found ${count} ${entity.label.toLowerCase()} (${Math.round(duration)}ms)`,
          duration: Math.round(duration),
          count
        });
      } catch (err) {
        auditResults.push({
          name: `Read ${entity.label}`,
          status: 'error',
          message: `Failed to read ${entity.label.toLowerCase()}: ${err instanceof Error ? err.message : String(err)}`,
          duration: Math.round(performance.now() - start)
        });
      }
    }

    setResults(auditResults);
    setLoading(false);

    const successCount = auditResults.filter(r => r.status === 'success').length;
    if (successCount === auditResults.length) {
      showToast('success', 'System Audit Complete', `All ${successCount} checks passed`);
    } else {
      showToast('error', 'System Audit', `${successCount}/${auditResults.length} checks passed`);
    }
  };

  // Scan all entities for test/CRUD/demo data
  const scanForTestData = async () => {
    setScanning(true);
    setScanComplete(false);
    const found: SuspectItem[] = [];

    try {
      // Scan assessments
      try {
        const assessments: any[] = await apiClient.getAssessments();
        for (const a of assessments) {
          const titleMatch = isSuspect(a.title);
          const descMatch = isSuspect(a.description);
          if (titleMatch || descMatch) {
            found.push({
              id: a.id,
              title: a.title || a.id,
              type: 'assessment',
              reason: titleMatch || descMatch || 'Suspect pattern',
              raw: a
            });
          }
        }
      } catch (err) {
        console.error('Scan assessments error:', err);
      }

      // Scan resources
      try {
        const resources: any[] = await apiClient.getResources();
        for (const r of resources) {
          const titleMatch = isSuspect(r.title);
          const descMatch = isSuspect(r.description);
          if (titleMatch || descMatch) {
            found.push({
              id: r.id,
              title: r.title || r.id,
              type: 'resource',
              reason: titleMatch || descMatch || 'Suspect pattern',
              raw: r
            });
          }
        }
      } catch (err) {
        console.error('Scan resources error:', err);
      }

      // Scan professionals
      try {
        const profResult = await apiClient.getProfessionals();
        const professionals: any[] = profResult.professionals || [];
        for (const p of professionals) {
          const nameMatch = isSuspect(p.name);
          const bioMatch = isSuspect(p.bio || p.description);
          if (nameMatch || bioMatch) {
            found.push({
              id: p.id || p.professional_id,
              title: p.name || p.id,
              type: 'professional',
              reason: nameMatch || bioMatch || 'Suspect pattern',
              raw: p
            });
          }
        }
      } catch (err) {
        console.error('Scan professionals error:', err);
      }

      // Scan equip programs
      try {
        const programs: any[] = await apiClient.getEquipPrograms();
        for (const ep of programs) {
          const titleMatch = isSuspect(ep.title);
          const descMatch = isSuspect(ep.description);
          if (titleMatch || descMatch) {
            found.push({
              id: ep.id,
              title: ep.title || ep.id,
              type: 'equip',
              reason: titleMatch || descMatch || 'Suspect pattern',
              raw: ep
            });
          }
        }
      } catch (err) {
        console.error('Scan equip programs error:', err);
      }

      setSuspects(found);
      setScanComplete(true);

      if (found.length === 0) {
        showToast('success', 'Scan Complete', 'No test/demo data found across all entities');
      } else {
        showToast('warning', 'Suspect Data Found', `${found.length} item(s) matched test/demo patterns`);
      }
    } catch (err) {
      showToast('error', 'Scan Failed', String(err));
    } finally {
      setScanning(false);
    }
  };

  // Delete a suspect item
  const deleteSuspect = async (item: SuspectItem) => {
    const confirmMsg = `Delete ${item.type} "${item.title}"? This cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    setDeleting(item.id);
    try {
      switch (item.type) {
        case 'assessment':
          await apiClient.deleteAssessment(item.id);
          break;
        case 'resource':
          await apiClient.deleteResource(item.id);
          break;
        case 'professional':
          await apiClient.deleteProfessional(item.id);
          break;
        case 'equip':
          await apiClient.deleteEquipProgram(item.id);
          break;
      }
      setSuspects(prev => prev.filter(s => s.id !== item.id));
      showToast('success', 'Deleted', `Removed ${item.type}: ${item.title}`);
    } catch (err) {
      showToast('error', 'Delete Failed', `Failed to delete ${item.title}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDeleting(null);
    }
  };

  // Purge all suspects
  const purgeAll = async () => {
    if (suspects.length === 0) return;
    const confirmMsg = `Delete ALL ${suspects.length} suspect items? This cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    setDeleting('all');
    let deleted = 0;
    let failed = 0;

    for (const item of [...suspects]) {
      try {
        switch (item.type) {
          case 'assessment':
            await apiClient.deleteAssessment(item.id);
            break;
          case 'resource':
            await apiClient.deleteResource(item.id);
            break;
          case 'professional':
            await apiClient.deleteProfessional(item.id);
            break;
          case 'equip':
            await apiClient.deleteEquipProgram(item.id);
            break;
        }
        deleted++;
        setSuspects(prev => prev.filter(s => s.id !== item.id));
      } catch {
        failed++;
      }
    }

    showToast(
      failed === 0 ? 'success' : 'warning',
      'Purge Complete',
      `Deleted ${deleted} item(s)${failed > 0 ? `, ${failed} failed` : ''}`
    );
    setDeleting(null);
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const entityResults = results.filter(r => r.name.startsWith('Read'));

  const typeLabel: Record<string, string> = {
    assessment: 'Assessment',
    resource: 'Resource',
    professional: 'Professional',
    equip: 'Equip Program'
  };

  const typeColor: Record<string, string> = {
    assessment: 'var(--color-chart-1, #6366f1)',
    resource: 'var(--color-chart-2, #22c55e)',
    professional: 'var(--color-chart-3, #f59e0b)',
    equip: 'var(--color-chart-4, #ef4444)'
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="System Health"
        description="Read-only system health checks, entity audits, and test data scanner. No data is created or modified automatically."
        onBack={onBack}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={checkHealth}
              disabled={loading || scanning}
              variant="outline"
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                fontWeight: 'var(--font-weight-medium)',
                gap: 'var(--spacing-2)'
              }}
            >
              <Activity className="w-4 h-4" /> Health Check
            </Button>
            <Button
              onClick={runReadOnlyAudit}
              disabled={loading || scanning}
              variant="outline"
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                fontWeight: 'var(--font-weight-medium)',
                gap: 'var(--spacing-2)'
              }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              System Audit
            </Button>
            <Button
              onClick={scanForTestData}
              disabled={loading || scanning}
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                fontWeight: 'var(--font-weight-medium)',
                gap: 'var(--spacing-2)',
                backgroundColor: 'var(--color-status-warning)',
                color: 'var(--color-text-primary)'
              }}
            >
              <Search className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? 'Scanning...' : 'Scan for Test Data'}
            </Button>
          </div>
        }
      />

      {/* Health Status Cards */}
      {healthData && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader className="pb-2">
              <CardTitle style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2"
                style={{ color: healthData.status === 'Healthy' ? 'var(--color-status-success)' : 'var(--color-status-danger)' }}
              >
                {healthData.status === 'Healthy' ?
                  <CircleCheck className="w-5 h-5" /> :
                  <CircleAlert className="w-5 h-5" />
                }
                <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                  {healthData.status}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader className="pb-2">
              <CardTitle style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Latency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                {healthData.latency}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader className="pb-2">
              <CardTitle style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Last Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {new Date(healthData.timestamp).toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader className="pb-2">
              <CardTitle style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Server Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {healthData.serverTime ? new Date(healthData.serverTime).toLocaleTimeString() : '-'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Entity Count Summary */}
      {entityResults.length > 0 && (
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardHeader>
            <CardTitle style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Content Summary
            </CardTitle>
            <CardDescription>
              Current entity counts from the database (read-only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {entityResults.map((result) => (
                <div
                  key={result.name}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-1)'
                  }}>
                    {result.name.replace('Read ', '')}
                  </p>
                  <p style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: result.status === 'success' ? 'var(--color-text-primary)' : 'var(--color-status-danger)'
                  }}>
                    {result.status === 'success' ? (result.count ?? 0) : '—'}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                    {result.duration}ms
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Data Scan Results */}
      {scanComplete && (
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  <ShieldAlert className="w-5 h-5" style={{ color: suspects.length > 0 ? 'var(--color-status-warning)' : 'var(--color-status-success)' }} />
                  Test Data Scan Results
                </CardTitle>
                <CardDescription>
                  {suspects.length === 0
                    ? 'No test/demo/CRUD data detected. Your database is clean.'
                    : `Found ${suspects.length} item(s) matching test/demo patterns (test, demo, sample, fake, crud, placeholder, lorem ipsum, etc.)`
                  }
                </CardDescription>
              </div>
              {suspects.length > 0 && (
                <Button
                  onClick={purgeAll}
                  disabled={!!deleting}
                  variant="outline"
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)',
                    fontWeight: 'var(--font-weight-medium)',
                    gap: 'var(--spacing-2)',
                    borderColor: 'var(--color-status-danger)',
                    color: 'var(--color-status-danger)'
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting === 'all' ? 'Purging...' : `Purge All (${suspects.length})`}
                </Button>
              )}
            </div>
          </CardHeader>
          {suspects.length > 0 && (
            <CardContent>
              <div className="space-y-2">
                {suspects.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center justify-between p-3 rounded-lg gap-3"
                    style={{
                      backgroundColor: 'var(--color-status-warning-light, #fefce8)',
                      border: '1px solid var(--color-status-warning, #f59e0b)',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span
                        className="shrink-0 px-2 py-1 rounded text-xs"
                        style={{
                          fontWeight: 'var(--font-weight-medium)',
                          backgroundColor: typeColor[item.type],
                          color: 'white',
                          fontFamily: 'var(--font-family-base)'
                        }}
                      >
                        {typeLabel[item.type]}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate" style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-family-base)'
                        }}>
                          {item.title}
                        </p>
                        <p className="truncate" style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-family-base)'
                        }}>
                          ID: {item.id} · {item.reason}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSuspect(item)}
                      disabled={!!deleting}
                      className="shrink-0"
                      style={{
                        color: 'var(--color-status-danger)',
                        gap: 'var(--spacing-1)'
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleting === item.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Detailed Audit Results */}
      {results.length > 0 && (
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardHeader>
            <CardTitle style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Audit Results
            </CardTitle>
            <CardDescription>
              {successCount} / {results.length} checks passed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={result.name}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{
                    backgroundColor: result.status === 'success' ? 'var(--color-status-success-light)' : 'var(--color-status-danger-light)',
                    border: `1px solid ${result.status === 'success' ? 'var(--color-status-success)' : 'var(--color-status-danger)'}`,
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {result.status === 'success' ?
                      <CircleCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--color-status-success)' }} /> :
                      <CircleAlert className="w-4 h-4 shrink-0" style={{ color: 'var(--color-status-danger)' }} />
                    }
                    <div className="min-w-0">
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)'
                      }}>
                        {result.name}
                      </span>
                      <p className="truncate" style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                        marginTop: '2px'
                      }}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                  {result.duration != null && (
                    <span className="shrink-0 ml-2" style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      fontFamily: 'monospace'
                    }}>
                      {result.duration}ms
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Notice */}
      {results.length === 0 && !healthData && !scanComplete && (
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="py-12 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <h3 style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-lg)', marginBottom: 'var(--spacing-2)' }}>
              System Health Monitor
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: '480px', margin: '0 auto' }}>
              Run a <strong>System Audit</strong> to check API connectivity and entity counts, or
              use <strong>Scan for Test Data</strong> to find and delete leftover CRUD/demo/test content
              that may have been published to users. All reads are safe — writes only happen when you
              explicitly confirm a delete.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}