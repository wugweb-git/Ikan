/**
 * The facts a user decides an assessment on: how long it takes, how many
 * questions it asks, and what it looks like. One source for each.
 *
 * Four surfaces used to answer these three questions four different ways —
 * `Assessments` defaulted duration to 3, `AssessmentDetail` to 5, the bento
 * grid hardcoded `questionCount = 10 / duration = 5`, and the landing screen
 * printed the string `'10 questions'` next to `'5 minutes'`. So the same
 * assessment advertised a different length depending on which screen you
 * arrived from, and none of them were reading the record.
 *
 * The rule here is the `?? 21` lesson from the denominator work: **a missing
 * fact renders nothing**. An assessment with no authored duration shows no
 * duration chip. It does not show "5 min", because a made-up number is
 * indistinguishable from a real one at the point a user is deciding whether
 * they have time for it.
 *
 * On the static site the count is the snapshot's `questionCount` and the
 * minutes come from `assessmentMinutes` in catalog.ts; this file keeps the
 * image rule.
 */

/** What a card needs off an assessment record. Deliberately structural. */
export interface AssessmentMetaSource {
  thumbnail?: unknown;
  hero_image?: unknown;
  image_url?: unknown;
  thumbnail_url?: unknown;
  cover_image?: unknown;
  metadata?: { thumbnail?: unknown; hero_image?: unknown; image?: unknown } | null;
}

/**
 * The authored image for an assessment, or null.
 *
 * Seven-deep `a || b || c || …` ladders were written out by hand on six
 * screens, each in a different order, which is how the catalogue ended up
 * showing a stock photo keyed on *category* while every one of the seven
 * records carried both a `thumbnail` and a `hero_image` that nothing rendered.
 *
 * Order is deliberate: `thumbnail` first because it is the uploaded, authored
 * one on all seven records, `hero_image` next because several of those are
 * still stock URLs. Null means the caller decides — a placeholder block, or
 * nothing at all. It does not mean "substitute a picture of someone else's
 * anxiety".
 */
export function assessmentImage(a: AssessmentMetaSource | null | undefined): string | null {
  const m = a?.metadata ?? null;
  const candidates = [
    a?.thumbnail, a?.hero_image, a?.image_url, a?.thumbnail_url, a?.cover_image,
    m?.thumbnail, m?.hero_image, m?.image,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return null;
}
