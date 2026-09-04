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
import { DAY_TYPE_PRESETS, PALETTE_BLOCK_TYPES, validateBlockForDayType } from './block-type-rules.ts';
import { METADATA_CATALOG_ITEMS } from '../metadata-catalog.ts';
import { INTERACTION_META, type Activity, type InteractionType } from './block-model.ts';

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

test('every preset can open with a lesson and close with a conclude', () => {
  // 131 `lesson` + 84 `conclude` = 215 of 406 live blocks, 53% of the
  // catalogue. A stage forbidding either was describing something no author
  // builds — which is what Phase 0 left behind by widening the lists only far
  // enough to cover each preset's own seeds.
  const cannotOpen = Object.entries(DAY_TYPE_PRESETS)
    .filter(([, p]) => !p.allowedInteractions.includes('read')).map(([d]) => d);
  const cannotClose = Object.entries(DAY_TYPE_PRESETS)
    .filter(([, p]) => !p.allowedInteractions.includes('complete')).map(([d]) => d);
  assert.deepEqual(cannotOpen, [], `presets that cannot open with a lesson: ${cannotOpen.join(', ')}`);
  assert.deepEqual(cannotClose, [], `presets that cannot close with a conclude: ${cannotClose.join(', ')}`);
});

test('every interaction is reachable from at least one preset', () => {
  // `upload` and `number` were allowed by no preset at all, so those two
  // activities could be authored nowhere. One live block (`reflection ·
  // number`) sat in the enforcement rejection list for exactly that reason.
  const reachable = new Set(
    Object.values(DAY_TYPE_PRESETS).flatMap(p => p.allowedInteractions as string[]),
  );
  const orphans = (Object.keys(INTERACTION_META) as InteractionType[]).filter(i => !reachable.has(i));
  assert.deepEqual(
    orphans, [],
    `no preset allows: ${orphans.join(', ')} — those activities are authorable nowhere`,
  );
});

// ── Seed-file assertions ───────────────────────────────────────────
// The seed file is the DEFINITION; KV is the deployment. A test that only
// checks KV passes while the seed quietly regresses — which is exactly how the
// 9 container rows and every `can_hold` list came to exist in KV alone, one
// re-seed away from being wiped. Anything the seed can regenerate is asserted
// about the seed.

const seedBlockTypes = METADATA_CATALOG_ITEMS.filter(i => i.type === 'block_type');

test('the seed file defines every container row, not just KV', () => {
  const seeded = seedBlockTypes.map(r => r.slug).sort();
  const expected = [...Object.keys(DAY_TYPE_PRESETS),
                    'lesson', 'exercise', 'journal', 'checklist', 'conclude', 'sleep-diary']
    .filter((v, i, a) => a.indexOf(v) === i).sort();
  assert.deepEqual(
    seeded, expected,
    'The merged block_type vocabulary must be reproducible from this file alone.',
  );
});

/**
 * INVARIANT: `can_hold` non-empty  <=>  a preset exists for this slug.
 *
 * CLOSED 2026-09-04. `quiz` and `reflection` were flipped to containers once
 * the 58 schema-invalid blocks were re-typed and zero blocks carried either
 * type. 11 containers + 5 leaves = 16. The pin below is gone and this asserts
 * zero, which is what a pin with a defined closure is supposed to become.
 *
 *   rules but holds nothing  -> nav/save/layout/step rules govern nothing
 *   holds something, no rules -> the player has no behaviour for it
 *
 * Neither side is a preference; an entry violating it is an error.
 *
 * PINNED, WITH A DEFINED CLOSURE — which is what makes this pin legitimate
 * where the deleted `allowedBlocks` one was not. `quiz` and `reflection` carry
 * presets while still being leaves, because 37 live blocks are typed with them
 * and Phase 3.3 re-types those first. At step 5 they flip to containers and
 * this list goes to []. It is a TODO with teeth, not a snapshot.
 */
test('can_hold non-empty <=> the row has a preset', () => {
  const violations = seedBlockTypes
    .filter(r => ((r.can_hold?.length ?? 0) > 0) !== (r.slug in DAY_TYPE_PRESETS))
    .map(r => r.slug).sort();
  assert.deepEqual(
    violations, [],
    'A block_type row either holds blocks AND has preset rules, or neither. ' +
    'Rules with nothing to govern, or containment with no behaviour, are both errors.',
  );
});

test('the vocabulary is 11 containers and 6 leaves', () => {
  const containers = seedBlockTypes.filter(r => (r.can_hold?.length ?? 0) > 0).map(r => r.slug).sort();
  const leaves     = seedBlockTypes.filter(r => (r.can_hold?.length ?? 0) === 0).map(r => r.slug).sort();
  // `sleep-diary` retained by decision 2026-09-04 and restored to the catalog,
  // so the leaf set is 6.
  assert.deepEqual(leaves, ['checklist', 'conclude', 'exercise', 'journal', 'lesson', 'sleep-diary']);
  assert.equal(containers.length, 11);
  // A container is never holdable: nothing nests a stage inside a stage.
  for (const r of seedBlockTypes) {
    for (const held of r.can_hold ?? []) {
      assert.ok(leaves.includes(held), `${r.slug} can_hold includes '${held}', which is a container`);
    }
  }
});

/**
 * DIRECTION A: the validator permits a block type the editor cannot create.
 *
 * A present-tense authoring gap — an author who deletes a seeded block cannot
 * add it back. Pinned at what it is today and closed in Phase 4.2/4.3, when the
 * picker is rebuilt off `can_hold`; it converts cleanly into a
 * can_hold-vs-picker test then.
 *
 * The opposite direction — palette offers what the interactions forbid — is
 * deliberately NOT tested: it is a property of `allowedBlocks`, which Phase 4
 * deletes, and pinning a field that is being removed only records its drift.
 */
test('every block type a stage can hold is offerable by the DayEditor palette', () => {
  const offerable = new Set(PALETTE_BLOCK_TYPES.map(b => b.type));
  const gaps = new Set<string>();
  for (const row of seedBlockTypes) {
    for (const held of row.can_hold ?? []) if (!offerable.has(held)) gaps.add(held);
  }
  assert.deepEqual(
    [...gaps].sort(), [],
    'CLOSED 2026-09-04. Every leaf block type the catalog defines now has a ' +
    'palette entry, so a stage can no longer permit a type the editor cannot ' +
    'create. This asserts zero — it was pinned at 3 gaps, then 1, now none.',
  );
});
