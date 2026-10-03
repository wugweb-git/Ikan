import type { ReactNode } from 'react';
import { Mail, MessageSquare, CircleCheck, TestTube, RefreshCw, Smartphone, Clock, CircleX, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { cn } from '../ui/utils';
import type { BrevoAccount, LogEntry } from './useBrevoData';

const CARD = 'bg-[var(--color-bg-card)] rounded-lg';
const TITLE = 'text-base font-medium text-[var(--color-text-primary)]';
const MUTED_SM = 'text-sm text-[var(--color-text-muted)]';
const HINT = 'mt-1 text-xs text-[var(--color-text-muted)]';
const INPUT = 'rounded-md!';
const LINK = 'text-[var(--color-primary-default)]';
const SUCCESS = 'text-[var(--color-status-success)]';
const DANGER = 'text-[var(--color-status-danger)]';

// ── Account status ────────────────────────────────────────────────
export function BrevoAccountCard({
  account,
  connected,
  apiKeyConfigured,
  onRefresh,
}: {
  account: BrevoAccount | null;
  connected: boolean;
  apiKeyConfigured: boolean;
  onRefresh: () => void;
}) {
  return (
    <Card className={CARD}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center justify-center size-10 rounded-sm',
                connected ? 'bg-[var(--color-status-success-light)]' : 'bg-[var(--color-status-danger-light)]',
              )}
            >
              {connected
                ? <CircleCheck className={cn('w-5 h-5', SUCCESS)} />
                : <CircleX className={cn('w-5 h-5', DANGER)} />
              }
            </div>
            <div>
              <h3 className={TITLE}>Brevo Account</h3>
              <p className={MUTED_SM}>
                {connected
                  ? `${account?.firstName} ${account?.lastName} — ${account?.email}`
                  : apiKeyConfigured
                    ? 'API key set but connection failed — verify your key'
                    : 'Set BREVO_API_KEY in environment secrets to connect'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <a href="https://app.brevo.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <ExternalLink className="w-4 h-4" />
                Brevo Dashboard
              </Button>
            </a>
          </div>
        </div>
        {account?.plan && (
          <div className={cn('flex items-center gap-4 p-3 rounded-sm bg-[var(--color-bg-muted)]', MUTED_SM)}>
            <span>Plan: <strong className="font-medium text-[var(--color-text-primary)]">{account.plan.type || 'Free'}</strong></span>
            {account.plan.credits !== undefined && <span>Credits: {account.plan.credits}</span>}
            {account.companyName && <span>Company: {account.companyName}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── One channel's config card ─────────────────────────────────────
export function BrevoChannelCard({
  icon,
  title,
  description,
  enabled,
  onEnabledChange,
  fields,
  testLabel,
  testType,
  testValue,
  testPlaceholder,
  onTestValueChange,
  onTest,
  testDisabled,
  testing,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onEnabledChange: (checked: boolean) => void;
  fields: ReactNode;
  testLabel: string;
  testType: 'email' | 'tel';
  testValue: string;
  testPlaceholder: string;
  onTestValueChange: (value: string) => void;
  onTest: () => void;
  testDisabled: boolean;
  testing: boolean;
}) {
  return (
    <Card className={CARD}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h3 className={TITLE}>{title}</h3>
              <p className={MUTED_SM}>{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-[var(--color-text-muted)]">Enabled</Label>
            <Switch checked={enabled} onCheckedChange={onEnabledChange} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">{fields}</div>

        {/* Test send */}
        <div className="flex items-end gap-3 p-4 rounded-sm bg-[var(--color-bg-muted)]">
          <div className="flex-1">
            <Label>{testLabel}</Label>
            <Input
              type={testType}
              value={testValue}
              onChange={(e) => onTestValueChange(e.target.value)}
              placeholder={testPlaceholder}
              className={INPUT}
            />
          </div>
          <Button variant="outline" onClick={onTest} disabled={testDisabled}>
            <TestTube className="w-4 h-4" />
            {testing ? 'Sending...' : 'Send Test'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** A labelled text input for a channel card's field grid. */
export function BrevoField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={INPUT} />
      {hint && <p className={HINT}>{hint}</p>}
    </div>
  );
}

// ── Recent activity ───────────────────────────────────────────────
export function BrevoActivityLog({ logs }: { logs: LogEntry[] }) {
  return (
    <Card className={CARD}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-[var(--color-primary-default)]" />
          <h3 className={TITLE}>Recent Activity</h3>
          <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-muted)] px-2 py-0.5 rounded-[var(--radius-xs)]">
            Last {logs.length} entries
          </span>
        </div>

        {logs.length === 0 ? (
          <p className={cn(MUTED_SM, 'text-center p-6')}>
            No communication logs yet. Send a test message to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {[...logs].reverse().slice(0, 10).map((log, i) => (
              <div key={`${log.timestamp}-${i}`} className="flex items-center justify-between p-3 rounded-sm bg-[var(--color-bg-muted)]">
                <div className="flex items-center gap-3">
                  {log.channel === 'email' && <Mail className="w-4 h-4 text-[var(--color-primary-default)]" />}
                  {log.channel === 'sms' && <Smartphone className="w-4 h-4 text-[var(--color-primary-default)]" />}
                  {log.channel === 'whatsapp' && <MessageSquare className={cn('w-4 h-4', SUCCESS)} />}
                  <div>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{log.recipient}</span>
                    <p className="text-xs text-[var(--color-text-muted)]">{log.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {log.success
                    ? <CircleCheck className={cn('w-4 h-4', SUCCESS)} />
                    : <CircleX className={cn('w-4 h-4', DANGER)} />
                  }
                  <span className="text-xs text-[var(--color-text-muted)]">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Setup guide ───────────────────────────────────────────────────
function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="font-medium text-[var(--color-text-primary)] min-w-5">{n}.</span>
      <p>{children}</p>
    </div>
  );
}

export function BrevoSetupGuide() {
  return (
    <Card className="bg-[var(--color-bg-muted)] rounded-lg">
      <CardContent className="p-6">
        <h3 className={cn(TITLE, 'mb-3')}>Setup Guide</h3>
        <div className={cn('space-y-3', MUTED_SM)}>
          <Step n={1}>
            Create a free Brevo account at{' '}
            <a href="https://app.brevo.com/account/register" target="_blank" rel="noopener noreferrer" className={LINK}>
              app.brevo.com
            </a>
            {' '}(300 emails/day free)
          </Step>
          <Step n={2}>
            Generate an API key in{' '}
            <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener noreferrer" className={LINK}>
              Settings &gt; SMTP &amp; API &gt; API Keys
            </a>
          </Step>
          <Step n={3}>
            Set the key as <code className="bg-[var(--color-bg-card)] px-1.5 py-px rounded-[var(--radius-xs)] text-xs">BREVO_API_KEY</code> in your Supabase environment secrets
          </Step>
          <Step n={4}>
            For SMS, purchase SMS credits in your Brevo dashboard. For WhatsApp, connect your WhatsApp Business account via Brevo.
          </Step>
        </div>
      </CardContent>
    </Card>
  );
}
