import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface UnsavedChangesDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export function UnsavedChangesDialog({
  open,
  onConfirm,
  onCancel,
  title = 'Unsaved Changes',
  description = 'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div 
              className="rounded-full p-2"
              style={{ backgroundColor: 'var(--color-status-warning)' + '20' }}
            >
              <AlertTriangle 
                size={24} 
                style={{ color: 'var(--color-status-warning)' }}
              />
            </div>
            <DialogTitle style={{ 
              fontFamily: 'var(--font-family-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-primary)'
            }}>
              {title}
            </DialogTitle>
          </div>
          <DialogDescription style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--spacing-2)'
          }}>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            style={{
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            Stay on Page
          </Button>
          <Button
            onClick={onConfirm}
            style={{
              backgroundColor: 'var(--color-status-danger)',
              color: 'var(--color-bg-card)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            Leave Without Saving
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
