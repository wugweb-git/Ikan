import React from 'react';
import { FileQuestion, Search, Inbox, FolderOpen, Plus } from 'lucide-react';
import { Button } from './button';
import { cn } from './utils';

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
        backgroundColor: 'var(--color-bg-page)'
      }}
    >
      <div
        className="mb-6 p-6 rounded-full"
        style={{
          backgroundColor: 'var(--color-bg-muted)'
        }}
      >
        <IconComponent
          className="w-16 h-16"
          style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}
        />
      </div>

      <h2
        className="mb-3"
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-base)'
        }}
      >
        {config.title}
      </h2>

      <p
        className="mb-8 max-w-md"
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-muted)',
          lineHeight: 'var(--line-height-md)',
          fontFamily: 'var(--font-family-base)'
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
            fontWeight: 'var(--font-weight-medium)',
            gap: 'var(--spacing-2)',
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-primary-on)'
          }}
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
