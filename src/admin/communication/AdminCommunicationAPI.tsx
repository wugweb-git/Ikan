import { useState } from 'react';
import { Mail, MessageSquare, Save, Shield, Smartphone } from 'lucide-react';
import { Button } from '../ui/button';
import { AdminPageLayout } from '../shell/AdminPageLayout';
import { AdminLoading } from '../ui/kit/AdminLoading';
import { BrevoAccountCard, BrevoActivityLog, BrevoChannelCard, BrevoField, BrevoSetupGuide } from './BrevoPanels';
import { useBrevoData } from './useBrevoData';

const ACTIVE = 'w-4 h-4 text-[var(--color-status-success)]';
const INACTIVE = 'w-4 h-4 text-[var(--color-text-muted)]';

/** Brevo API tab of the Communication screen. */
export function AdminCommunicationAPI() {
  const {
    loading, reload, config, setConfig, account, accountConnected, apiKeyConfigured,
    logs, testing, saving, saveConfig, testChannel,
  } = useBrevoData();
  const [testRecipient, setTestRecipient] = useState({ email: '', sms: '', whatsapp: '' });

  const stats = [
    {
      label: 'API Status',
      value: accountConnected ? 'Connected' : 'Not Connected',
      icon: <Shield className={accountConnected ? ACTIVE : 'w-4 h-4 text-[var(--color-status-danger)]'} />,
    },
    { label: 'Email', value: config.email.enabled ? 'Active' : 'Inactive', icon: <Mail className={config.email.enabled ? ACTIVE : INACTIVE} /> },
    { label: 'SMS', value: config.sms.enabled ? 'Active' : 'Inactive', icon: <Smartphone className={config.sms.enabled ? ACTIVE : INACTIVE} /> },
    { label: 'WhatsApp', value: config.whatsapp.enabled ? 'Active' : 'Inactive', icon: <MessageSquare className={config.whatsapp.enabled ? ACTIVE : INACTIVE} /> },
  ];

  if (loading) {
    return <AdminLoading message="Loading Brevo configuration..." />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] p-4 md:p-8">
      <AdminPageLayout
        title="Brevo Communication API"
        description="Unified Email, SMS, and WhatsApp via Brevo (formerly Sendinblue)"
        stats={stats}
      >
        <BrevoAccountCard
          account={account}
          connected={accountConnected}
          apiKeyConfigured={apiKeyConfigured}
          onRefresh={() => { void reload(); }}
        />

        <BrevoChannelCard
          icon={<Mail className="w-6 h-6 text-[var(--color-primary-default)]" />}
          title="Email (Transactional)"
          description="Send transactional emails via Brevo SMTP API"
          enabled={config.email.enabled}
          onEnabledChange={(checked) => setConfig({ ...config, email: { ...config.email, enabled: checked } })}
          fields={<>
            <BrevoField
              label="Sender Name"
              value={config.email.senderName}
              onChange={(v) => setConfig({ ...config, email: { ...config.email, senderName: v } })}
              placeholder="iKan Health"
            />
            <BrevoField
              label="Sender Email"
              value={config.email.senderEmail}
              onChange={(v) => setConfig({ ...config, email: { ...config.email, senderEmail: v } })}
              placeholder="noreply@ikanhealth.in"
            />
          </>}
          testLabel="Test Recipient Email"
          testType="email"
          testValue={testRecipient.email}
          testPlaceholder="test@example.com"
          onTestValueChange={(v) => setTestRecipient({ ...testRecipient, email: v })}
          onTest={() => testChannel('email', testRecipient.email)}
          testDisabled={!config.email.enabled || testing === 'email' || !accountConnected}
          testing={testing === 'email'}
        />

        <BrevoChannelCard
          icon={<Smartphone className="w-6 h-6 text-[var(--color-primary-default)]" />}
          title="SMS (Transactional)"
          description="Send transactional SMS via Brevo SMS API"
          enabled={config.sms.enabled}
          onEnabledChange={(checked) => setConfig({ ...config, sms: { ...config.sms, enabled: checked } })}
          fields={
            <BrevoField
              label="Sender Name"
              value={config.sms.senderName}
              onChange={(v) => setConfig({ ...config, sms: { ...config.sms, senderName: v } })}
              placeholder="iKan"
              hint="Max 11 alphanumeric characters. Some countries require a registered sender ID."
            />
          }
          testLabel="Test Phone Number"
          testType="tel"
          testValue={testRecipient.sms}
          testPlaceholder="+91XXXXXXXXXX"
          onTestValueChange={(v) => setTestRecipient({ ...testRecipient, sms: v })}
          onTest={() => testChannel('sms', testRecipient.sms)}
          testDisabled={!config.sms.enabled || testing === 'sms' || !accountConnected}
          testing={testing === 'sms'}
        />

        <BrevoChannelCard
          icon={<MessageSquare className="w-6 h-6 text-[var(--color-status-success)]" />}
          title="WhatsApp Business"
          description="Send WhatsApp messages via Brevo WhatsApp API (template-based)"
          enabled={config.whatsapp.enabled}
          onEnabledChange={(checked) => setConfig({ ...config, whatsapp: { ...config.whatsapp, enabled: checked } })}
          fields={<>
            <BrevoField
              label="Sender Phone Number"
              value={config.whatsapp.senderNumber}
              onChange={(v) => setConfig({ ...config, whatsapp: { ...config.whatsapp, senderNumber: v } })}
              placeholder="+91XXXXXXXXXX"
              hint="Must be a WhatsApp Business number registered in your Brevo account."
            />
            <BrevoField
              label="Test Template Name"
              value={config.whatsapp.testTemplateName}
              onChange={(v) => setConfig({ ...config, whatsapp: { ...config.whatsapp, testTemplateName: v } })}
              placeholder="hello_world"
              hint="Pre-approved template name for test messages."
            />
          </>}
          testLabel="Test WhatsApp Number"
          testType="tel"
          testValue={testRecipient.whatsapp}
          testPlaceholder="+91XXXXXXXXXX"
          onTestValueChange={(v) => setTestRecipient({ ...testRecipient, whatsapp: v })}
          onTest={() => testChannel('whatsapp', testRecipient.whatsapp)}
          testDisabled={!config.whatsapp.enabled || testing === 'whatsapp' || !accountConnected}
          testing={testing === 'whatsapp'}
        />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => { void saveConfig(); }}
            disabled={saving}
            className="px-6! bg-[var(--color-primary-default)] hover:bg-[var(--color-primary-default)] text-[var(--color-primary-on)]"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All Configuration'}
          </Button>
        </div>

        <BrevoActivityLog logs={logs} />
        <BrevoSetupGuide />
      </AdminPageLayout>
    </div>
  );
}
