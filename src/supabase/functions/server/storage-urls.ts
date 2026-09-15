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
