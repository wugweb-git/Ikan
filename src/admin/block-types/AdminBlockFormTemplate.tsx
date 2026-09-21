/**
 * AdminBlockFormTemplate.tsx
 * 
 * Shared, templatised building blocks for block editor UIs.
 * Used by:
 *   - AdminBlockTypeViewer (EditorPreview mocks)
 *   - BlockEditor (actual Equip block editing forms)
 *   - AdminCheckinTemplateBuilder (actual check-in step editing)
 * 
 * Purpose: visual consistency between preview & real admin forms.
 */

import React from 'react';
import { GripVertical, ChevronDown, Image as ImageIcon, Layers } from 'lucide-react';

// ── Style Tokens ─────────────────────────────────────────────────
const S = {
  font: 'var(--font-family-base)',
  fwMedium: 'var(--font-weight-medium)' as any,
  textPrimary: 'var(--color-text-primary)',
  textMuted: 'var(--color-text-muted)',
  textInverse: 'var(--color-primary-on)',
  bgCard: 'var(--color-bg-card)',
  bgMuted: 'var(--color-bg-muted)',
  bgInput: 'var(--color-bg-input)',
  bgPrimary: 'var(--color-primary-default)',
  bgAccent: 'var(--color-accent-default)',
  border: 'var(--color-border-default)',
  radiusLg: 'var(--radius-lg)',
  radiusMd: 'var(--radius-md)',
} as const;

// ── Shared styles ────────────────────────────────────────────────
export const blockFormStyles = {
  wrap: {
    borderRadius: S.radiusLg,
    backgroundColor: S.bgCard,
    border: `1px solid ${S.border}`,
    overflow: 'hidden',
  } satisfies React.CSSProperties,

  headerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: S.bgMuted,
    borderBottom: `1px solid ${S.border}`,
  } satisfies React.CSSProperties,

  body: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  } satisfies React.CSSProperties,

  fieldLabel: {
    fontFamily: S.font,
    fontSize: '10px',
    fontWeight: S.fwMedium,
    color: S.textMuted,
    marginBottom: '2px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  } satisfies React.CSSProperties,

  inputMock: {
    width: '100%',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: S.bgInput,
    border: `1px solid ${S.border}`,
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    fontSize: 'var(--text-xs)',
    color: S.textMuted,
    fontFamily: S.font,
  } satisfies React.CSSProperties,

  textareaMock: {
    width: '100%',
    height: '48px',
    borderRadius: '8px',
    backgroundColor: S.bgInput,
    border: `1px solid ${S.border}`,
    padding: '6px 8px',
    display: 'flex',
    alignItems: 'flex-start',
    fontSize: 'var(--text-xs)',
    color: S.textMuted,
    fontFamily: S.font,
  } satisfies React.CSSProperties,

  selectMock: {
    width: '100%',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: S.bgInput,
    border: `1px solid ${S.border}`,
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 'var(--text-xs)',
    color: S.textMuted,
    fontFamily: S.font,
  } satisfies React.CSSProperties,

  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 8px',
    borderRadius: '6px',
    backgroundColor: S.bgMuted,
    border: `1px solid ${S.border}`,
  } satisfies React.CSSProperties,

  sectionDivider: {
    borderTop: `1px solid ${S.border}`,
    paddingTop: '8px',
  } satisfies React.CSSProperties,
};

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
    <div style={blockFormStyles.headerBar}>
      <GripVertical size={12} style={{ color: S.textMuted }} />
      {emoji && <span style={{ fontSize: '14px' }}>{emoji}</span>}
      {icon}
      <span style={{
        fontSize: '9px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: S.textMuted,
        fontFamily: S.font,
        fontWeight: S.fwMedium,
        ...(emoji ? {
          padding: '1px 6px',
          backgroundColor: S.bgAccent,
          borderRadius: '4px',
        } : {}),
      }}>
        {typeBadge}
      </span>
      <span style={{
        fontSize: '11px',
        color: S.textPrimary,
        fontFamily: S.font,
        fontWeight: S.fwMedium,
        flex: 1,
      }}>
        {title}
      </span>
      {children}
      <ChevronDown size={12} style={{ color: S.textMuted }} />
    </div>
  );
}

/** Label for a form field */
export function FieldLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span style={{
      ...blockFormStyles.fieldLabel,
      ...(icon ? { display: 'flex', alignItems: 'center', gap: '4px' } : {}),
    }}>
      {icon}
      {children}
    </span>
  );
}

/** Mock text input (for preview rendering) */
export function MockInput({ children, mono }: { children?: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{
      ...blockFormStyles.inputMock,
      ...(mono ? { fontFamily: 'monospace' } : {}),
    }}>
      {children}
    </div>
  );
}

/** Mock textarea (for preview rendering) */
export function MockTextarea({ children, height }: { children?: React.ReactNode; height?: string }) {
  return (
    <div style={{
      ...blockFormStyles.textareaMock,
      ...(height ? { height } : {}),
      whiteSpace: 'pre-line',
    }}>
      {children}
    </div>
  );
}

/** Mock select dropdown (for preview rendering) */
export function MockSelect({ children }: { children?: React.ReactNode }) {
  return (
    <div style={blockFormStyles.selectMock}>
      <span>{children}</span>
      <ChevronDown size={10} />
    </div>
  );
}

/** Mock checkbox row */
export function MockCheckbox({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <div style={blockFormStyles.checkboxRow}>
      <div style={{
        width: 12,
        height: 12,
        borderRadius: 3,
        border: `1.5px solid ${checked ? S.bgPrimary : S.border}`,
        backgroundColor: checked ? S.bgPrimary : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {checked && <span style={{ color: 'white', fontSize: '8px' }}>✓</span>}
      </div>
      <span style={{ fontSize: '10px', fontFamily: S.font, color: S.textPrimary }}>{label}</span>
    </div>
  );
}

/** 2-column grid layout */
export function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      {children}
    </div>
  );
}

/** Section separator with optional label */
export function SectionDivider({ label, icon }: { label?: string; icon?: React.ReactNode }) {
  return (
    <div style={blockFormStyles.sectionDivider}>
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
          {icon}
          <span style={{ ...blockFormStyles.fieldLabel, margin: 0 }}>{label}</span>
        </div>
      )}
    </div>
  );
}

/** Media upload placeholder */
export function MockMediaUpload({ label }: { label?: string }) {
  return (
    <div style={blockFormStyles.sectionDivider}>
      <FieldLabel icon={<ImageIcon size={10} />}>Block Media</FieldLabel>
      <div style={{
        width: '100%',
        height: '32px',
        borderRadius: '8px',
        border: `1px dashed ${S.border}`,
        backgroundColor: S.bgMuted,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: '10px', color: S.textMuted }}>{label || 'Upload image or paste video URL'}</span>
      </div>
    </div>
  );
}

/** Wizard flow checkboxes (for Equip blocks) */
export function WizardFlowSection() {
  return (
    <SectionDivider label="Wizard Flow" icon={<Layers size={10} style={{ color: S.bgPrimary }} />}>
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
    <div style={{
      borderLeft: `2px solid ${S.bgAccent}`,
      paddingLeft: '10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      {children}
    </div>
  );
}
