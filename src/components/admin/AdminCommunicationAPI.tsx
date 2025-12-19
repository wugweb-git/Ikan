import React, { useState, useEffect } from 'react';
import {
  Mail,
  MessageSquare,
  Send,
  Key,
  CheckCircle,
  XCircle,
  Save,
  TestTube
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { useNotifications } from '../../contexts/NotificationContext';
import { AdminHeader } from './AdminHeader';
import { useIsMobile } from '../../hooks/useIsMobile';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface CommunicationConfig {
  provider: string;
  enabled: boolean;
  api_key?: string;
  api_secret?: string;
  sender_id?: string;
  webhook_url?: string;
  updated_at?: string;
}

export function AdminCommunicationAPI() {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();

  // Email configuration
  const [emailConfig, setEmailConfig] = useState<CommunicationConfig>({
    provider: 'sendgrid',
    enabled: false,
    api_key: '',
    sender_id: 'noreply@ikan.health'
  });

  // SMS configuration  
  const [smsConfig, setSmsConfig] = useState<CommunicationConfig>({
    provider: 'twilio',
    enabled: false,
    api_key: '',
    api_secret: '',
    sender_id: '+1234567890'
  });

  // WhatsApp configuration
  const [whatsappConfig, setWhatsappConfig] = useState<CommunicationConfig>({
    provider: 'twilio-whatsapp',
    enabled: false,
    api_key: '',
    api_secret: '',
    sender_id: '+1234567890'
  });

  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/communication/config`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Update configs from server
        const configs = data.configs || [];
        configs.forEach((cfg: any) => {
          if (cfg.provider === 'sendgrid') setEmailConfig(cfg);
          if (cfg.provider === 'twilio') setSmsConfig(cfg);
          if (cfg.provider === 'twilio-whatsapp') setWhatsappConfig(cfg);
        });
      }
    } catch (error) {
      console.error('Failed to load communication configs:', error);
    }
  };

  const handleSaveConfig = async (provider: string, config: CommunicationConfig) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/communication/config`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ provider, config })
        }
      );

      if (response.ok) {
        showToast('success', 'Saved', `${provider} configuration saved successfully`);
      } else {
        showToast('error', 'Error', 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      showToast('error', 'Error', 'Failed to save configuration');
    }
  };

  const handleTest = async (provider: string, recipient: string) => {
    setTesting(provider);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/communication/test`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            provider,
            recipient,
            message: 'Test message from iKan Admin Panel'
          })
        }
      );

      if (response.ok) {
        showToast('success', 'Test Sent', `Test ${provider} message sent successfully`);
      } else {
        showToast('error', 'Test Failed', `Failed to send test ${provider} message`);
      }
    } catch (error) {
      console.error('Error testing API:', error);
      showToast('error', 'Test Failed', 'Failed to test API');
    } finally {
      setTesting(null);
    }
  };

  const stats = [
    {
      label: 'Email Service',
      value: emailConfig.enabled ? 'Active' : 'Inactive',
      icon: <Mail className="w-4 h-4" style={{ color: emailConfig.enabled ? 'var(--color-success-default)' : 'var(--color-text-muted)' }} />
    },
    {
      label: 'SMS Service',
      value: smsConfig.enabled ? 'Active' : 'Inactive',
      icon: <MessageSquare className="w-4 h-4" style={{ color: smsConfig.enabled ? 'var(--color-success-default)' : 'var(--color-text-muted)' }} />
    },
    {
      label: 'WhatsApp',
      value: whatsappConfig.enabled ? 'Active' : 'Inactive',
      icon: <MessageSquare className="w-4 h-4" style={{ color: whatsappConfig.enabled ? 'var(--color-success-default)' : 'var(--color-text-muted)' }} />
    },
    {
      label: 'Total Services',
      value: [emailConfig.enabled, smsConfig.enabled, whatsappConfig.enabled].filter(Boolean).length,
      icon: <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />
    },
  ];

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: 'var(--color-bg-page)',
        padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)'
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Communication API Management"
          description="Configure Email, SMS, and WhatsApp API integrations"
          stats={stats}
        />

        {/* Email Configuration */}
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6" style={{ color: 'var(--color-primary-default)' }} />
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Email Service (SendGrid)
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Configure email delivery via SendGrid
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label>Enabled</Label>
                <Switch
                  checked={emailConfig.enabled}
                  onCheckedChange={(checked) => setEmailConfig({ ...emailConfig, enabled: checked })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={emailConfig.api_key}
                  onChange={(e) => setEmailConfig({ ...emailConfig, api_key: e.target.value })}
                  placeholder="SG.xxxxxxxxxxxxx"
                />
              </div>
              <div>
                <Label>Sender Email</Label>
                <Input
                  value={emailConfig.sender_id}
                  onChange={(e) => setEmailConfig({ ...emailConfig, sender_id: e.target.value })}
                  placeholder="noreply@ikan.health"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleSaveConfig('sendgrid', emailConfig)}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)',
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'var(--color-primary-on)'
                }}
              >
                <Save className="w-4 h-4" />
                Save Configuration
              </Button>
              <Button
                variant="outline"
                onClick={() => handleTest('email', 'test@example.com')}
                disabled={!emailConfig.enabled || testing === 'email'}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)'
                }}
              >
                <TestTube className="w-4 h-4" />
                {testing === 'email' ? 'Testing...' : 'Test Email'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SMS Configuration */}
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6" style={{ color: 'var(--color-primary-default)' }} />
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    SMS Service (Twilio)
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Configure SMS delivery via Twilio
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label>Enabled</Label>
                <Switch
                  checked={smsConfig.enabled}
                  onCheckedChange={(checked) => setSmsConfig({ ...smsConfig, enabled: checked })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Account SID</Label>
                <Input
                  type="password"
                  value={smsConfig.api_key}
                  onChange={(e) => setSmsConfig({ ...smsConfig, api_key: e.target.value })}
                  placeholder="ACxxxxxxxxxxxxx"
                />
              </div>
              <div>
                <Label>Auth Token</Label>
                <Input
                  type="password"
                  value={smsConfig.api_secret}
                  onChange={(e) => setSmsConfig({ ...smsConfig, api_secret: e.target.value })}
                  placeholder="Auth Token"
                />
              </div>
              <div>
                <Label>Twilio Phone Number</Label>
                <Input
                  value={smsConfig.sender_id}
                  onChange={(e) => setSmsConfig({ ...smsConfig, sender_id: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleSaveConfig('twilio', smsConfig)}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)',
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'var(--color-primary-on)'
                }}
              >
                <Save className="w-4 h-4" />
                Save Configuration
              </Button>
              <Button
                variant="outline"
                onClick={() => handleTest('sms', '+1234567890')}
                disabled={!smsConfig.enabled || testing === 'sms'}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)'
                }}
              >
                <TestTube className="w-4 h-4" />
                {testing === 'sms' ? 'Testing...' : 'Test SMS'}
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
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    WhatsApp Business API
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Configure WhatsApp messaging via Twilio or Meta
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label>Enabled</Label>
                <Switch
                  checked={whatsappConfig.enabled}
                  onCheckedChange={(checked) => setWhatsappConfig({ ...whatsappConfig, enabled: checked })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>API Key / Account SID</Label>
                <Input
                  type="password"
                  value={whatsappConfig.api_key}
                  onChange={(e) => setWhatsappConfig({ ...whatsappConfig, api_key: e.target.value })}
                  placeholder="ACxxxxxxxxxxxxx"
                />
              </div>
              <div>
                <Label>API Secret / Auth Token</Label>
                <Input
                  type="password"
                  value={whatsappConfig.api_secret}
                  onChange={(e) => setWhatsappConfig({ ...whatsappConfig, api_secret: e.target.value })}
                  placeholder="Secret Token"
                />
              </div>
              <div>
                <Label>WhatsApp Number</Label>
                <Input
                  value={whatsappConfig.sender_id}
                  onChange={(e) => setWhatsappConfig({ ...whatsappConfig, sender_id: e.target.value })}
                  placeholder="whatsapp:+1234567890"
                />
              </div>
              <div>
                <Label>Webhook URL</Label>
                <Input
                  value={whatsappConfig.webhook_url}
                  onChange={(e) => setWhatsappConfig({ ...whatsappConfig, webhook_url: e.target.value })}
                  placeholder="https://your-domain.com/webhook"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleSaveConfig('twilio-whatsapp', whatsappConfig)}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)',
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'var(--color-primary-on)'
                }}
              >
                <Save className="w-4 h-4" />
                Save Configuration
              </Button>
              <Button
                variant="outline"
                onClick={() => handleTest('whatsapp', 'whatsapp:+1234567890')}
                disabled={!whatsappConfig.enabled || testing === 'whatsapp'}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)'
                }}
              >
                <TestTube className="w-4 h-4" />
                {testing === 'whatsapp' ? 'Testing...' : 'Test WhatsApp'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card style={{ backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-6">
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-3)' }}>
              📚 Setup Documentation
            </h3>
            <div className="space-y-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              <p>
                <strong>Email (SendGrid):</strong> Get API key from{' '}
                <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-default)' }}>
                  SendGrid Dashboard
                </a>
              </p>
              <p>
                <strong>SMS (Twilio):</strong> Get Account SID and Auth Token from{' '}
                <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-default)' }}>
                  Twilio Console
                </a>
              </p>
              <p>
                <strong>WhatsApp:</strong> Register for WhatsApp Business API via{' '}
                <a href="https://www.twilio.com/whatsapp" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-default)' }}>
                  Twilio WhatsApp
                </a>
                {' '}or{' '}
                <a href="https://developers.facebook.com/products/whatsapp" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-default)' }}>
                  Meta Business
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
