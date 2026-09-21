/**
 * The day's own settings: title, subtitle, description.
 *
 * Moved verbatim from `DayComposer.tsx` 2026-09-09 (§21 layout port, phase 1).
 * Three references became props: `activeDay` -> `day`,
 * `handleUpdateDay(activeDay.day, …)` -> `onUpdate(…)`, `stageRows` ->
 * `templates`. Nothing else changed.
 *
 * It also carried an "Apply a template" picker and a read-only "this day's
 * behaviour" table. Both were removed 2026-09-09 on the owner's instruction —
 * see the notes at each site for what they did and what still writes `policy`
 * and `layout` without them.
 */
import { DayContent } from '../../../shared/blocks/block-model';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';

export interface DayConfigPaneProps {
  day: DayContent;
  onUpdate: (updates: Partial<DayContent>) => void;
  readOnly: boolean;
}

export function DayConfigPane({ day, onUpdate, readOnly }: DayConfigPaneProps) {
  return (
    <div className="animate-in fade-in duration-300 space-y-3">
      <div>
        <h2 style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}>Day Configuration</h2>
        <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>Define the identity and goals for Day {day.day}.</p>
      </div>

      <div className="space-y-2">
        <div>
          <label style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>Day Title</label>
          <Input 
            value={day.title} 
            onChange={e => onUpdate({ title: e.target.value })}
            placeholder="e.g. Introduction to Mindfulness"
            className="h-9"
            style={{ fontWeight: 500, fontSize: '13px', borderRadius: 'var(--radius-md)' }}
            disabled={readOnly}
          />
        </div>

        {/* Subtitle */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>Subtitle</label>
          <Input 
            value={day.subtitle || ''} 
            onChange={e => onUpdate({ subtitle: e.target.value })}
            placeholder="e.g. Learn the basics of breathing exercises"
            className="h-8"
            style={{ fontSize: '12px', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-md)' }}
            disabled={readOnly}
          />
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>Description</label>
          <Textarea 
            value={day.description || ''} 
            onChange={e => onUpdate({ description: e.target.value })}
            placeholder="Brief summary..."
            rows={2}
            style={{ fontSize: '12px', borderRadius: 'var(--radius-md)', minHeight: '52px' }}
            disabled={readOnly}
          />
        </div>
      </div>

      {/*
        "THIS DAY'S BEHAVIOUR" was here — a read-only table of `policyOf(day)`
        and `layoutOf(day)` (auto-advance, navigation, scoring, save-on-exit,
        step rules, layout, progress style, button labels) plus a provenance
        line saying which template seeded them.

        Removed 2026-09-09 on the owner's instruction, together with the
        template picker above it. It described the day accurately; it was simply
        not what an author comes to this screen to read.

        None of it is orphaned: `policy` and `layout` are still written when a
        day is created, `policyOf` still governs the block editor's Step control,
        and `layoutOf` still drives the player's day layout. What is gone is the
        REPORT, not the data.
      */}

    </div>
  );
}
