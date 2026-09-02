import { Badge } from '../ui/badge';

interface ResourceCategoryProps {
  category: string;
  className?: string;
}

export function ResourceCategory({ category, className }: ResourceCategoryProps) {
  return (
    <Badge 
      variant="outline" 
      className={`text-sm py-1 px-3 ${className || ''}`}
      style={{ 
        borderColor: 'var(--color-border-default)',
        color: 'var(--color-text-muted)'
      }}
    >
      {category}
    </Badge>
  );
}