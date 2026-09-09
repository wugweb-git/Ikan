/**
 * The builder's top bar: where you are, what state the record is in, and every
 * action that applies to the whole record. §21 item 5.
 *
 * It replaces `WizardLayout`'s two-row header, whose action slots were called
 * `footerLeftContent` and `footerRightContent` and rendered in the header —
 * names that had come loose from what they did. Every button they carried has a
 * named prop here, and the caller passes callbacks rather than JSX, so the bar
 * decides the layout and the wizard keeps the behaviour.
 *
 * The stepper is gone. There are two screens, not a sequence: Setup describes the
 * record, Content builds it, and neither has to be finished before the other.
 */
import { ChevronLeft, ChevronRight, Eye, Save, Upload, Trash2, X, LayoutPanelTop } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { BuilderScreen, RecordMeta } from './builder-types';

export interface BuilderTopBarProps {
  record: RecordMeta;
  /** What the back link says — "Programmes", "Assessments". */
  backLabel: string;
  screen: BuilderScreen;
  onScreenChange: (screen: BuilderScreen) => void;
  saving: boolean;
  canPreview: boolean;
  onPreview: () => void;
  onSave: () => void;
  onPublishToggle: () => void;
  onSaveAndClose: () => void;
  saveAndCloseLabel: string;
  /** Omitted until the record exists — there is nothing to delete before that. */
  onDelete?: () => void;
  onExit: () => void;
}

export function BuilderTopBar({
  record, backLabel, screen, onScreenChange, saving, canPreview,
  onPreview, onSave, onPublishToggle, onSaveAndClose, saveAndCloseLabel, onDelete, onExit,
}: BuilderTopBarProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 h-12 shrink-0"
      style={{ backgroundColor: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border-default)' }}
    >
      <button
        type="button"
        onClick={onExit}
        className="flex items-center gap-1 shrink-0"
        style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}
      >
        <ChevronLeft size={14} /> {backLabel}
      </button>

      <span className="truncate" style={{ fontSize: '15px', fontWeight: 650, color: 'var(--color-text-primary)' }}>
        {record.name || 'Untitled'}
      </span>
      <Badge variant={record.published ? 'success' : 'warning'} className="shrink-0">
        {record.published ? 'Published' : 'Draft'}
      </Badge>

      {/* Setup and Content are a pair, not a sequence — this is the whole
          navigation the builder has. */}
      {screen === 'content' ? (
        <Button
          variant="ghost" size="sm"
          className="gap-1.5 h-8 px-2.5 shrink-0"
          style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}
          onClick={() => onScreenChange('setup')}
        >
          <LayoutPanelTop size={13} /> Setup
        </Button>
      ) : null}

      <span className="flex-1" />

      {canPreview && (
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-2.5" onClick={onPreview} title="Preview the player">
          <Eye size={14} /> <span className="hidden sm:inline" style={{ fontSize: '12.5px' }}>Preview</span>
        </Button>
      )}
      <Button
        variant="outline" size="sm" className="h-8 w-8 p-0"
        onClick={onSave} disabled={saving} title="Save"
      >
        <Save size={15} />
      </Button>
      <Button
        variant="outline" size="sm" className="gap-1.5 h-8 px-2.5"
        onClick={onPublishToggle} disabled={saving || !record.id}
        title={record.id ? undefined : 'Save the programme once before publishing it'}
        style={{ fontSize: '12.5px' }}
      >
        <Upload size={14} /> {record.published ? 'Unpublish' : 'Publish'}
      </Button>

      {screen === 'setup' ? (
        <Button size="sm" className="gap-1.5 h-8 px-3" onClick={() => onScreenChange('content')} style={{ fontSize: '12.5px' }}>
          Content <ChevronRight size={14} />
        </Button>
      ) : (
        <Button size="sm" className="h-8 px-3" onClick={onSaveAndClose} disabled={saving} style={{ fontSize: '12.5px' }}>
          {saveAndCloseLabel}
        </Button>
      )}

      {onDelete && (
        <Button
          variant="ghost" size="sm" className="h-8 w-8 p-0"
          onClick={onDelete} title="Delete programme"
          style={{ color: 'var(--color-status-danger)' }}
        >
          <Trash2 size={15} />
        </Button>
      )}
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onExit} title="Close">
        <X size={15} />
      </Button>
    </div>
  );
}
