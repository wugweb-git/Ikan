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
 * **Fixed 2026-09-04.** Five presets used to seed default content their own
 * allow-list rejected — 8 violations — so turning enforcement on would have
 * failed an author's day at the moment they picked a preset, before they had
 * authored anything. `read` and `complete` were added to the five presets whose
 * seeds need them. The first test now asserts **zero**, and is the gate that
 * keeps it that way.
 *
 * The second test is still pinned rather than zeroed, because reconciling
 * `allowedBlocks` against `allowedInteractions` is a separate decision
 * (blocks.md §18 2.4) and not a cleanup.
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

test('no preset seeds default content its own rules reject', () => {
  assert.deepEqual(
    seedViolations(), [],
    'A preset seeds a default block its own allow-list rejects. Either add the ' +
    "interaction to that preset's allowedInteractions, or change the seed. " +
    'Leaving it means enforcement fails the day an author picks this preset.',
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
  // Pinned, not asserted to zero — see the file header.
  //
  // This grew from 3 to 7 when the allow-lists were fixed above, and that is
  // expected, not a regression: adding `complete` to four presets whose palette
  // carries no conclude-shaped block necessarily widens the disagreement. The
  // fix cleared the violations that block enforcement; it did not reconcile the
  // two fields, which is §18 2.4.
  //
  //   assessment · practice · check-in · quiz   permit `complete` (added 2026-09-04),
  //                                             palette has no conclude-shaped block
  //   learning · rest                           same shape, pre-existing
  //   reflection                                exactly inverted — palette carries
  //                                             `summary`, interaction list forbids `complete`
  //
  // `reflection` is the one to look at first: it is the only preset whose
  // palette permits a conclude-shaped block, and the only one whose interaction
  // list forbids it.
  assert.deepEqual(
    contradictions.map(c => c.split(':')[0]).sort(),
    ['assessment', 'check-in', 'learning', 'practice', 'quiz', 'reflection', 'rest'],
    `The allowedBlocks/allowedInteractions contradictions changed:\n  ${contradictions.join('\n  ')}`,
  );
});
