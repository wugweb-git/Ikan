/**
 * The day's own settings — title, subtitle, description, "apply a template", and
 * the read-only account of what this day obeys.
 *
 * Moved verbatim from `DayComposer.tsx` 2026-09-09 (§21 layout port, phase 1).
 * Three references became props: `activeDay` -> `day`,
 * `handleUpdateDay(activeDay.day, …)` -> `onUpdate(…)`, `stageRows` ->
 * `templates`. Nothing else changed.
 *
 * `applyTemplate` is a SENTINEL on the update, not a field on the day: the
 * mutation pulls it off, writes `policy` + `layout` from it, seeds blocks if the
 * day has none, and discards it. It must keep flowing through `onUpdate`
 * untouched — that indirection is the difference between a template and a type.
 */
import { DayContent } from '../../../lib/blocks/block-model';
import type { DayType } from '../../../lib/blocks/block-model';
import { policyOf } from '../../../lib/blocks/day-policy';
import { layoutOf } from '../../../lib/blocks/day-layout';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent } from '../../ui/card';

export interface DayConfigPaneProps {
  day: DayContent;
  /** The day templates on offer — `{value, label, activities}` per preset. */
  templates: { value: string; label: string; activities?: unknown[] }[];
  onUpdate: (updates: Partial<DayContent> & { applyTemplate?: DayType }) => void;
  readOnly: boolean;
}

export function DayConfigPane({ day, templates, onUpdate, readOnly }: DayConfigPaneProps) {
  return (
    <div className="animate-in fade-in duration-300 space-y-3">
      <div>
        <h2 style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}>Day Configuration</h2>
        <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>Define the identity and goals for Day {day.day}.</p>
      </div>

      {/* Compact 2-column grid form */}
      <div className="space-y-2">
        {/* Title + Type row */}
        <div className="grid grid-cols-[1fr_140px] gap-2">
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
          <div>
            {/*
              APPLY A TEMPLATE — not set a type (§19 step 3).

              This was a Day Type select whose value was stored on
              the day and everything else derived from. A day now
              carries its own `policy` and `layout`; picking here
              WRITES them and seeds the blocks, once. The control
              therefore has no current value to show — nothing to
              select, because the day is not "a learning day", it is
              a day that was made from the learning template and has
              been its own thing since.
            */}
            <label style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>
              Apply a template <span style={{ fontWeight: 400 }}>— writes this day&apos;s behaviour and appearance, once</span>
            </label>
            <Select
              value=""
              onValueChange={(v: string) => onUpdate({ applyTemplate: v as DayType } as Partial<DayContent>)}
              disabled={readOnly}
            >
              <SelectTrigger className="h-9" style={{ fontSize: '12px', borderRadius: 'var(--radius-md)' }}>
                <SelectValue placeholder="Choose a template…" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((row) => (
                  <SelectItem key={row.value} value={row.value}>
                    <div className="flex items-center gap-2">
                      <span>{row.label}</span>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                        {(row.activities ?? []).length} activities
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: 3 }}>
              Applying one overwrites this day&apos;s policy and layout, and seeds
              blocks if it has none. Editing the template later will not change
              this day.
            </p>
          </div>
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

      {/* ── THIS DAY'S OWN POLICY AND LAYOUT ── */}
      {/*
        Was "DAY TYPE PRESET DETAILS" — a read-only view of the
        preset the day's type pointed at, including its
        `can_hold` allow-list. All of that described a template,
        not this day. Since §19 step 3 the day carries its own
        policy and layout, so this shows what THIS day actually
        obeys, and the provenance stamp saying which template
        wrote it and when.
      */}
      {(() => {
        const policy = policyOf(day);
        const layout = layoutOf(day);
        const source = (day as { policy_source?: string }).policy_source;
        const rows: [string, string][] = [
          ['Auto-advance', String(policy.autoAdvance ?? false)],
          ['Navigation back', String(policy.navigationBack ?? false)],
          ['Scoring', String(policy.scoringEnabled ?? false)],
          ['Save on exit', String(policy.saveOnExit ?? false)],
          ['Save on toggle', String(policy.saveOnToggle ?? false)],
          ['Steps', policy.stepGroupRules.allowed
            ? (policy.stepGroupRules.required ? 'allowed, required' : 'allowed')
            : 'not allowed'],
          ['Layout', layout.layout],
          ['Progress', layout.progressStyle],
          ['Primary button', layout.primaryButtonText.last === layout.primaryButtonText.otherwise
            ? layout.primaryButtonText.last
            : `${layout.primaryButtonText.otherwise} / ${layout.primaryButtonText.last} on the last step`],
          ['Completion title', layout.completionTitle],
        ];
        return (
          <Card style={{ border: '1px solid var(--color-border-default)' }}>
            <CardContent className="p-3 space-y-1">
              <p className="uppercase tracking-wider mb-1" style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)' }}>
                This day&apos;s behaviour
              </p>
              {rows.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-2" style={{ fontSize: '11px', fontFamily: 'var(--font-family-base)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{k}</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{v}</span>
                </div>
              ))}
              <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: 6 }}>
                {source
                  ? `Seeded from ${source}. Editing that template will not change this day.`
                  : 'This day owns these values; no template has been applied to it.'}
              </p>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
