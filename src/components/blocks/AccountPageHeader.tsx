import React from 'react';
import { cn } from '../ui/utils';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../ui/button';

interface AccountPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  onBack?: () => void;
}

export function AccountPageHeader({
  title,
  subtitle,
  actions,
  className,
  onBack
}: AccountPageHeaderProps) {
  return (
    <div className={cn("flex flex-col mb-[24px]", className)} style={{ gap: '8px' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center" style={{ gap: '8px' }}>
          {onBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 -ml-2" 
              onClick={onBack}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          <h1 className="m-0" style={{ fontSize: '28px', fontWeight: 'var(--font-weight-medium)', lineHeight: '34px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>
            {title}
          </h1>
        </div>
        {actions && (
          <div className="flex items-center" style={{ gap: '12px' }}>
            {actions}
          </div>
        )}
      </div>
      {subtitle && (
        <p className="m-0" style={{ fontSize: '14px', lineHeight: '20px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}