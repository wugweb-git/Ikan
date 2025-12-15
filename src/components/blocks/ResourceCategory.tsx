import React from 'react';
import { Badge } from '../ui/badge';

interface ResourceCategoryProps {
  category: string;
  className?: string;
}

export function ResourceCategory({ category, className }: ResourceCategoryProps) {
  return (
    <Badge 
      variant="outline" 
      className={`text-sm py-1 px-3 border-gray-300 text-gray-600 ${className || ''}`}
    >
      {category}
    </Badge>
  );
}
