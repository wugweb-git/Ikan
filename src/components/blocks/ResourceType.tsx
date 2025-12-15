import React from 'react';
import { Button } from '../ui/button';
import { BookOpen, Video, Wrench } from 'lucide-react';

interface ResourceTypeProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  className?: string;
}

export function ResourceType({ activeType, onTypeChange, className }: ResourceTypeProps) {
  const typeFilters = [
    { id: 'all', label: 'All', icon: BookOpen },
    { id: 'article', label: 'Articles', icon: BookOpen },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'tool', label: 'Tools', icon: Wrench }
  ];

  return (
    <div 
      className={className || "flex flex-wrap"}
      style={{ gap: 'var(--spacing-2)' }}
    >
      {typeFilters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeType === filter.id;
        
        return (
          <Button
            key={filter.id}
            onClick={() => onTypeChange(filter.id)}
            variant={isActive ? "default" : "outline"}
            className="rounded-2xl"
            style={{
              gap: 'var(--spacing-2)',
              paddingLeft: 'var(--spacing-5)',
              paddingRight: 'var(--spacing-5)',
              paddingTop: 'var(--spacing-3)',
              paddingBottom: 'var(--spacing-3)',
              backgroundColor: isActive ? '#2e2a2f' : 'white',
              color: isActive ? 'white' : '#757575',
              border: isActive ? 'none' : '1px solid #d9d9d9',
              fontSize: 'var(--text-sm)'
            }}
          >
            <Icon size={16} />
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
