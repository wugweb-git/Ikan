import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Badge } from './badge';
import { Input } from './input';
import { cn } from './utils';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  disabled?: boolean;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add tag and press Enter...',
  maxTags,
  className,
  disabled = false
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      
      const newTag = inputValue.trim();
      
      // Check if tag already exists
      if (value.includes(newTag)) {
        setInputValue('');
        return;
      }

      // Check max tags limit
      if (maxTags && value.length >= maxTags) {
        return;
      }

      onChange([...value, newTag]);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag on backspace when input is empty
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div 
      className={cn(
        "border rounded-md p-2 flex flex-wrap gap-2 items-center min-h-[42px]",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        borderColor: 'var(--color-border-default)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: disabled ? 'var(--color-bg-muted)' : 'var(--color-bg-card)'
      }}
    >
      {value.map((tag, index) => (
        <Badge 
          key={`${tag}-${index}`}
          variant="secondary"
          className="gap-1 pr-1"
          style={{
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-primary-on)',
            borderRadius: 'var(--radius-sm)',
            paddingLeft: 'var(--spacing-2)',
            paddingRight: 'var(--spacing-1)',
            paddingTop: 'var(--spacing-1)',
            paddingBottom: 'var(--spacing-1)',
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-white/20 rounded-sm p-0.5 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </Badge>
      ))}
      
      {(!maxTags || value.length < maxTags) && !disabled && (
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 border-0 shadow-none focus-visible:ring-0 min-w-[120px] p-0 h-auto"
          style={{
            outline: 'none',
            boxShadow: 'none',
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-sm)'
          }}
        />
      )}

      {maxTags && (
        <span 
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginLeft: 'auto',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          {value.length}/{maxTags}
        </span>
      )}
    </div>
  );
}