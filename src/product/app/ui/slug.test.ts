/**
 * The programme's URLs. A result and a diary that live at `?id=<uuid>` cannot be
 * read, shared or retraced by a person; under the programme they can.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { equipUrl, equipResultUrl, equipDiaryUrl, equipSubPage } from './slug.ts';

const sleep = { slug: 'sleep-tight', id: '68970d31-0ff3-4d73-b137-80e98228d399' };

test('a programme, its result and its diary are one address family', () => {
  assert.equal(equipUrl(sleep), '/equip/sleep-tight');
  assert.equal(equipResultUrl(sleep), '/equip/sleep-tight/result');
  assert.equal(equipDiaryUrl(sleep), '/equip/sleep-tight/diary');
});

test('a record with no slug keeps the legacy form rather than minting a broken one', () => {
  const noSlug = { id: 'abc' };
  assert.equal(equipResultUrl(noSlug), '/equip-program-completion?id=abc');
  assert.equal(equipDiaryUrl(noSlug), '/learning-diary?id=abc');
});

test('the sub-page is read off the path, and the programme itself has none', () => {
  assert.deepEqual(equipSubPage('/equip/sleep-tight'), { slug: 'sleep-tight', page: null });
  assert.deepEqual(equipSubPage('/equip/sleep-tight/result'), { slug: 'sleep-tight', page: 'result' });
  assert.deepEqual(equipSubPage('/equip/sleep-tight/diary'), { slug: 'sleep-tight', page: 'diary' });
  assert.deepEqual(equipSubPage('/equip/sleep-tight/'), { slug: 'sleep-tight', page: null });
});

test('an unknown sub-page is the programme, not a 404 — a typo must not lose the reader', () => {
  assert.deepEqual(equipSubPage('/equip/sleep-tight/nonsense'), { slug: 'sleep-tight', page: null });
});

test('non-equip paths are none of its business', () => {
  assert.equal(equipSubPage('/equip'), null);
  assert.equal(equipSubPage('/equip/'), null);
  assert.equal(equipSubPage('/assessment/sleep'), null);
});
