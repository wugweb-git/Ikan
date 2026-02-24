import React from 'react';
import { BookOpen, Video, Wrench } from 'lucide-react';
import { cn } from '../ui/utils';

interface ResourceTypeLabelProps {
  type: string;
  className?: string;
}

export function ResourceTypeLabel({ type, className }: ResourceTypeLabelProps) {
  if (!type) {
    return (
      <div 
        className={cn("flex items-center gap-2", className)}
        style={{ 
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-medium)'
        }}
      >
        <BookOpen size={16} />
        <span className="capitalize">Article</span>
      </div>
    );
  }

  const normalizedType = type.toLowerCase();
  let Icon = BookOpen;
  
  if (normalizedType.includes('video')) Icon = Video;
  else if (normalizedType.includes('tool')) Icon = Wrench;

  return (
    <div 
      className={cn("flex items-center gap-2", className)}
      style={{ 
        color: 'var(--color-text-muted)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-medium)'
      }}
    >
      <Icon size={16} />
      <span className="capitalize">{type}</span>
    </div>
  );
}
