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
    <article className={cn("w-full max-w-3xl mx-auto py-8 space-y-6", className)}>
      <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
        {content}
      </div>
    </article>
  );
}
