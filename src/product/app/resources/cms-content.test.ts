/**
 * Five of the six content-drop bugs are one bug: a newline-delimited string read
 * as if it were an array. These tests use the strings the store actually holds.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cmsLines, splitTitleAndSubtitle, stripDuplicateHeading, recordImage } from './cms-content.ts';

test('a newline-delimited tile is its lines — this is the bug, five times over', () => {
  // Sleep Tight's metadata.tile2_content, verbatim.
  const stored = 'Daily micro-lessons (5-10 minutes)\nEvidence-based CBT techniques\nProgress tracking & insights\nPersonalized sleep plan';
  assert.deepEqual(cmsLines(stored), [
    'Daily micro-lessons (5-10 minutes)',
    'Evidence-based CBT techniques',
    'Progress tracking & insights',
    'Personalized sleep plan',
  ]);
  // `Array.isArray` on that string is false, which is why every override was skipped.
  assert.equal(Array.isArray(stored), false);
});

test('an already-split array passes through, and objects yield their text', () => {
  assert.deepEqual(cmsLines(['a', 'b']), ['a', 'b']);
  assert.deepEqual(cmsLines([{ text: 'a' }, { title: 'b' }]), ['a', 'b']);
});

test('blank lines are not bullets', () => {
  assert.deepEqual(cmsLines('one\n\n  \ntwo\n'), ['one', 'two']);
  assert.deepEqual(cmsLines(undefined), []);
  assert.deepEqual(cmsLines(null), []);
  assert.deepEqual(cmsLines(42), []);
});

test('an outcome splits on its first period, not every period', () => {
  assert.deepEqual(
    splitTitleAndSubtitle('Better Sleep Quality. Fall asleep faster and wake up refreshed'),
    { title: 'Better Sleep Quality', subtitle: 'Fall asleep faster and wake up refreshed' },
  );
  assert.deepEqual(
    splitTitleAndSubtitle('Reduced Sleep Anxiety. Stop worrying about sleep. Feel in control'),
    { title: 'Reduced Sleep Anxiety', subtitle: 'Stop worrying about sleep. Feel in control' },
  );
});

test('a line with no period keeps all of its text as the title', () => {
  assert.deepEqual(splitTitleAndSubtitle('Sustainable Habits'), { title: 'Sustainable Habits' });
  assert.deepEqual(splitTitleAndSubtitle('Improved Daily Energy.'), { title: 'Improved Daily Energy' });
});

test('a tile heading that repeats the section heading is dropped once', () => {
  const html = "<p>What you’ll see</p>\n<p>After completing the assessment, you will receive a score.</p>";
  assert.equal(
    stripDuplicateHeading(html, "What you'll see"),
    '<p>After completing the assessment, you will receive a score.</p>',
  );
});

test('a heading that only resembles the section heading is content and stays', () => {
  const html = '<p>What you will not see</p><p>Body.</p>';
  assert.equal(stripDuplicateHeading(html, "What you'll see"), html);
  // Nothing to compare against means nothing is removed.
  assert.equal(stripDuplicateHeading(html, ''), html);
  assert.equal(stripDuplicateHeading('', 'x'), '');
});

test('a list-led tile keeps its list', () => {
  const html = '<p>Important notes</p>\n<ul>\n<li><p>This is a self-help tool.</p></li>\n</ul>';
  assert.equal(
    stripDuplicateHeading(html, 'Important notes'),
    '<ul>\n<li><p>This is a self-help tool.</p></li>\n</ul>',
  );
});

test('the hero falls down a ladder of the record\'s own images', () => {
  // Sleep Tight, verbatim: no hero_image, but a cover and an image_url.
  assert.equal(
    recordImage({ cover_image: 'https://img/cover.jpg', image_url: 'https://img/other.jpg' }),
    'https://img/cover.jpg',
  );
  assert.equal(recordImage({ hero_image: 'https://img/hero.jpg', cover_image: 'https://img/c.jpg' }), 'https://img/hero.jpg');
  assert.equal(recordImage({ metadata: { thumbnail: 'https://img/t.jpg' } }), 'https://img/t.jpg');
});

test('a record with no image gets none — the band stays honest', () => {
  assert.equal(recordImage({}), undefined);
  assert.equal(recordImage(null), undefined);
  assert.equal(recordImage({ cover_image: '   ' }), undefined);
});

test('an unsigned URL beats a signed one, because signed URLs expire', () => {
  assert.equal(
    recordImage({
      hero_image: 'https://x.supabase.co/storage/v1/object/sign/bucket/a.png?token=…',
      cover_image: 'https://images.unsplash.com/photo.jpg',
    }),
    'https://images.unsplash.com/photo.jpg',
  );
  // If every candidate is signed, the best-ranked one is still better than none.
  assert.match(recordImage({ hero_image: 'https://x/object/sign/a.png' }) ?? '', /object\/sign/);
});
