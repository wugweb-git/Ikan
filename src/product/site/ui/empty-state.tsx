import { cn } from './utils';
import { FileQuestion, Search, Inbox, FolderOpen, Plus } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'default' | 'search' | 'inbox' | 'folder';
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
  variant = 'default'
}: EmptyStateProps) {
  const variants = {
    default: {
      title: title || 'No Items Found',
      description: description || 'There are no items to display at the moment.',
      icon: FileQuestion
    },
    search: {
      title: title || 'No Results Found',
      description: description || 'Try adjusting your search or filters to find what you\'re looking for.',
      icon: Search
    },
    inbox: {
      title: title || 'All Caught Up!',
      description: description || 'You don\'t have any new items.',
      icon: Inbox
    },
    folder: {
      title: title || 'This Folder is Empty',
      description: description || 'Add items to get started.',
      icon: FolderOpen
    }
  };

  const config = variants[variant];
  const IconComponent = icon || config.icon;

  return (
    <div
      className={cn('flex flex-col items-center justify-center text-center p-12', className)}
      style={{
        minHeight: '400px',
        backgroundColor: 'var(--canvas)'
      }}
    >
      <div
        className="mb-6 p-6 rounded-full"
        style={{
          backgroundColor: 'var(--secondary)'
        }}
      >
        <IconComponent
          className="w-16 h-16"
          style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}
        />
      </div>

      <h2
        className="mb-3"
        style={{
          fontSize: '20px',
          fontWeight: '500',
          color: 'var(--foreground)',
          fontFamily: 'var(--font-sans)'
        }}
      >
        {config.title}
      </h2>

      <p
        className="mb-8 max-w-md"
        style={{
          fontSize: '16px',
          color: 'var(--muted-foreground)',
          lineHeight: 'var(--line-height-md)',
          fontFamily: 'var(--font-sans)'
        }}
      >
        {config.description}
      </p>

      {onAction && actionLabel && (
        <Button
          onClick={onAction}
          style={{
            height: 'var(--ikan-component-button-height)',
            borderRadius: 'var(--ikan-component-border-radius)',
            fontWeight: '500',
            gap: 'var(--spacing-2)',
            backgroundColor: 'var(--foreground)',
            color: 'var(--background)'
          }}
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}