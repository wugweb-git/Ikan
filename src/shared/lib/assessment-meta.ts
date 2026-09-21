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
 */

/** What a card needs off an assessment record. Deliberately structural. */
export interface AssessmentMetaSource {
  questions?: unknown;
  duration?: unknown;
  thumbnail?: unknown;
  hero_image?: unknown;
  image_url?: unknown;
  thumbnail_url?: unknown;
  cover_image?: unknown;
  metadata?: { thumbnail?: unknown; hero_image?: unknown; image?: unknown } | null;
}

export interface AssessmentMeta {
  /** Item count, from `questions.length` alone. Null when there are none. */
  count: number | null;
  /** Authored minutes. Null when unauthored — never a default. */
  minutes: number | null;
}

/**
 * @param a an assessment record (or the mapped view-model of one).
 *
 * `questions.length` is the ONLY source for the count: not a stored
 * `question_count`, not `metadata.question_count`. Both existed, both were
 * stale on at least one record, and both are derivable from the array that is
 * already loaded.
 *
 * `duration` is the only source for minutes. `metadata.estimated_minutes` was
 * the other branch every screen carried; it is null on all seven live records
 * and always has been, so reading it only ever widened the ladder.
 */
export function assessmentMeta(a: AssessmentMetaSource | null | undefined): AssessmentMeta {
  const count = Array.isArray(a?.questions) && a.questions.length > 0 ? a.questions.length : null;
  const minutes = typeof a?.duration === 'number' && a.duration > 0 ? a.duration : null;
  return { count, minutes };
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

/**
 * The meta chips as label/value pairs.
 *
 * Two fields rather than one interpolated string. `"8 questions · 10 min"`
 * reads fine in English and badly in most of the twelve catalog languages —
 * the middot is not a separator everywhere, and "questions" is a compound in
 * several. Returning the parts lets a caller lay them out; it does not commit
 * them to a run-on sentence.
 */
export function assessmentMetaChips(a: AssessmentMetaSource | null | undefined): { key: string; label: string }[] {
  const { count, minutes } = assessmentMeta(a);
  const chips: { key: string; label: string }[] = [];
  if (minutes !== null) chips.push({ key: 'duration', label: `${minutes} min` });
  if (count !== null) chips.push({ key: 'count', label: `${count} questions` });
  return chips;
}

/**
 * Whether an authored duration is plausible for the item count.
 *
 * Not a validator — it blocks nothing, exactly like the coverage meter. It
 * exists because `duration` is hand-authored and drifts: the live records have
 * the 24-item General questionnaire at 3 minutes and the 8-item Sleep scale at
 * 10, which cannot both be right. Surfacing that in the editor is the only
 * thing that keeps the field meaningful, since nothing else can tell you a
 * number is wrong when it is merely implausible.
 *
 * The window is wide on purpose. A short instrument that asks for genuine
 * reflection legitimately takes longer per item than a rapid screener, so this
 * flags the order-of-magnitude mistakes and stays quiet about taste.
 */
export function durationLooksImplausible(a: AssessmentMetaSource | null | undefined): string | null {
  const { count, minutes } = assessmentMeta(a);
  if (count === null || minutes === null) return null;
  // ~15s/item is the rate the fastest live records were authored at.
  const implied = count * 0.25;
  if (minutes > implied * 2.5) {
    return `${minutes} min is long for ${count} questions (roughly ${Math.max(1, Math.round(implied))} min at a typical pace).`;
  }
  if (minutes < implied * 0.4) {
    return `${minutes} min is short for ${count} questions (roughly ${Math.max(1, Math.round(implied))} min at a typical pace).`;
  }
  return null;
}
