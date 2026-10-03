import { Plus, Trash2, Check } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { stepCountLabel, type CheckinTemplate } from './checkin-template-types';

const MUTED = 'text-[var(--color-text-muted)]';
const SMALL_BUTTON = 'gap-1 rounded-[var(--radius-md)]! text-xs!';

/** Left column: template picker plus activate / delete for the selected one. */
export function TemplateList({
  templates,
  activeTemplate,
  onSelect,
  onNew,
  onActivate,
  onDelete,
}: {
  templates: CheckinTemplate[];
  activeTemplate: CheckinTemplate | null;
  onSelect: (t: CheckinTemplate) => void;
  onNew: () => void;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <Card className="overflow-hidden rounded-lg border border-[var(--color-border-default)]">
        <div className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-muted)] px-3.5 py-3">
          <span className={cn('text-xs font-medium', MUTED)}>Templates</span>
        </div>
        <div className="p-2">
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border-none px-3 py-2.5 text-left transition-colors duration-150',
                activeTemplate?.id === t.id ? 'bg-[var(--color-bg-muted)]' : 'bg-transparent',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                  {t.name}
                </div>
                <div className={cn('text-xs', MUTED)}>
                  {stepCountLabel(t.steps.length)}
                </div>
              </div>
              {t.is_active && (
                <span className="rounded-full bg-[var(--color-status-success-light)] px-2 py-0.5 text-xs font-medium text-[var(--color-status-success)]">
                  Active
                </span>
              )}
            </button>
          ))}

          {templates.length === 0 && (
            <div className="p-4 text-center">
              <p className={cn('text-sm', MUTED)}>No templates yet</p>
              <Button
                size="sm"
                onClick={onNew}
                className={cn(SMALL_BUTTON, 'mt-2 text-[var(--color-text-primary)]')}
              >
                <Plus size={13} /> Create Template
              </Button>
            </div>
          )}
        </div>
        <div className="border-t border-[var(--color-border-default)] px-2 pt-2 pb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onNew}
            className={cn(SMALL_BUTTON, 'w-full text-[var(--color-text-primary)]!')}
          >
            <Plus size={14} /> New Template
          </Button>
        </div>
      </Card>

      {/* Active template actions */}
      {activeTemplate && (
        <Card className="rounded-lg border border-[var(--color-border-default)] p-3">
          <div className="space-y-2">
            {!activeTemplate.is_active && (
              <Button
                variant="outline"
                size="sm"
                className={cn(SMALL_BUTTON, 'w-full text-[var(--color-status-success)]!')}
                onClick={() => onActivate(activeTemplate.id)}
              >
                <Check size={13} /> Set as Active
              </Button>
            )}
            {activeTemplate.id !== 'default' && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(SMALL_BUTTON, 'w-full text-[var(--color-status-danger)]!')}
                onClick={() => onDelete(activeTemplate.id)}
              >
                <Trash2 size={13} /> Delete Template
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
