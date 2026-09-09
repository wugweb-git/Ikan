/**
 * §26 is a closed list. These tests are what stops it drifting back open — the
 * previous vocabulary grew from 12 to 17 interactions and 12 to 20 activities
 * one well-meaning addition at a time.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  INTERACTIONS, ACTIVITIES, ACTIVITY_SPECS, LABELS, TWO_INTERACTIONS,
  interactionsOf, requiresOf, activitiesFor,
} from './vocabulary.ts';

test('nine interactions, twenty-nine activities, seven labels', () => {
  assert.equal(INTERACTIONS.length, 9);
  assert.equal(ACTIVITIES.length, 29);
  assert.equal(LABELS.length, 7);
});

test('the nine are exactly these, in this order', () => {
  assert.deepEqual([...INTERACTIONS], [
    'observe', 'choose', 'share', 'locate', 'confirm', 'rate', 'order', 'measure', 'submit',
  ]);
});

test('every activity carries at least one interaction, and every one is one of the nine', () => {
  for (const a of ACTIVITIES) {
    const set = interactionsOf(a);
    assert.ok(set.length >= 1, `${a} carries no interaction`);
    for (const i of set) assert.ok((INTERACTIONS as readonly string[]).includes(i), `${a} carries unknown ${i}`);
  }
});

test('exactly six activities carry two interactions, and they are the six §26 names', () => {
  const two = ACTIVITIES.filter((a) => interactionsOf(a).length === 2);
  assert.equal(two.length, 6);
  assert.deepEqual([...two].sort(), Object.keys(TWO_INTERACTIONS).sort());
});

test('no activity carries three', () => {
  for (const a of ACTIVITIES) assert.ok(interactionsOf(a).length <= 2, `${a} carries ${interactionsOf(a).length}`);
});

test('every interaction is carried by at least one activity — none is decorative', () => {
  for (const i of INTERACTIONS) {
    assert.ok(activitiesFor(i).length > 0, `nothing carries ${i}`);
  }
});

test('observe is the interaction of every teaching activity', () => {
  for (const a of ['read', 'listen', 'view', 'complete', 'table-review', 'paced-breathing'] as const) {
    assert.ok(interactionsOf(a).includes('observe'), `${a} does not observe`);
  }
});

test('the six that store nothing still carry an interaction', () => {
  const silent = ACTIVITIES.filter((a) => ACTIVITY_SPECS[a].produces === '');
  assert.equal(silent.length, 6);
  for (const a of silent) assert.ok(interactionsOf(a).length >= 1);
});

test('read requires content — not nothing', () => {
  // §27 step 2: read's `requires` was an em dash. A lesson with no content
  // renders an empty card, which `validateBlock` has always called an error.
  assert.deepEqual([...requiresOf('read')], ['content']);
});

test('table-review requires source_key, which is what makes it a read-back', () => {
  // The live page said `columns`, which would make it a second table rather than
  // a view of an earlier one.
  assert.deepEqual([...requiresOf('table-review')], ['source_key']);
});

test('the date family is three activities with three outputs', () => {
  // `pick-date` described "a date or a time" producing one iso_date. §26 splits it.
  assert.equal(ACTIVITY_SPECS['date'].produces, 'date');
  assert.equal(ACTIVITY_SPECS['time'].produces, 'time');
  assert.equal(ACTIVITY_SPECS['date-time'].produces, 'datetime');
});

test('slider and rating-scale are different activities because they produce different things', () => {
  assert.equal(ACTIVITY_SPECS['slider'].produces, 'number');
  assert.equal(ACTIVITY_SPECS['rating-scale'].produces, 'option_id');
  assert.deepEqual([...interactionsOf('slider')], ['rate']);
  assert.deepEqual([...interactionsOf('rating-scale')], ['rate']);
});

test('display carries image, and every choose activity takes it except the instrument', () => {
  const display = LABELS.find((l) => l.key === 'display');
  assert.ok(display && (display.values as readonly string[]).includes('image'),
    'image must be a display value — picture choice is a label, not an activity');

  /*
    §26 CONTRADICTS ITSELF HERE, and this test records which half won.

    The Labels table says `display` applies to "every `choose` activity and
    `rating-scale`". The Activities table gives `clinical-instrument` only
    `layout: list`. The per-activity row wins: a validated instrument's options
    are fixed by the instrument, so re-skinning them as emoji or images is
    exactly what it must not allow. Every other `choose` activity takes display.
  */
  for (const a of [...activitiesFor('choose'), 'rating-scale' as const]) {
    const labels = ACTIVITY_SPECS[a as keyof typeof ACTIVITY_SPECS].labels as readonly string[];
    if (a === 'clinical-instrument') {
      assert.equal(labels.includes('display'), false, 'the instrument must not be re-skinnable');
      continue;
    }
    assert.ok(labels.includes('display'), `${a} cannot take a display label`);
  }
});

test('an unknown activity carries nothing rather than guessing', () => {
  assert.deepEqual([...interactionsOf('comparison-matrix')], []);
  assert.deepEqual([...interactionsOf(undefined)], []);
  assert.deepEqual([...requiresOf('nonsense')], []);
});
