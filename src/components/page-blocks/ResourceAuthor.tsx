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
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          <img 
            alt={name} 
            className="w-full h-full object-cover" 
            src={avatar} 
          />
        </div>
      )}
      <div className="flex flex-col">
        <span 
          style={{ 
            fontFamily: 'var(--font-family-base)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)'
          }}
        >
          {name}
        </span>
        <span 
          style={{ 
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)'
          }}
        >
          {date} • {readTime}
        </span>
      </div>
    </div>
  );
}