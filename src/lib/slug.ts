/**
 * Convert a title into a URL-friendly slug.
 * e.g. "Feeling worried and stressed" -> "feeling-worried-and-stressed"
 */
export function slugify(input: string): string {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Build the public detail URL for an assessment, preferring its slug and
 * falling back to the legacy `?id=` form for records without one.
 */
export function assessmentUrl(record: { slug?: string | null; id?: string | null } | undefined | null): string {
  const slug = record?.slug;
  if (slug) return `/assessment/${slug}`;
  return `/assessment-detail?id=${record?.id ?? ''}`;
}

/**
 * Build the public detail URL for an equip program, preferring its slug.
 */
export function equipUrl(record: { slug?: string | null; id?: string | null; equip_id?: string | null } | undefined | null): string {
  const slug = record?.slug;
  if (slug) return `/equip/${slug}`;
  return `/equip-detail?id=${record?.equip_id ?? record?.id ?? ''}`;
}
