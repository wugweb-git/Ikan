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
        className="text-base font-medium text-gray-900"
        style={{ fontFamily: 'var(--font-family-base)' }}
      >
        Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="px-3 py-1 text-sm font-normal text-gray-600 bg-gray-100 border border-gray-200"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
