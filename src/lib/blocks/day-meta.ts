/**
 * What a day's header says about itself: how many blocks, how long, and whether
 * anything on it repeats.
 *
 * This is DERIVED TEXT, which is the kind that lies. "24 min · repeats to day 21"
 * is four separate claims and none of them is stored anywhere — so it is computed
 * here, once, with tests beside `repeat-summary.test.ts`, rather than inline in a
 * component where a second copy would appear the first time another screen wanted
 * the same line.
 *
 * The repeat half is built from the BLOCKS' own `repeat` config through
 * `repeatTargetDays`. A day does not yet carry a repeat of its own — that is §21
 * item 7 — so a day "repeats" exactly when one of its blocks is carried forward
 * onto another day, and the phrase names the furthest day it reaches.
 */
import { repeatTargetDays, type Activity, type DayContent } from './block-model.ts';

export interface DayMeta {
  blocks: number;
  /** Summed block durations, in minutes. Blocks with none count as 0, not 5. */
  minutes: number;
  /** Every other day this day's blocks are carried onto, ascending. */
  repeatsTo: number[];
  /** "repeats to day 21" / "repeats to 3 days" / undefined when nothing repeats. */
  repeatLabel?: string;
}

export function dayMeta(day: DayContent | undefined, totalDays: number): DayMeta {
  const list: Activity[] = day?.activities ?? [];
  const minutes = list.reduce((n, b) => n + (typeof b?.duration === 'number' ? b.duration : 0), 0);

  const targets = new Set<number>();
  for (const block of list) {
    if (!block?.repeat) continue;
    for (const d of repeatTargetDays(block, day!.day, totalDays)) {
      if (d !== day!.day) targets.add(d);
    }
  }
  const repeatsTo = [...targets].sort((a, b) => a - b);

  let repeatLabel: string | undefined;
  if (repeatsTo.length === 1) repeatLabel = `repeats to day ${repeatsTo[0]}`;
  else if (repeatsTo.length > 1) {
    const contiguous = repeatsTo.every((d, i) => i === 0 || d === repeatsTo[i - 1] + 1);
    repeatLabel = contiguous
      ? `repeats to day ${repeatsTo[repeatsTo.length - 1]}`
      : `repeats onto ${repeatsTo.length} days`;
  }

  return { blocks: list.length, minutes, repeatsTo, repeatLabel };
}

/** The day-list row's count badge: how many blocks, or nothing when empty. */
export function blockCountLabel(day: DayContent | undefined): string {
  const n = day?.activities?.length ?? 0;
  return n === 0 ? '' : String(n);
}
