import { useState } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { AdminPageLayout } from '../shell/AdminPageLayout';
import { useMetadata } from '../ui/hooks/useMetadata';
import { useCheckinTemplates } from './useCheckinTemplates';
import { TemplateList } from './TemplateList';
import { TemplateEditor } from './TemplateEditor';
import { StepPreview } from './StepPreview';

/** Check-in Builder: configure the steps users see when logging a mood journal entry. */
export function AdminCheckinTemplateBuilder() {
  const state = useCheckinTemplates();
  const { templates, activeTemplate, dirty, saving } = state;

  const [previewMode, setPreviewMode] = useState(false);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);

  // EMA categories from KV metadata (no fallback — KV is the source of truth)
  const { emaCategories: emaMeta } = useMetadata();
  const emaCategoryLabels = emaMeta.map(c => c.label);

  return (
    <AdminPageLayout
      title="Check-in Builder"
      description="Configure the steps users see when logging a mood journal entry. Drag to reorder, add or remove steps."
      maxWidth="none"
      loading={state.loading}
      error={state.error}
      onRetry={state.reload}
      actions={
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="rounded-full bg-[var(--color-status-warning-light)] px-2.5 py-[3px] text-xs font-medium text-[var(--color-status-warning)]">
              Unsaved changes
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-1 rounded-[var(--radius-md)]! text-xs! text-[var(--color-text-primary)]!"
          >
            {previewMode ? <EyeOff size={14} /> : <Eye size={14} />}
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button
            size="sm"
            onClick={state.handleSave}
            disabled={!dirty || saving}
            className="gap-1 rounded-[var(--radius-md)]! bg-[var(--color-primary-default)] text-xs! text-[var(--color-primary-on)]"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* LEFT: Template selector */}
        <TemplateList
          templates={templates}
          activeTemplate={activeTemplate}
          onSelect={state.selectTemplate}
          onNew={state.handleNewTemplate}
          onActivate={state.handleActivate}
          onDelete={state.handleDelete}
        />

        {/* RIGHT: Step builder or preview */}
        <div>
          {!activeTemplate ? (
            <Card className="rounded-lg p-10 text-center">
              <p className="text-base text-[var(--color-text-muted)]">Select or create a template to get started</p>
            </Card>
          ) : previewMode ? (
            <StepPreview template={activeTemplate} />
          ) : (
            <TemplateEditor
              state={state}
              emaCategories={emaCategoryLabels}
              showAddPicker={showAddPicker}
              setShowAddPicker={setShowAddPicker}
              editingName={editingName}
              setEditingName={setEditingName}
            />
          )}
        </div>
      </div>
    </AdminPageLayout>
  );
}
