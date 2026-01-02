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
    <div className={cn("flex flex-col gap-4 mb-[24px]", className)}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-[10px]">
          <div className="flex items-center gap-2">
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
            <h1 className="text-[30px] font-medium text-[#151515] leading-[36px] tracking-[0.35px]">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-[14px] text-[#151515] leading-[27px] tracking-[-0.44px]">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-[12px] mt-1">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
