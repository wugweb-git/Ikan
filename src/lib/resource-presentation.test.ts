/**
 * Run with:  npm test
 *
 * Fixtures use the field names the 9 live `resource:` records actually carry,
 * measured 2026-09-08 — not the ones `ResourcePost` declares. That difference
 * is the whole reason this module exists.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  toResourcePost, resourceImage, resourceReadTime, isPublished,
} from './resource-presentation.ts';

/** Shaped like a live record: thumbnail, not image; readTime, not read_time. */
const live = {
  id: 'a5bef353-f6e5-4a22-9ae7-2d4e4a7ebd41',
  title: 'The Late Night Tax: How Bad Sleep Impacts Your Long Term Health.',
  description: 'Sleep debt compounds.',
  category: 'sleep',
  thumbnail: 'https://example.test/thumb.jpg',
  readTime: '6 min read',
  created_at: '2026-03-04T10:00:00.000Z',
  published: true,
};

test('reads the image from thumbnail, which is what every live record carries', () => {
  assert.equal(resourceImage(live), 'https://example.test/thumb.jpg');
  // The card's own type says `image`; no live record has it. If one ever does,
  // it still resolves rather than falling through to empty.
  assert.equal(resourceImage({ image: 'i.jpg' }), 'i.jpg');
  assert.equal(resourceImage({ image_url: 'u.jpg' }), 'u.jpg');
});

test('a record with no image yields empty string, never undefined', () => {
  // An undefined src renders a broken-image icon; empty lets the card decide.
  assert.equal(resourceImage({}), '');
  assert.equal(toResourcePost({}).image, '');
});

test('thumbnail wins over image_url when a record carries both', () => {
  assert.equal(resourceImage({ thumbnail: 't.jpg', image_url: 'u.jpg' }), 't.jpg');
});

test('read time comes from minutes, then either spelling, then a default', () => {
  assert.equal(resourceReadTime({ read_time_minutes: 8 }), '8 min read');
  assert.equal(resourceReadTime({ readTime: '6 min read' }), '6 min read');
  assert.equal(resourceReadTime({ read_time: '4 min read' }), '4 min read');
  assert.equal(resourceReadTime({}), '5 min read');
});

test('zero minutes is not treated as a real reading time', () => {
  assert.equal(resourceReadTime({ read_time_minutes: 0 }), '5 min read');
});

test('published defaults to true when the field is absent', () => {
  // Defaulting the other way would hide live articles that predate the field.
  assert.equal(isPublished({}), true);
  assert.equal(isPublished({ published: true }), true);
  assert.equal(isPublished({ published: false }), false);
});

test('a live record maps to a complete card', () => {
  const p = toResourcePost(live);
  assert.equal(p.id, live.id);
  assert.equal(p.slug, live.id);
  assert.equal(p.title, live.title);
  assert.equal(p.category, 'sleep');
  assert.equal(p.image, 'https://example.test/thumb.jpg');
  assert.equal(p.readTime, '6 min read');
  assert.equal(p.published, true);
  assert.match(p.date, /2026/);
});

test('an untitled record gets a placeholder rather than an empty heading', () => {
  assert.equal(toResourcePost({ id: 'x' }).title, 'Untitled Resource');
});

test('an unparseable created_at falls back rather than rendering Invalid Date', () => {
  assert.equal(toResourcePost({ id: 'x', created_at: 'not-a-date' }).date, 'Recently');
});

test('a record with no id yields empty, not a fresh random id per render', () => {
  // Library.tsx used `resource-${Math.random()}`, which changes on every
  // render and so breaks both the React key and the id-based de-duplication
  // running directly beneath it.
  assert.equal(toResourcePost({ title: 'x' }).id, '');
  assert.equal(toResourcePost({ title: 'x' }).id, toResourcePost({ title: 'x' }).id);
});

test('resource_id is accepted where id is absent', () => {
  assert.equal(toResourcePost({ resource_id: 'r1' }).id, 'r1');
  assert.equal(toResourcePost({ resource_id: 'r1' }).slug, 'r1');
});
