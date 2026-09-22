import { useState, type ElementType, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, CircleCheck } from 'lucide-react';
import { Card } from '../../ui/card';
import { cn } from '../../ui/utils';
import { AdminStatusBadge } from '../../ui/kit/AdminStatusBadge';

/** Shared building blocks for the KV audit sections. */

// Button sizing/colours used throughout (hover keeps the fill, like the old inline styles).
export const BTN = 'h-[var(--ikan-component-button-height)] rounded-[var(--radius-md)]';
export const BTN_PRIMARY = 'bg-[var(--color-primary-default)] hover:bg-[var(--color-primary-default)] text-[var(--color-primary-on)]';
export const BTN_DANGER = 'bg-[var(--color-status-danger)] hover:bg-[var(--color-status-danger)] text-[var(--color-text-inverse)]';
export const BTN_WARNING = 'bg-[var(--color-status-warning)] hover:bg-[var(--color-status-warning)] text-[var(--color-text-inverse)]';

export type SectionVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const ICON_TONE: Record<SectionVariant, string> = {
  danger: 'bg-[var(--color-status-danger-light)] text-[var(--color-status-danger)]',
  warning: 'bg-[var(--color-status-warning-light)] text-[var(--color-status-warning)]',
  success: 'bg-[var(--color-status-success-light)] text-[var(--color-status-success)]',
  info: 'bg-[var(--color-info-light)] text-[var(--color-info-default)]',
  neutral: 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]',
};

// ─── Section wrapper ───────────────────────────────────────────
export function AuditSection({ title, icon: Icon, count, variant, children, defaultOpen = false }: {
  title: string;
  icon: ElementType;
  count: number;
  variant: SectionVariant;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <Card className="rounded-lg border border-[var(--color-border-default)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left bg-transparent border-0 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', ICON_TONE[variant])}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-medium text-[var(--color-text-primary)]">{title}</span>
          </div>
          <AdminStatusBadge status={variant} label={String(count)} />
        </div>
        <Chevron className="w-5 h-5 text-[var(--color-text-muted)]" />
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[var(--color-border-default)]">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </Card>
  );
}

// ─── Key badge for display ──────────────────────────────────────
export function KeyBadge({ keyName }: { keyName: string }) {
  return (
    <code className="font-mono text-xs bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] px-1.5 py-0.5 rounded-[var(--radius-xs)] break-all">
      {keyName}
    </code>
  );
}

/** Green "nothing to do" line. */
export function AllClear({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[var(--color-status-success)]">
      <CircleCheck className="w-4 h-4" />
      <span className="text-sm">{children}</span>
    </div>
  );
}

const RESULT_TONE = {
  success: 'bg-[var(--color-status-success-light)] border-[var(--color-status-success)] text-[var(--color-status-success)]',
  warning: 'bg-[var(--color-status-warning-light)] border-[var(--color-status-warning)] text-[var(--color-status-warning)]',
  danger: 'bg-[var(--color-status-danger-light)] border-[var(--color-status-danger)] text-[var(--color-status-danger)]',
} as const;

/** Inline outcome of a maintenance tool. Red when it starts with "Error". */
export function ResultBanner({ result, tone, className }: {
  result: string | null;
  /** Override the success tone (e.g. a pending purge confirmation is amber). */
  tone?: 'success' | 'warning';
  className?: string;
}) {
  if (!result) return null;
  const t = result.startsWith('Error') ? 'danger' : tone ?? 'success';
  return (
    <div className={cn('p-3 rounded-lg border text-sm', RESULT_TONE[t], className)}>
      {result}
    </div>
  );
}

/** Muted paragraph under a section title. */
export function SectionIntro({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-sm text-[var(--color-text-muted)]', className)}>{children}</p>;
}
