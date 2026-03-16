import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { apiClient } from '../../../lib/api-client';
import { useGoogleFit } from '../../integrations/GoogleFitContext';
import { Link2, Activity } from 'lucide-react';

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

// ─── Brand Icons ───────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2" />
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="var(--color-text-primary)" />
  </svg>
);

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

  const isGoogleConnected = (user as any)?.googleConnected || false;
  const isLinkedInConnected = (user as any)?.linkedinConnected || false;

  const handleSocialToggle = async (provider: 'google' | 'linkedin') => {
    const connected = provider === 'google' ? isGoogleConnected : isLinkedInConnected;
    const action = connected ? 'disconnect' : 'connect';
    setSyncing(provider);
    try {
      if (action === 'connect') {
        try {
          const supabaseProvider = provider === 'linkedin' ? 'linkedin_oidc' : 'google';
          await apiClient.linkSocialAccount(supabaseProvider as any);
          return;
        } catch {
          await apiClient.connectSocialAccount(provider);
          showToast('success', 'Connected', `Successfully connected to ${provider === 'google' ? 'Google' : 'LinkedIn'}`);
        }
      } else {
        try {
          const identities = await apiClient.getLinkedIdentities();
          const identity = identities.find((i: any) =>
            i.provider === provider || i.provider === (provider === 'linkedin' ? 'linkedin_oidc' : provider)
          );
          if (identity) {
            await apiClient.unlinkSocialAccount(identity.id);
            showToast('success', 'Disconnected', `Disconnected from ${provider === 'google' ? 'Google' : 'LinkedIn'}`);
            return;
          }
        } catch { /* fallback */ }
        await apiClient.disconnectSocialAccount(provider);
        showToast('success', 'Disconnected', `Disconnected from ${provider === 'google' ? 'Google' : 'LinkedIn'}`);
      }
    } catch (error) {
      console.error(`Failed to ${action} ${provider}:`, error);
      showToast('error', 'Error', `Failed to ${action} ${provider === 'google' ? 'Google' : 'LinkedIn'}.`);
    } finally {
      setSyncing(null);
    }
  };

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
      {/* Connected Accounts */}
      <Card className="shadow-none p-0 gap-0" style={cardStyle}>
        <div className="flex items-center" style={{ padding: '20px 24px 16px', gap: '8px' }}>
          <Link2 size={20} style={{ color: 'var(--color-text-primary)' }} />
          <h2 style={{ ...f('base', 500), margin: 0 }}>Connected Accounts</h2>
        </div>
        <CardContent className="p-0" style={{ padding: '0 24px 24px' }}>
          <div className="flex flex-col" style={{ gap: '8px' }}>
            <IntegrationRow
              icon={<GoogleIcon />}
              name="Google"
              description="Sign in & sync calendar"
              connected={isGoogleConnected}
              onToggle={() => handleSocialToggle('google')}
              loading={syncing === 'google'}
            />
            <IntegrationRow
              icon={<LinkedInIcon />}
              name="LinkedIn"
              description="Professional profile sync"
              connected={isLinkedInConnected}
              onToggle={() => handleSocialToggle('linkedin')}
              loading={syncing === 'linkedin'}
            />
            <IntegrationRow
              icon={<AppleIcon />}
              name="Apple"
              description="Sign in with Apple"
              connected={false}
              onToggle={() => showToast('info', 'Coming Soon', 'Apple sign-in will be available soon.')}
            />
          </div>
        </CardContent>
      </Card>

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
