import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mail, Send, MessageSquare, Phone, FileText, Plus, Eye, EyeOff,
  Trash2, Loader2, RefreshCw, Copy, Code, X, Save, Pencil,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { AdminStatusBadge, resolveStatusVariant } from './AdminStatusBadge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNotifications } from '../../shared/contexts/NotificationContext';
import { AdminHeader } from './AdminHeader';
import { AdminCommunicationAPI } from './AdminCommunicationAPI';
import { AdminEmptyState } from './AdminEmptyState';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { projectId, publicAnonKey } from '../../shared/config/supabase-info';
import { supabase } from '../../shared/supabase';
import tokens from '../../shared/lib/design-tokens';

// ── Design helpers ──────────────────────────────────────────────
const B = {
  primary: tokens.colors.primary.default,
  primaryOn: tokens.colors.primary.on,
  accent: tokens.colors.accent.default,
  success: tokens.colors.status.success,
  successLight: tokens.colors.status['success-light'],
  warning: tokens.colors.status.warning,
  warningLight: tokens.colors.status['warning-light'],
  danger: tokens.colors.status.danger,
  dangerLight: tokens.colors.status['danger-light'],
  muted: tokens.colors.text.muted,
  textPrimary: tokens.colors.text.primary,
  bgPage: tokens.colors.background.page,
  bgCard: tokens.colors.background.card,
  bgMuted: tokens.colors.background.muted,
  bgInput: tokens.colors.background.input,
  border: tokens.colors.border.default,
};

const f = (size: string, weight: number = 400, color: string = B.textPrimary): React.CSSProperties => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

// ── Types ───────────────────────────────────────────────────────
type Channel = 'email' | 'sms' | 'whatsapp';
type TemplateCategory = 'welcome' | 'notification' | 'reminder' | 'marketing' | 'transactional' | 'assessment' | 'checkin';

interface NotifTemplate {
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

interface QueueItem {
  id: string;
  type: 'email' | 'push' | 'sms';
  recipient: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  scheduled_at: string;
}

// ── Variable placeholders ───────────────────────────────────────
const AVAILABLE_VARS: { key: string; label: string; example: string }[] = [
  { key: 'user_name', label: 'User Name', example: 'Jane Doe' },
  { key: 'user_email', label: 'User Email', example: 'jane@example.com' },
  { key: 'app_name', label: 'App Name', example: 'iKan Health' },
  { key: 'date', label: 'Date', example: new Date().toLocaleDateString() },
  { key: 'assessment_name', label: 'Assessment Name', example: 'GAD-7' },
  { key: 'program_name', label: 'Program Name', example: 'Stress Mastery' },
  { key: 'checkin_streak', label: 'Check-in Streak', example: '7 days' },
  { key: 'support_url', label: 'Support URL', example: 'https://ikanhealth.in/support' },
];

const CHANNEL_META: Record<Channel, { label: string; icon: any; color: string; bg: string }> = {
  email: { label: 'Email', icon: Mail, color: B.primary, bg: B.accent },
  sms: { label: 'SMS', icon: Phone, color: B.warning, bg: B.warningLight },
  whatsapp: { label: 'WhatsApp', icon: MessageSquare, color: B.success, bg: B.successLight },
};

const CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'welcome', label: 'Welcome' },
  { value: 'notification', label: 'Notification' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'checkin', label: 'Check-in' },
  { value: 'marketing', label: 'Marketing' },
];

const DEFAULT_EMAIL_HTML = `<!DOCTYPE html>
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

// ═══════════════════════════════════════════════════════════════════
// EMAIL HTML PREVIEW
// ═══════════════════════════════════════════════════════════════════
function EmailPreview({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        // Replace variables with example values for preview
        let previewHtml = html;
        AVAILABLE_VARS.forEach(v => {
          previewHtml = previewHtml.replace(new RegExp(`\\{\\{${v.key}\\}\\}`, 'g'), v.example);
        });
        doc.write(previewHtml);
        doc.close();
      }
    }
  }, [html]);

  return (
    <div style={{ border: `1px solid ${B.border}`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
      <div className="flex items-center justify-between" style={{ padding: '8px 12px', backgroundColor: B.bgMuted, borderBottom: `1px solid ${B.border}` }}>
        <div className="flex items-center gap-2">
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF5F57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#28CA41' }} />
        </div>
        <span style={f('xs', 400, B.muted)}>Email Preview</span>
        <div style={{ width: 30 }} />
      </div>
      <iframe
        ref={iframeRef}
        title="Email Preview"
        style={{ width: '100%', height: 500, border: 'none', backgroundColor: '#f5f5f5' }}
        sandbox="allow-same-origin"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE EDITOR
// ═══════════════════════════════════════════════════════════════════
function TemplateEditor({
  template,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  template: NotifTemplate;
  onChange: (updates: Partial<NotifTemplate>) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const isMobile = useIsMobile();
  const smsLength = (template.smsContent || template.body || '').length;
  const smsSegments = Math.ceil(smsLength / 160) || 1;

  const insertVariable = (field: 'body' | 'subject' | 'htmlContent' | 'smsContent', varKey: string) => {
    const placeholder = `{{${varKey}}}`;
    onChange({ [field]: (template[field] || '') + placeholder });
  };

  const channelMeta = CHANNEL_META[template.channel];
  const ChannelIcon = channelMeta.icon;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: channelMeta.bg }}>
            <ChannelIcon size={18} style={{ color: channelMeta.color }} />
          </div>
          <div>
            <span style={f('xs', 500, B.muted)}>{channelMeta.label} Template</span>
            <h3 style={{ ...f('lg', 500), margin: 0 }}>{template.name || 'New Template'}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {template.channel === 'email' && (
            <Button
              variant="outline" size="sm"
              onClick={() => { setShowPreview(!showPreview); setShowHtmlEditor(false); }}
              style={{ gap: 4, borderRadius: 'var(--radius-md)', ...f('xs', 500) }}
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
          )}
          <Button
            size="sm" onClick={onSave} disabled={saving || !template.name.trim()}
            style={{ gap: 4, borderRadius: 'var(--radius-md)', backgroundColor: B.primary, color: B.primaryOn, ...f('xs', 500, B.primaryOn), opacity: (saving || !template.name.trim()) ? 0.5 : 1 }}
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel} style={{ gap: 4, ...f('xs', 500, B.muted) }}>
            <X size={14} /> Cancel
          </Button>
        </div>
      </div>

      {/* Preview mode for email */}
      {showPreview && template.channel === 'email' ? (
        <EmailPreview html={template.htmlContent || DEFAULT_EMAIL_HTML} />
      ) : (
        <div className={isMobile ? 'space-y-4' : 'grid grid-cols-[1fr_280px] gap-4'}>
          {/* Main editor */}
          <div className="space-y-4">
            {/* Name + Category row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Template Name</Label>
                <Input
                  value={template.name}
                  onChange={e => onChange({ name: e.target.value })}
                  placeholder="e.g., Welcome Email"
                  style={{ borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput, ...f('sm') }}
                />
              </div>
              <div>
                <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Category</Label>
                <Select value={template.category} onValueChange={(v: any) => onChange({ category: v })}>
                  <SelectTrigger style={{ borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput, ...f('sm'), height: 38 }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Channel */}
            <div>
              <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Channel</Label>
              <div className="flex gap-2">
                {(Object.entries(CHANNEL_META) as [Channel, typeof CHANNEL_META['email']][]).map(([ch, meta]) => {
                  const Icon = meta.icon;
                  const active = template.channel === ch;
                  return (
                    <button
                      key={ch}
                      onClick={() => onChange({ channel: ch })}
                      className="flex items-center gap-2"
                      style={{
                        padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                        border: `1.5px solid ${active ? meta.color : B.border}`,
                        backgroundColor: active ? meta.bg : 'transparent',
                        ...f('sm', 500, active ? meta.color : B.muted),
                      }}
                    >
                      <Icon size={16} />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email-specific fields */}
            {template.channel === 'email' && (
              <>
                <div>
                  <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Subject Line</Label>
                  <Input
                    value={template.subject || ''}
                    onChange={e => onChange({ subject: e.target.value })}
                    placeholder="Email subject..."
                    style={{ borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput, ...f('sm') }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                    <Label style={{ ...f('xs', 500, B.muted), margin: 0 }}>
                      {showHtmlEditor ? 'HTML Source' : 'Email Body (Plain Text)'}
                    </Label>
                    <button
                      onClick={() => setShowHtmlEditor(!showHtmlEditor)}
                      className="flex items-center gap-1"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', ...f('xs', 500, B.primary) }}
                    >
                      <Code size={12} />
                      {showHtmlEditor ? 'Plain Text' : 'Edit HTML'}
                    </button>
                  </div>
                  {showHtmlEditor ? (
                    <textarea
                      value={template.htmlContent || DEFAULT_EMAIL_HTML}
                      onChange={e => onChange({ htmlContent: e.target.value })}
                      className="w-full focus:outline-none"
                      rows={18}
                      style={{
                        padding: '12px 14px', borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${B.border}`, backgroundColor: '#1e1e1e',
                        fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                        fontSize: '13px', lineHeight: 1.5, color: '#d4d4d4',
                        resize: 'vertical', tabSize: 2,
                      }}
                    />
                  ) : (
                    <Textarea
                      value={template.body}
                      onChange={e => onChange({ body: e.target.value })}
                      placeholder="Use {{user_name}}, {{app_name}} etc. for dynamic content..."
                      className="focus:outline-none focus:ring-0"
                      rows={8}
                      style={{
                        borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`,
                        backgroundColor: B.bgInput, ...f('sm'), lineHeight: 1.6, resize: 'vertical',
                      }}
                    />
                  )}
                </div>
              </>
            )}

            {/* SMS-specific fields */}
            {template.channel === 'sms' && (
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                  <Label style={{ ...f('xs', 500, B.muted), margin: 0 }}>SMS Content</Label>
                  <span style={{
                    ...f('xs', 400, smsLength > 160 ? B.warning : B.muted),
                    padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                    backgroundColor: smsLength > 160 ? B.warningLight : B.bgMuted,
                  }}>
                    {smsLength}/160 ({smsSegments} segment{smsSegments > 1 ? 's' : ''})
                  </span>
                </div>
                <Textarea
                  value={template.smsContent || template.body || ''}
                  onChange={e => onChange({ smsContent: e.target.value, body: e.target.value })}
                  placeholder="Hi {{user_name}}, your check-in streak is {{checkin_streak}}!"
                  className="focus:outline-none focus:ring-0"
                  rows={4}
                  style={{
                    borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`,
                    backgroundColor: B.bgInput, ...f('sm'), lineHeight: 1.6, resize: 'vertical',
                  }}
                />
                <p style={{ ...f('xs', 400, B.muted), marginTop: 4 }}>
                  SMS over 160 chars will be split into multiple segments. Keep messages concise.
                </p>
              </div>
            )}

            {/* WhatsApp-specific fields */}
            {template.channel === 'whatsapp' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Brevo Template Name</Label>
                    <Input
                      value={template.whatsappTemplateName || ''}
                      onChange={e => onChange({ whatsappTemplateName: e.target.value })}
                      placeholder="e.g., welcome_message"
                      style={{ borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput, ...f('sm'), fontFamily: 'monospace' }}
                    />
                  </div>
                  <div>
                    <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Language</Label>
                    <Input
                      value={template.whatsappLanguage || 'en'}
                      onChange={e => onChange({ whatsappLanguage: e.target.value })}
                      placeholder="en"
                      style={{ borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput, ...f('sm') }}
                    />
                  </div>
                </div>
                <div>
                  <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Body Variables (comma-separated)</Label>
                  <Input
                    value={(template.whatsappBodyVars || []).join(', ')}
                    onChange={e => onChange({ whatsappBodyVars: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="user_name, app_name"
                    style={{ borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput, ...f('sm'), fontFamily: 'monospace' }}
                  />
                  <p style={{ ...f('xs', 400, B.muted), marginTop: 4 }}>
                    These map to the {'{{1}}'}, {'{{2}}'}, ... placeholders in your WhatsApp template.
                  </p>
                </div>
                <div>
                  <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Preview Text</Label>
                  <Textarea
                    value={template.body}
                    onChange={e => onChange({ body: e.target.value })}
                    placeholder="Preview of the message content..."
                    className="focus:outline-none focus:ring-0"
                    rows={4}
                    style={{
                      borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`,
                      backgroundColor: B.bgInput, ...f('sm'), lineHeight: 1.6, resize: 'vertical',
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Sidebar: Variables + info */}
          {!isMobile && (
            <div className="space-y-4">
              <Card style={{ borderRadius: 'var(--radius-lg)', border: `1px solid ${B.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', backgroundColor: B.bgMuted, borderBottom: `1px solid ${B.border}` }}>
                  <span style={f('xs', 500, B.muted)}>Variables</span>
                </div>
                <div style={{ padding: 8 }}>
                  {AVAILABLE_VARS.map(v => (
                    <button
                      key={v.key}
                      onClick={() => {
                        const field = template.channel === 'sms' ? 'smsContent'
                          : showHtmlEditor ? 'htmlContent' : 'body';
                        insertVariable(field as any, v.key);
                      }}
                      className="w-full text-left flex items-center justify-between"
                      style={{
                        padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: 'none',
                        backgroundColor: 'transparent', cursor: 'pointer', transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = B.bgMuted)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <span style={{ ...f('xs', 500), fontFamily: 'monospace' }}>{`{{${v.key}}}`}</span>
                      <Copy size={12} style={{ color: B.muted }} />
                    </button>
                  ))}
                </div>
              </Card>

              {/* Channel info card */}
              <Card style={{ borderRadius: 'var(--radius-lg)', border: `1px solid ${B.border}`, padding: 14 }}>
                <div className="space-y-2">
                  <span style={f('xs', 500, B.muted)}>Quick Tips</span>
                  {template.channel === 'email' && (
                    <ul style={{ ...f('xs', 400, B.muted), paddingLeft: 16, margin: 0, lineHeight: 1.6 }}>
                      <li>Use the HTML editor for full design control</li>
                      <li>Preview replaces variables with example data</li>
                      <li>Keep subject lines under 50 characters</li>
                      <li>Test with the Brevo API Config tab</li>
                    </ul>
                  )}
                  {template.channel === 'sms' && (
                    <ul style={{ ...f('xs', 400, B.muted), paddingLeft: 16, margin: 0, lineHeight: 1.6 }}>
                      <li>Keep under 160 chars to avoid multi-segment</li>
                      <li>Each variable expands to real text</li>
                      <li>No HTML or rich formatting</li>
                    </ul>
                  )}
                  {template.channel === 'whatsapp' && (
                    <ul style={{ ...f('xs', 400, B.muted), paddingLeft: 16, margin: 0, lineHeight: 1.6 }}>
                      <li>Template must be pre-approved by WhatsApp</li>
                      <li>Body vars map to numbered placeholders</li>
                      <li>Configure sender number in Brevo API Config</li>
                    </ul>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export function AdminCommunication({ onBack: _onBack }: { onBack?: () => void }) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'templates' | 'queue' | 'api-config'>('templates');
  const [channelFilter, setChannelFilter] = useState<Channel | 'all'>('all');

  const [templates, setTemplates] = useState<NotifTemplate[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editor state
  const [editingTemplate, setEditingTemplate] = useState<NotifTemplate | null>(null);

  // Broadcast form
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastType, setBroadcastType] = useState<'email' | 'sms'>('email');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState('all');

  const getAuthHeaders = useCallback(async (includeContentType = false) => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('Auth: getSession error in AdminCommunication:', error.message);
        const h: Record<string, string> = { 'Authorization': `Bearer ${publicAnonKey}` };
        if (includeContentType) h['Content-Type'] = 'application/json';
        return h;
      }
      const token = data.session?.access_token || publicAnonKey;
      const h: Record<string, string> = { 'Authorization': `Bearer ${token}` };
      if (includeContentType) h['Content-Type'] = 'application/json';
      return h;
    } catch (err) {
      console.warn('Auth: getAuthHeaders failed:', err);
      const h: Record<string, string> = { 'Authorization': `Bearer ${publicAnonKey}` };
      if (includeContentType) h['Content-Type'] = 'application/json';
      return h;
    }
  }, []);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${baseUrl}/admin/communication/templates`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      } else {
        console.error('Failed to fetch templates:', res.status);
      }
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  }, [getAuthHeaders, baseUrl]);

  // Load queue
  const loadQueue = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${baseUrl}/admin/communication/queue`, { headers });
      if (res.ok) {
        const data = await res.json();
        setQueue(data.queue || []);
      } else {
        console.error('Failed to fetch queue:', res.status);
      }
    } catch (err) {
      console.error('Error loading queue:', err);
    }
  }, [getAuthHeaders, baseUrl]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadTemplates(), loadQueue()]);
      setLoading(false);
    };
    load();
  }, [loadTemplates, loadQueue]);

  // CRUD
  const handleNewTemplate = (channel: Channel) => {
    setEditingTemplate({
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
    });
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate || !editingTemplate.name.trim()) {
      showToast('error', 'Validation', 'Template name is required');
      return;
    }
    setSaving(true);
    try {
      const headers = await getAuthHeaders(true);
      const res = await fetch(`${baseUrl}/admin/communication/templates`, {
        method: 'POST',
        headers,
        body: JSON.stringify(editingTemplate),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.template) {
          setTemplates(prev => {
            const idx = prev.findIndex(t => t.id === data.template.id);
            if (idx >= 0) { const u = [...prev]; u[idx] = data.template; return u; }
            return [...prev, data.template];
          });
        }
        showToast('success', 'Saved', 'Template saved successfully');
        setEditingTemplate(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast('error', 'Error', errData.error || 'Failed to save template');
      }
    } catch (err) {
      console.error('Error saving template:', err);
      showToast('error', 'Error', 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Delete this template? This cannot be undone.')) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${baseUrl}/admin/communication/templates/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id));
        if (editingTemplate?.id === id) setEditingTemplate(null);
        showToast('success', 'Deleted', 'Template deleted');
      } else {
        showToast('error', 'Error', 'Failed to delete template');
      }
    } catch (err) {
      console.error('Error deleting template:', err);
      showToast('error', 'Error', 'Failed to delete template');
    }
  };

  const handleDuplicate = (t: NotifTemplate) => {
    setEditingTemplate({
      ...t,
      id: '',
      name: `${t.name} (copy)`,
      created_at: new Date().toISOString(),
      updated_at: undefined,
    });
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastBody.trim()) {
      showToast('error', 'Validation', 'Subject and message are required');
      return;
    }
    try {
      const headers = await getAuthHeaders(true);
      const res = await fetch(`${baseUrl}/admin/communication/queue`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: broadcastType,
          recipient: broadcastAudience === 'all' ? 'all-users' : `segment-${broadcastAudience}`,
          subject: broadcastSubject,
          body: broadcastBody,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) setQueue(prev => [data.item, ...prev]);
        showToast('success', 'Queued', 'Broadcast message queued for delivery');
        setIsBroadcastOpen(false);
        setBroadcastSubject('');
        setBroadcastBody('');
      } else {
        showToast('error', 'Error', 'Failed to queue broadcast');
      }
    } catch (err) {
      console.error('Error queuing broadcast:', err);
      showToast('error', 'Error', 'Failed to queue broadcast');
    }
  };

  // Filtered templates
  const filteredTemplates = channelFilter === 'all'
    ? templates
    : templates.filter(t => t.channel === channelFilter);

  // Stats
  const stats = [
    { label: 'Email', value: templates.filter(t => t.channel === 'email').length, icon: <Mail className="w-4 h-4" style={{ color: B.primary }} /> },
    { label: 'SMS', value: templates.filter(t => t.channel === 'sms').length, icon: <Phone className="w-4 h-4" style={{ color: B.warning }} /> },
    { label: 'WhatsApp', value: templates.filter(t => t.channel === 'whatsapp').length, icon: <MessageSquare className="w-4 h-4" style={{ color: B.success }} /> },
    { label: 'Queued', value: queue.filter(n => n.status === 'pending').length, icon: <Send className="w-4 h-4" style={{ color: B.muted }} /> },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Phone className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  // ── Tab buttons ─────────────────────────────────────────────────
  const tabs = [
    { id: 'templates' as const, label: 'Templates' },
    { id: 'queue' as const, label: 'Queue' },
    { id: 'api-config' as const, label: 'Brevo API' },
  ];

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex items-center" style={{ gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setEditingTemplate(null); }}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              border: 'none', cursor: 'pointer',
              backgroundColor: activeTab === tab.id ? B.primary : B.bgMuted,
              color: activeTab === tab.id ? B.primaryOn : B.muted,
              ...f('sm', 500, activeTab === tab.id ? B.primaryOn : B.muted),
              transition: 'all 150ms ease',
            }}
          >
            {tab.label}
            {tab.id === 'queue' && queue.filter(q => q.status === 'pending').length > 0 && (
              <span style={{
                marginLeft: 6, padding: '1px 6px', borderRadius: 'var(--radius-pill)',
                backgroundColor: B.warningLight, ...f('xs', 500, B.warning),
              }}>
                {queue.filter(q => q.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* API Config tab */}
      {activeTab === 'api-config' && <AdminCommunicationAPI />}

      {/* Templates tab */}
      {activeTab === 'templates' && (
        <>
          {editingTemplate ? (
            <TemplateEditor
              template={editingTemplate}
              onChange={updates => setEditingTemplate({ ...editingTemplate, ...updates })}
              onSave={handleSaveTemplate}
              onCancel={() => setEditingTemplate(null)}
              saving={saving}
            />
          ) : (
            <>
              <AdminHeader
                title="Notification Templates"
                description="Create and manage email, SMS, and WhatsApp notification templates"
                stats={stats}
                actions={
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline" size="sm"
                      onClick={() => { loadTemplates(); }}
                      style={{ gap: 4, borderRadius: 'var(--radius-md)', ...f('xs', 500) }}
                    >
                      <RefreshCw size={14} />
                      {!isMobile && 'Refresh'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleNewTemplate('email')}
                      style={{ gap: 4, borderRadius: 'var(--radius-md)', backgroundColor: B.primary, color: B.primaryOn, ...f('xs', 500, B.primaryOn) }}
                    >
                      <Plus size={14} />
                      New Template
                    </Button>
                  </div>
                }
              />

              {/* Channel filter */}
              <div className="flex items-center gap-2" style={{ marginTop: 16, marginBottom: 16 }}>
                <button
                  onClick={() => setChannelFilter('all')}
                  style={{
                    padding: '6px 14px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
                    backgroundColor: channelFilter === 'all' ? B.primary : B.bgMuted,
                    ...f('xs', 500, channelFilter === 'all' ? B.primaryOn : B.muted),
                  }}
                >
                  All ({templates.length})
                </button>
                {(Object.entries(CHANNEL_META) as [Channel, typeof CHANNEL_META['email']][]).map(([ch, meta]) => {
                  const count = templates.filter(t => t.channel === ch).length;
                  const active = channelFilter === ch;
                  return (
                    <button
                      key={ch}
                      onClick={() => setChannelFilter(ch)}
                      className="flex items-center gap-1"
                      style={{
                        padding: '6px 14px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
                        backgroundColor: active ? meta.bg : B.bgMuted,
                        ...f('xs', 500, active ? meta.color : B.muted),
                      }}
                    >
                      {meta.label} ({count})
                    </button>
                  );
                })}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: B.muted }} />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <AdminEmptyState
                  icon={<FileText size={40} style={{ color: B.muted }} />}
                  title="No templates yet"
                  description={channelFilter === 'all'
                    ? 'Create your first notification template to start communicating with users.'
                    : `No ${CHANNEL_META[channelFilter as Channel]?.label || ''} templates found.`
                  }
                  action={
                    <div className="flex gap-2 mt-4">
                      {(Object.entries(CHANNEL_META) as [Channel, typeof CHANNEL_META['email']][]).map(([ch, meta]) => {
                        const Icon = meta.icon;
                        return (
                          <Button
                            key={ch}
                            variant="outline"
                            size="sm"
                            onClick={() => handleNewTemplate(ch)}
                            style={{ gap: 4, borderRadius: 'var(--radius-md)', ...f('xs', 500) }}
                          >
                            <Icon size={14} />
                            {meta.label}
                          </Button>
                        );
                      })}
                    </div>
                  }
                />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map(template => {
                    const meta = CHANNEL_META[template.channel] || CHANNEL_META.email;
                    const ChannelIcon = meta.icon;
                    return (
                      <Card
                        key={template.id}
                        className="group"
                        style={{ borderRadius: 'var(--radius-lg)', border: `1px solid ${B.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' }}
                        onClick={() => setEditingTemplate(template)}
                      >
                        {/* Channel bar */}
                        <div className="flex items-center gap-2" style={{ padding: '10px 16px', backgroundColor: meta.bg, borderBottom: `1px solid ${B.border}` }}>
                          <ChannelIcon size={14} style={{ color: meta.color }} />
                          <span style={f('xs', 500, meta.color)}>{meta.label}</span>
                          <div className="flex-1" />
                          <AdminStatusBadge status={resolveStatusVariant(template.category)} label={template.category} />
                        </div>

                        <CardContent style={{ padding: '14px 16px' }}>
                          <h4 style={{ ...f('sm', 500), margin: '0 0 4px' }}>{template.name}</h4>
                          {template.channel === 'email' && template.subject && (
                            <p style={{ ...f('xs', 400, B.muted), margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              Subject: {template.subject}
                            </p>
                          )}
                          {template.channel === 'sms' && (
                            <p style={{ ...f('xs', 400, B.muted), margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {(template.smsContent || template.body || '').slice(0, 60)}{(template.smsContent || template.body || '').length > 60 ? '...' : ''}
                            </p>
                          )}
                          {template.channel === 'whatsapp' && (
                            <p style={{ ...f('xs', 400, B.muted), margin: '0 0 8px', fontFamily: 'monospace' }}>
                              {template.whatsappTemplateName || 'No template name set'}
                            </p>
                          )}

                          <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
                            <Button
                              variant="outline" size="sm"
                              onClick={e => { e.stopPropagation(); setEditingTemplate(template); }}
                              style={{ gap: 4, borderRadius: 'var(--radius-md)', ...f('xs', 500) }}
                            >
                              <Pencil size={12} /> Edit
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              onClick={e => { e.stopPropagation(); handleDuplicate(template); }}
                              style={{ gap: 4, ...f('xs', 400, B.muted) }}
                            >
                              <Copy size={12} /> Copy
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              onClick={e => { e.stopPropagation(); handleDeleteTemplate(template.id); }}
                              style={{ gap: 4, ...f('xs', 400, B.danger) }}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Queue tab */}
      {activeTab === 'queue' && (
        <>
          <AdminHeader
            title="Notification Queue"
            description="Track broadcast messages and their delivery status"
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={loadQueue} style={{ gap: 4, borderRadius: 'var(--radius-md)', ...f('xs', 500) }}>
                  <RefreshCw size={14} /> Refresh
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsBroadcastOpen(true)}
                  style={{ gap: 4, borderRadius: 'var(--radius-md)', backgroundColor: B.primary, color: B.primaryOn, ...f('xs', 500, B.primaryOn) }}
                >
                  <Send size={14} /> Send Broadcast
                </Button>
              </div>
            }
          />

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: B.muted }} />
            </div>
          ) : queue.length === 0 ? (
            <AdminEmptyState
              icon={<Send size={40} style={{ color: B.muted }} />}
              title="No broadcasts yet"
              description="Send your first broadcast to see delivery status here."
            />
          ) : (
            <Card style={{ borderRadius: 'var(--radius-lg)', border: `1px solid ${B.border}`, overflow: 'hidden', marginTop: 16 }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: B.bgMuted }}>
                    <tr>
                      {['Type', 'Recipient', 'Subject', 'Status', 'Scheduled'].map(h => (
                        <th key={h} className="px-4 py-3 text-left" style={f('xs', 500, B.muted)}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: idx < queue.length - 1 ? `1px solid ${B.border}` : 'none' }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <span style={{ ...f('sm'), textTransform: 'capitalize' }}>{item.type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ ...f('xs', 400, B.muted), fontFamily: 'monospace' }}>{item.recipient}</td>
                        <td className="px-4 py-3" style={f('sm')}>{item.subject}</td>
                        <td className="px-4 py-3"><AdminStatusBadge status={item.status} /></td>
                        <td className="px-4 py-3" style={f('xs', 400, B.muted)}>{new Date(item.scheduled_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Broadcast form (inline) */}
          {isBroadcastOpen && (
            <Card style={{ borderRadius: 'var(--radius-lg)', border: `2px solid ${B.primary}`, marginTop: 16, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', backgroundColor: `color-mix(in srgb, ${B.primary} 4%, ${B.bgCard})`, borderBottom: `1px solid ${B.border}` }}>
                <div className="flex items-center justify-between">
                  <span style={f('sm', 500)}>Send Broadcast</span>
                  <button onClick={() => setIsBroadcastOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={16} style={{ color: B.muted }} />
                  </button>
                </div>
              </div>
              <CardContent style={{ padding: 20 }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Type</Label>
                      <Select value={broadcastType} onValueChange={(v: any) => setBroadcastType(v)}>
                        <SelectTrigger style={{ borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`, ...f('sm'), height: 38 }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Audience</Label>
                      <Select value={broadcastAudience} onValueChange={setBroadcastAudience}>
                        <SelectTrigger style={{ borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`, ...f('sm'), height: 38 }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="active">Active Users</SelectItem>
                          <SelectItem value="inactive">Inactive Users</SelectItem>
                          <SelectItem value="premium">Premium Users</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Subject</Label>
                    <Input value={broadcastSubject} onChange={e => setBroadcastSubject(e.target.value)} placeholder="Message subject..."
                      style={{ borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput, ...f('sm') }} />
                  </div>
                  <div>
                    <Label style={{ ...f('xs', 500, B.muted), marginBottom: 4, display: 'block' }}>Message</Label>
                    <Textarea value={broadcastBody} onChange={e => setBroadcastBody(e.target.value)} placeholder="Your message here..."
                      className="focus:outline-none focus:ring-0" rows={4}
                      style={{ borderRadius: 'var(--radius-md)', border: `1.5px solid ${B.border}`, backgroundColor: B.bgInput, ...f('sm'), resize: 'vertical' }} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsBroadcastOpen(false)} style={{ borderRadius: 'var(--radius-md)', ...f('xs', 500) }}>Cancel</Button>
                    <Button size="sm" onClick={handleSendBroadcast} disabled={!broadcastSubject || !broadcastBody}
                      style={{ gap: 4, borderRadius: 'var(--radius-md)', backgroundColor: B.primary, color: B.primaryOn, ...f('xs', 500, B.primaryOn) }}>
                      <Send size={14} /> Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
