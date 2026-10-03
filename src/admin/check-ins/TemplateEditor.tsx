import { Plus, X, Check, Pencil } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { StepEditorCard } from './StepEditorCard';
import { BLOCK_TYPES, stepCountLabel } from './checkin-template-types';
import type { CheckinTemplatesState } from './useCheckinTemplates';

const MUTED = 'text-[var(--color-text-muted)]';

/** Right column: the selected template's name, description and step list. */
export function TemplateEditor({
  state,
  emaCategories,
  showAddPicker,
  setShowAddPicker,
  editingName,
  setEditingName,
}: {
  state: CheckinTemplatesState;
  emaCategories: string[];
  showAddPicker: boolean;
  setShowAddPicker: (open: boolean) => void;
  editingName: boolean;
  setEditingName: (editing: boolean) => void;
}) {
  const template = state.activeTemplate;
  if (!template) return null;

  return (
    <div className="space-y-4">
      {/* Template header */}
      <Card className="rounded-lg border border-[var(--color-border-default)] px-5 py-4">
        <div className="flex items-center justify-between">
          {editingName ? (
            <div className="flex flex-1 items-center gap-2">
              <Input
                autoFocus
                value={template.name}
                onChange={e => state.updateTemplate({ name: e.target.value })}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
                className="max-w-[320px] rounded-[var(--radius-md)]! text-lg! font-medium!"
              />
              <Button variant="ghost" size="sm" onClick={() => setEditingName(false)}>
                <Check size={14} />
              </Button>
            </div>
          ) : (
            <div className="flex cursor-pointer items-center gap-2" onClick={() => setEditingName(true)}>
              <h2 className="m-0 text-lg font-medium text-[var(--color-text-primary)]">{template.name}</h2>
              <Pencil size={14} className={MUTED} />
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className={cn('text-xs', MUTED)}>
              {stepCountLabel(template.steps.length)}
            </span>
            {template.is_active && (
              <span className="rounded-full bg-[var(--color-status-success-light)] px-2.5 py-[3px] text-xs font-medium text-[var(--color-status-success)]">
                Active
              </span>
            )}
          </div>
        </div>
        {/* Description */}
        <Input
          value={template.description || ''}
          onChange={e => state.updateTemplate({ description: e.target.value })}
          placeholder="Template description..."
          className="mt-2 rounded-[var(--radius-md)]! text-sm! text-[var(--color-text-muted)]!"
        />
      </Card>

      {/* Steps list */}
      {template.steps.map((step, index) => (
        <StepEditorCard
          key={step.id}
          step={step}
          index={index}
          totalSteps={template.steps.length}
          expanded={state.expandedStepId === step.id}
          onToggleExpand={() => state.toggleStep(step.id)}
          onChange={updates => state.updateStep(step.id, updates)}
          onMoveUp={() => state.moveStep(index, -1)}
          onMoveDown={() => state.moveStep(index, 1)}
          onDuplicate={() => state.duplicateStep(index)}
          onDelete={() => state.deleteStep(index)}
          emaCategories={emaCategories}
          onAddScale={state.handleScaleCreated}
        />
      ))}

      {/* Add step */}
      {showAddPicker ? (
        <div>
          <Card className="rounded-lg border-2 border-dashed border-[var(--color-primary-default)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Add a Step</span>
              <button onClick={() => setShowAddPicker(false)} className="cursor-pointer border-none bg-transparent">
                <X size={16} className={MUTED} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BLOCK_TYPES.map(bt => {
                const BIcon = bt.icon;
                return (
                  <button
                    key={bt.value}
                    onClick={() => { state.addStep(bt.value); setShowAddPicker(false); }}
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-2 py-3.5 text-center"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-muted)]">
                      <BIcon size={18} className="text-[var(--color-primary-default)]" />
                    </div>
                    <span className="text-xs font-medium text-[var(--color-text-primary)]">{bt.label}</span>
                    <span className={cn('text-xs leading-[1.3]', MUTED)}>{bt.description}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      ) : (
        <button
          onClick={() => setShowAddPicker(true)}
          className={cn(
            'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-border-default)] bg-transparent p-4 text-sm font-medium',
            MUTED,
          )}
        >
          <Plus size={16} /> Add Step
        </button>
      )}
    </div>
  );
}
