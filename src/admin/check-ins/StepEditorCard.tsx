import { useState } from 'react';
import { Plus, Trash2, GripVertical, Copy, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { cn } from '../ui/utils';
import { getAvailableScaleKeys } from '../ui/lib/emoji-utils';
import { AddNewScaleModal } from './AddNewScaleModal';
import {
  BLOCK_TYPES,
  EMOJI_PICKS,
  FIELD_INPUT,
  FIELD_LABEL,
  FIELD_SELECT,
  getBlockIcon,
  getBlockLabel,
  type CheckinStep,
  type StepType,
} from './checkin-template-types';

const MUTED = 'text-[var(--color-text-muted)]';

export function StepEditorCard({
  step,
  index,
  totalSteps,
  expanded,
  onToggleExpand,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  emaCategories,
  onAddScale,
}: {
  step: CheckinStep;
  index: number;
  totalSteps: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onChange: (updates: Partial<CheckinStep>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  emaCategories: string[];
  onAddScale?: (newKey: string) => void;
}) {
  const Icon = getBlockIcon(step.type);
  const [showAddScaleModal, setShowAddScaleModal] = useState(false);

  return (
    <div>
      <Card
        className={cn(
          'overflow-hidden rounded-lg border-[1.5px]',
          expanded ? 'border-[var(--color-primary-default)]' : 'border-[var(--color-border-default)]',
        )}
      >
        {/* Collapsed Header */}
        <div
          onClick={onToggleExpand}
          className={cn(
            'flex cursor-pointer items-center gap-3 px-4 py-3.5',
            expanded
              ? 'bg-[color-mix(in_srgb,var(--color-primary-default)_4%,var(--color-bg-card))]'
              : 'bg-[var(--color-bg-card)]',
          )}
        >
          <div className={cn('flex items-center gap-1', MUTED)}>
            <GripVertical size={16} />
            <span className={cn('min-w-[18px] text-center text-xs font-medium', MUTED)}>{index + 1}</span>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-muted)]">
            {step.hero_emoji ? (
              <span className="text-[18px]">{step.hero_emoji}</span>
            ) : (
              <Icon size={16} className={MUTED} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                {step.question || 'Untitled Step'}
              </span>
              {step.required && (
                <span className="rounded-full bg-[var(--color-status-danger-light)] px-1.5 py-px text-xs leading-[1.4] font-medium text-[var(--color-status-danger)]">
                  Required
                </span>
              )}
            </div>
            <span className={cn('text-xs', MUTED)}>
              {getBlockLabel(step.type)}
              {step.scale_key ? ` · ${step.scale_key}` : ''}
              {step.ema_category ? ` · ${step.ema_category}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={e => { e.stopPropagation(); onMoveUp(); }}
              disabled={index === 0}
              className="cursor-pointer border-none bg-transparent p-1 disabled:cursor-default disabled:opacity-30"
            >
              <ArrowUp size={14} className={MUTED} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onMoveDown(); }}
              disabled={index === totalSteps - 1}
              className="cursor-pointer border-none bg-transparent p-1 disabled:cursor-default disabled:opacity-30"
            >
              <ArrowDown size={14} className={MUTED} />
            </button>
            {expanded ? <ChevronUp size={16} className={MUTED} /> : <ChevronDown size={16} className={MUTED} />}
          </div>
        </div>

        {/* Expanded Editor */}
        {expanded && (
          <div className="overflow-hidden">
            <CardContent className="border-t border-[var(--color-border-default)] px-4 pt-0 pb-4 [&:last-child]:pb-4">
              <div className="space-y-4 pt-4">
                {/* Row 1: Type + Scale Key */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className={FIELD_LABEL}>Block Type</Label>
                    <select
                      value={step.type}
                      onChange={e => onChange({ type: e.target.value as StepType })}
                      className={FIELD_SELECT}
                    >
                      {BLOCK_TYPES.map(bt => (
                        <option key={bt.value} value={bt.value}>{bt.label}</option>
                      ))}
                    </select>
                  </div>

                  {(step.type === 'emoji_scale' || step.type === 'multi_select') && (
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <Label className={cn('text-xs font-medium', MUTED)}>Scale / Source</Label>
                        {step.type === 'emoji_scale' && (
                          <button
                            onClick={() => setShowAddScaleModal(true)}
                            title="Add new scale"
                            className="flex cursor-pointer items-center gap-1 rounded-full border border-[var(--color-border-default)] bg-transparent px-2 py-0.5 text-xs font-medium text-[var(--color-primary-default)]"
                          >
                            <Plus size={11} />
                            New
                          </button>
                        )}
                      </div>
                      <select
                        value={step.scale_key || ''}
                        onChange={e => onChange({ scale_key: e.target.value || undefined })}
                        className={FIELD_SELECT}
                      >
                        <option value="">Select scale...</option>
                        {step.type === 'emoji_scale' ? (
                          getAvailableScaleKeys().map(sk => (
                            <option key={sk.value} value={sk.value}>
                              {sk.emoji} {sk.label} ({sk.count}){sk.isCustom ? ' ✦' : ''}
                            </option>
                          ))
                        ) : (
                          <option value="context_tags">Context Tags</option>
                        )}
                      </select>
                    </div>
                  )}
                  {showAddScaleModal && (
                    <AddNewScaleModal
                      onClose={() => setShowAddScaleModal(false)}
                      onCreated={(newKey) => {
                        setShowAddScaleModal(false);
                        if (onAddScale) onAddScale(newKey);
                        onChange({ scale_key: newKey });
                      }}
                    />
                  )}
                </div>

                {/* Question */}
                <div>
                  <Label className={FIELD_LABEL}>Question</Label>
                  <Input
                    value={step.question}
                    onChange={e => onChange({ question: e.target.value })}
                    placeholder="How are you feeling?"
                    className={FIELD_INPUT}
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <Label className={FIELD_LABEL}>Subtitle (optional)</Label>
                  <Input
                    value={step.subtitle || ''}
                    onChange={e => onChange({ subtitle: e.target.value || undefined })}
                    placeholder="Tap the emoji that matches your vibe"
                    className={FIELD_INPUT}
                  />
                </div>

                {/* Row: Emoji + EMA Category + Save As */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className={FIELD_LABEL}>Hero Emoji</Label>
                    <div className="flex max-h-20 flex-wrap gap-1 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] p-1">
                      {EMOJI_PICKS.map(em => (
                        <button
                          key={em}
                          onClick={() => onChange({ hero_emoji: em })}
                          className={cn(
                            'flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm border-2 text-[15px]',
                            step.hero_emoji === em
                              ? 'border-[var(--color-primary-default)] bg-[var(--color-bg-muted)]'
                              : 'border-transparent bg-transparent',
                          )}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                    {/* Custom emoji: paste/type any emoji not in the curated list above */}
                    <Input
                      value={step.hero_emoji && !EMOJI_PICKS.includes(step.hero_emoji) ? step.hero_emoji : ''}
                      onChange={e => {
                        // Take only the first grapheme so a pasted sentence doesn't overwrite it
                        const v = Array.from(e.target.value.trim())[0] || '';
                        onChange({ hero_emoji: v || undefined });
                      }}
                      placeholder="Or paste a custom emoji"
                      maxLength={8}
                      className={cn(FIELD_INPUT, 'mt-1')}
                    />
                  </div>
                  <div>
                    <Label className={FIELD_LABEL}>EMA Category</Label>
                    <select
                      value={step.ema_category || ''}
                      onChange={e => onChange({ ema_category: e.target.value || undefined })}
                      className={FIELD_SELECT}
                    >
                      <option value="">None</option>
                      {emaCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className={FIELD_LABEL}>Save As (field key)</Label>
                    <Input
                      value={step.save_as || ''}
                      onChange={e => onChange({ save_as: e.target.value || undefined })}
                      placeholder="e.g. mood_rating"
                      className={cn(FIELD_INPUT, 'text-xs! font-mono')}
                    />
                  </div>
                </div>

                {/* Single Choice options */}
                {step.type === 'single_choice' && (
                  <div>
                    <Label className={FIELD_LABEL}>Options (one per line)</Label>
                    <textarea
                      value={(step.options || []).join('\n')}
                      onChange={e => onChange({ options: e.target.value.split('\n').filter(Boolean) })}
                      rows={4}
                      placeholder="Not at all&#10;A little bit&#10;Moderately&#10;Quite a bit&#10;Extremely"
                      className="w-full resize-none rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-3 py-2.5 text-sm leading-[1.6] text-[var(--color-text-primary)] focus:outline-none"
                    />
                  </div>
                )}

                {/* Slider config */}
                {step.type === 'slider' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className={FIELD_LABEL}>Min</Label>
                      <Input
                        type="number"
                        value={step.slider_min ?? 0}
                        onChange={e => onChange({ slider_min: Number(e.target.value) })}
                        className={FIELD_INPUT}
                      />
                    </div>
                    <div>
                      <Label className={FIELD_LABEL}>Max</Label>
                      <Input
                        type="number"
                        value={step.slider_max ?? 10}
                        onChange={e => onChange({ slider_max: Number(e.target.value) })}
                        className={FIELD_INPUT}
                      />
                    </div>
                    <div>
                      <Label className={FIELD_LABEL}>Labels (comma-sep)</Label>
                      <Input
                        value={(step.slider_labels || []).join(', ')}
                        onChange={e => onChange({ slider_labels: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Not at all, Extremely"
                        className={cn(FIELD_INPUT, 'text-xs!')}
                      />
                    </div>
                  </div>
                )}

                {/* Required + actions */}
                <div className="flex items-center justify-between border-t border-[var(--color-border-default)] pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={step.required}
                      onCheckedChange={v => onChange({ required: v })}
                    />
                    <span className={cn('text-xs', MUTED)}>Required</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDuplicate}
                      className="gap-1 text-xs! font-normal! text-[var(--color-text-muted)]!"
                    >
                      <Copy size={13} /> Duplicate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDelete}
                      className="gap-1 text-xs! font-normal! text-[var(--color-status-danger)]!"
                    >
                      <Trash2 size={13} /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        )}
      </Card>
    </div>
  );
}
