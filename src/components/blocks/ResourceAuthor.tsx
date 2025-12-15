import React from 'react';
import { cn } from '../ui/utils';

interface ResourceAuthorProps {
  name: string;
  avatar?: string;
  date: string;
  readTime: string;
  className?: string;
}

export function ResourceAuthor({ 
  name, 
  avatar, 
  date, 
  readTime,
  className = '' 
}: ResourceAuthorProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {avatar && (
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100">
          <img 
            alt={name} 
            className="w-full h-full object-cover" 
            src={avatar} 
          />
        </div>
      )}
      <div className="flex flex-col">
        <span 
          className="font-medium text-gray-900"
          style={{ fontFamily: 'var(--font-family-base)' }}
        >
          {name}
        </span>
        <span 
          className="text-sm text-gray-500"
          style={{ fontFamily: 'var(--font-family-base)' }}
        >
          {date} • {readTime}
        </span>
      </div>
    </div>
  );
}
