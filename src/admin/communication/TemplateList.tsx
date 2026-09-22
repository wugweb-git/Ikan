import { FileText, Copy, Trash2, Pencil } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { AdminStatusBadge, resolveStatusVariant } from '../ui/kit/AdminStatusBadge';
import { AdminEmptyState } from '../ui/kit/AdminEmptyState';
import { cn } from '../ui/utils';
import { BTN_SM, CHANNEL_META, CHANNELS, type Channel, type NotifTemplate } from './communication-types';

const PILL = 'px-3.5 py-1.5 rounded-[var(--radius-pill)] border-none cursor-pointer text-xs font-medium';
const PILL_IDLE = 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]';
const CARD_LINE = 'm-0 mb-2 text-xs text-[var(--color-text-muted)]';

/** Channel filter pills + template cards (or the empty state). */
export function TemplateList({
  templates,
  channelFilter,
  onChannelFilter,
  onNew,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  templates: NotifTemplate[];
  channelFilter: Channel | 'all';
  onChannelFilter: (c: Channel | 'all') => void;
  onNew: (channel: Channel) => void;
  onEdit: (t: NotifTemplate) => void;
  onDuplicate: (t: NotifTemplate) => void;
  onDelete: (id: string) => void;
}) {
  const filtered = channelFilter === 'all'
    ? templates
    : templates.filter(t => t.channel === channelFilter);

  return (
    <>
      {/* Channel filter */}
      <div className="flex items-center gap-2 my-4">
        <button
          onClick={() => onChannelFilter('all')}
          className={cn(PILL, channelFilter === 'all'
            ? 'bg-[var(--color-primary-default)] text-[var(--color-primary-on)]'
            : PILL_IDLE)}
        >
          All ({templates.length})
        </button>
        {CHANNELS.map(ch => {
          const meta = CHANNEL_META[ch];
          const count = templates.filter(t => t.channel === ch).length;
          const active = channelFilter === ch;
          return (
            <button
              key={ch}
              onClick={() => onChannelFilter(ch)}
              className={cn(PILL, 'flex items-center gap-1', active ? cn(meta.bg, meta.text) : PILL_IDLE)}
            >
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState
          icon={<FileText size={40} className="text-[var(--color-text-muted)]" />}
          title="No templates yet"
          description={channelFilter === 'all'
            ? 'Create your first notification template to start communicating with users.'
            : `No ${CHANNEL_META[channelFilter]?.label || ''} templates found.`
          }
          action={
            <div className="flex gap-2 mt-4">
              {CHANNELS.map(ch => {
                const meta = CHANNEL_META[ch];
                const Icon = meta.icon;
                return (
                  <Button
                    key={ch}
                    variant="outline"
                    size="sm"
                    onClick={() => onNew(ch)}
                    className={cn(BTN_SM, 'text-[var(--color-text-primary)]')}
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
          {filtered.map(template => {
            const meta = CHANNEL_META[template.channel] || CHANNEL_META.email;
            const ChannelIcon = meta.icon;
            const smsText = template.smsContent || template.body || '';
            return (
              <Card
                key={template.id}
                className="group overflow-hidden cursor-pointer rounded-lg border border-[var(--color-border-default)] transition-[border-color] duration-150"
                onClick={() => onEdit(template)}
              >
                {/* Channel bar */}
                <div className={cn('flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-border-default)]', meta.bg)}>
                  <ChannelIcon size={14} className={meta.text} />
                  <span className={cn('text-xs font-medium', meta.text)}>{meta.label}</span>
                  <div className="flex-1" />
                  <AdminStatusBadge status={resolveStatusVariant(template.category)} label={template.category} />
                </div>

                <CardContent className="px-4 py-3.5">
                  <h4 className="m-0 mb-1 text-sm font-medium text-[var(--color-text-primary)]">{template.name}</h4>
                  {template.channel === 'email' && template.subject && (
                    <p className={cn(CARD_LINE, 'truncate')}>
                      Subject: {template.subject}
                    </p>
                  )}
                  {template.channel === 'sms' && (
                    <p className={cn(CARD_LINE, 'truncate')}>
                      {smsText.slice(0, 60)}{smsText.length > 60 ? '...' : ''}
                    </p>
                  )}
                  {template.channel === 'whatsapp' && (
                    <p className={cn(CARD_LINE, 'font-mono')}>
                      {template.whatsappTemplateName || 'No template name set'}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline" size="sm"
                      onClick={e => { e.stopPropagation(); onEdit(template); }}
                      className={cn(BTN_SM, 'text-[var(--color-text-primary)]')}
                    >
                      <Pencil size={12} /> Edit
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={e => { e.stopPropagation(); onDuplicate(template); }}
                      className="gap-1 text-xs! font-normal! text-[var(--color-text-muted)]"
                    >
                      <Copy size={12} /> Copy
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={e => { e.stopPropagation(); onDelete(template.id); }}
                      className="gap-1 text-xs! font-normal! text-[var(--color-status-danger)]"
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
  );
}
