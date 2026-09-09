/**
 * Block validation — what a block needs before it can work.
 *
 * Until 2026-09-04 nothing validated block content at any layer. A day could be
 * saved and published with zero blocks, a select with no options, a clinical
 * item with no scale, or an input-table with no columns, and the only signal was
 * a deduped `console.warn` that reached nobody. `validateBlockForDayType` in
 * `block-type-rules.ts` looked like the guardrail but had **zero production callers**
 * and its allow-list branch returned `allowed: true` unconditionally.
 *
 * This checks the LIVE shape — `exerciseConfig` — rather than the target model's
 * field names in `INTERACTION_REQUIREMENTS`, because the live shape is what the
 * editor edits and what the renderer reads. When blocks migrate to the new
 * model, this collapses into `missingRequirements()`.
 *
 * Dependency-free on purpose: it must run under `node --test`.
 */
import { resolveInteraction, configOf, type Activity, type InteractionType } from './block-model.ts';
import { SCALE_BACKED, RESPONSE_PRODUCING } from './content-hierarchy.ts';

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
  'view':        [{ check: (c, b) => nonEmpty(b.image_url), code: 'no-media',
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
    if (!rule.check(configOf(block), block)) {
      issues.push({ level: 'error', code: rule.code, message: rule.message });
    }
  }

  // Advisory, not an error — the block renders, it just renders a default.
  if (interaction === 'rate' && !nonEmpty(configOf(block)?.scale)) {
    issues.push({ level: 'warning', code: 'default-scale',
                  message: 'No scale declared, so this uses the default 1–5 with generic labels.' });
  }

  if (!block.title?.trim()) {
    issues.push({ level: 'warning', code: 'no-title',
                  message: 'Untitled. The player falls back to the prompt, which is usually not a heading.' });
  }

  issues.push(...validateBlockTypeRules(block, interaction));

  return issues;
}

/**
 * The per-BLOCK-TYPE rules from the block type reference.
 *
 * `REQUIRED` above keys on INTERACTION — "can this widget draw at all". These
 * key on TYPE — what the reference says a block of this kind must carry, which
 * is a different and stricter question. An `input-table` draws fine with no
 * `key`; a `sleep-diary` with no key produces no diary, which is the entire
 * reason the type exists.
 *
 * Reported, never blocking. On today's content this fires on **107 keyless
 * input-tables, 35 scale-backed blocks with no `scale_ref` and 5 checklists
 * with no items** — none of which is bad authoring, because the editor has
 * never had a field for `key` and no block has ever referenced a shared scale.
 * Turning these into errors before those two things exist would fail content
 * for lacking something it was never possible to give.
 */
function validateBlockTypeRules(block: Activity, interaction: InteractionType): BlockIssue[] {
  const out: BlockIssue[] = [];
  const cfg = configOf(block);
  const key = cfg?.key;
  /*
    DERIVED, NOT LISTED.

    This was a hardcoded `['exercise','journal','checklist','sleep-diary']`, and
    it was wrong within the day: the block remap moved live content onto
    `tracker` (82 blocks) and `workshop` (5), neither of which was in the list,
    so 67 keyless blocks that DO produce an answer were invisible to the check
    that exists to find them.

    Whether a block needs a key is not a fact about its type at all — it is
    whether the thing it draws produces a response, which `RESPONSE_PRODUCING`
    already states. A type added or a block retyped cannot slip past a derived
    rule the way it slipped past a list.
  */
  const needsKey = RESPONSE_PRODUCING.includes(interaction);

  if (needsKey && !(typeof key === 'string' && key.trim())) {
    out.push({ level: 'warning', code: 'no-response-key',
               message: `This block answers something (${interaction}), and nothing says where the answer goes. `
                      + 'Without a key its answers file under this block id, so the same question '
                      + 'asked on two days becomes two unrelated facts.' });
  }

  switch (block.type) {
    case 'exercise':
      if (!cfg?.subtype) {
        out.push({ level: 'error', code: 'no-activity',
                   message: 'An exercise with no activity has nothing for the user to do — it '
                          + 'falls through to a free-text box.' });
      }
      // Scale-backed: the option set should come from the catalog, not be inlined.
      if (SCALE_BACKED.includes(interaction) && !(block as { scale_ref?: string }).scale_ref) {
        out.push({ level: 'warning', code: 'no-scale-ref',
                   message: `A ${interaction} takes its options from a shared scale. This one `
                          + 'inlines them, so the same scale is re-typed per block and cannot be '
                          + 'corrected in one place.' });
      }
      break;

    case 'journal':
      if (!nonEmpty(cfg?.prompt)) {
        out.push({ level: 'warning', code: 'no-prompt',
                   message: 'A journal is a prompt and a box. With no prompt it is just a box.' });
      }
      break;

    case 'sleep-diary':
      if (!nonEmpty(cfg?.columns) && !nonEmpty(cfg?.tableColumns)) {
        out.push({ level: 'error', code: 'no-columns',
                   message: 'A sleep diary needs its columns — bedtime, wake time, quality. With '
                          + 'none it renders one unlabelled cell.' });
      }
      break;

    default:
      break;
  }

  return out;
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

  /*
    `conclude` closes the day — the reference says "always last". Both halves of
    that are day-level facts a single block cannot see.

    Live, 13 days have no closing card at all: productivity-reset has none on
    any of its 8 days, and sleep-tight, stress-buster and burnout-reset have 2,
    2 and 1. Reported so an author sees it while editing rather than in a census.
  */
  const concludes = list.filter(b => b?.type === 'conclude');
  if (list.length > 0 && concludes.length === 0) {
    dayIssues.push({ level: 'warning', code: 'no-conclude',
                     message: 'This day has no closing block, so it ends on whatever came last '
                            + 'with no sign it is finished.' });
  }
  if (concludes.length > 1) {
    dayIssues.push({ level: 'error', code: 'multiple-concludes',
                     message: `${concludes.length} closing blocks on one day — only the last can be the end.` });
  }
  if (concludes.length === 1 && list[list.length - 1]?.type !== 'conclude') {
    dayIssues.push({ level: 'error', code: 'conclude-not-last',
                     message: 'The closing block is not last, so content follows the end of the day.' });
  }

  const seen = new Set<string>();
  /*
    Two blocks on one day sharing a RESPONSE KEY collide exactly as two sharing
    an id do — `responseKeyOf` is what an answer files under, and the id is only
    its fallback. The id check has been here since the beginning; the key check
    had not, and Duplicate (§21 item 3) makes the collision one click away: the
    copy keeps the original's key, which is right across days and wrong on one.
  */
  const keySeen = new Map<string, string>();
  for (const b of list) {
    if (b?.id) {
      if (seen.has(b.id)) {
        dayIssues.push({ level: 'error', code: 'duplicate-block-id',
                         message: `Two blocks on this day share the id "${b.id}" — they would write to the same answer.` });
      }
      seen.add(b.id);
    }
    const declaredKey = configOf(b)?.key;
    if (typeof declaredKey === 'string' && declaredKey.trim()) {
      const key = declaredKey.trim();
      const firstTitle = keySeen.get(key);
      if (firstTitle !== undefined) {
        /*
          WARNING, not error, and the difference is calibration rather than
          principle: four days of live content already do this — burnout-reset
          day 2 and sleep-tight day 9 (`small_task` ×4), stress-buster day 11
          (`thoughts_and_feelings` ×4), sleep-tight day 13 (`ideating_solutions`
          ×2). Shipping it as an error would have made four existing days
          unpublishable on a rule nobody had been told about. Report first,
          enforce once the content is fixed — the same order §18 2b used.
        */
        dayIssues.push({ level: 'warning', code: 'duplicate-response-key',
                         message: `"${b?.title || b?.id}" and "${firstTitle}" both answer under the key "${key}" on this day — `
                                + 'the second answer overwrites the first. Give one of them its own key, '
                                + 'or move it to another day.' });
      } else {
        keySeen.set(key, b?.title || b?.id || key);
      }
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
