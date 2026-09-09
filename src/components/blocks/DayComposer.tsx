/**
 * `DayEditor` — the day/block builder's public entry point.
 *
 * The component itself is `ContentScreen` in `components/builder/content/`. This
 * file is the adapter that keeps the prop contract its callers already use, so
 * `EquipProgramWizard`, `AssessmentEditPageWizard` and the dev harness did not
 * change a line when the builder was rebuilt (§21 layout port, phase 4).
 *
 * The one translation worth naming: `singleDayMode` was a single flag meaning
 * two things — hide the day calendar, and force the record to exactly one day.
 * `ContentScreen` asks those separately. An assessment answers yes to both, which
 * is why one flag could stand in for two for as long as it did.
 */
import { ContentScreen } from '../builder/content/ContentScreen';
import type { DayContent } from '../../lib/blocks/block-model';

export interface DailyBuilderProps {
  program: { daily_content?: DayContent[] } & Record<string, any>;
  mode: 'equip' | 'assessment' | 'onboarding';
  singleDayMode: boolean;
  onProgramChange: (updates: Partial<{ daily_content: DayContent[] } & Record<string, any>>) => void;
  validationMode?: 'draft' | 'publish';
  readOnly?: boolean;
}

export function DayEditor({
  program, mode, singleDayMode, onProgramChange, validationMode = 'draft', readOnly = false,
}: DailyBuilderProps) {
  return (
    <ContentScreen
      program={program}
      mode={mode}
      onProgramChange={onProgramChange}
      showCalendar={!singleDayMode}
      enforceSingleDay={singleDayMode}
      validationMode={validationMode}
      readOnly={readOnly}
      /* The wizards still render this inside a scrolling `main` with a stepper
         above it, so it keeps its own height until phase 5 gives the builder a
         full-height shell of its own. */
      heightMode="embedded"
    />
  );
}
