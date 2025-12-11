import React from 'react';
import { Icon, availableIcons, getIconVariants } from './Icon';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import type { IconName } from '../lib/icon-config';

interface IconShowcaseProps {
  className?: string;
  showVariants?: boolean;
  iconSize?: number;
}

export function IconShowcase({ 
  className, 
  showVariants = true, 
  iconSize = 24 
}: IconShowcaseProps) {
  return (
    <div className={cn("grid gap-4 p-4", className)}>
      <div className="space-y-2">
        <h2>iKan Icon System</h2>
        <p className="text-muted-foreground">
          Complete icon set with multiple variants for consistent UI design
        </p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {availableIcons.map((iconName) => {
          const variants = getIconVariants(iconName);
          
          return (
            <Card key={iconName} className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon name={iconName} size={iconSize} />
                  <span className="font-medium capitalize">
                    {iconName.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                
                {showVariants && variants.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Variants:</p>
                    <div className="flex flex-wrap gap-1">
                      {variants.map((variant) => (
                        <Badge 
                          key={variant} 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {variant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {showVariants && variants.length > 1 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {variants.map((variant) => (
                    <div 
                      key={variant} 
                      className="flex items-center gap-1 text-xs text-muted-foreground"
                      title={`${iconName} - ${variant}`}
                    >
                      <Icon 
                        name={iconName} 
                        variant={variant} 
                        size={16} 
                      />
                      <span>{variant}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

interface IconGridProps {
  iconName: IconName;
  className?: string;
  iconSize?: number;
}

export function IconGrid({ iconName, className, iconSize = 32 }: IconGridProps) {
  const variants = getIconVariants(iconName);
  
  return (
    <div className={cn("grid gap-2", className)}>
      <h3 className="font-medium capitalize">
        {iconName.replace(/([A-Z])/g, ' $1').trim()}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {variants.map((variant) => (
          <div 
            key={variant}
            className="flex flex-col items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Icon 
              name={iconName} 
              variant={variant} 
              size={iconSize} 
            />
            <span className="text-xs text-center text-muted-foreground">
              {variant}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IconShowcase;