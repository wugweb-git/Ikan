import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { BookOpen, Video, Wrench, FileText, Activity, Mic, GraduationCap } from 'lucide-react';
import { RESOURCE_TYPES } from '../../lib/constants';

interface ResourceTypeProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  className?: string;
}

const ICON_MAP: Record<string, any> = {
  'file-text': FileText,
  'tool': Wrench,
  'activity': Activity,
  'video': Video,
  'mic': Mic,
  'book': BookOpen,
  'graduation-cap': GraduationCap
};

export function ResourceType({ activeType, onTypeChange, className }: ResourceTypeProps) {
  const typeFilters = [
    { id: 'all', label: 'All', icon: BookOpen },
    ...RESOURCE_TYPES.map(t => ({
      id: t.value,
      label: t.label,
      icon: ICON_MAP[t.icon] || BookOpen
    }))
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
              backgroundColor: isActive ? 'var(--color-primary-default)' : 'white',
              color: isActive ? 'white' : 'var(--grey-6)',
              border: isActive ? 'none' : '1px solid var(--grey-3)',
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