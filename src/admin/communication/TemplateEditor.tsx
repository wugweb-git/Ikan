import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Copy, Code, X, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useIsMobile } from '../ui/hooks/useIsMobile';
import { cn } from '../ui/utils';
import {
  AVAILABLE_VARS, BTN_PRIMARY, BTN_SM, CATEGORIES, CHANNEL_META, CHANNELS, DEFAULT_EMAIL_HTML,
  FIELD_INPUT, FIELD_LABEL, FIELD_TEXTAREA, SELECT_TRIGGER,
  type NotifTemplate, type TemplateCategory,
} from './communication-types';

// ═══════════════════════════════════════════════════════════════════
// EMAIL HTML PREVIEW
// ═══════════════════════════════════════════════════════════════════
function EmailPreview({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.open();
    // Replace variables with example values for preview
    let previewHtml = html;
    AVAILABLE_VARS.forEach(v => {
      previewHtml = previewHtml.replace(new RegExp(`\\{\\{${v.key}\\}\\}`, 'g'), v.example);
    });
    doc.write(previewHtml);
    doc.close();
  }, [html]);

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-[var(--grey-1)]">
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--color-bg-muted)] border-b border-[var(--color-border-default)]">
        <div className="flex items-center gap-2">
          {/* Window-chrome dots (decorative, fixed colours) */}
          <div className="size-2.5 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
          <div className="size-2.5 rounded-full" style={{ backgroundColor: '#FFBD2E' }} />
          <div className="size-2.5 rounded-full" style={{ backgroundColor: '#28CA41' }} />
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">Email Preview</span>
        <div className="w-[30px]" />
      </div>
      <iframe
        ref={iframeRef}
        title="Email Preview"
        className="w-full h-[500px] border-none bg-[var(--grey-1)]"
        sandbox="allow-same-origin"
      />
    </div>
  );
}

const TIP_LIST = 'text-xs text-[var(--color-text-muted)] pl-4 m-0 leading-[1.6]';

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE EDITOR
// ═══════════════════════════════════════════════════════════════════
export function TemplateEditor({
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
  const saveDisabled = saving || !template.name.trim();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex items-center justify-center size-9 rounded-md', channelMeta.bg)}>
            <ChannelIcon size={18} className={channelMeta.text} />
          </div>
          <div>
            <span className="text-xs font-medium text-[var(--color-text-muted)]">{channelMeta.label} Template</span>
            <h3 className="m-0 text-lg font-medium text-[var(--color-text-primary)]">{template.name || 'New Template'}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {template.channel === 'email' && (
            <Button
              variant="outline" size="sm"
              onClick={() => { setShowPreview(!showPreview); setShowHtmlEditor(false); }}
              className={cn(BTN_SM, 'text-[var(--color-text-primary)]')}
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
          )}
          <Button size="sm" onClick={onSave} disabled={saveDisabled} className={BTN_PRIMARY}>
            <Save size={14} />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel} className={cn(BTN_SM, 'text-[var(--color-text-muted)]')}>
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
                <Label className={FIELD_LABEL}>Template Name</Label>
                <Input
                  value={template.name}
                  onChange={e => onChange({ name: e.target.value })}
                  placeholder="e.g., Welcome Email"
                  className={FIELD_INPUT}
                />
              </div>
              <div>
                <Label className={FIELD_LABEL}>Category</Label>
                <Select value={template.category} onValueChange={(v) => onChange({ category: v as TemplateCategory })}>
                  <SelectTrigger className={cn(SELECT_TRIGGER, 'bg-[var(--color-bg-input)]!')}>
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
              <Label className={FIELD_LABEL}>Channel</Label>
              <div className="flex gap-2">
                {CHANNELS.map(ch => {
                  const meta = CHANNEL_META[ch];
                  const Icon = meta.icon;
                  const active = template.channel === ch;
                  return (
                    <button
                      key={ch}
                      onClick={() => onChange({ channel: ch })}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer border-[1.5px] text-sm font-medium',
                        active ? cn(meta.border, meta.bg, meta.text) : 'border-[var(--color-border-default)] bg-transparent text-[var(--color-text-muted)]',
                      )}
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
                  <Label className={FIELD_LABEL}>Subject Line</Label>
                  <Input
                    value={template.subject || ''}
                    onChange={e => onChange({ subject: e.target.value })}
                    placeholder="Email subject..."
                    className={FIELD_INPUT}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className={cn(FIELD_LABEL, 'm-0')}>
                      {showHtmlEditor ? 'HTML Source' : 'Email Body (Plain Text)'}
                    </Label>
                    <button
                      onClick={() => setShowHtmlEditor(!showHtmlEditor)}
                      className="flex items-center gap-1 bg-transparent border-none cursor-pointer text-xs font-medium text-[var(--color-primary-default)]"
                    >
                      <Code size={12} />
                      {showHtmlEditor ? 'Plain Text' : 'Edit HTML'}
                    </button>
                  </div>
                  {showHtmlEditor ? (
                    <textarea
                      value={template.htmlContent || DEFAULT_EMAIL_HTML}
                      onChange={e => onChange({ htmlContent: e.target.value })}
                      className="w-full focus:outline-none px-3.5 py-3 rounded-md border-[1.5px] border-[var(--color-border-default)] text-[13px] leading-[1.5] resize-y [tab-size:2]"
                      rows={18}
                      style={{
                        // Code-editor look (fixed dark theme, independent of the admin palette)
                        backgroundColor: '#1e1e1e',
                        color: '#d4d4d4',
                        fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                      }}
                    />
                  ) : (
                    <Textarea
                      value={template.body}
                      onChange={e => onChange({ body: e.target.value })}
                      placeholder="Use {{user_name}}, {{app_name}} etc. for dynamic content..."
                      className={FIELD_TEXTAREA}
                      rows={8}
                    />
                  )}
                </div>
              </>
            )}

            {/* SMS-specific fields */}
            {template.channel === 'sms' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className={cn(FIELD_LABEL, 'm-0')}>SMS Content</Label>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-[var(--radius-pill)]',
                      smsLength > 160
                        ? 'text-[var(--color-status-warning)] bg-[var(--color-status-warning-light)]'
                        : 'text-[var(--color-text-muted)] bg-[var(--color-bg-muted)]',
                    )}
                  >
                    {smsLength}/160 ({smsSegments} segment{smsSegments > 1 ? 's' : ''})
                  </span>
                </div>
                <Textarea
                  value={template.smsContent || template.body || ''}
                  onChange={e => onChange({ smsContent: e.target.value, body: e.target.value })}
                  placeholder="Hi {{user_name}}, your check-in streak is {{checkin_streak}}!"
                  className={FIELD_TEXTAREA}
                  rows={4}
                />
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  SMS over 160 chars will be split into multiple segments. Keep messages concise.
                </p>
              </div>
            )}

            {/* WhatsApp-specific fields */}
            {template.channel === 'whatsapp' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className={FIELD_LABEL}>Brevo Template Name</Label>
                    <Input
                      value={template.whatsappTemplateName || ''}
                      onChange={e => onChange({ whatsappTemplateName: e.target.value })}
                      placeholder="e.g., welcome_message"
                      className={cn(FIELD_INPUT, 'font-mono')}
                    />
                  </div>
                  <div>
                    <Label className={FIELD_LABEL}>Language</Label>
                    <Input
                      value={template.whatsappLanguage || 'en'}
                      onChange={e => onChange({ whatsappLanguage: e.target.value })}
                      placeholder="en"
                      className={FIELD_INPUT}
                    />
                  </div>
                </div>
                <div>
                  <Label className={FIELD_LABEL}>Body Variables (comma-separated)</Label>
                  <Input
                    value={(template.whatsappBodyVars || []).join(', ')}
                    onChange={e => onChange({ whatsappBodyVars: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="user_name, app_name"
                    className={cn(FIELD_INPUT, 'font-mono')}
                  />
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    These map to the {'{{1}}'}, {'{{2}}'}, ... placeholders in your WhatsApp template.
                  </p>
                </div>
                <div>
                  <Label className={FIELD_LABEL}>Preview Text</Label>
                  <Textarea
                    value={template.body}
                    onChange={e => onChange({ body: e.target.value })}
                    placeholder="Preview of the message content..."
                    className={FIELD_TEXTAREA}
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>

          {/* Sidebar: Variables + info */}
          {!isMobile && (
            <div className="space-y-4">
              <Card className="overflow-hidden rounded-lg border border-[var(--color-border-default)]">
                <div className="px-3.5 py-2.5 bg-[var(--color-bg-muted)] border-b border-[var(--color-border-default)]">
                  <span className="text-xs font-medium text-[var(--color-text-muted)]">Variables</span>
                </div>
                <div className="p-2">
                  {AVAILABLE_VARS.map(v => (
                    <button
                      key={v.key}
                      onClick={() => {
                        const field = template.channel === 'sms' ? 'smsContent'
                          : showHtmlEditor ? 'htmlContent' : 'body';
                        insertVariable(field, v.key);
                      }}
                      className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-sm border-none bg-transparent cursor-pointer transition-colors duration-150 hover:bg-[var(--color-bg-muted)]"
                    >
                      <span className="text-xs font-medium font-mono text-[var(--color-text-primary)]">{`{{${v.key}}}`}</span>
                      <Copy size={12} className="text-[var(--color-text-muted)]" />
                    </button>
                  ))}
                </div>
              </Card>

              {/* Channel info card */}
              <Card className="p-3.5 rounded-lg border border-[var(--color-border-default)]">
                <div className="space-y-2">
                  <span className="text-xs font-medium text-[var(--color-text-muted)]">Quick Tips</span>
                  {template.channel === 'email' && (
                    <ul className={TIP_LIST}>
                      <li>Use the HTML editor for full design control</li>
                      <li>Preview replaces variables with example data</li>
                      <li>Keep subject lines under 50 characters</li>
                      <li>Test with the Brevo API Config tab</li>
                    </ul>
                  )}
                  {template.channel === 'sms' && (
                    <ul className={TIP_LIST}>
                      <li>Keep under 160 chars to avoid multi-segment</li>
                      <li>Each variable expands to real text</li>
                      <li>No HTML or rich formatting</li>
                    </ul>
                  )}
                  {template.channel === 'whatsapp' && (
                    <ul className={TIP_LIST}>
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
