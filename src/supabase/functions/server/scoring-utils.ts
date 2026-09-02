/**
 * One implementation of "what was this assessment out of".
 *
 * There were four — here, in ikan-score-routes, in index.tsx's history repair,
 * and on the client — each with its own fallback ladder, and they disagreed.
 * Three of them computed the maximum by reading `opt.value` on every option.
 * Every option in this database is a plain string, so that always resolved to
 * 0 and the denominator fell through to a band ceiling or a hardcoded literal.
 *
 * `questions[].scoring` is an option-text -> weight map and is the
 * authoritative source. It is populated on all live questions. Read that
 * first, and keep the `opt.value` path only for object-shaped options that
 * older content may still carry.
 */
export function maxScoreFromDefinition(def: any): number {
  if (!def?.questions || !Array.isArray(def.questions)) return 0;

  let total = 0;
  for (const q of def.questions) {
    let maxVal = 0;

    if (q?.scoring && typeof q.scoring === 'object' && !Array.isArray(q.scoring)) {
      for (const w of Object.values(q.scoring)) {
        if (typeof w === 'number' && w > maxVal) maxVal = w;
      }
    }

    if (maxVal === 0 && Array.isArray(q?.options)) {
      for (const opt of q.options) {
        const v = typeof opt === 'object' && opt !== null ? (opt.value ?? opt.score ?? 0) : 0;
        if (typeof v === 'number' && v > maxVal) maxVal = v;
      }
    }

    total += maxVal;
  }
  return total;
}

/**
 * Last-resort denominator from the declared bands. Separate from the function
 * above so callers decide explicitly whether a band ceiling is acceptable —
 * it is not a maximum, it is the top of the most severe band, and `ranges` is
 * legitimately null on assessments that declare no bands.
 */
export function maxScoreFromBands(def: any): number {
  const ranges = def?.scoring?.ranges;
  if (!Array.isArray(ranges) || ranges.length === 0) return 0;
  return ranges[ranges.length - 1]?.max || 0;
}
