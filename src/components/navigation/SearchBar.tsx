import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function SearchBar({ 
  placeholder = "Search...", 
  value = "", 
  onChange, 
  onSearch,
  className,
  disabled = false 
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(value === "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInternalValue(value);
    setIsEmpty(value === "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    setIsEmpty(newValue === "");
    onChange?.(newValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(internalValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleSearchClick = () => {
    onSearch?.(internalValue);
  };

  // JSON spec states: ["default", "focus", "empty"]
  const getSearchBarState = () => {
    if (isFocused) return 'focus';
    if (isEmpty) return 'empty';
    return 'default';
  };

  const searchBarState = getSearchBarState();

  return (
    <div 
      className={cn(
        "relative transition-all duration-200",
        // JSON spec animations: ["motion.keyframes.scaleIn"]
        isFocused && "animate-scaleIn",
        className
      )}
      style={{
        // JSON spec constraints
        minWidth: 'var(--constraint-input-min)',
        maxWidth: 'var(--constraint-input-max)'
      }}
      data-state={searchBarState}
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {/* JSON spec icons: { "search": "{icon.search.outline}" } */}
          <Icon 
            name="search" 
            size={16} // JSON spec tokens: ["icons.sizes.md"]
            variant="outline"
            style={{ 
              color: isFocused ? 'var(--color-primary-default)' : 'var(--color-text-muted)'
            }}
          />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={internalValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus} // JSON spec interactions: ["focus", "type"]
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full pl-10 pr-4 py-2 transition-all duration-200 outline-none",
            "placeholder:text-muted-foreground",
            isFocused && "ring-2",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{
            // JSON spec tokens: ["input.background", "borders.radius.md"]
            backgroundColor: 'var(--color-bg-input)', // input.background
            borderRadius: 'var(--radius-md)', // borders.radius.md
            border: `1px solid ${isFocused ? 'var(--color-primary-default)' : 'var(--color-border-default)'}`,
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-regular)',
            color: 'var(--color-text-primary)',
            ringColor: 'var(--color-primary-default)',
            ringOpacity: 0.2
          }}
        />
        
        {!isEmpty && (
          <button
            onClick={handleSearchClick}
            className={cn(
              "absolute inset-y-0 right-0 pr-3 flex items-center transition-opacity duration-200",
              "hover:opacity-80"
            )}
          >
            <Icon 
              name="arrowRight" 
              size={16}
              variant="outline"
              style={{ color: 'var(--color-primary-default)' }}
            />
          </button>
        )}
      </div>
    </div>
  );
}