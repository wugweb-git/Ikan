/**
 * How a day LOOKS, as data rather than as a lookup on its type.
 *
 * §19 step 1 — the reader. A day is moving from carrying a `dayType` that
 * everything else is derived from, to carrying its own `policy` and `layout`
 * written onto it when a template seeds it. This module is the first half:
 * every day can now state its own layout, and one that does not still resolves
 * through the old type lookup, so nothing changes until the data does.
 *
 * ## The two fields that could not simply move
 *
 * `DAY_TYPE_CONFIG` was a `Record<DayType, …>` in `ProgramPlayer.tsx`, and two
 * of its seven fields were **functions**:
 *
 *     primaryButtonText: (isLast: boolean) => string
 *     fallbackTitle:     (dayNum: number) => string
 *
 * A function cannot be stored in KV, so denormalising the map as written was
 * impossible — the migration would have written `undefined` for both and every
 * day would have lost its primary button label. They are data here:
 *
 *     primaryButtonText: { last: 'See Results', otherwise: 'Next' }
 *     fallbackTitle:     'Day {day}'
 *
 * A label that ignored `isLast` becomes the same string twice, which is the
 * honest encoding — it says "this stage does not distinguish the last step"
 * rather than hiding it in a closure.
 *
 * The map also moved out of the component so the step-2 migration can import
 * it: `ProgramPlayer.tsx` is `.tsx`, and Node's type stripper cannot load one,
 * so a migration script could never have read the values it needed to write.
 */
import type { DayType, DayContent } from './block-model.ts';

/** A day's appearance. Fully serialisable — no functions, so it can be stored. */
export interface DayLayout {
  layout: 'centered' | 'card' | 'scrollable' | 'compact' | 'step-focus';
  showBack: boolean;
  autoAdvance: boolean;
  progressStyle: 'percentage' | 'steps' | 'none';
  /** Was `(isLast) => string`. Equal values mean the stage draws one label. */
  primaryButtonText: { last: string; otherwise: string };
  /** Heading on the completion screen. */
  completionTitle: string;
  /** Was `(dayNum) => string`. `{day}` is substituted with the day number. */
  fallbackTitle: string;
  singlePage?: boolean;
  bgColor?: string;
}

const PAGE = 'bg-[var(--color-bg-page)]';
const CARD = 'bg-[var(--color-bg-card)]';
/** A label that did not branch on `isLast`. */
const same = (s: string) => ({ last: s, otherwise: s });

/**
 * The template layouts, one per stage type.
 *
 * Values are byte-identical to the `DAY_TYPE_CONFIG` they replace —
 * `day-layout.test.ts` asserts that against every one of the eleven, because
 * "zero behaviour change" is the entire promise of this step.
 *
 * These remain as what a template SEEDS. Once a day carries its own layout,
 * editing one of these no longer changes that day — which is what makes it a
 * template rather than a type, and is the consequence most likely to surprise.
 */
export const DAY_TYPE_LAYOUTS: Record<DayType, DayLayout> = {
  'onboarding': {
    layout: 'step-focus', showBack: false, autoAdvance: true, progressStyle: 'steps',
    primaryButtonText: { last: 'Start Programme', otherwise: 'Continue' },
    bgColor: PAGE, completionTitle: "You're all set", fallbackTitle: 'Getting started',
  },
  'quiz': {
    layout: 'centered', showBack: false, autoAdvance: true, progressStyle: 'steps',
    primaryButtonText: { last: 'See Results', otherwise: 'Next' },
    bgColor: PAGE, completionTitle: 'Quiz Complete', fallbackTitle: 'Day {day}',
  },
  'check-in': {
    layout: 'compact', showBack: false, autoAdvance: true, progressStyle: 'steps',
    primaryButtonText: { last: 'Done', otherwise: 'Next' },
    bgColor: PAGE, completionTitle: 'Checked in', fallbackTitle: 'Day {day}',
  },
  'rest': {
    layout: 'scrollable', showBack: true, autoAdvance: false, progressStyle: 'none',
    primaryButtonText: same('Done'), singlePage: true,
    bgColor: PAGE, completionTitle: 'Rest Day', fallbackTitle: 'Day {day}',
  },
  'assessment': {
    layout: 'centered', showBack: false, autoAdvance: true, progressStyle: 'steps',
    primaryButtonText: { last: 'Complete', otherwise: 'Continue' },
    bgColor: PAGE, completionTitle: 'All Done!', fallbackTitle: 'Assessment',
  },
  'assessment-lite': {
    layout: 'card', showBack: true, autoAdvance: true, progressStyle: 'percentage',
    primaryButtonText: { last: 'Complete', otherwise: 'Next' },
    bgColor: CARD, completionTitle: 'All Done!', fallbackTitle: 'Assessment',
  },
  'learning': {
    layout: 'scrollable', showBack: true, autoAdvance: false, progressStyle: 'percentage',
    primaryButtonText: same('Continue'),
    bgColor: PAGE, completionTitle: 'Session Complete', fallbackTitle: 'Day {day}',
  },
  'practice': {
    layout: 'scrollable', showBack: true, autoAdvance: false, progressStyle: 'percentage',
    primaryButtonText: { last: 'Done for Today', otherwise: 'Next' },
    // Reads 'Assessment', not 'Day {day}'. Preserved verbatim from the map it
    // replaces — see the note there about assessments having run as `practice`.
    bgColor: PAGE, completionTitle: 'All Done!', fallbackTitle: 'Assessment',
  },
  'workshop': {
    layout: 'step-focus', showBack: true, autoAdvance: false, progressStyle: 'steps',
    primaryButtonText: { last: 'Finish', otherwise: 'Continue' },
    bgColor: CARD, completionTitle: 'Session Complete', fallbackTitle: 'Day {day}',
  },
  'tracker': {
    layout: 'compact', showBack: false, autoAdvance: false, progressStyle: 'none',
    primaryButtonText: same('Save'), singlePage: true,
    bgColor: PAGE, completionTitle: 'Session Complete', fallbackTitle: 'Day {day}',
  },
  'reflection': {
    layout: 'scrollable', showBack: true, autoAdvance: false, progressStyle: 'none',
    primaryButtonText: same('Complete Reflection'),
    bgColor: PAGE, completionTitle: 'Session Complete', fallbackTitle: 'Day {day}',
  },
};

export const DEFAULT_DAY_LAYOUT = DAY_TYPE_LAYOUTS['learning'];

/**
 * A day's layout: **its own first, the type lookup only as a fallback.**
 *
 * Until the migration writes `layout` onto all 98 live days, every one of them
 * takes the fallback, which is why this step is a no-op in behaviour. After it,
 * the day answers for itself and `dayType` can go.
 */
export function layoutOf(day: Pick<DayContent, 'layout' | 'dayType'> | undefined | null): DayLayout {
  if (day?.layout) return day.layout;
  const t = day?.dayType;
  if (t && Object.prototype.hasOwnProperty.call(DAY_TYPE_LAYOUTS, t)) return DAY_TYPE_LAYOUTS[t];
  return DEFAULT_DAY_LAYOUT;
}

/** The primary button's label. Replaces `config.primaryButtonText(isLast)`. */
export function primaryButtonFor(layout: DayLayout, isLast: boolean): string {
  return isLast ? layout.primaryButtonText.last : layout.primaryButtonText.otherwise;
}

/** The header when neither programme nor day names itself. Replaces `config.fallbackTitle(n)`. */
export function fallbackTitleFor(layout: DayLayout, dayNum: number): string {
  return layout.fallbackTitle.replace('{day}', String(dayNum));
}
