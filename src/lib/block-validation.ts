/**
 * Block validation — what a block needs before it can work.
 *
 * Until 2026-09-04 nothing validated block content at any layer. A day could be
 * saved and published with zero blocks, a select with no options, a clinical
 * item with no scale, or an input-table with no columns, and the only signal was
 * a deduped `console.warn` that reached nobody. `validateBlockForDayType` in
 * `day-presets.ts` looked like the guardrail but had **zero production callers**
 * and its allow-list branch returned `allowed: true` unconditionally.
 *
 * This checks the LIVE shape — `exerciseConfig` — rather than the target model's
 * field names in `INTERACTION_REQUIREMENTS`, because the live shape is what the
 * editor edits and what the renderer reads. When blocks migrate to the new
 * model, this collapses into `missingRequirements()`.
 *
 * Dependency-free on purpose: it must run under `node --test`.
 */
import { resolveInteraction, type Activity, type InteractionType } from './equip-admin-types.ts';

export interface BlockIssue {
  /** `error` blocks a publish; `warning` is authored-content advice. */
  level: 'error' | 'warning';
  /** Stable code, so a UI can group or suppress without matching prose. */
  code: string;
  message: string;
}

const nonEmpty = (v: unknown): boolean => Array.isArray(v) ? v.length > 0 : !!v;

/**
 * What each interaction needs in `exerciseConfig` to render as anything.
 * Every entry here is a shape that currently renders as an empty widget.
 */
const REQUIRED: Partial<Record<InteractionType, { check: (c: any, b: Activity) => boolean; code: string; message: string }[]>> = {
  'select-one':  [{ check: c => nonEmpty(c?.options), code: 'no-options',
                    message: 'A single-select needs at least one option — it renders as an empty list.' }],
  'select-many': [{ check: c => nonEmpty(c?.options), code: 'no-options',
                    message: 'A multi-select needs at least one option — it renders as an empty list.' }],
  // NOT an error: `renderRatingScale` (BlockRenderer.tsx:735-742) defaults to a
  // 1-5 range with "Not at all"/"Very much" labels when no scale is declared, so
  // the block works. Calibrating against live content caught this as a false
  // positive on Sleep Tight's "Sleep Duration". A validator that flags working
  // content teaches authors to ignore it.
  'rate':        [],
  'clinical':    [{ check: c => nonEmpty(c?.scale), code: 'no-scale',
                    message: 'A clinical instrument needs its scale — without one the answers cannot be scored.' },
                  { check: c => nonEmpty(c?.questions) || nonEmpty(c?.prompt), code: 'no-questions',
                    message: 'A clinical instrument needs its questions.' }],
  // Verified against `renderChecklist` (BlockRenderer.tsx:326), which reads
  // `listItems || options || []` and renders an EMPTY LIST otherwise. Note it
  // does not read `rows` — a `row_list` carrying only `rows` renders nothing,
  // which is why one live block is correctly flagged here despite looking
  // configured.
  'check':       [{ check: c => nonEmpty(c?.listItems) || nonEmpty(c?.options) || nonEmpty(c?.items), code: 'no-items',
                    message: 'A checklist needs items in listItems or options — with neither it renders an empty list. (`rows` is not read by the renderer.)' }],
  'input-table': [{ check: c => nonEmpty(c?.columns) || nonEmpty(c?.tableColumns), code: 'no-columns',
                    message: 'A table needs columns — with none it renders a single unlabelled cell.' }],
  'track-table': [{ check: c => nonEmpty(c?.columns) || nonEmpty(c?.tableColumns), code: 'no-columns',
                    message: 'A tracking grid needs columns.' }],
  'write':       [{ check: (c, b) => nonEmpty(c?.prompt) || nonEmpty(b.title), code: 'no-prompt',
                    message: 'A written answer needs a prompt or a title, or the user is given a blank box and no question.' }],
  'number':      [{ check: (c, b) => nonEmpty(c?.prompt) || nonEmpty(b.title), code: 'no-prompt',
                    message: 'A number entry needs a prompt saying what to enter.' }],
  'upload':      [{ check: c => nonEmpty(c?.acceptedFileTypes), code: 'no-file-types',
                    message: 'An upload needs its accepted file types.' }],
  'read':        [{ check: (c, b) => nonEmpty(b.content) || nonEmpty(b.image_url), code: 'no-content',
                    message: 'A lesson with no content and no media renders as an empty card.' }],
  'watch':       [{ check: (c, b) => nonEmpty(b.image_url), code: 'no-media',
                    message: 'A watch block needs media to play.' }],
};

/** Everything wrong with this block, on its own terms. Never throws. */
export function validateBlock(block: Activity): BlockIssue[] {
  const issues: BlockIssue[] = [];
  if (!block) return issues;

  let interaction: InteractionType;
  try {
    interaction = resolveInteraction(block);
  } catch {
    return [{ level: 'error', code: 'unresolvable',
              message: 'This block’s type and activity could not be resolved to anything renderable.' }];
  }

  for (const rule of REQUIRED[interaction] ?? []) {
    if (!rule.check(block.exerciseConfig, block)) {
      issues.push({ level: 'error', code: rule.code, message: rule.message });
    }
  }

  // Advisory, not an error — the block renders, it just renders a default.
  if (interaction === 'rate' && !nonEmpty(block.exerciseConfig?.scale)) {
    issues.push({ level: 'warning', code: 'default-scale',
                  message: 'No scale declared, so this uses the default 1–5 with generic labels.' });
  }

  if (!block.title?.trim()) {
    issues.push({ level: 'warning', code: 'no-title',
                  message: 'Untitled. The player falls back to the prompt, which is usually not a heading.' });
  }

  return issues;
}

/** Day-level roll-up. A day with no blocks is publishable today; it should not be. */
export function validateDay(
  blocks: Activity[] | undefined,
): { blockIssues: Map<string, BlockIssue[]>; dayIssues: BlockIssue[] } {
  const blockIssues = new Map<string, BlockIssue[]>();
  const dayIssues: BlockIssue[] = [];
  const list = blocks ?? [];

  if (list.length === 0) {
    dayIssues.push({ level: 'error', code: 'empty-day',
                     message: 'This day has no blocks. A user reaching it sees an empty screen.' });
  }

  const seen = new Set<string>();
  for (const b of list) {
    if (b?.id) {
      if (seen.has(b.id)) {
        dayIssues.push({ level: 'error', code: 'duplicate-block-id',
                         message: `Two blocks on this day share the id "${b.id}" — they would write to the same answer.` });
      }
      seen.add(b.id);
    }
    const issues = validateBlock(b);
    if (issues.length) blockIssues.set(b?.id ?? '(no id)', issues);
  }

  return { blockIssues, dayIssues };
}

/** Convenience: does anything here block a publish? */
export function hasBlockingIssues(r: ReturnType<typeof validateDay>): boolean {
  if (r.dayIssues.some(i => i.level === 'error')) return true;
  for (const issues of r.blockIssues.values()) {
    if (issues.some(i => i.level === 'error')) return true;
  }
  return false;
}
