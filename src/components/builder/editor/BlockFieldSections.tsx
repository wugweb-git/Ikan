/**
 * Every field whose visibility is decided by the BLOCK — its `type`, its
 * activity, or whether it sits in an assessment. Moved out of `BlockEditor.tsx`
 * 2026-09-09 (§21 layout port, phase 2), JSX unchanged.
 *
 * The boundary is deliberate: a section belongs here iff `block.type`,
 * `activityOf(block)` or `isAssessment` decides whether it appears. Anything
 * decided by POSITION — title, subtitle, the type picker, the media buttons —
 * stays with the chrome, which phase 3 replaces.
 *
 * Five sections, and the guards are worth stating because a dropped branch
 * type-checks perfectly and simply never renders:
 *
 *   content        `hasContentField(block.type)` — lesson · journal · conclude · sleep-diary
 *   response key   type ∈ exercise · journal · checklist · sleep-diary
 *   exercise       `block.type === 'exercise'`, then per-activity:
 *                    options      mcq · single-select · multi-select · structured-list
 *                    clinical     clinical-instrument (questions + scale)
 *                    rating       rating-scale (min · max · labels)
 *                    table        table · input-table · comparison-matrix · comparison_matrix
 *                    upload       upload (accepted types · max size)
 *   checklist      `block.type === 'checklist'`
 *   scoring        `(isAssessment || activityConfig.scoring.enabled) && type === 'exercise'`
 *
 * Note every per-activity guard reads `block.activityConfig?.subtype`, NOT
 * `activityOf(block)`. That is today's behaviour and it is preserved exactly: a
 * block carrying its activity only at block level (220 of 420 live) shows the
 * header's activity and none of these panels. Changing it here would be a
 * behaviour change hidden inside a move.
 */
import { Target, Upload } from 'lucide-react';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { RichTextEditor } from '../../ui/rich-text-editor';
import { Activity, AUTHORABLE_SUBTYPES, activityOf, normalizeSubtype } from '../../../lib/blocks/block-model';
import { getIconComponent, iconResolves } from '../../../lib/catalog-icons';
import { hasContentField, contentLabelFor, contentPlaceholderFor } from '../../../lib/blocks/block-fields';
import { useMetadata } from '../../../hooks/useMetadata';

export interface BlockFieldSectionsProps {
  block: Activity;
  onChange: (updates: Partial<Activity>) => void;
  isAssessment?: boolean;
}

export function BlockFieldSections({ block, onChange, isAssessment }: BlockFieldSectionsProps) {
  /* Derived here rather than passed in, so the sections and their inputs move
     together. The chrome computes `currentActivity` too, for the header; the
     duplication lasts until phase 3 makes this the only reader. */
  const { exerciseSubtypes: kvExerciseSubtypes } = useMetadata();
  const currentActivity = normalizeSubtype(activityOf(block)) ?? activityOf(block);
  const exerciseSubtypeOptions = kvExerciseSubtypes
    .filter(s => (AUTHORABLE_SUBTYPES as readonly string[]).includes(s.value)
                 || s.value === currentActivity)
    .map(s => ({ value: s.value, label: s.label, icon: s.icon, offPreset: false }));
  const suggestedKey = (block.activityConfig?.prompt || block.title || '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').split('_').slice(0, 4).join('_')
    || undefined;

  return (
    <>
      {/* DYNAMIC FIELDS BASED ON TYPE */}

      {/* 1. CONTENT / PROMPT SECTION — which types, what label and what
          placeholder all come from `block-fields.ts`, shared with the
          viewer's preview so the two cannot drift. */}
      {hasContentField(block.type) && (
        <div className="space-y-1">
          <Label style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)' }}>
            {contentLabelFor(block.type)}
          </Label>
          <RichTextEditor
            value={block.content}
            onChange={(val) => onChange({ content: val })}
            placeholder={contentPlaceholderFor(block.type)}
            minHeight="80px"
          />
        </div>
      )}

      {/*
        RESPONSE KEY — where this block's answers go.

        The field has never existed. `activityConfig.key` was on 98 blocks
        and read by no code until this week, and 107 input-tables have none
        because an author was never asked: the 37 that do have one inherited
        it by copy-paste, which is why 14 keys are shared across 51 blocks.
        The validator now reports the gap; without this field there was no
        way to act on the report.

        Shown only for the four types that produce an answer. A `lesson` or
        a `conclude` has nothing to file.
      */}
      {['exercise', 'journal', 'checklist', 'sleep-diary'].includes(block.type) && (
        <div className="space-y-1">
          <Label style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)' }}>
            Response key
          </Label>
          <div className="flex gap-2">
            <Input
              value={block.activityConfig?.key || ''}
              onChange={(e) => onChange({
                activityConfig: { ...block.activityConfig, key: e.target.value.trim() },
              })}
              placeholder="e.g. sleep_quality"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            {!block.activityConfig?.key && suggestedKey && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange({
                  activityConfig: { ...block.activityConfig, key: suggestedKey },
                })}
                style={{ fontFamily: 'monospace', fontSize: '11px', whiteSpace: 'nowrap' }}
              >
                use {suggestedKey}
              </Button>
            )}
          </div>
          <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
            Answers file under this name instead of the block id. Give the SAME key to the same
            question on other days and its entries become one series — that is what turns seven
            nights of a sleep diary into a diary. Leave it blank and each day is a separate,
            unrelated answer.
          </p>
        </div>
      )}

      {/* 2. EXERCISE BLOCK */}
      {block.type === 'exercise' && (
        <div className="space-y-4 border-l-2 pl-4" style={{ borderColor: 'var(--color-accent-default)' }}>
          <div className="space-y-1">
            {/* Mislabelled since it was written: this list is fed by the
                `activity` catalog bucket (renamed from `exercise_subtype`
                in Phase 1.2), not by InteractionType. */}
            {/* "N allowed on a <stage> day" was here. A day has no type,
                so there is no such sentence to write. */}
            <Label className="text-xs">Activity</Label>
            <Select 
              value={currentActivity || 'mcq'} 
              /*
                Writes the block-level `activity` — the field `activityOf`
                prefers and 420 of 420 blocks carry — and keeps
                `activityConfig.subtype` in step ONLY where it already
                exists. Writing both unconditionally would put the old
                field back onto the 220 blocks the remap cleared, which is
                the two-representations failure this module keeps paying for.
              */
              onValueChange={(val: any) => onChange({
                activity: val,
                ...(block.activityConfig?.subtype
                  ? { activityConfig: { ...block.activityConfig, subtype: val } }
                  : {}),
              })}
            >
              {/* No icon of its own here: `SelectValue` renders the chosen
                  item's children, icon included, so adding one drew it twice. */}
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exerciseSubtypeOptions.map((subtype) => {
                  const Icon = getIconComponent(subtype.icon);
                  return (
                    <SelectItem key={subtype.value} value={subtype.value}>
                      <span className="flex items-center gap-2">
                        {iconResolves(subtype.icon) && <Icon size={14} style={{ color: 'var(--color-text-muted)' }} />}
                        {subtype.label}
                      </span>
                      {subtype.offPreset && (
                        <span style={{ color: 'var(--color-status-warning)' }}>
                          {' '}· not usually on this day
                        </span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Prompt / Question</Label>
            <Input 
              value={block.activityConfig?.prompt || ''} 
              onChange={(e) => onChange({ 
                activityConfig: { ...block.activityConfig, prompt: e.target.value } 
              })}
              placeholder="e.g. Which of these habits do you do?"
            />
          </div>

          {/* Options Editor for MCQ/Select/Structured List */}
          {['mcq', 'single-select', 'multi-select', 'structured-list'].includes(block.activityConfig?.subtype || '') && (
            <div className="space-y-1">
              <Label className="text-xs">
                {block.activityConfig?.subtype === 'structured-list' ? 'List Items' : 'Options'} (One per line)
              </Label>
              <Textarea 
                value={(
                  block.activityConfig?.subtype === 'structured-list' 
                    ? (block.activityConfig?.listItems || []) 
                    : (block.activityConfig?.options || [])
                ).join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').filter(l => l);
                  const isList = block.activityConfig?.subtype === 'structured-list';
                  onChange({ 
                    activityConfig: { 
                      ...block.activityConfig, 
                      options: isList ? undefined : lines,
                      listItems: isList ? lines : undefined
                    } 
                  });
                }}
                placeholder="Item 1&#10;Item 2&#10;Item 3"
                rows={4}
              />
            </div>
          )}

          {/* Clinical Instrument Config */}
          {block.activityConfig?.subtype === 'clinical-instrument' && (
            <div className="space-y-4 pt-2 border-t border-dashed">
              <div className="space-y-1">
                <Label className="text-xs">Questions (One per line)</Label>
                <Textarea 
                  value={(block.activityConfig?.questions || []).join('\n')}
                  onChange={(e) => onChange({ 
                    activityConfig: { 
                      ...block.activityConfig, 
                      questions: e.target.value.split('\n').filter(l => l) 
                    } 
                  })}
                  placeholder="Feeling nervous?&#10;Not being able to stop worrying?"
                  rows={4}
                />
              </div>
              <div className="space-y-1">
                 <Label className="text-xs">Scale (Label : Value per line)</Label>
                 <Textarea
                   value={(block.activityConfig?.scale || []).map(s => `${s.label}:${s.value}`).join('\n')}
                   onChange={(e) => {
                     const scale = e.target.value.split('\n').map(line => {
                       const [label, val] = line.split(':');
                       return { label: label?.trim() || '', value: parseInt(val?.trim() || '0') };
                     }).filter(s => s.label);
                     onChange({ 
                       activityConfig: { ...block.activityConfig, scale } 
                     });
                   }}
                   placeholder="Not at all : 0&#10;Several days : 1&#10;More than half the days : 2&#10;Nearly every day : 3"
                   rows={4}
                 />
              </div>
            </div>
          )}

          {/* Rating Scale Config */}
          {block.activityConfig?.subtype === 'rating-scale' && (
            <div className="space-y-4 pt-2 border-t border-dashed">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Min Value</Label>
                  <Input
                    type="number"
                    value={block.activityConfig?.slider_min ?? 0}
                    onChange={(e) => onChange({
                      activityConfig: { ...block.activityConfig, slider_min: parseInt(e.target.value) || 0 }
                    })}
                    placeholder="0"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max Value</Label>
                  <Input
                    type="number"
                    value={block.activityConfig?.slider_max ?? 10}
                    onChange={(e) => onChange({
                      activityConfig: { ...block.activityConfig, slider_max: parseInt(e.target.value) || 10 }
                    })}
                    placeholder="10"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Scale Labels (comma separated, e.g. "Very Low, Low, Moderate, High, Very High")</Label>
                <Input
                  value={(block.activityConfig?.slider_labels || []).join(', ')}
                  onChange={(e) => onChange({
                    activityConfig: {
                      ...block.activityConfig,
                      slider_labels: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }
                  })}
                  placeholder="Not at all, Slightly, Moderately, Very, Extremely"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          )}

          {/* Table Config */}
          {(block.activityConfig?.subtype === 'table' || block.activityConfig?.subtype === 'input-table' || block.activityConfig?.subtype === 'comparison-matrix' || block.activityConfig?.subtype === 'comparison_matrix') && (
            <div className="space-y-4 pt-2 border-t border-dashed">
              <div className="space-y-1">
                <Label className="text-xs">Column Headers (One per line)</Label>
                <Textarea 
                  value={(block.activityConfig?.columns || []).join('\n')}
                  onChange={(e) => onChange({ 
                    activityConfig: { 
                      ...block.activityConfig, 
                      columns: e.target.value.split('\n').filter(l => l) 
                    } 
                  })}
                  placeholder="Situation&#10;Emotion&#10;Intensity (1-10)"
                  rows={4}
                />
              </div>
        
              <div className="space-y-1">
                <Label className="text-xs">Row Headers (Optional - for Fixed Grid)</Label>
                <Textarea 
                  value={(block.activityConfig?.rows || []).join('\n')}
                  onChange={(e) => onChange({ 
                    activityConfig: { 
                      ...block.activityConfig, 
                      rows: e.target.value.split('\n').filter(l => l) 
                    } 
                  })}
                  placeholder="Row 1&#10;Row 2&#10;Row 3"
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                 <Checkbox 
                   id="allow_add_rows"
                   checked={block.activityConfig?.allow_add_rows}
                   onCheckedChange={(c) => onChange({
                      activityConfig: { ...block.activityConfig, allow_add_rows: !!c }
                   })}
                 />
                 <Label htmlFor="allow_add_rows" className="text-xs font-normal">Allow user to add rows</Label>
              </div>
            </div>
          )}

          {/* Upload Config */}
          {block.activityConfig?.subtype === 'upload' && (
            <div className="space-y-4 pt-2 border-t border-dashed">
              <div className="flex items-center gap-2 mb-1">
                <Upload size={14} style={{ color: 'var(--color-primary-default)' }} />
                <Label className="text-xs" style={{ fontWeight: 'var(--font-weight-medium)' }}>Upload Settings</Label>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Accepted File Types (comma separated)</Label>
                <Input
                  value={(block.activityConfig?.acceptedFileTypes || []).join(', ')}
                  onChange={(e) => onChange({
                    activityConfig: {
                      ...block.activityConfig,
                      acceptedFileTypes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }
                  })}
                  placeholder="image/*, .pdf, .doc, .docx, audio/*"
                  className="h-8 text-xs"
                />
                <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                  Use MIME types (image/*, audio/*) or extensions (.pdf, .doc). Leave empty for default (images, PDFs, docs, audio).
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Max File Size (MB)</Label>
                <Input
                  type="number"
                  value={Math.round((block.activityConfig?.maxFileSize || 10485760) / (1024 * 1024))}
                  onChange={(e) => onChange({
                    activityConfig: {
                      ...block.activityConfig,
                      maxFileSize: (parseInt(e.target.value) || 10) * 1024 * 1024
                    }
                  })}
                  placeholder="10"
                  className="h-8 text-xs w-24"
                  min={1}
                  max={10}
                />
                <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                  Maximum 10MB per file. Files are stored securely in private storage.
                </p>
              </div>

              <div className="p-2 rounded-md" style={{ backgroundColor: 'var(--color-status-info-light)', border: '1px solid var(--color-border-default)' }}>
                <p style={{ fontSize: '10px', color: 'var(--color-status-info)', lineHeight: 1.5 }}>
                  Uploaded files are stored in Supabase Storage with signed URLs. Users see a tap-to-upload area with drag feedback and a success state showing the filename and size.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. CHECKLIST BLOCK */}
      {block.type === 'checklist' && (
        <div className="space-y-2">
           <Label className="text-xs">Checklist Items (One per line)</Label>
           <Textarea
             value={(block.activityConfig?.options || []).join('\n')}
             onChange={(e) => onChange({ 
                activityConfig: { 
                  ...block.activityConfig, 
                  subtype: 'multi-select', // Checklist is effectively multi-select
                  options: e.target.value.split('\n').filter(l => l) 
                } 
              })}
             placeholder="Brush teeth&#10;Read book&#10;Turn off phone"
             rows={4}
           />
        </div>
      )}

      {/* SCORING SECTION (Assessment Only) */}
      {(isAssessment || block.activityConfig?.scoring?.enabled) && block.type === 'exercise' && (
         <div className="pt-2 border-t p-3 rounded-md" style={{ backgroundColor: 'var(--color-status-warning-light)' }}>
           <div className="flex items-center justify-between mb-2">
             <Label className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-status-warning)' }}>
               <Target size={12} /> Scoring Configuration
             </Label>
             <div className="flex items-center gap-2">
                <Checkbox 
                  checked={block.activityConfig?.scoring?.enabled}
                  onCheckedChange={(c) => onChange({
                    activityConfig: {
                      ...block.activityConfig,
                      scoring: { ...block.activityConfig?.scoring, enabled: !!c }
                    }
                  })}
                />
                <Label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-status-warning)' }}>Enable Scoring</Label>
             </div>
           </div>

           {block.activityConfig?.scoring?.enabled && (
             <div className="space-y-3">
                {['mcq', 'single-select', 'multi-select'].includes(block.activityConfig?.subtype || '') && (
                  <div className="space-y-1">
                    <Label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-status-warning)' }}>
                      Option Weights (Comma separated, order matches options)
                    </Label>
                    <Input 
                      value={(block.activityConfig?.scoring?.weights || []).join(', ')}
                      onChange={(e) => {
                        const weights = e.target.value.split(',').map(w => parseInt(w.trim()) || 0);
                        onChange({
                          activityConfig: {
                            ...block.activityConfig,
                            scoring: { ...block.activityConfig?.scoring, weights }
                          }
                        });
                      }}
                      placeholder="e.g. 0, 1, 0, 0 (Correct answer is 2nd option)"
                      className="h-8 text-xs"
                      style={{ borderColor: 'var(--color-status-warning-light)' }}
                    />
                  </div>
                )}
          
                <div className="flex items-center gap-2">
                  <Label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-status-warning)' }}>Max Score</Label>
                  <Input 
                    type="number"
                    value={block.activityConfig?.scoring?.maxScore || 1}
                    onChange={(e) => onChange({
                      activityConfig: {
                        ...block.activityConfig,
                        scoring: { ...block.activityConfig?.scoring, maxScore: parseInt(e.target.value) }
                      }
                    })}
                    className="w-16 h-7 text-xs" style={{ backgroundColor: 'var(--color-bg-card)' }}
                  />
                </div>
             </div>
           )}
         </div>
      )}
    </>
  );
}
