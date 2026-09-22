import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../dialog';
import { Button } from '../button';

/**
 * The admin's one confirmation dialog (replaces `window.confirm`).
 *
 * Imperative use from any screen inside the admin shell:
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title: 'Delete this item?', destructive: true }))) return;
 *
 * Declarative use (a dialog you already control): <ConfirmDialog open … />.
 */

export interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button + warning icon. */
  destructive?: boolean;
}

interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            {destructive && (
              <div className="rounded-full p-2 bg-[var(--color-status-danger-light)]">
                <AlertTriangle size={24} className="text-[var(--color-status-danger)]" />
              </div>
            )}
            <DialogTitle className="font-[family-name:var(--font-family-base)] font-medium text-[length:var(--text-lg)] text-[var(--color-text-primary)]">
              {title}
            </DialogTitle>
          </div>
          {description && (
            <DialogDescription className="font-[family-name:var(--font-family-base)] text-[length:var(--text-sm)] text-[var(--color-text-muted)] mt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} className="font-medium">
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            autoFocus
            className={destructive
              ? 'font-medium bg-[var(--color-status-danger)] text-[var(--color-bg-card)] hover:bg-[var(--color-status-danger)] hover:opacity-90'
              : 'font-medium bg-[var(--color-primary-default)] text-[var(--color-primary-on)] hover:bg-[var(--color-primary-default)] hover:opacity-90'}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Mount once around the admin screens (AdminDashboard does). */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const settle = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setState(null);
  }, []);

  const confirm = useCallback<ConfirmFn>((options) => {
    // A second confirm while one is open cancels the first.
    resolver.current?.(false);
    setState(options);
    return new Promise<boolean>((resolve) => { resolver.current = resolve; });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={state !== null}
        title={state?.title ?? ''}
        description={state?.description}
        confirmLabel={state?.confirmLabel}
        cancelLabel={state?.cancelLabel}
        destructive={state?.destructive}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  );
}

/** Promise-based confirm. Resolves true on confirm, false on cancel/dismiss. */
export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used inside <ConfirmProvider> (the admin shell mounts one)');
  return confirm;
}
