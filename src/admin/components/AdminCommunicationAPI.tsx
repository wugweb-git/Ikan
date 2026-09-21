import { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  MessageSquare,
  CircleCheck,
  Save,
  TestTube,
  RefreshCw,
  Shield,
  Smartphone,
  Clock,
  CircleX,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useNotifications } from '../../shared/contexts/NotificationContext';
import { AdminHeader } from './AdminHeader';
import { AdminLoading } from './AdminLoading';
import { useIsMobile } from '../ui/hooks/useIsMobile';
import { projectId, publicAnonKey } from '../../shared/config/supabase-info';
import { supabase } from '../../shared/supabase';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;

interface BrevoConfig {
  email: {
    enabled: boolean;
    senderName: string;
    senderEmail: string;
  };
  sms: {
    enabled: boolean;
    senderName: string;
  };
  whatsapp: {
    enabled: boolean;
    senderNumber: string;
    testTemplateName: string;
  };
  updatedAt?: string;
}

interface BrevoAccount {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  plan: any;
}

interface LogEntry {
  channel: string;
  recipient: string;
  subject: string;
  success: boolean;
  timestamp: string;
}

const DEFAULT_CONFIG: BrevoConfig = {
  email: { enabled: false, senderName: 'iKan Health', senderEmail: 'noreply@ikanhealth.in' },
  sms: { enabled: false, senderName: 'iKan' },
  whatsapp: { enabled: false, senderNumber: '', testTemplateName: '' },
};

export function AdminCommunicationAPI() {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<BrevoConfig>(DEFAULT_CONFIG);
  const [account, setAccount] = useState<BrevoAccount | null>(null);
  const [accountConnected, setAccountConnected] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testing, setTesting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [testRecipient, setTestRecipient] = useState({ email: '', sms: '', whatsapp: '' });

  const getHeaders = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('Auth: getSession error in CommunicationAPI:', error.message);
        return { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' };
      }
      const token = data.session?.access_token || publicAnonKey;
      return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    } catch (err) {
      console.warn('Auth: getHeaders failed in CommunicationAPI:', err);
      return { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' };
    }
  };

  // ── Load config + account status ─────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = await getHeaders();
      const [configRes, accountRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/brevo/config`, { headers }).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/brevo/account`, { headers }).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/brevo/logs?limit=20`, { headers }).then(r => r.json()).catch(() => null),
      ]);

      if (configRes?.config) setConfig(configRes.config);
      if (configRes?.apiKeyConfigured !== undefined) setApiKeyConfigured(configRes.apiKeyConfigured);

      if (accountRes?.connected) {
        setAccountConnected(true);
        setAccount(accountRes.account);
      } else {
        setAccountConnected(false);
        setAccount(null);
      }

      if (logsRes?.logs) setLogs(logsRes.logs);
    } catch (err) {
      console.error('Failed to load Brevo data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Save config ──────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(`${API_BASE}/brevo/config`, {
        method: 'POST',
        headers,
        body: JSON.stringify(config),
      });
      if (res.ok) {
        showToast('success', 'Saved', 'Brevo configuration saved successfully');
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('error', 'Error', data.error || 'Failed to save configuration');
      }
    } catch (err) {
      console.error('Error saving Brevo config:', err);
      showToast('error', 'Error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // ── Test channel ─────────────────────────────────────────────
  const handleTest = async (channel: string) => {
    const recipient = testRecipient[channel as keyof typeof testRecipient];
    if (!recipient) {
      showToast('error', 'Missing Recipient', `Enter a ${channel === 'email' ? 'email address' : 'phone number'} to test`);
      return;
    }
    setTesting(channel);
    try {
      const headers = await getHeaders();
      const res = await fetch(`${API_BASE}/brevo/test`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ channel, recipient }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast('success', 'Test Sent', `Test ${channel} sent to ${recipient}`);
        // Refresh logs
        const logsRes = await fetch(`${API_BASE}/brevo/logs?limit=20`, { headers }).then(r => r.json()).catch(() => null);
        if (logsRes?.logs) setLogs(logsRes.logs);
      } else {
        showToast('error', 'Test Failed', data.error || `Failed to send test ${channel}`);
      }
    } catch (err) {
      console.error(`Error testing ${channel}:`, err);
      showToast('error', 'Test Failed', `Network error testing ${channel}`);
    } finally {
      setTesting(null);
    }
  };

  // ── Stats ────────────────────────────────────────────────────
  const stats = [
    {
      label: 'API Status',
      value: accountConnected ? 'Connected' : 'Not Connected',
      icon: <Shield className="w-4 h-4" style={{ color: accountConnected ? 'var(--color-success-default)' : 'var(--color-danger-default)' }} />,
    },
    {
      label: 'Email',
      value: config.email.enabled ? 'Active' : 'Inactive',
      icon: <Mail className="w-4 h-4" style={{ color: config.email.enabled ? 'var(--color-success-default)' : 'var(--color-text-muted)' }} />,
    },
    {
      label: 'SMS',
      value: config.sms.enabled ? 'Active' : 'Inactive',
      icon: <Smartphone className="w-4 h-4" style={{ color: config.sms.enabled ? 'var(--color-success-default)' : 'var(--color-text-muted)' }} />,
    },
    {
      label: 'WhatsApp',
      value: config.whatsapp.enabled ? 'Active' : 'Inactive',
      icon: <MessageSquare className="w-4 h-4" style={{ color: config.whatsapp.enabled ? 'var(--color-success-default)' : 'var(--color-text-muted)' }} />,
    },
  ];

  if (loading) {
    return <AdminLoading message="Loading Brevo configuration..." />;
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--color-bg-page)',
        padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)',
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Brevo Communication API"
          description="Unified Email, SMS, and WhatsApp via Brevo (formerly Sendinblue)"
          stats={stats}
        />

        {/* Account Status */}
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 40, height: 40,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: accountConnected ? 'var(--color-success-muted)' : 'var(--color-danger-muted)',
                  }}
                >
                  {accountConnected
                    ? <CircleCheck className="w-5 h-5" style={{ color: 'var(--color-success-default)' }} />
                    : <CircleX className="w-5 h-5" style={{ color: 'var(--color-danger-default)' }} />
                  }
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                    Brevo Account
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    {accountConnected
                      ? `${account?.firstName} ${account?.lastName} — ${account?.email}`
                      : apiKeyConfigured
                        ? 'API key set but connection failed — verify your key'
                        : 'Set BREVO_API_KEY in environment secrets to connect'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={loadData}
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)',
                    fontWeight: 'var(--font-weight-medium)',
                    gap: 'var(--spacing-2)',
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
                <a
                  href="https://app.brevo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    style={{
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      fontWeight: 'var(--font-weight-medium)',
                      gap: 'var(--spacing-2)',
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Brevo Dashboard
                  </Button>
                </a>
              </div>
            </div>
            {account?.plan && (
              <div
                className="flex items-center gap-4"
                style={{
                  padding: 'var(--spacing-3)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg-muted)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span>Plan: <strong style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{account.plan.type || 'Free'}</strong></span>
                {account.plan.credits !== undefined && <span>Credits: {account.plan.credits}</span>}
                {account.companyName && <span>Company: {account.companyName}</span>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6" style={{ color: 'var(--color-primary-default)' }} />
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                    Email (Transactional)
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Send transactional emails via Brevo SMTP API
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Enabled</Label>
                <Switch
                  checked={config.email.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, email: { ...config.email, enabled: checked } })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Sender Name</Label>
                <Input
                  value={config.email.senderName}
                  onChange={(e) => setConfig({ ...config, email: { ...config.email, senderName: e.target.value } })}
                  placeholder="iKan Health"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
              </div>
              <div>
                <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Sender Email</Label>
                <Input
                  value={config.email.senderEmail}
                  onChange={(e) => setConfig({ ...config, email: { ...config.email, senderEmail: e.target.value } })}
                  placeholder="noreply@ikanhealth.in"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
              </div>
            </div>

            {/* Test Email */}
            <div
              className="flex items-end gap-3"
              style={{
                padding: 'var(--spacing-4)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-muted)',
              }}
            >
              <div className="flex-1">
                <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Test Recipient Email</Label>
                <Input
                  type="email"
                  value={testRecipient.email}
                  onChange={(e) => setTestRecipient({ ...testRecipient, email: e.target.value })}
                  placeholder="test@example.com"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => handleTest('email')}
                disabled={!config.email.enabled || testing === 'email' || !accountConnected}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)',
                }}
              >
                <TestTube className="w-4 h-4" />
                {testing === 'email' ? 'Sending...' : 'Send Test'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SMS Configuration */}
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6" style={{ color: 'var(--color-primary-default)' }} />
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                    SMS (Transactional)
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Send transactional SMS via Brevo SMS API
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Enabled</Label>
                <Switch
                  checked={config.sms.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, sms: { ...config.sms, enabled: checked } })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Sender Name</Label>
                <Input
                  value={config.sms.senderName}
                  onChange={(e) => setConfig({ ...config, sms: { ...config.sms, senderName: e.target.value } })}
                  placeholder="iKan"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                  Max 11 alphanumeric characters. Some countries require a registered sender ID.
                </p>
              </div>
            </div>

            {/* Test SMS */}
            <div
              className="flex items-end gap-3"
              style={{
                padding: 'var(--spacing-4)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-muted)',
              }}
            >
              <div className="flex-1">
                <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Test Phone Number</Label>
                <Input
                  type="tel"
                  value={testRecipient.sms}
                  onChange={(e) => setTestRecipient({ ...testRecipient, sms: e.target.value })}
                  placeholder="+91XXXXXXXXXX"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => handleTest('sms')}
                disabled={!config.sms.enabled || testing === 'sms' || !accountConnected}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)',
                }}
              >
                <TestTube className="w-4 h-4" />
                {testing === 'sms' ? 'Sending...' : 'Send Test'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Configuration */}
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6" style={{ color: 'var(--color-success-default)' }} />
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                    WhatsApp Business
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Send WhatsApp messages via Brevo WhatsApp API (template-based)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Enabled</Label>
                <Switch
                  checked={config.whatsapp.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, whatsapp: { ...config.whatsapp, enabled: checked } })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Sender Phone Number</Label>
                <Input
                  value={config.whatsapp.senderNumber}
                  onChange={(e) => setConfig({ ...config, whatsapp: { ...config.whatsapp, senderNumber: e.target.value } })}
                  placeholder="+91XXXXXXXXXX"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                  Must be a WhatsApp Business number registered in your Brevo account.
                </p>
              </div>
              <div>
                <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Test Template Name</Label>
                <Input
                  value={config.whatsapp.testTemplateName}
                  onChange={(e) => setConfig({ ...config, whatsapp: { ...config.whatsapp, testTemplateName: e.target.value } })}
                  placeholder="hello_world"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                  Pre-approved template name for test messages.
                </p>
              </div>
            </div>

            {/* Test WhatsApp */}
            <div
              className="flex items-end gap-3"
              style={{
                padding: 'var(--spacing-4)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-muted)',
              }}
            >
              <div className="flex-1">
                <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Test WhatsApp Number</Label>
                <Input
                  type="tel"
                  value={testRecipient.whatsapp}
                  onChange={(e) => setTestRecipient({ ...testRecipient, whatsapp: e.target.value })}
                  placeholder="+91XXXXXXXXXX"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => handleTest('whatsapp')}
                disabled={!config.whatsapp.enabled || testing === 'whatsapp' || !accountConnected}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)',
                }}
              >
                <TestTube className="w-4 h-4" />
                {testing === 'whatsapp' ? 'Sending...' : 'Send Test'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            style={{
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              fontWeight: 'var(--font-weight-medium)',
              gap: 'var(--spacing-2)',
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)',
              paddingLeft: 'var(--spacing-6)',
              paddingRight: 'var(--spacing-6)',
            }}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All Configuration'}
          </Button>
        </div>

        {/* Recent Communication Logs */}
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5" style={{ color: 'var(--color-primary-default)' }} />
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                Recent Activity
              </h3>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'var(--color-bg-muted)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                Last {logs.length} entries
              </span>
            </div>

            {logs.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--spacing-6)' }}>
                No communication logs yet. Send a test message to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {[...logs].reverse().slice(0, 10).map((log, i) => (
                  <div
                    key={`${log.timestamp}-${i}`}
                    className="flex items-center justify-between"
                    style={{
                      padding: 'var(--spacing-3)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-bg-muted)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {log.channel === 'email' && <Mail className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />}
                      {log.channel === 'sms' && <Smartphone className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />}
                      {log.channel === 'whatsapp' && <MessageSquare className="w-4 h-4" style={{ color: 'var(--color-success-default)' }} />}
                      <div>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                          {log.recipient}
                        </span>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {log.subject}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.success
                        ? <CircleCheck className="w-4 h-4" style={{ color: 'var(--color-success-default)' }} />
                        : <CircleX className="w-4 h-4" style={{ color: 'var(--color-danger-default)' }} />
                      }
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card style={{ backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-6">
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-3)', color: 'var(--color-text-primary)' }}>
              Setup Guide
            </h3>
            <div className="space-y-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              <div className="flex items-start gap-2">
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', minWidth: 20 }}>1.</span>
                <p>
                  Create a free Brevo account at{' '}
                  <a href="https://app.brevo.com/account/register" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-default)' }}>
                    app.brevo.com
                  </a>
                  {' '}(300 emails/day free)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', minWidth: 20 }}>2.</span>
                <p>
                  Generate an API key in{' '}
                  <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-default)' }}>
                    Settings &gt; SMTP &amp; API &gt; API Keys
                  </a>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', minWidth: 20 }}>3.</span>
                <p>Set the key as <code style={{ backgroundColor: 'var(--color-bg-card)', padding: '1px 6px', borderRadius: 'var(--radius-xs)', fontSize: 'var(--text-xs)' }}>BREVO_API_KEY</code> in your Supabase environment secrets</p>
              </div>
              <div className="flex items-start gap-2">
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', minWidth: 20 }}>4.</span>
                <p>For SMS, purchase SMS credits in your Brevo dashboard. For WhatsApp, connect your WhatsApp Business account via Brevo.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}