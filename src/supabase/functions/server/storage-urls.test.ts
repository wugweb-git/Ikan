/**
 * Run with:  npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  urlForUploadedFile, isPublicContentBucket, SIGNED_URL_TTL_SECONDS,
  type StorageBucketApi,
} from './storage-urls.ts';

/** A fake storage client that records which kind of URL was asked for. */
function fakeStorage() {
  const calls: string[] = [];
  const from = (bucket: string): StorageBucketApi => ({
    getPublicUrl: (path) => {
      calls.push(`public:${bucket}/${path}`);
      return { data: { publicUrl: `https://x.test/storage/v1/object/public/${bucket}/${path}` } };
    },
    createSignedUrl: async (path, ttl) => {
      calls.push(`signed:${bucket}/${path}:${ttl}`);
      return { data: { signedUrl: `https://x.test/storage/v1/object/sign/${bucket}/${path}?token=t` } };
    },
  });
  return { from, calls };
}

test('a content upload stores a permanent public URL, not an expiring signed one', async () => {
  // The defect: every content image was stored signed for a year, so the eight
  // assessment heroes uploaded together would all have stopped loading on one day.
  for (const bucket of ['make-cc205da9-images', 'make-cc205da9-media', 'equip-program-images']) {
    const { from, calls } = fakeStorage();
    const url = await urlForUploadedFile(from, bucket, 'assessments/a.png');
    assert.match(url ?? '', /\/object\/public\//, bucket);
    assert.doesNotMatch(url ?? '', /token=/, bucket);
    assert.deepEqual(calls, [`public:${bucket}/assessments/a.png`]);
  }
});

test('a bucket holding user data keeps a signed link', async () => {
  // The bucket name comes from the request. Naming a private bucket must never
  // produce a public URL — it would 400 for everyone, or worse, be public.
  for (const bucket of ['make-cc205da9-avatars', 'make-cc205da9-user-uploads', 'make-cc205da9-professional-uploads']) {
    const { from, calls } = fakeStorage();
    const url = await urlForUploadedFile(from, bucket, 'u/avatar.png');
    assert.match(url ?? '', /\/object\/sign\//, bucket);
    assert.deepEqual(calls, [`signed:${bucket}/u/avatar.png:${SIGNED_URL_TTL_SECONDS}`]);
  }
});

test('an unknown bucket is treated as private, not public', () => {
  assert.equal(isPublicContentBucket('anything-else'), false);
  assert.equal(isPublicContentBucket(''), false);
});

test('no URL produced means null, so the route can fail instead of storing an empty link', async () => {
  const from = (): StorageBucketApi => ({
    getPublicUrl: () => ({ data: { publicUrl: '' } }),
    createSignedUrl: async () => ({ data: null, error: new Error('x') }),
  });
  assert.equal(await urlForUploadedFile(from, 'make-cc205da9-images', 'a.png'), null);
  assert.equal(await urlForUploadedFile(from, 'make-cc205da9-avatars', 'a.png'), null);
});

// ── Avatars ──────────────────────────────────────────────────────────────────

import {
  avatarPathFromUrl, normaliseAvatarForStorage, presentAvatar, presentAvatars,
  AVATAR_URL_TTL_SECONDS, type AvatarSigner,
} from './storage-urls.ts';

const U = 'd5003e00-7ddc-4f1a-8658-8dd43a20674f';
const OTHER = '7b0b9f70-80e3-4cb5-87ec-cd74a08971db';
const signed = (p: string) =>
  `https://x.supabase.co/storage/v1/object/sign/make-cc205da9-avatars/${p}?token=eyJ.abc.def`;

function signer(ok = true) {
  const calls: Array<[string, number]> = [];
  const s: AvatarSigner = {
    createSignedUrl: async (path, ttl) => {
      calls.push([path, ttl]);
      return ok ? { data: { signedUrl: `FRESH:${path}` } } : { data: null, error: new Error('x') };
    },
  };
  return { s, calls };
}

test('the avatar path is recovered from every Supabase URL form, expired or not', () => {
  const p = `${U}/avatar-1.png`;
  assert.equal(avatarPathFromUrl(signed(p)), p);
  assert.equal(avatarPathFromUrl(`https://x/storage/v1/object/public/make-cc205da9-avatars/${p}`), p);
  assert.equal(avatarPathFromUrl(`https://x/storage/v1/object/authenticated/make-cc205da9-avatars/${p}`), p);
  assert.equal(avatarPathFromUrl(`https://x/storage/v1/object/sign/make-cc205da9-avatars/${U}/a%20b.png?token=t`), `${U}/a b.png`);
});

test('a link into any other bucket, or an external picture, is not an avatar path', () => {
  assert.equal(avatarPathFromUrl('https://x/storage/v1/object/public/make-cc205da9-images/assessments/a.png'), null);
  assert.equal(avatarPathFromUrl('https://lh3.googleusercontent.com/a/photo.jpg'), null);
  assert.equal(avatarPathFromUrl(null), null);
  assert.equal(avatarPathFromUrl(''), null);
});

test('stored form keeps the path and drops the expiring link', () => {
  const out = normaliseAvatarForStorage({ user_id: U, avatar_url: signed(`${U}/avatar-1.png`) }, U);
  assert.equal(out.avatar_path, `${U}/avatar-1.png`);
  assert.equal('avatar_url' in out, false);
});

test("a user cannot point their avatar at another user's file", () => {
  // Otherwise the read side would sign someone else's private picture for them.
  const out = normaliseAvatarForStorage(
    { user_id: U, avatar_path: `${U}/mine.png`, avatar_url: signed(`${OTHER}/theirs.png`) }, U);
  assert.equal(out.avatar_path, `${U}/mine.png`, 'previous avatar kept');
  assert.equal('avatar_url' in out, false, 'foreign link not stored');
});

test('an external picture wins over a stored path', () => {
  const out = normaliseAvatarForStorage(
    { user_id: U, avatar_path: `${U}/old.png`, avatar_url: 'https://lh3.googleusercontent.com/a/p.jpg' }, U);
  assert.equal(out.avatar_url, 'https://lh3.googleusercontent.com/a/p.jpg');
  assert.equal('avatar_path' in out, false);
});

test('null clears the avatar; a missing key changes nothing', () => {
  const cleared = normaliseAvatarForStorage({ user_id: U, avatar_path: `${U}/a.png`, avatar_url: null }, U);
  assert.equal(cleared.avatar_url, null);
  assert.equal('avatar_path' in cleared, false);
  const untouched = normaliseAvatarForStorage({ user_id: U, avatar_path: `${U}/a.png` }, U);
  assert.equal(untouched.avatar_path, `${U}/a.png`);
});

test('the returned form carries a fresh short-lived link and never the path', async () => {
  const { s, calls } = signer();
  const out = await presentAvatar({ user_id: U, avatar_path: `${U}/a.png` }, s);
  assert.equal(out.avatar_url, `FRESH:${U}/a.png`);
  assert.equal('avatar_path' in out, false, 'path must not reach the client, who would send it back');
  assert.deepEqual(calls, [[`${U}/a.png`, AVATAR_URL_TTL_SECONDS]]);
});

test('a row written before paths existed still presents, from its old link', async () => {
  const { s } = signer();
  const out = await presentAvatar({ user_id: U, avatar_url: signed(`${U}/legacy.png`) }, s);
  assert.equal(out.avatar_url, `FRESH:${U}/legacy.png`);
});

test('a failed signing omits avatar_url instead of nulling it', async () => {
  // The editors send the profile back on save, and null means "clear my avatar".
  const { s } = signer(false);
  const out = await presentAvatar({ user_id: U, avatar_path: `${U}/a.png` }, s);
  assert.equal('avatar_url' in out, false);
});

test('an external picture and a user without an avatar pass through unsigned', async () => {
  const { s, calls } = signer();
  const ext = await presentAvatar({ user_id: U, avatar_url: 'https://lh3.googleusercontent.com/a/p.jpg' }, s);
  assert.equal(ext.avatar_url, 'https://lh3.googleusercontent.com/a/p.jpg');
  const none = await presentAvatar({ user_id: U, avatar_url: null }, s);
  assert.equal(none.avatar_url, null);
  assert.equal(calls.length, 0);
});

test('a list is presented row by row', async () => {
  const { s } = signer();
  const out = await presentAvatars([
    { user_id: U, avatar_path: `${U}/a.png` },
    { user_id: OTHER },
  ], s);
  assert.equal(out[0].avatar_url, `FRESH:${U}/a.png`);
  assert.equal('avatar_url' in out[1], false);
});
