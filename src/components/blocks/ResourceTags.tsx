import React from 'react';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

interface ResourceTagsProps {
  tags: string[];
  className?: string;
}

export function ResourceTags({ tags, className }: ResourceTagsProps) {
  if (!tags || tags.length === 0) return null;
  
  return (
    <div className={cn("space-y-3", className)}>
      <h3 
        style={{ 
          fontFamily: 'var(--font-family-base)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)'
        }}
      >
        Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="px-3 py-1"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-bg-muted)',
              borderColor: 'var(--color-border-default)',
              borderWidth: '1px'
            }}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
