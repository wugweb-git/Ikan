/**
 * AdminBlockFormTemplate.tsx
 *
 * Shared, templatised building blocks for block editor UIs.
 * Used by:
 *   - AdminBlockTypeViewer (EditorPreview mocks)
 *
 * Purpose: visual consistency between preview & real admin forms.
 */

import React from 'react';
import { GripVertical, ChevronDown, Image as ImageIcon, Layers } from 'lucide-react';
import { cn } from '../ui/utils';

// ── Shared class strings ─────────────────────────────────────────
const MOCK_FIELD =
  'w-full rounded-[8px] bg-[var(--color-bg-input)] border border-[var(--color-border-default)] px-2 flex text-xs text-[var(--color-text-muted)]';

export const blockFormClasses = {
  wrap: 'rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-default)] overflow-hidden',
  headerBar: 'flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-muted)] border-b border-[var(--color-border-default)]',
  body: 'p-3 flex flex-col gap-2.5',
  fieldLabel: 'text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-[0.05em]',
  inputMock: cn(MOCK_FIELD, 'h-7 items-center'),
  textareaMock: cn(MOCK_FIELD, 'h-12 py-1.5 items-start whitespace-pre-line'),
  selectMock: cn(MOCK_FIELD, 'h-7 items-center justify-between'),
  checkboxRow: 'flex items-center gap-1.5 px-2 py-1.5 rounded-[6px] bg-[var(--color-bg-muted)] border border-[var(--color-border-default)]',
  sectionDivider: 'border-t border-[var(--color-border-default)] pt-2',
} as const;

// ── Reusable Sub-Components ──────────────────────────────────────

/** Header bar for a block card (grip + icon + type badge + title + collapse arrow) */
export function BlockHeaderBar({
  icon,
  typeBadge,
  title,
  emoji,
  children,
}: {
  icon?: React.ReactNode;
  typeBadge: string;
  title: string;
  emoji?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={blockFormClasses.headerBar}>
      <GripVertical size={12} className="text-[var(--color-text-muted)]" />
      {emoji && <span className="text-[14px]">{emoji}</span>}
      {icon}
      <span
        className={cn(
          'text-[9px] uppercase tracking-[0.05em] text-[var(--color-text-muted)] font-medium',
          emoji && 'px-1.5 py-px bg-[var(--color-accent-default)] rounded-[4px]',
        )}
      >
        {typeBadge}
      </span>
      <span className="text-[11px] text-[var(--color-text-primary)] font-medium flex-1">
        {title}
      </span>
      {children}
      <ChevronDown size={12} className="text-[var(--color-text-muted)]" />
    </div>
  );
}

/** Label for a form field */
export function FieldLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span className={cn(blockFormClasses.fieldLabel, 'mb-0.5', icon ? 'flex items-center gap-1' : 'block')}>
      {icon}
      {children}
    </span>
  );
}

/** Mock text input (for preview rendering) */
export function MockInput({ children, mono }: { children?: React.ReactNode; mono?: boolean }) {
  return <div className={cn(blockFormClasses.inputMock, mono && 'font-mono')}>{children}</div>;
}

/** Mock textarea (for preview rendering) */
export function MockTextarea({ children, height }: { children?: React.ReactNode; height?: string }) {
  return (
    <div className={blockFormClasses.textareaMock} style={height ? { height } : undefined}>
      {children}
    </div>
  );
}

/** Mock select dropdown (for preview rendering) */
export function MockSelect({ children }: { children?: React.ReactNode }) {
  return (
    <div className={blockFormClasses.selectMock}>
      <span>{children}</span>
      <ChevronDown size={10} />
    </div>
  );
}

/** Mock checkbox row */
export function MockCheckbox({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <div className={blockFormClasses.checkboxRow}>
      <div
        className={cn(
          'w-3 h-3 rounded-[3px] border-[1.5px] flex items-center justify-center',
          checked
            ? 'border-[var(--color-primary-default)] bg-[var(--color-primary-default)]'
            : 'border-[var(--color-border-default)] bg-transparent',
        )}
      >
        {checked && <span className="text-white text-[8px]">✓</span>}
      </div>
      <span className="text-[10px] text-[var(--color-text-primary)]">{label}</span>
    </div>
  );
}

/** 2-column grid layout */
export function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

/** Section separator with optional label */
export function SectionDivider({ label, icon, children }: {
  label?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className={blockFormClasses.sectionDivider}>
      {label && (
        <div className="flex items-center gap-1 mb-1.5">
          {icon}
          <span className={cn(blockFormClasses.fieldLabel, 'block m-0')}>{label}</span>
        </div>
      )}
      {children}
    </div>
  );
}

/** Media upload placeholder */
export function MockMediaUpload({ label }: { label?: string }) {
  return (
    <div className={blockFormClasses.sectionDivider}>
      <FieldLabel icon={<ImageIcon size={10} />}>Block Media</FieldLabel>
      <div className="w-full h-8 rounded-[8px] border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-muted)] flex items-center justify-center">
        <span className="text-[10px] text-[var(--color-text-muted)]">{label || 'Upload image or paste video URL'}</span>
      </div>
    </div>
  );
}

/** Wizard flow checkboxes (for Equip blocks) */
export function WizardFlowSection() {
  return (
    <SectionDivider label="Wizard Flow" icon={<Layers size={10} className="text-[var(--color-primary-default)]" />}>
      <FieldGrid>
        <MockCheckbox label="Auto-Advance" checked />
        <MockCheckbox label="Required" />
      </FieldGrid>
    </SectionDivider>
  );
}

/** Indented sub-section (for exercise config, etc.) */
export function IndentedSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-[var(--color-accent-default)] pl-2.5 flex flex-col gap-2">
      {children}
    </div>
  );
}
