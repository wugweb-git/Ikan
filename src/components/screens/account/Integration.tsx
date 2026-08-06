import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { apiClient } from '../../../lib/api-client';
import { useGoogleFit } from '../../integrations/GoogleFitContext';
import { Activity } from 'lucide-react';

// ─── Font helper ──────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

const cardStyle: React.CSSProperties = {
  borderRadius: '16px',
  border: '1px solid var(--color-border-default)',
  backgroundColor: 'var(--color-bg-card)',
  boxShadow: 'none',
  overflow: 'hidden',
};

// ─── Connected Account Row ─────────────────────────────────────
function IntegrationRow({
  icon,
  name,
  description,
  connected,
  onToggle,
  loading = false,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  connected: boolean;
  onToggle: () => void;
  loading?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--color-border-default)',
        backgroundColor: connected ? 'var(--color-bg-page)' : 'transparent',
      }}
    >
      <div className="flex items-center" style={{ gap: '14px' }}>
        <div className="shrink-0 flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--color-bg-muted)' }}>
          {icon}
        </div>
        <div className="flex flex-col" style={{ gap: '2px' }}>
          <span style={f('sm', 500)}>{name}</span>
          <span style={{ ...f('xs', 400, 'var(--color-text-muted)'), lineHeight: '16px' }}>
            {connected ? 'Connected' : description}
          </span>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={loading}
        className="shrink-0 flex items-center justify-center transition-colors disabled:opacity-50"
        style={{
          height: '36px',
          padding: '0 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 500,
          fontFamily: 'var(--font-family-base)',
          cursor: loading ? 'not-allowed' : 'pointer',
          border: connected ? '1px solid var(--color-status-danger)' : '1px solid var(--color-primary-default)',
          backgroundColor: connected ? 'transparent' : 'var(--color-primary-default)',
          color: connected ? 'var(--color-status-danger)' : 'var(--color-text-inverse)',
        }}
      >
        {loading ? 'Processing...' : connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
export function Integration() {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const { isConnected: isHealthConnected, connect: connectHealth, disconnect: disconnectHealth } = useGoogleFit();
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleHealthToggle = async () => {
    setSyncing('health');
    try {
      if (isHealthConnected) {
        disconnectHealth();
        showToast('success', 'Disconnected', 'Health Connect disconnected.');
      } else {
        connectHealth();
        showToast('success', 'Connected', 'Health Connect linked successfully.');
      }
    } catch (error) {
      showToast('error', 'Error', 'Failed to update Health Connect.');
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="flex flex-col" style={{ gap: '24px' }}>
      {/* Connected Accounts card removed 2026-08-07: "Connect Google/LinkedIn" fell back to a fake
          connection (no real verification) whenever the real Supabase linkIdentity() call failed,
          silently masking real OAuth failures as success — see src/docs/systems/user-accounts.md.
          Health Connect below is unaffected — confirmed fully real, no fake fallback. */}

      {/* Health Connect */}
      <Card className="shadow-none p-0 gap-0" style={cardStyle}>
        <div className="flex items-center" style={{ padding: '20px 24px 16px', gap: '8px' }}>
          <Activity size={20} style={{ color: 'var(--color-text-primary)' }} />
          <h2 style={{ ...f('base', 500), margin: 0 }}>Health Data</h2>
        </div>
        <CardContent className="p-0" style={{ padding: '0 24px 24px' }}>
          <IntegrationRow
            icon={<Activity size={20} style={{ color: 'var(--color-status-success)' }} />}
            name="Health Connect"
            description="Sync sleep, activity & heart rate"
            connected={isHealthConnected}
            onToggle={handleHealthToggle}
            loading={syncing === 'health'}
          />
        </CardContent>
      </Card>
    </div>
  );
}
