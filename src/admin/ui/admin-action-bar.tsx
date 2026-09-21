import { Trash2, X, Save, Upload, Eye } from 'lucide-react';
import { Button } from './button';

interface AdminActionBarProps {
  // Primary actions
  onDelete?: () => void;
  onCancel?: () => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onPreview?: () => void;
  
  // State
  isPublished?: boolean;
  isSaving?: boolean;
  isDeleting?: boolean;
  
  // Labels (optional overrides)
  deleteLabel?: string;
  cancelLabel?: string;
  draftLabel?: string;
  publishLabel?: string;
  previewLabel?: string;
  
  // Visibility
  showDelete?: boolean;
  showCancel?: boolean;
  showDraft?: boolean;
  showPublish?: boolean;
  showPreview?: boolean;
}

export function AdminActionBar({
  onDelete,
  onCancel,
  onSaveDraft,
  onPublish,
  onPreview,
  isPublished = false,
  isSaving = false,
  isDeleting = false,
  deleteLabel = 'Delete',
  cancelLabel = 'Cancel',
  draftLabel = 'Save as Draft',
  publishLabel,
  previewLabel = 'Preview',
  showDelete = true,
  showCancel = true,
  showDraft = true,
  showPublish = true,
  showPreview = false
}: AdminActionBarProps) {
  
  const actualPublishLabel = publishLabel || (isPublished ? 'Update' : 'Save and Publish');
  
  return (
    <div 
      className="flex items-center justify-between gap-4 p-4 border-t sticky bottom-0 z-10"
      style={{ 
        backgroundColor: 'white',
        borderTop: '1px solid var(--color-border-default)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
      }}
    >
      {/* Left Side - Delete Button */}
      <div>
        {showDelete && onDelete && (
          <Button
            variant="outline"
            onClick={onDelete}
            disabled={isDeleting || isSaving}
            style={{
              height: '44px',
              paddingLeft: 'var(--spacing-5)',
              paddingRight: 'var(--spacing-5)',
              borderRadius: 'var(--radius-md)',
              gap: 'var(--spacing-2)',
              backgroundColor: '#DC2626',
              color: 'white',
              border: 'none',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            <Trash2 className="w-4 h-4" />
            {deleteLabel}
          </Button>
        )}
      </div>

      {/* Right Side - Action Buttons */}
      <div className="flex items-center gap-3">
        {showPreview && onPreview && (
          <Button
            variant="outline"
            onClick={onPreview}
            disabled={isSaving}
            style={{
              height: '44px',
              paddingLeft: 'var(--spacing-5)',
              paddingRight: 'var(--spacing-5)',
              borderRadius: 'var(--radius-md)',
              gap: 'var(--spacing-2)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            <Eye className="w-4 h-4" />
            {previewLabel}
          </Button>
        )}

        {showCancel && onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            style={{
              height: '44px',
              paddingLeft: 'var(--spacing-5)',
              paddingRight: 'var(--spacing-5)',
              borderRadius: 'var(--radius-md)',
              gap: 'var(--spacing-2)',
              backgroundColor: '#9CA3AF',
              color: 'white',
              border: 'none',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            <X className="w-4 h-4" />
            {cancelLabel}
          </Button>
        )}

        {showDraft && onSaveDraft && (
          <Button
            variant="outline"
            onClick={onSaveDraft}
            disabled={isSaving}
            style={{
              height: '44px',
              paddingLeft: 'var(--spacing-5)',
              paddingRight: 'var(--spacing-5)',
              borderRadius: 'var(--radius-md)',
              gap: 'var(--spacing-2)',
              backgroundColor: '#374151',
              color: 'white',
              border: 'none',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : draftLabel}
          </Button>
        )}

        {showPublish && onPublish && (
          <Button
            onClick={onPublish}
            disabled={isSaving}
            style={{
              height: '44px',
              paddingLeft: 'var(--spacing-5)',
              paddingRight: 'var(--spacing-5)',
              borderRadius: 'var(--radius-md)',
              gap: 'var(--spacing-2)',
              backgroundColor: '#0891B2',
              color: 'white',
              border: 'none',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            <Upload className="w-4 h-4" />
            {isSaving ? 'Publishing...' : actualPublishLabel}
          </Button>
        )}
      </div>
    </div>
  );
}