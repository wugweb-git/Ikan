/**
 * The facts a user decides an Equip programme on: how long it runs, and how
 * much is in it. One source for each.
 *
 * The counterpart to `assessment-meta.ts`, and it exists for the same reason:
 * three surfaces answered "how long is this programme?" three different ways,
 * and one of them answered it with nothing at all.
 *
 * ## Why `daily_content.length` wins
 *
 * Measured 2026-09-08, all four live programmes:
 *
 *   Unburn              daily_content 31   duration_days 35   duration_weeks 4
 *   Sleep Tight         daily_content 31   duration_days 31   duration_weeks 5
 *   Stress Buster       daily_content 28   duration_days 30   duration_weeks 4
 *   Productivity Reset  daily_content  8   duration_days  7   duration_weeks 1
 *
 * `daily_content` is the programme — it is the array `ProgramPlayer` walks and
 * the admin editor writes. `duration_days` is a separate authored field that
 * agrees with it exactly once in four, and `duration_weeks` disagrees with its
 * own `duration_days` in three of four (35 days is 5 weeks, not 4; 31 is 5, not
 * 4 or 5 consistently). Only one of these three numbers is checkable against
 * what a user will actually be asked to do.
 *
 * So this resolves from `daily_content` and treats the authored fields as
 * declared-but-unverified. It does not silently pick a winner and hide the
 * disagreement: `equipDurationLooksImplausible` reports it, the same way
 * `durationLooksImplausible` does for an assessment.
 */

/** What this reads off an equip record. Structural on purpose. */
export interface EquipMetaSource {
  daily_content?: unknown;
  days?: unknown;
  duration_days?: unknown;
  duration_weeks?: unknown;
}

export interface EquipMeta {
  /** Days the programme actually contains. Null when it has no content. */
  days: number | null;
  /** Total activities across every day. Null when there are none. */
  activities: number | null;
  /** Authored weeks, echoed for display only. Never used to derive days. */
  declaredWeeks: number | null;
}

function positiveInt(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

/** The live day array, whichever field this record shape put it in. */
function daysArray(p: EquipMetaSource | null | undefined): unknown[] {
  if (Array.isArray(p?.daily_content) && p.daily_content.length > 0) return p.daily_content;
  // `days` is the separate-entity shape. It is dead for content purposes, but
  // a record fetched through a path that still populates it should not report
  // a programme as empty.
  if (Array.isArray(p?.days)) return p.days;
  return [];
}

export function equipMeta(p: EquipMetaSource | null | undefined): EquipMeta {
  const arr = daysArray(p);
  const days = arr.length > 0 ? arr.length : null;

  let activities = 0;
  for (const d of arr) {
    const blocks = (d as any)?.blocks ?? (d as any)?.activities;
    if (Array.isArray(blocks)) activities += blocks.length;
  }

  return {
    days,
    activities: activities > 0 ? activities : null,
    declaredWeeks: positiveInt(p?.duration_weeks),
  };
}

/**
 * Meta as label/value pairs.
 *
 * Parts, not an interpolated string — the same reason `assessmentMetaChips`
 * returns them. A caller lays them out; nothing here commits them to a
 * run-on that translates badly.
 */
export function equipMetaChips(p: EquipMetaSource | null | undefined): { key: string; label: string }[] {
  const { days, activities } = equipMeta(p);
  const chips: { key: string; label: string }[] = [];
  if (days !== null) chips.push({ key: 'days', label: `${days} days` });
  if (activities !== null) chips.push({ key: 'activities', label: `${activities} activities` });
  return chips;
}

/**
 * Whether the authored duration fields agree with the programme's real length.
 *
 * Flags, never blocks — the same shape as the coverage meter and
 * `durationLooksImplausible`. It exists because `duration_days` is hand-authored
 * and drifts, and nothing else can tell an editor that a 31-day programme is
 * advertised as 35.
 *
 * Returns null when there is nothing to compare, so an unauthored field is
 * silence rather than a complaint.
 */
export function equipDurationLooksImplausible(p: EquipMetaSource | null | undefined): string | null {
  const { days, declaredWeeks } = equipMeta(p);
  if (days === null) return null;

  const declaredDays = positiveInt(p?.duration_days);
  const problems: string[] = [];

  if (declaredDays !== null && declaredDays !== days) {
    problems.push(`duration_days says ${declaredDays} but the programme contains ${days} days`);
  }
  if (declaredWeeks !== null) {
    // A week is 7 days. Allow the partial final week, so 31 days is 5 weeks
    // and not "4.43".
    const impliedWeeks = Math.ceil(days / 7);
    if (declaredWeeks !== impliedWeeks) {
      problems.push(`duration_weeks says ${declaredWeeks} but ${days} days is ${impliedWeeks}`);
    }
  }

  return problems.length > 0 ? problems.join('; ') + '.' : null;
}
