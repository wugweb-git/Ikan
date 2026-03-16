import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { BookOpen, Video, Wrench, FileText, Activity, Mic, GraduationCap } from 'lucide-react';
import { useMetadata } from '../../hooks/useMetadata';

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
  'graduation-cap': GraduationCap,
  'filter': FileText,
  'tag': FileText,
  'type': FileText,
  'folder': BookOpen,
};

export function ResourceType({ activeType, onTypeChange, className }: ResourceTypeProps) {
  const { filterTypes } = useMetadata();

  const typeFilters = [
    { id: 'all', label: 'All', icon: BookOpen },
    ...filterTypes.map(t => ({
      id: t.value,
      label: t.label,
      icon: ICON_MAP[t.icon || 'file-text'] || BookOpen
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