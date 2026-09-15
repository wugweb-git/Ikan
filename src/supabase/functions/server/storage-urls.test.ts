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
