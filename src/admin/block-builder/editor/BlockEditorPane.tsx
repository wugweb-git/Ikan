/**
 * The editor column, in the shape the §21 mockup asks for: a header that names
 * the block and can change it, a body whose first row is Title and Activity side
 * by side, and the flow controls pinned to the bottom as a strip.
 *
 * This is chrome only. Every field that depends on the block's type or activity
 * comes from `BlockFieldSections`, unchanged since phase 2, and the flow controls
 * come from `BlockFlowFooter`.
 *
 * Three things the old chrome did that this one does differently, deliberately:
 *
 *  - **Activity is offered on every block type**, not just `exercise`. Under the
 *    settled model `interaction = f(activity)` and every block has one — a lesson
 *    reads, a conclude completes. The old editor only let you set it on an
 *    exercise, so the activity of the other 15 types was unreachable in the UI
 *    even though the row, the header and the renderer all read it. The list is
 *    still filtered by `AUTHORABLE_SUBTYPES`, so nothing without a renderer can
 *    be chosen.
 *  - **The type picker is searchable** and lists all 17 types (`BlockTypePicker`),
 *    where the old one was a `Select` of the same rows.
 *  - **`dayPolicy` replaces the `dayType` prop.** `BlockEditor` accepted a
 *    `dayType` that no call site ever passed, so its preset lookup was always
 *    undefined. A day has no type any more; what the flow controls actually want
 *    to know is the day's own `stepGroupRules`, which is what this passes.
 */
import { useRef } from 'react';
import { Image as ImageIcon, Video, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Activity, interactionsOfBlock, activityOf, normalizeSubtype } from '../model/block-model';
import { validateBlock } from '../model/block-validation';
import { useMetadata } from '../../ui/hooks/useMetadata';
import { projectId } from '../../../shared/api/supabase-info';
import { getAuthHeaders } from '../../../shared/api/supabase';
import { BlockFieldSections, ActivityPicker } from './BlockFieldSections';
import { BlockFlowFooter } from './BlockFlowFooter';
import { BlockTypePicker } from './BlockTypePicker';
import { retype } from '../model/block-retype';
import type { ActivityName } from '../model/vocabulary';
import type { DayPolicy } from '../model/day-policy';

export interface BlockEditorPaneProps {
  block: Activity;
  onChange: (updates: Partial<Activity>) => void;
  onDelete?: () => void;
  isAssessment?: boolean;
  /** The day this block sits on — its step rules govern the Step control. */
  dayPolicy?: DayPolicy;
  readOnly?: boolean;
  /** Bumped by the row kebab to open the type picker. */
  openTypePickerAt?: number;
}

export function BlockEditorPane({ block, onChange, onDelete, isAssessment, dayPolicy, readOnly, openTypePickerAt }: BlockEditorPaneProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { exerciseSubtypes: kvExerciseSubtypes, blockTypes: kvBlockTypes } = useMetadata();

  const currentActivity = normalizeSubtype(activityOf(block)) ?? activityOf(block);
  const activityRow = kvExerciseSubtypes.find(a => a.value === currentActivity);
  const safeBlockType = typeof block.type === 'string' ? block.type : 'lesson';
  /* One or more of the nine — six activities carry two. */
  const currentInteractions = interactionsOfBlock(block);
  const blockIssues = validateBlock(block);
  const isVideo = !!block.image_url && (block.image_url.includes('youtube') || block.image_url.includes('vimeo') || block.image_url.endsWith('.mp4'));

  /* Moved verbatim from `BlockEditor` — same bucket, same headers, same toasts. */
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
        { method: 'POST', headers: await getAuthHeaders(), body: formData },
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

  const mediaButton = (active: boolean, title: string, onClick: () => void, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex items-center gap-1.5 px-2.5 h-7 rounded transition-colors hover:bg-[var(--color-bg-muted)]"
      style={{
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '12px',
        color: active ? 'var(--color-primary-default)' : 'var(--color-text-muted)',
      }}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-col h-full min-h-0" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{ backgroundColor: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border-default)' }}
      >
        <BlockTypePicker
          block={block}
          type={safeBlockType}
          activity={currentActivity as ActivityName | undefined}
          activityLabel={activityRow?.label}
          activityIcon={activityRow?.icon}
          options={kvBlockTypes.map(t => ({ value: t.value, label: t.label, icon: t.icon, activities: t.activities }))}
          /*
            The retype is applied by `retype()`, not by writing `type` — it drops
            exactly the fields the picker just said it would and stamps
            `retyped_from`. Writing the type alone is what left a block reading
            "Conclude — input table".
          */
          onPick={(type, activity) => onChange(retype(block, activity, type))}
          vocabularyUnavailable={kvBlockTypes.length === 0}
          disabled={readOnly}
          openAt={openTypePickerAt}
        />
        {currentInteractions.map((i) => (
          <span
            key={i}
            className="shrink-0"
            title="What the user does here — carried by the activity"
            style={{ fontSize: '9px', fontWeight: 500, color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-muted)', padding: '2px 7px', borderRadius: 'var(--radius-pill)' }}
          >
            {i}
          </span>
        ))}
        <span className="flex-1" />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
        />
        {mediaButton(!!block.image_url && !isVideo, 'Upload image', () => imageInputRef.current?.click(),
          <><ImageIcon size={13} /> Image</>)}
        {mediaButton(isVideo, 'Add video URL', () => {
          const url = prompt('Enter video URL (YouTube, Vimeo, or MP4):');
          if (url) onChange({ image_url: url });
        }, <><Video size={13} /> Video</>)}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            title="Delete block"
            className="h-7 w-7 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-bg-muted)]"
            style={{ color: 'var(--color-status-danger)' }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* ── BODY ───────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1fr) 220px' }}>
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input
              value={block.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Block title..."
              className="h-9 text-sm"
              style={{ fontWeight: 500, color: 'var(--color-text-primary)', borderRadius: 'var(--radius-md)' }}
              disabled={readOnly}
            />
          </div>
          {/* Every type, not just `exercise` — see the note at the top. */}
          <ActivityPicker block={block} onChange={onChange} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Subtitle</Label>
          <Input
            value={block.subtitle || ''}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="Optional"
            className="h-8 text-xs"
            style={{ color: 'var(--color-text-muted)', borderRadius: 'var(--radius-md)' }}
            disabled={readOnly}
          />
        </div>

        {blockIssues.length > 0 && (
          <div className="space-y-1">
            {blockIssues.map((issue, i) => (
              <div
                key={i}
                className="flex items-start gap-2 px-2.5 py-1.5 rounded-md"
                style={{
                  fontSize: 'var(--text-xs)',
                  backgroundColor: 'var(--color-bg-card)',
                  borderLeft: `2px solid ${issue.level === 'error' ? 'var(--color-status-danger)' : 'var(--color-status-warning)'}`,
                }}
              >
                <span style={{ color: issue.level === 'error' ? 'var(--color-status-danger)' : 'var(--color-status-warning)' }}>
                  {issue.level === 'error' ? '✕' : '⚠'}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>{issue.message}</span>
              </div>
            ))}
          </div>
        )}

        <BlockFieldSections
          block={block}
          onChange={onChange}
          isAssessment={isAssessment}
          hoisted={{ activity: true }}
        />
      </div>

      {/* ── FOOTER STRIP ───────────────────────────────────────── */}
      <div className="shrink-0" style={{ backgroundColor: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border-default)' }}>
        <BlockFlowFooter block={block} onChange={onChange} dayPolicy={dayPolicy} variant="strip" />
      </div>
    </div>
  );
}
