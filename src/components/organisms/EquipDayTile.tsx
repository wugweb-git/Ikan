import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';

interface EquipDayTileProps {
  day: number;
  title: string;
  description?: string;
  duration?: string;
  status: 'locked' | 'unlocked' | 'completed';
  isToday?: boolean;
  onStart?: () => void;
  onContinue?: () => void;
  className?: string;
}

export function EquipDayTile({
  day,
  title,
  description,
  duration,
  status,
  isToday = false,
  onStart,
  onContinue,
  className
}: EquipDayTileProps) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isUnlocked = status === 'unlocked';

  const getStatusConfig = () => {
    switch (status) {
      case 'locked':
        return {
          icon: 'lock',
          iconColor: 'var(--color-neutral-400)',
          bgColor: 'var(--color-bg-muted)',
          borderColor: 'var(--color-border-light)',
          textColor: 'var(--color-text-muted)',
          actionText: 'Locked',
          canInteract: false
        };
      case 'completed':
        return {
          icon: 'check_circle',
          iconColor: 'var(--color-status-success)',
          bgColor: 'var(--color-status-success-light)',
          borderColor: 'var(--color-status-success)',
          textColor: 'var(--color-text-primary)',
          actionText: 'Review',
          canInteract: true
        };
      case 'unlocked':
        return {
          icon: 'play_circle',
          iconColor: 'var(--color-primary-default)',
          bgColor: 'var(--color-bg-card)',
          borderColor: isToday ? 'var(--color-primary-default)' : 'var(--color-border-default)',
          textColor: 'var(--color-text-primary)',
          actionText: 'Start',
          canInteract: true
        };
      default:
        return {
          icon: 'circle',
          iconColor: 'var(--color-neutral-400)',
          bgColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border-default)',
          textColor: 'var(--color-text-primary)',
          actionText: 'Start',
          canInteract: false
        };
    }
  };

  const config = getStatusConfig();

  const handleClick = () => {
    if (!config.canInteract) return;
    
    if (isCompleted) {
      onContinue?.();
    } else {
      onStart?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={config.canInteract ? { scale: 1.02 } : {}}
      whileTap={config.canInteract ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "relative transition-all duration-200 ease-out",
          config.canInteract && "hover:shadow-md cursor-pointer",
          isToday && "ring-2",
          className
        )}
        style={{
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          borderWidth: '2px',
          borderRadius: 'var(--radius-lg)',
          ringColor: isToday ? 'var(--color-primary-default)' : 'transparent',
          opacity: isLocked ? 0.6 : 1
        }}
        onClick={handleClick}
      >
        {/* Today badge */}
        {isToday && !isLocked && (
          <Badge 
            className="absolute -top-2 -right-2 z-10"
            style={{
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)',
              fontSize: 'var(--text-xs)'
            }}
          >
            Today
          </Badge>
        )}

        <CardContent 
          className="p-4 space-y-3"
          style={{ padding: 'var(--spacing-4)' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Day number */}
              <div 
                className="flex items-center justify-center rounded-full"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: isCompleted ? 'var(--color-status-success)' : 
                                  isToday ? 'var(--color-primary-default)' : 
                                  'var(--color-neutral-300)',
                  color: isCompleted || isToday ? 'white' : 'var(--color-text-primary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-semibold)'
                }}
              >
                {day}
              </div>

              {/* Title */}
              <div>
                <h3 
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: config.textColor,
                    lineHeight: 'var(--line-height-sm)'
                  }}
                >
                  {title}
                </h3>
                {duration && (
                  <div className="flex items-center gap-1 mt-1">
                    <Icon name="schedule" size={12} style={{ color: 'var(--color-text-muted)' }} />
                    <span 
                      style={{ 
                        fontSize: 'var(--text-xs)', 
                        color: 'var(--color-text-muted)'
                      }}
                    >
                      {duration}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Status icon */}
            <Icon 
              name={config.icon} 
              size={20} 
              style={{ color: config.iconColor }}
            />
          </div>

          {/* Description */}
          {description && (
            <p 
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}
            >
              {description}
            </p>
          )}

          {/* Action button */}
          {config.canInteract && (
            <Button
              size="sm"
              variant={isCompleted ? "outline" : "default"}
              className="w-full gap-2"
              disabled={!config.canInteract}
              style={{
                backgroundColor: isCompleted ? 'transparent' : 'var(--color-primary-default)',
                color: isCompleted ? 'var(--color-primary-default)' : 'var(--color-primary-on)',
                borderColor: isCompleted ? 'var(--color-primary-default)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              <Icon name={config.icon} size={14} />
              {config.actionText}
            </Button>
          )}
        </CardContent>

        {/* Lock overlay for locked items */}
        {isLocked && (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <div 
              className="flex flex-col items-center gap-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Icon name="lock" size={24} />
              <span 
                style={{ 
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                Complete previous days
              </span>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default EquipDayTile;