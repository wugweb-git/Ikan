import { useRef, memo } from 'react';
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
  Video,
  Moon,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Activity, resolveInteraction, INTERACTION_META, warnFallback, activityOf, normalizeSubtype } from '../../lib/blocks/block-model';
import { getIconComponent, iconResolves } from '../../lib/catalog-icons';
/* §21 layout port, phase 2 (2026-09-09): the block-gated field sections and the
   flow/carry-forward controls moved to `components/builder/editor/`. This file
   keeps the chrome until phase 3 replaces it. */
import { BlockFieldSections } from '../builder/editor/BlockFieldSections';
import { BlockFlowFooter } from '../builder/editor/BlockFlowFooter';
import { useMetadata } from '../../hooks/useMetadata';
import { validateBlock } from '../../lib/blocks/block-validation';
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
  /*
    `dayType` was here — "pass the parent day's type for preset-awareness". No
    call site ever passed it, so the preset lookup it fed always returned
    undefined. Removed in phase 3: what the flow controls actually want is the
    day's own `stepGroupRules`, which `BlockEditorPane` passes as `dayPolicy`.
  */
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
  /*
    Every catalog row is a block type an author may pick. This split them into
    "stages" and "leaves" by `can_hold`, and narrowed the type list to the
    leaves; no block holds another, so there is no split and nothing to narrow.
  */
  const leafRows = kvBlockTypes;
  const blockTypeOptions = leafRows.map(s => ({ value: s.value, label: s.label }));

  // The activity list is no longer narrowed by the day either: a day has no
  // type, so there is no stage whose permitted set could narrow it. What a
  // BLOCK TYPE permits is `activities` on its own catalog row — a separate
  // constraint, and one this editor does not yet apply.
  /*
    THE ACTIVITY THIS BLOCK CARRIES — §21 item 2.

    Read through `activityOf`, not `activityConfig.subtype`. 220 of 420 live
    blocks carry the activity ONLY at block level, so the old read showed them
    all as `mcq` (the select's default) and a save then wrote that default into
    `subtype` — an activity silently replaced by opening the block.
  */
  const currentActivity = normalizeSubtype(activityOf(block)) ?? activityOf(block);
  const activityRow = kvExerciseSubtypes.find(a => a.value === currentActivity);
  const ActivityIcon = getIconComponent(activityRow?.icon);
  const hasActivityIcon = iconResolves(activityRow?.icon);

  /* `exerciseSubtypeOptions` was built here — the AUTHORABLE_SUBTYPES filter and
     the comment explaining it — and moved with the Activity select into
     `BlockFieldSections` (phase 2). */
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

  /* The suggested response key moved with the Response key field into
     `BlockFieldSections` (phase 2). */
  /*
    The preset allow-list verdict was computed here and rendered as advice.
    Gone with §19 step 3: it judged this block against the DAY'S TYPE, and a day
    no longer has one. `validateBlock` above is untouched — it asks whether the
    block can render at all, which is a question about the block itself.
  */

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
            {/* The header names what this block IS — its type and its activity —
                with the activity's own catalog icon. It used to read
                "Interactive Block", which is true of every block and therefore
                says nothing. */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="shrink-0 flex items-center justify-center"
                style={{ width: 26, height: 26, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-primary-default)' }}
              >
                {hasActivityIcon ? <ActivityIcon size={14} /> : getIcon()}
              </span>
              <span className="truncate" style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}>
                {safeBlockType.charAt(0).toUpperCase() + safeBlockType.slice(1)}
                {activityRow ? <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}> — {activityRow.label.toLowerCase()}</span> : null}
              </span>
              <span className="shrink-0" style={{ fontSize: '9px', fontWeight: 500, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-muted)', padding: '1px 6px', borderRadius: 'var(--radius-pill)' }}>
                {currentInteraction}
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
              {/* Delete, in the editor — §21 item 3. The day builder mounts this
                  with `hideHeader`, which hid the only delete the editor had, so
                  a block could be removed from the row list and nowhere else. */}
              {hideHeader && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="h-6 w-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-accent-default)]"
                  title="Delete block"
                >
                  <Trash2 size={13} style={{ color: 'var(--color-status-danger)' }} />
                </button>
              )}
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

          <BlockFieldSections block={block} onChange={onChange} isAssessment={isAssessment} />

          <BlockFlowFooter block={block} onChange={onChange} />

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
    prev.isAssessment === next.isAssessment
  );
});