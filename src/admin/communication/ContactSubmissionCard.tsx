import { Mail, CircleCheck, Archive, Trash2, Loader2, ChevronDown, ChevronRight, Clock, User, Send, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AdminStatusBadge, type StatusVariant } from '../ui/kit/AdminStatusBadge';
import { cn } from '../ui/utils';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  submitted_at: string;
  updated_at?: string;
  adminNotes?: string;
}

export interface NewsletterSubscriber {
  email: string;
  name: string;
  subscribedAt: string;
  status: string;
  source: string;
}

export const STATUS_OPTIONS: { value: string; label: string; variant: StatusVariant }[] = [
  { value: 'new', label: 'New', variant: 'info' },
  { value: 'read', label: 'Read', variant: 'warning' },
  { value: 'replied', label: 'Replied', variant: 'success' },
  { value: 'archived', label: 'Archived', variant: 'neutral' },
];

const META = 'flex items-center gap-1 text-xs text-[var(--color-text-muted)]';
const ACTION_BTN = 'rounded-md!';

export function SubmissionCard({
  submission,
  expanded,
  onToggle,
  onStatusChange,
  onDelete,
  isLoading,
}: {
  submission: ContactSubmission;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}) {
  const statusVariant: StatusVariant =
    STATUS_OPTIONS.find(o => o.value === submission.status)?.variant ?? 'neutral';

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-lg border',
        submission.status === 'new' ? 'border-[var(--color-status-info)]' : 'border-[var(--color-border-default)]',
      )}
    >
      {/* Header */}
      <button
        onClick={() => {
          onToggle();
          if (submission.status === 'new') {
            onStatusChange(submission.id, 'read');
          }
        }}
        className="w-full flex items-center gap-3 p-4 text-left bg-transparent border-none cursor-pointer"
      >
        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">{submission.subject}</span>
            <AdminStatusBadge status={statusVariant} label={submission.status} dot />
          </div>
          <div className="flex items-center gap-3">
            <span className={META}>
              <User className="w-3 h-3" />
              {submission.name}
            </span>
            <span className={META}>
              <Mail className="w-3 h-3" />
              {submission.email}
            </span>
            <span className={META}>
              <Clock className="w-3 h-3" />
              {formatDate(submission.submitted_at)}
            </span>
          </div>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-4 border-t border-[var(--color-border-default)]">
          {/* Message */}
          <div className="p-4 mt-4 rounded-md bg-[var(--color-bg-muted)]">
            <p className="m-0 text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">
              {submission.message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {submission.status !== 'read' && (
              <Button variant="outline" size="sm" onClick={() => onStatusChange(submission.id, 'read')} disabled={isLoading} className={ACTION_BTN}>
                <Eye className="w-4 h-4 mr-1" />
                Mark Read
              </Button>
            )}
            {submission.status !== 'replied' && (
              <Button variant="outline" size="sm" onClick={() => onStatusChange(submission.id, 'replied')} disabled={isLoading} className={ACTION_BTN}>
                <CircleCheck className="w-4 h-4 mr-1" />
                Mark Replied
              </Button>
            )}
            {submission.status !== 'archived' && (
              <Button variant="outline" size="sm" onClick={() => onStatusChange(submission.id, 'archived')} disabled={isLoading} className={ACTION_BTN}>
                <Archive className="w-4 h-4 mr-1" />
                Archive
              </Button>
            )}
            <a
              href={`mailto:${submission.email}?subject=Re: ${encodeURIComponent(submission.subject)}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium no-underline text-[var(--color-primary-on)] bg-[var(--color-primary-default)]"
            >
              <Send className="w-4 h-4" />
              Reply via Email
            </a>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(submission.id)}
              disabled={isLoading}
              className={cn(ACTION_BTN, 'text-[var(--color-status-danger)]')}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = diffMs / (1000 * 60 * 60);

    if (diffH < 1) return `${Math.max(1, Math.round(diffMs / 60000))}m ago`;
    if (diffH < 24) return `${Math.round(diffH)}h ago`;
    if (diffH < 48) return 'Yesterday';

    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
