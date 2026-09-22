import { Mail, MessageSquare, Phone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────
export type Channel = 'email' | 'sms' | 'whatsapp';
export type TemplateCategory = 'welcome' | 'notification' | 'reminder' | 'marketing' | 'transactional' | 'assessment' | 'checkin';

export interface NotifTemplate {
  id: string;
  channel: Channel;
  name: string;
  category: TemplateCategory;
  // Email-specific
  subject?: string;
  htmlContent?: string;
  // SMS-specific
  smsContent?: string;
  // WhatsApp-specific
  whatsappTemplateName?: string;
  whatsappLanguage?: string;
  whatsappBodyVars?: string[];
  // Shared
  body: string;               // plain text body (also serves as SMS content)
  variables?: string[];        // placeholder variables used
  created_at: string;
  updated_at?: string;
}

export interface QueueItem {
  id: string;
  type: 'email' | 'push' | 'sms';
  recipient: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  scheduled_at: string;
}

export interface BroadcastInput {
  type: 'email' | 'sms';
  audience: string;
  subject: string;
  body: string;
}

// ── Variable placeholders ───────────────────────────────────────
export const AVAILABLE_VARS: { key: string; label: string; example: string }[] = [
  { key: 'user_name', label: 'User Name', example: 'Jane Doe' },
  { key: 'user_email', label: 'User Email', example: 'jane@example.com' },
  { key: 'app_name', label: 'App Name', example: 'iKan Health' },
  { key: 'date', label: 'Date', example: new Date().toLocaleDateString() },
  { key: 'assessment_name', label: 'Assessment Name', example: 'GAD-7' },
  { key: 'program_name', label: 'Program Name', example: 'Stress Mastery' },
  { key: 'checkin_streak', label: 'Check-in Streak', example: '7 days' },
  { key: 'support_url', label: 'Support URL', example: 'https://ikanhealth.in/support' },
];

/** Per-channel label, icon and colour classes (text / background / border). */
export const CHANNEL_META: Record<Channel, { label: string; icon: LucideIcon; text: string; bg: string; border: string }> = {
  email: {
    label: 'Email', icon: Mail,
    text: 'text-[var(--color-primary-default)]', bg: 'bg-[var(--color-accent-default)]', border: 'border-[var(--color-primary-default)]',
  },
  sms: {
    label: 'SMS', icon: Phone,
    text: 'text-[var(--color-status-warning)]', bg: 'bg-[var(--color-status-warning-light)]', border: 'border-[var(--color-status-warning)]',
  },
  whatsapp: {
    label: 'WhatsApp', icon: MessageSquare,
    text: 'text-[var(--color-status-success)]', bg: 'bg-[var(--color-status-success-light)]', border: 'border-[var(--color-status-success)]',
  },
};

export const CHANNELS = Object.keys(CHANNEL_META) as Channel[];

export const CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'welcome', label: 'Welcome' },
  { value: 'notification', label: 'Notification' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'checkin', label: 'Check-in' },
  { value: 'marketing', label: 'Marketing' },
];

// ── Shared class strings ────────────────────────────────────────
// Button / Input / Textarea / SelectTrigger set inline defaults (radius,
// font size, border), so overriding them needs the `!` modifier.
export const FIELD_LABEL = 'block mb-1 text-xs font-medium text-[var(--color-text-muted)]';
export const FIELD_INPUT = 'rounded-md! border-[1.5px]! bg-[var(--color-bg-input)]! text-sm!';
export const FIELD_TEXTAREA = 'rounded-md! border-[var(--color-border-default)]! bg-[var(--color-bg-input)]! text-sm! leading-[1.6] resize-y focus:outline-none focus:ring-0';
export const SELECT_TRIGGER = 'rounded-md! border-[var(--color-border-default)]! text-sm! h-[38px]!';
export const BTN_SM = 'gap-1 rounded-md! text-xs!';
export const BTN_PRIMARY = 'gap-1 rounded-md! text-xs! bg-[var(--color-primary-default)] hover:bg-[var(--color-primary-default)] text-[var(--color-primary-on)]';

export function newTemplate(channel: Channel): NotifTemplate {
  return {
    id: '',
    channel,
    name: '',
    category: 'notification',
    subject: '',
    htmlContent: channel === 'email' ? DEFAULT_EMAIL_HTML : undefined,
    smsContent: '',
    body: '',
    whatsappTemplateName: '',
    whatsappLanguage: 'en',
    whatsappBodyVars: [],
    created_at: new Date().toISOString(),
  };
}

export function duplicateTemplate(t: NotifTemplate): NotifTemplate {
  return {
    ...t,
    id: '',
    name: `${t.name} (copy)`,
    created_at: new Date().toISOString(),
    updated_at: undefined,
  };
}

export const DEFAULT_EMAIL_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Ubuntu', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; }
    .header { background-color: #2A2A2A; padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; font-weight: 500; margin: 0; }
    .body { padding: 32px 24px; }
    .body p { font-size: 16px; line-height: 1.6; color: #151515; margin: 0 0 16px; }
    .cta { display: inline-block; background-color: #2A2A2A; color: #ffffff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 500; font-size: 16px; }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: #717182; border-top: 1px solid #E9EBEF; }
  </style>
</head>
<body>
  <div style="padding: 24px;">
    <div class="container">
      <div class="header">
        <h1>{{app_name}}</h1>
      </div>
      <div class="body">
        <p>Hi {{user_name}},</p>
        <p>Your message content goes here.</p>
        <p style="text-align: center; margin-top: 24px;">
          <a href="{{support_url}}" class="cta">Take Action</a>
        </p>
      </div>
      <div class="footer">
        <p>&copy; {{date}} {{app_name}}. All rights reserved.</p>
        <p>You received this because you signed up for {{app_name}}.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
