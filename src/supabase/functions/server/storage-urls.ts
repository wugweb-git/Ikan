/**
 * The URL an uploaded file is stored under.
 *
 * Content imagery — assessment heroes, programme thumbnails, articles, the
 * media library — used to be stored as a Supabase *signed* URL minted at upload
 * with a one-year expiry. That is a scheduled outage: the eight
 * `assessment_def:` heroes were all uploaded together, so all eight would have
 * stopped loading on the same day (2026-12-30), and every later upload set its
 * own cliff a year out. Nothing re-signs a stored link, so the day comes and the
 * image is simply gone.
 *
 * Content is public by nature — it is shown on public pages to anyone — so the
 * content buckets are public and a content upload stores a permanent public
 * URL. Everything else keeps the signed link it had: a bucket that is not on the
 * list below is assumed to hold something that should not be world-readable.
 *
 * The list is explicit rather than inferred from the bucket's own `public` flag
 * because the upload routes accept the bucket name from the request. A caller
 * naming a private bucket must get a signed link, never a public URL that 400s.
 *
 * Deliberately NOT here, and staying private: `make-cc205da9-avatars`,
 * `make-cc205da9-user-uploads`, `make-cc205da9-professional-uploads`.
 */

export const PUBLIC_CONTENT_BUCKETS: ReadonlySet<string> = new Set([
  'make-cc205da9-images',
  'make-cc205da9-media',
  'equip-program-images',
]);

export function isPublicContentBucket(bucket: string): boolean {
  return PUBLIC_CONTENT_BUCKETS.has(bucket);
}

/** Seconds a signed link lasts, for buckets that are not public content. */
export const SIGNED_URL_TTL_SECONDS = 365 * 24 * 60 * 60;

/** The slice of the supabase-js storage client this module needs. */
export interface StorageBucketApi {
  getPublicUrl(path: string): { data: { publicUrl: string } };
  createSignedUrl(
    path: string,
    expiresIn: number,
  ): Promise<{ data: { signedUrl: string } | null; error?: unknown }>;
}

/**
 * Resolve the URL to store for a file just uploaded to `bucket` at `path`.
 * Returns null when no URL could be produced, so the caller can fail the
 * request rather than store an empty link.
 */
export async function urlForUploadedFile(
  from: (bucket: string) => StorageBucketApi,
  bucket: string,
  path: string,
): Promise<string | null> {
  if (isPublicContentBucket(bucket)) {
    return from(bucket).getPublicUrl(path).data?.publicUrl || null;
  }
  const { data } = await from(bucket).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl || null;
}

// ── Avatars ──────────────────────────────────────────────────────────────────
//
// Avatars are user data, so their bucket stays private — but they were stored
// the same broken way content was: a signed link minted at upload with a
// one-year life, written into `user:{id}.avatar_url`. Every profile picture
// stopped loading a year after it was set, and nothing re-signed it.
//
// The fix is not a public bucket. It is storing the object PATH and signing a
// short-lived link each time a profile is handed to a client:
//
//   stored   → `avatar_path: "<userId>/avatar-123.png"`, no bucket link at all
//   returned → `avatar_url: <fresh signed link>`, `avatar_path` stripped
//
// `avatar_url` in storage holds only an EXTERNAL picture (a Google photo, say),
// never a link into our bucket. Two readers make the write side necessary too:
// the admin user editor and the profile form both send the whole profile back,
// including the fresh link they were given, and without normalising on write
// that link would be stored and expire all over again.

export const AVATAR_BUCKET = 'make-cc205da9-avatars';

/**
 * How long a served avatar link lasts. Long enough to outlive an app session
 * (the profile is re-fetched whenever the app loads), short enough that a
 * leaked link stops working on its own.
 */
export const AVATAR_URL_TTL_SECONDS = 7 * 24 * 60 * 60;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * The object path inside the avatar bucket that `url` points at, in any of
 * Supabase's URL forms — signed, public or authenticated — or null when it
 * points anywhere else. Expiry is irrelevant: an expired link still names its
 * file, which is exactly what makes old stored links recoverable.
 */
export function avatarPathFromUrl(url: unknown): string | null {
  if (typeof url !== 'string' || url === '') return null;
  const re = new RegExp(
    `/storage/v1/object/(?:sign|public|authenticated)/${escapeRegExp(AVATAR_BUCKET)}/([^?#]+)`,
  );
  const m = url.match(re);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

type AvatarRecord = Record<string, unknown> & {
  avatar_url?: unknown;
  avatar_path?: unknown;
};

/**
 * The form a user record is STORED in. Apply after merging any update, before
 * writing.
 *
 * - `avatar_url` pointing into our bucket becomes `avatar_path`, and the link is
 *   dropped — but only if the file is in that user's own folder. Anything else
 *   is refused: otherwise a user could set their avatar to another user's file
 *   and the read side would happily sign it for them.
 * - An external `avatar_url` is kept, and any bucket path is cleared, because
 *   the newer picture wins.
 * - `avatar_url: null` or `""` clears the avatar entirely.
 * - No `avatar_url` key means "no change": an existing `avatar_path` stays.
 */
export function normaliseAvatarForStorage<T extends AvatarRecord>(record: T, ownerId: string): T {
  const r: AvatarRecord = { ...record };
  if (!('avatar_url' in r) || r.avatar_url === undefined) return r as T;

  if (r.avatar_url === null || r.avatar_url === '') {
    delete r.avatar_path;
    r.avatar_url = null;
    return r as T;
  }

  const path = avatarPathFromUrl(r.avatar_url);
  if (path === null) {
    // External picture.
    delete r.avatar_path;
    return r as T;
  }

  delete r.avatar_url;
  if (ownerId && path.startsWith(`${ownerId}/`)) {
    r.avatar_path = path;
  }
  // A path in someone else's folder is dropped; the previous avatar_path, if
  // any, is left exactly as it was.
  return r as T;
}

/** The slice of the storage client avatar signing needs. */
export interface AvatarSigner {
  createSignedUrl(
    path: string,
    expiresIn: number,
  ): Promise<{ data: { signedUrl: string } | null; error?: unknown }>;
}

function storedAvatarPath(record: AvatarRecord): string | null {
  if (typeof record.avatar_path === 'string' && record.avatar_path !== '') return record.avatar_path;
  // A record written before paths existed still carries the link; recover the
  // path from it so un-migrated rows present correctly too.
  return avatarPathFromUrl(record.avatar_url);
}

/**
 * The form a user record is RETURNED in. Signs a fresh avatar link from the
 * stored path and strips the path itself, so a client can never send it back.
 *
 * If signing fails the `avatar_url` key is omitted rather than set to null:
 * the editors send the profile back on save, and a null would be read as
 * "clear my avatar", deleting it over a transient storage error.
 */
export async function presentAvatar<T>(record: T, signer: AvatarSigner): Promise<T> {
  if (!record || typeof record !== 'object') return record;
  const r = { ...(record as unknown as AvatarRecord) };
  const path = storedAvatarPath(r);
  delete r.avatar_path;
  if (path === null) return r as unknown as T;

  const { data } = await signer.createSignedUrl(path, AVATAR_URL_TTL_SECONDS);
  if (data?.signedUrl) {
    r.avatar_url = data.signedUrl;
  } else {
    delete r.avatar_url;
  }
  return r as unknown as T;
}

export async function presentAvatars<T>(records: T[], signer: AvatarSigner): Promise<T[]> {
  return Promise.all((records || []).map((rec) => presentAvatar(rec, signer)));
}
