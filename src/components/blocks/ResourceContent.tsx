import React from 'react';
import { cn } from '../ui/utils';

interface ResourceContentProps {
  content: React.ReactNode;
  className?: string;
}

export function ResourceContent({ 
  content, 
  className = '' 
}: ResourceContentProps) {
  return (
    <article className={cn("w-full max-w-3xl mx-auto space-y-6 p-[0px]", className)}>
      <div 
        className="prose prose-lg max-w-none space-y-6"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {content}
      </div>
    </article>
  );
}
