import { Mail, Phone, Send, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AdminStatusBadge } from '../ui/kit/AdminStatusBadge';
import { AdminEmptyState } from '../ui/kit/AdminEmptyState';
import { AdminDataTable, type Column } from '../ui/kit/AdminDataTable';
import { cn } from '../ui/utils';
import {
  BTN_PRIMARY, BTN_SM, FIELD_INPUT, FIELD_LABEL, FIELD_TEXTAREA, SELECT_TRIGGER,
  type BroadcastInput, type QueueItem,
} from './communication-types';

const QUEUE_COLUMNS: Column<QueueItem>[] = [
  {
    header: 'Type',
    render: (item) => (
      <div className="flex items-center gap-2">
        {item.type === 'sms' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
        <span className="text-sm capitalize text-[var(--color-text-primary)]">{item.type}</span>
      </div>
    ),
  },
  {
    header: 'Recipient',
    render: (item) => <span className="text-xs font-mono text-[var(--color-text-muted)]">{item.recipient}</span>,
  },
  {
    header: 'Subject',
    render: (item) => <span className="text-sm text-[var(--color-text-primary)]">{item.subject}</span>,
  },
  { header: 'Status', render: (item) => <AdminStatusBadge status={item.status} /> },
  {
    header: 'Scheduled',
    render: (item) => (
      <span className="text-xs text-[var(--color-text-muted)]">{new Date(item.scheduled_at).toLocaleString()}</span>
    ),
  },
];

/** Queue table (or empty state). */
export function QueueTable({ queue }: { queue: QueueItem[] }) {
  if (queue.length === 0) {
    return (
      <AdminEmptyState
        icon={<Send size={40} className="text-[var(--color-text-muted)]" />}
        title="No broadcasts yet"
        description="Send your first broadcast to see delivery status here."
      />
    );
  }
  return (
    <AdminDataTable
      columns={QUEUE_COLUMNS}
      data={queue}
      showToolbar={false}
      paginate={false}
      mobileLayout="table"
    />
  );
}

/** Inline "Send Broadcast" form (controlled: the draft lives in the screen, so it survives close / tab switches). */
export function BroadcastForm({
  draft,
  onDraftChange,
  onSend,
  onClose,
}: {
  draft: BroadcastInput;
  onDraftChange: (updates: Partial<BroadcastInput>) => void;
  onSend: () => void;
  onClose: () => void;
}) {
  const { type, audience, subject, body } = draft;

  return (
    <Card className="mt-4 overflow-hidden rounded-lg border-2 border-[var(--color-primary-default)]">
      <div className="px-5 py-3.5 border-b border-[var(--color-border-default)] bg-[color-mix(in_srgb,var(--color-primary-default)_4%,var(--color-bg-card))]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Send Broadcast</span>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer">
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>Type</Label>
              <Select value={type} onValueChange={(v) => onDraftChange({ type: v as 'email' | 'sms' })}>
                <SelectTrigger className={SELECT_TRIGGER}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={FIELD_LABEL}>Audience</Label>
              <Select value={audience} onValueChange={(v) => onDraftChange({ audience: v })}>
                <SelectTrigger className={SELECT_TRIGGER}>
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
            <Label className={FIELD_LABEL}>Subject</Label>
            <Input value={subject} onChange={e => onDraftChange({ subject: e.target.value })} placeholder="Message subject..." className={FIELD_INPUT} />
          </div>
          <div>
            <Label className={FIELD_LABEL}>Message</Label>
            <Textarea value={body} onChange={e => onDraftChange({ body: e.target.value })} placeholder="Your message here..."
              className={cn(FIELD_TEXTAREA, 'leading-[inherit]')} rows={4} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className={cn(BTN_SM, 'text-[var(--color-text-primary)]')}>Cancel</Button>
            <Button size="sm" onClick={onSend} disabled={!subject || !body} className={BTN_PRIMARY}>
              <Send size={14} /> Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
