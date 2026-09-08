/**
 * How a day BEHAVES, as data rather than as a lookup on its type.
 *
 * §19 step 1 — the policy half of the reader. `DAY_TYPE_PRESETS[dayType]`
 * carries the real behaviour a day obeys — `autoAdvance`, `navigationBack`,
 * `scoringEnabled`, `saveOnExit`, `saveOnToggle` and the step-group rules — so
 * removing `dayType` with nothing in its place would leave the player with
 * nothing to look any of it up from.
 *
 * A day carries its own `policy` from the moment a template seeds it; one that
 * does not still resolves through the type. Until the migration runs, all 98
 * live days take the fallback, so this changes nothing.
 *
 * `allowedInteractions` deliberately does NOT move here. It is composition
 * constraint, and the settled model drops constraint: a template seeds, it does
 * not police. It stays on the preset as seeding information.
 */
import { DAY_TYPE_PRESETS } from './block-type-rules.ts';
import type { DayType, DayContent } from './block-model.ts';

/** What a day obeys. Serialisable, so it can be stored on the day. */
export interface DayPolicy {
  autoAdvance?: boolean;
  navigationBack?: boolean;
  scoringEnabled?: boolean;
  /** The stage promises a save when the user leaves. */
  saveOnExit?: boolean;
  /** Every change is committed as it happens, so no exit flush is needed. */
  saveOnToggle?: boolean;
  stepGroupRules: {
    allowed: boolean;
    required: boolean;
    maxBlocksPerStep?: number;
    oneBlockPerStep?: boolean;
    oneStepPerLesson?: boolean;
  };
}

/** The template policies, derived from the presets rather than restated. */
export const DAY_TYPE_POLICIES: Record<DayType, DayPolicy> = Object.fromEntries(
  Object.entries(DAY_TYPE_PRESETS).map(([type, preset]) => [
    type,
    { ...preset.autoConfig, stepGroupRules: preset.stepGroupRules },
  ]),
) as Record<DayType, DayPolicy>;

export const DEFAULT_DAY_POLICY = DAY_TYPE_POLICIES['learning'];

/**
 * A day's policy: **its own first, the type lookup only as a fallback.**
 *
 * `ProgramPlayer.handleExit` reads `saveOnExit`/`saveOnToggle` through this —
 * that call site went through `DAY_TYPE_PRESETS[activeDay.dayType]` directly
 * until now, and is one of the two the migration has to move.
 */
export function policyOf(day: Pick<DayContent, 'policy' | 'dayType'> | undefined | null): DayPolicy {
  if (day?.policy) return day.policy;
  const t = day?.dayType;
  if (t && Object.prototype.hasOwnProperty.call(DAY_TYPE_POLICIES, t)) return DAY_TYPE_POLICIES[t];
  return DEFAULT_DAY_POLICY;
}
