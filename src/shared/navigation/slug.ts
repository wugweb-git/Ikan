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

/**
 * A PROGRAMME'S OWN PAGES, under the programme.
 *
 * The result and the learning diary were `?id=<uuid>` routes of their own —
 * `/equip-program-completion?id=68970d31…`, `/learning-diary?id=68970d31…` —
 * which said nothing about which programme they belonged to and could not be
 * read, shared or retraced by a person. They are parts of a programme, so they
 * live under it:
 *
 *     /equip/sleep-tight            the programme
 *     /equip/sleep-tight/result     what it concluded
 *     /equip/sleep-tight/diary      what the user wrote during it
 *
 * The `?id=` forms still resolve — every stored link, every email and every
 * bookmark keeps working, which is the point of adding a route rather than
 * replacing one.
 */
export function equipResultUrl(record: { slug?: string | null; id?: string | null; equip_id?: string | null } | undefined | null): string {
  const slug = record?.slug;
  if (slug) return `/equip/${slug}/result`;
  return `/equip-program-completion?id=${record?.equip_id ?? record?.id ?? ''}`;
}

export function equipDiaryUrl(record: { slug?: string | null; id?: string | null; equip_id?: string | null } | undefined | null): string {
  const slug = record?.slug;
  if (slug) return `/equip/${slug}/diary`;
  return `/learning-diary?id=${record?.equip_id ?? record?.id ?? ''}`;
}

/** The sub-page of `/equip/<slug>/…`, or null for the programme itself. */
export function equipSubPage(pathname: string): { slug: string; page: 'result' | 'diary' | null } | null {
  if (!pathname.startsWith('/equip/') || pathname === '/equip/') return null;
  const rest = pathname.slice('/equip/'.length).replace(/\/+$/, '');
  if (!rest) return null;
  const [slug, page] = rest.split('/');
  if (!slug) return null;
  if (page === 'result' || page === 'diary') return { slug, page };
  return { slug, page: null };
}
