import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { 
  BookOpen, 
  PenTool, 
  MessageCircle, 
  CheckSquare, 
  Target, 
  Trash2, 
  GripVertical, 
  ChevronDown, 
  ChevronUp,
  Image as ImageIcon,
  Table as TableIcon,
  Video,
  Layers,
  FastForward,
  CircleAlert,
  Clock,
  Moon,
  Upload
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { RichTextEditor } from '../ui/rich-text-editor';
import { Activity, resolveInteraction, INTERACTION_META, warnFallback, type InteractionType } from '../../lib/blocks/block-model';
import { useMetadata, isContainerRow } from '../../hooks/useMetadata';
import { validateBlock } from '../../lib/blocks/block-validation';
import { hasContentField, contentLabelFor, contentPlaceholderFor } from '../../lib/blocks/block-fields';
import { validateBlockForDayType } from '../../lib/blocks/block-type-rules';
import { getPresetForDayType, type DayTypePreset } from '../../lib/blocks/block-type-rules';
import { projectId } from '../../utils/supabase/info';
import { getAuthHeaders } from '../../lib/supabase-client';
import { toast } from 'sonner';

interface BlockEditorProps {
  block: Activity;
  onChange: (updates: Partial<Activity>) => void;
  onDelete: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  moveUp?: () => void;
  moveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  hideHeader?: boolean;
  isAssessment?: boolean;
  dayType?: string; // Pass the parent day's type for preset-awareness
}

function BlockEditorInner({ 
  block, 
  onChange, 
  onDelete, 
  isExpanded, 
  onToggleExpand,
  moveUp,
  moveDown,
  isFirst,
  isLast,
  hideHeader,
  isAssessment,
  dayType
}: BlockEditorProps) {
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // Image upload handler
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'equip-program-images');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/upload-image`,
        { method: 'POST', headers: await getAuthHeaders(), body: formData }
      );
      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
      const data = await response.json();
      if (data.url) {
        onChange({ image_url: data.url });
        toast.success('Image uploaded');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Upload failed. Try pasting a URL instead.');
    }
  };
  
  // MetaManager — exercise subtypes from KV
  const {
    exerciseSubtypes: kvExerciseSubtypes,
    blockTypes: kvBlockTypes,
    loading: metaLoading,
    error: metaError,
  } = useMetadata();
  // The catalog is the only vocabulary. The two hardcoded fallback arrays that
  // used to stand in here held DIFFERENT terms than the catalog does — and since
  // useMetadata returns empty buckets on a throw as well as while loading, a
  // failed fetch silently offered the admin the wrong list with no way to tell.
  // Empty now means empty, and the editor says so rather than inventing terms.
  // ── The stage this block sits in ─────────────────────────────────
  // Its catalog row carries `can_hold` (which block types it accepts) and
  // `activities` (which activities those blocks may use). Those two lists are
  // the guardrail; before Phase 4 they existed in data and nothing read them.
  //
  // NOTE `can_hold` barely discriminates — every stage holds lesson, exercise
  // and conclude — so filtering the block-type picker changes little. The teeth
  // are in `activities`, which varies from 0 to 7 across stages. That is the
  // filter an author actually feels.
  const stageRow = dayType ? kvBlockTypes.find(r => r.value === dayType) : undefined;
  const stageCanHold = stageRow?.can_hold;
  const stageActivities = stageRow?.activities;

  // Container rows (`can_hold`) are stages, not blocks — a block can never BE
  // one, so they never reach this picker.
  const leafRows = kvBlockTypes.filter(s => !isContainerRow(s));
  const blockTypeOptions = leafRows
    .filter(s => !stageCanHold?.length || stageCanHold.includes(s.value))
    .map(s => ({ value: s.value, label: s.label }));

  // An activity the stage does not permit is still SHOWN when the block already
  // uses it — hiding the current value would silently rewrite existing content
  // on the next save. It is marked instead.
  const exerciseSubtypeOptions = kvExerciseSubtypes
    .filter(s => !stageActivities?.length
                 || stageActivities.includes(s.value)
                 || s.value === block.activityConfig?.subtype)
    .map(s => ({
      value: s.value,
      label: s.label,
      offPreset: !!stageActivities?.length && !stageActivities.includes(s.value),
    }));
  const vocabularyUnavailable = !metaLoading && (kvBlockTypes.length === 0 || kvExerciseSubtypes.length === 0);
  if (vocabularyUnavailable) {
    warnFallback(
      'BlockEditor',
      `catalog unavailable (block_type ${kvBlockTypes.length} rows, activity ${kvExerciseSubtypes.length} rows)` +
        (metaError ? ` — ${metaError}` : '')
    );
  }

  // What is wrong with this block, on its own terms. Reporting only — nothing
  // blocks a save yet (blocks.md §18 2b: report first, enforce once the 27
  // undetermined day types are assigned). Calibrated against live content: 401
  // of 407 stored blocks raise nothing, so a message here means something.
  const blockIssues = validateBlock(block);

  // 2b — the preset allow-list, finally reaching a user. `validateBlockForDayType`
  // has existed since the presets did and had ZERO production callers: its only
  // caller was its own test, and its allow-list branch returns `allowed: true`
  // unconditionally, so `wouldReject` was computed and discarded. Surfaced here
  // as advice, not a block: enforcement waits until the 27 undetermined day
  // types are assigned (blocks.md §18 6.3), because on today's content it would
  // reject 182 of 407 blocks — mislabelled days, not bad content.
  const presetVerdict = dayType
    ? validateBlockForDayType(block.type, block.activityConfig?.subtype, dayType)
    : undefined;

  // Resolve the current interaction for display
  const currentInteraction = resolveInteraction(block);
  const interactionMeta = INTERACTION_META[currentInteraction];

  // Safety: coerce block.type to string in case of corrupted data
  const safeBlockType = typeof block.type === 'string' ? block.type : 'lesson';

  const getIcon = () => {
    switch (safeBlockType) {
      case 'lesson': return <BookOpen className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />;
      case 'exercise': return <PenTool className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />;
      case 'journal': return <MessageCircle className="w-4 h-4" style={{ color: 'var(--color-warning-default)' }} />;
      case 'checklist': return <CheckSquare className="w-4 h-4" style={{ color: 'var(--color-status-success)' }} />;
      case 'reflection': return <Target className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />;
      case 'conclude': return <Target className="w-4 h-4" style={{ color: 'var(--color-status-danger)' }} />;
      case 'sleep-diary': return <Moon className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  // Determine active media tab based on current data
  const isVideo = block.image_url && (block.image_url.includes('youtube') || block.image_url.includes('vimeo') || block.image_url.endsWith('.mp4'));
  const mediaType = isVideo ? 'video' : 'image';

  return (
    <Card className={hideHeader ? "border-none shadow-none bg-transparent" : "shadow-sm mb-3"} style={!hideHeader ? { border: '1px solid var(--color-border-default)' } : undefined}>
      {!hideHeader && (
      <div className="flex items-center gap-2 p-3 rounded-t-lg" style={{ backgroundColor: 'var(--color-bg-muted)', borderBottom: '1px solid var(--color-border-default)' }}>
        <div className="cursor-grab" style={{ color: 'var(--color-text-muted)' }}>
          <GripVertical className="w-4 h-4" />
        </div>
        
        <div className="flex items-center gap-2 flex-1">
          {getIcon()}
          <span className="uppercase tracking-wider" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)' }}>
            {block.type}
          </span>
          <span className="truncate max-w-[200px]" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
            {block.title || '(Untitled Block)'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {moveUp && (
            <Button variant="ghost" size="sm" onClick={moveUp} disabled={isFirst} className="h-6 w-6 p-0">
              <ChevronUp className="w-3 h-3" />
            </Button>
          )}
          {moveDown && (
            <Button variant="ghost" size="sm" onClick={moveDown} disabled={isLast} className="h-6 w-6 p-0">
              <ChevronDown className="w-3 h-3" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDelete} className="h-6 w-6 p-0" style={{ color: 'var(--color-status-danger)' }}>
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggleExpand} className="h-6 w-6 p-0">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      )}

      {(isExpanded || hideHeader) && (
        <CardContent className={hideHeader ? "p-0 space-y-2" : "p-3 space-y-3"}>
          
          {/* ── HEADER ROW: Block label + interaction badges + media icons ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {getIcon()}
              <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}>
                Interactive Block
              </span>
              <span style={{ fontSize: '9px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-muted)', padding: '1px 6px', borderRadius: 'var(--radius-pill)' }}>
                {block.type}/{currentInteraction}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="h-6 w-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-accent-default)]"
                title="Upload image"
                style={{ opacity: block.image_url && !isVideo ? 1 : 0.4 }}
              >
                <ImageIcon size={13} style={{ color: block.image_url && !isVideo ? 'var(--color-primary-default)' : 'var(--color-text-muted)' }} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Enter video URL (YouTube, Vimeo, or MP4):');
                  if (url) onChange({ image_url: url });
                }}
                className="h-6 w-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-accent-default)]"
                title="Add video URL"
                style={{ opacity: isVideo ? 1 : 0.4 }}
              >
                <Video size={13} style={{ color: isVideo ? 'var(--color-primary-default)' : 'var(--color-text-muted)' }} />
              </button>
            </div>
          </div>

          {/* ── PRIMARY ROW: Title (75%) + Type dropdown (25%) ── */}
          <div className="flex gap-2">
            <div className="flex-[3]">
              <Input 
                value={block.title} 
                onChange={(e) => onChange({ title: e.target.value })} 
                placeholder="Block title..."
                className="h-9 text-sm"
                style={{ fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div className="flex-[1]">
              <Select 
                value={block.type} 
                onValueChange={(val: any) => onChange({ type: val })}
              >
                <SelectTrigger className="h-9" style={{ fontSize: '12px', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex items-center gap-1.5">
                    {getIcon()}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {blockTypeOptions.map((bt) => (
                    <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {presetVerdict?.wouldReject && presetVerdict.reason && (
            <div
              className="flex items-start gap-2 px-2.5 py-1.5 rounded-md"
              style={{
                marginTop: 8, fontSize: 'var(--text-xs)',
                backgroundColor: 'var(--color-bg-muted)',
                borderLeft: '2px solid var(--color-status-info)',
              }}
            >
              <span style={{ color: 'var(--color-status-info)' }}>i</span>
              <span style={{ color: 'var(--color-text-muted)' }}>
                {presetVerdict.reason} <em>Not enforced — this is what the day’s preset expects.</em>
              </span>
            </div>
          )}

          {blockIssues.length > 0 && (
            <div className="space-y-1" style={{ marginTop: 8 }}>
              {blockIssues.map((issue, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 px-2.5 py-1.5 rounded-md"
                  style={{
                    fontSize: 'var(--text-xs)',
                    backgroundColor: 'var(--color-bg-muted)',
                    borderLeft: `2px solid ${issue.level === 'error'
                      ? 'var(--color-status-danger)' : 'var(--color-status-warning)'}`,
                  }}
                >
                  <span style={{ color: issue.level === 'error'
                    ? 'var(--color-status-danger)' : 'var(--color-status-warning)' }}>
                    {issue.level === 'error' ? '✕' : '⚠'}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{issue.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── SECONDARY ROW: Subtitle ── */}
          <Input 
            value={block.subtitle || ''} 
            onChange={(e) => onChange({ subtitle: e.target.value })} 
            placeholder="Subtitle (optional)"
            className="h-7 text-xs"
            style={{ color: 'var(--color-text-muted)', borderColor: 'transparent', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)' }}
          />

          {/* ── MEDIA PREVIEW (only when media exists) ── */}
          {block.image_url && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md" style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}>
              {!isVideo ? (
                <img src={block.image_url} className="w-8 h-8 rounded object-cover shrink-0" alt="" />
              ) : (
                <Video size={14} style={{ color: 'var(--color-text-muted)' }} />
              )}
              <Input
                value={block.image_url || ''}
                onChange={(e) => onChange({ image_url: e.target.value })}
                placeholder={isVideo ? "Video URL" : "Image URL"}
                className="h-6 text-[10px] flex-1 border-none shadow-none px-1"
              />
              <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" style={{ color: 'var(--color-status-danger)' }} onClick={() => onChange({ image_url: '' })}>
                <Trash2 size={10} />
              </Button>
            </div>
          )}

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

          {/* 2. EXERCISE BLOCK */}
          {block.type === 'exercise' && (
            <div className="space-y-4 border-l-2 pl-4" style={{ borderColor: 'var(--color-accent-default)' }}>
              <div className="space-y-1">
                {/* Mislabelled since it was written: this list is fed by the
                    `activity` catalog bucket (renamed from `exercise_subtype`
                    in Phase 1.2), not by InteractionType. */}
                <Label className="text-xs">
                  Activity
                  {stageRow && (
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
                      {' '}— {stageActivities?.length ?? 0} allowed on a {stageRow.label} day
                    </span>
                  )}
                </Label>
                <Select 
                  value={block.activityConfig?.subtype || 'mcq'} 
                  onValueChange={(val: any) => onChange({ 
                    activityConfig: { ...block.activityConfig, subtype: val } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseSubtypeOptions.map((subtype) => (
                      <SelectItem key={subtype.value} value={subtype.value}>
                        {subtype.label}
                        {subtype.offPreset && (
                          <span style={{ color: 'var(--color-status-warning)' }}>
                            {' '}· not usually on this day
                          </span>
                        )}
                      </SelectItem>
                    ))}
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

          {/* WIZARD FLOW & INTERACTION SECTION */}
          <div className="pt-2 mt-2" style={{ borderTop: '1px solid var(--color-border-default)' }}>
             {(() => {
               const preset = dayType ? getPresetForDayType(dayType) : undefined;
               const presetManaged = preset && (
                 preset.autoConfig.autoAdvance !== undefined ||
                 preset.autoConfig.scoringEnabled !== undefined ||
                 !preset.stepGroupRules.allowed
               );

               return (
                 <>
                   <div className="flex items-center gap-1.5 mb-2">
                     <Layers size={11} style={{ color: 'var(--color-text-muted)' }} />
                     <span style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Wizard Flow</span>
                     {presetManaged && (
                       <span style={{
                         fontSize: '9px', fontWeight: 500, fontFamily: 'var(--font-family-base)',
                         color: 'var(--color-status-success)', backgroundColor: 'var(--color-status-success-light)',
                         padding: '1px 5px', borderRadius: 'var(--radius-pill)',
                       }}>
                         {preset.label}
                       </span>
                     )}
                   </div>

                   {/* CONTROL ROW: Single inline row */}
                   <div className="flex items-center gap-2 flex-wrap">
                     {/* Step Group ID */}
                     {(!preset || preset.stepGroupRules.allowed) && (
                       <div className="flex items-center gap-1">
                         <Input 
                           value={block.stepGroup || ''}
                           onChange={(e) => onChange({ stepGroup: e.target.value })}
                           placeholder="Step ID"
                           className="h-7 w-24 text-[11px] font-mono"
                           style={{ borderRadius: 'var(--radius-md)' }}
                         />
                         <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>Optional</span>
                       </div>
                     )}

                     {/* Auto toggle chip */}
                     <button
                       type="button"
                       onClick={() => onChange({ autoAdvance: !block.autoAdvance })}
                       className="h-7 px-2.5 flex items-center gap-1 rounded-md text-[11px] transition-colors"
                       style={{
                         fontWeight: 500, fontFamily: 'var(--font-family-base)',
                         backgroundColor: block.autoAdvance ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                         color: block.autoAdvance ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
                         border: block.autoAdvance ? 'none' : '1px solid var(--color-border-default)',
                       }}
                     >
                       <FastForward size={10} /> Auto
                     </button>

                     {/* Required toggle chip */}
                     <button
                       type="button"
                       onClick={() => onChange({ required: !block.required })}
                       className="h-7 px-2.5 flex items-center gap-1 rounded-md text-[11px] transition-colors"
                       style={{
                         fontWeight: 500, fontFamily: 'var(--font-family-base)',
                         backgroundColor: block.required ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                         color: block.required ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
                         border: block.required ? 'none' : '1px solid var(--color-border-default)',
                       }}
                     >
                       Required
                     </button>

                     {/* Duration inline */}
                     <div className="flex items-center gap-1 h-7 px-2 rounded-md" style={{ border: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-card)' }}>
                       <Clock size={10} style={{ color: 'var(--color-text-muted)' }} />
                       <input 
                         type="number" 
                         className="w-8 h-5 text-[11px] text-center bg-transparent border-none outline-none"
                         style={{ fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}
                         value={block.duration}
                         onChange={(e) => onChange({ duration: parseInt(e.target.value) || 0 })}
                       />
                       <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>m</span>
                     </div>
                   </div>
                 </>
               );
             })()}

             {/* ── Repeat / carry-forward ───────────────────────────────── */}
             <div className="mt-3 pt-3 flex items-center gap-2 flex-wrap" style={{ borderTop: '1px solid var(--color-border-light)' }}>
               <span style={{ fontSize: '10px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                 Carry forward
               </span>
               <button
                 type="button"
                 onClick={() => onChange({ repeat: block.repeat ? undefined : { type: 'simple_repeat', onDays: [] } })}
                 className="h-7 px-2.5 flex items-center gap-1 rounded-md text-[11px] transition-colors"
                 style={{
                   fontWeight: 500, fontFamily: 'var(--font-family-base)',
                   backgroundColor: block.repeat ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                   color: block.repeat ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
                   border: block.repeat ? 'none' : '1px solid var(--color-border-default)',
                 }}
               >
                 Repeat
               </button>

               {block.repeat && (
                 <>
                   <Select value={block.repeat.type} onValueChange={(t: any) => onChange({ repeat: { ...block.repeat!, type: t } })}>
                     <SelectTrigger className="h-7 w-[150px]" style={{ fontSize: '11px', borderRadius: 'var(--radius-md)' }}>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="simple_repeat">Simple repeat</SelectItem>
                       <SelectItem value="column_addition">Add columns</SelectItem>
                       <SelectItem value="on_demand">On demand</SelectItem>
                     </SelectContent>
                   </Select>

                   {block.repeat.type === 'on_demand' ? (
                     <div className="flex items-center gap-1 h-7 px-2 rounded-md" style={{ border: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-card)' }}>
                       <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>From day</span>
                       <input
                         type="number"
                         className="w-10 h-5 text-[11px] text-center bg-transparent border-none outline-none"
                         style={{ fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}
                         value={block.repeat.onDemandFromDay ?? ''}
                         onChange={(e) => onChange({ repeat: { ...block.repeat!, onDemandFromDay: parseInt(e.target.value) || undefined } })}
                       />
                     </div>
                   ) : (
                     <>
                       <button
                         type="button"
                         onClick={() => onChange({ repeat: { ...block.repeat!, everyDay: !block.repeat!.everyDay } })}
                         className="h-7 px-2.5 flex items-center rounded-md text-[11px]"
                         style={{
                           fontWeight: 500, fontFamily: 'var(--font-family-base)',
                           backgroundColor: block.repeat.everyDay ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                           color: block.repeat.everyDay ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
                           border: block.repeat.everyDay ? 'none' : '1px solid var(--color-border-default)',
                         }}
                       >
                         Every day
                       </button>
                       {!block.repeat.everyDay && (
                         <div className="flex items-center gap-1 h-7 px-2 rounded-md" style={{ border: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-card)' }}>
                           <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>On days</span>
                           <input
                             type="text"
                             placeholder="e.g. 10, 25"
                             className="w-20 h-5 text-[11px] bg-transparent border-none outline-none"
                             style={{ fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}
                             value={(block.repeat.onDays ?? []).join(', ')}
                             onChange={(e) => onChange({ repeat: { ...block.repeat!, onDays: e.target.value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) } })}
                           />
                         </div>
                       )}
                     </>
                   )}
                 </>
               )}
             </div>
          </div>

        </CardContent>
      )}
    </Card>
  );
}

// Memoize to prevent re-renders when sibling blocks change
export const BlockEditor = memo(BlockEditorInner, (prev, next) => {
  // Only re-render if this block's own data changed
  return (
    prev.block === next.block &&
    prev.isExpanded === next.isExpanded &&
    prev.isFirst === next.isFirst &&
    prev.isLast === next.isLast &&
    prev.hideHeader === next.hideHeader &&
    prev.isAssessment === next.isAssessment &&
    prev.dayType === next.dayType
  );
});