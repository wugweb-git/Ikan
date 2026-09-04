/**
 * Run with:  npm test
 *
 * **Every preset's own `defaultBlocks` validated against its own rules.**
 *
 * This is the check that should have existed before `allowedInteractions` was
 * introduced alongside `allowedBlocks`. The two fields sit in the same object
 * and disagree: `learning` permits the `complete` interaction in one and
 * forbids conclude-shaped blocks in the other, so a validator reading one gets
 * a different answer than one reading the other.
 *
 * The consequence is not theoretical. Five presets seed default content that
 * their own allow-list rejects — which means turning enforcement on (blocks.md
 * §18 5.2) would fail an author's day at the moment they pick a preset, before
 * they have authored anything. That is the first thing they would see.
 *
 * So this test does NOT assert zero violations. It pins the exact known set, so
 * that a new one fails loudly and fixing an existing one is a deliberate edit
 * here rather than a silent drift.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DAY_TYPE_PRESETS, validateBlockForDayType } from './day-presets.ts';
import type { Activity } from '../../lib/equip-admin-types.ts';

interface SeedBlock {
  type?: Activity['type'];
  exerciseConfig?: { subtype?: string };
}

/** Every seeded default block that its own preset's rules reject, as `dayType[index] type`. */
function seedViolations(): string[] {
  const out: string[] = [];
  for (const [dayType, preset] of Object.entries(DAY_TYPE_PRESETS)) {
    const seeds = (preset as unknown as { defaultBlocks?: SeedBlock[] }).defaultBlocks ?? [];
    seeds.forEach((b, i) => {
      const verdict = validateBlockForDayType(
        String(b.type), b.exerciseConfig?.subtype, dayType,
      );
      if (!verdict.allowed || verdict.wouldReject) out.push(`${dayType}[${i}] ${String(b.type)}`);
    });
  }
  return out.sort();
}

/**
 * The 8 known violations, 2026-09-04. Two shapes, and BOTH are structural:
 *
 *   `lesson`   → resolves to `read`,     absent from 4 presets' allowedInteractions
 *   `conclude` → resolves to `complete`, absent from 4 presets' allowedInteractions
 *
 * Nearly every authored day opens with a lesson and closes with a conclude —
 * 131 `lesson` and 84 `conclude` blocks live — so the omission is in the
 * allow-lists, not in the seeds. `read` and `complete` are almost certainly
 * missing from every preset that lacks them.
 */
const KNOWN_SEED_VIOLATIONS = [
  'assessment-lite[0] lesson',
  'assessment[0] lesson',
  'assessment[3] conclude',
  'check-in[2] conclude',
  'practice[0] lesson',
  'practice[2] conclude',
  'quiz[0] lesson',
  'quiz[3] conclude',
].sort();

test('no preset seeds default content its own rules reject, beyond the known set', () => {
  const actual = seedViolations();

  const introduced = actual.filter(v => !KNOWN_SEED_VIOLATIONS.includes(v));
  assert.deepEqual(
    introduced, [],
    `A preset now seeds a default block its own allow-list rejects:\n  ${introduced.join('\n  ')}\n` +
    'Either add the interaction to that preset\'s allowedInteractions, or change the seed.',
  );

  const fixed = KNOWN_SEED_VIOLATIONS.filter(v => !actual.includes(v));
  assert.deepEqual(
    fixed, [],
    `These known violations are fixed — remove them from KNOWN_SEED_VIOLATIONS:\n  ${fixed.join('\n  ')}`,
  );
});

test('allowedBlocks and allowedInteractions do not contradict each other on conclude', () => {
  // `summary` is the palette's name for a conclude-shaped block. A preset that
  // permits the `complete` interaction but has no conclude-shaped entry in its
  // palette is telling two different stories about the same block.
  const contradictions: string[] = [];
  for (const [dayType, preset] of Object.entries(DAY_TYPE_PRESETS)) {
    const byInteraction = preset.allowedInteractions.includes('complete');
    const byPalette = preset.allowedBlocks.some(b => b === 'summary' || b === 'conclude');
    if (byInteraction !== byPalette) {
      contradictions.push(
        `${dayType}: allowedInteractions says ${byInteraction}, allowedBlocks says ${byPalette}`,
      );
    }
  }
  // Pinned, not asserted to zero — see the file header. Reconciling the two
  // fields is blocks.md §18 2.3/2.4, and is a decision, not a cleanup.
  //
  // The three, 2026-09-04:
  //   learning    permits `complete`, palette has no conclude-shaped block
  //   rest        permits `complete`, palette has no conclude-shaped block
  //   reflection  forbids `complete`, palette DOES carry `summary`
  //
  // `reflection` is the interesting one: it is the only preset whose palette
  // permits a conclude-shaped block, and its interaction list forbids it. The
  // two fields are exactly inverted there.
  assert.deepEqual(
    contradictions.map(c => c.split(':')[0]).sort(),
    ['learning', 'reflection', 'rest'],
    `The allowedBlocks/allowedInteractions contradictions changed:\n  ${contradictions.join('\n  ')}`,
  );
});
