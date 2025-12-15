import React from 'react';
import { BookOpen, Video, Wrench } from 'lucide-react';
import { cn } from '../ui/utils';

interface ResourceTypeLabelProps {
  type: string;
  className?: string;
}

export function ResourceTypeLabel({ type, className }: ResourceTypeLabelProps) {
  const normalizedType = type.toLowerCase();
  let Icon = BookOpen;
  
  if (normalizedType.includes('video')) Icon = Video;
  else if (normalizedType.includes('tool')) Icon = Wrench;

  return (
    <div className={cn("flex items-center gap-2 text-gray-500 text-sm font-medium", className)}>
      <Icon size={16} />
      <span className="capitalize">{type}</span>
    </div>
  );
}
