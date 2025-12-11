import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface ProgramCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  category?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  progress?: number;
  totalSessions?: number;
  completedSessions?: number;
  duration?: string;
  price?: number;
  isPurchased?: boolean;
  isLocked?: boolean;
  onStart?: () => void;
  onContinue?: () => void;
  onPurchase?: () => void;
  className?: string;
}

export function ProgramCard({
  title,
  description,
  imageUrl,
  imageAlt,
  category,
  difficulty,
  progress = 0,
  totalSessions,
  completedSessions,
  duration,
  price,
  isPurchased = false,
  isLocked = false,
  onStart,
  onContinue,
  onPurchase,
  className
}: ProgramCardProps) {
  const hasProgress = progress > 0;
  const isCompleted = progress >= 100;
  
  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'Beginner': return 'var(--color-status-success)';
      case 'Intermediate': return 'var(--color-status-warning)';
      case 'Advanced': return 'var(--color-status-danger)';
      default: return 'var(--color-neutral-400)';
    }
  };

  const handleAction = () => {
    if (isLocked && !isPurchased) {
      onPurchase?.();
    } else if (hasProgress && !isCompleted) {
      onContinue?.();
    } else {
      onStart?.();
    }
  };

  const getActionText = () => {
    if (isLocked && !isPurchased) return `Purchase - ₹${price}`;
    if (isCompleted) return 'Review Program';
    if (hasProgress) return 'Continue';
    return 'Start Program';
  };

  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-all duration-200 ease-out",
        "group relative overflow-hidden",
        isLocked && !isPurchased && "opacity-75",
        className
      )}
      style={{
        padding: 'var(--spacing-4)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        backgroundColor: 'var(--color-bg-card)'
      }}
    >
      {/* Lock overlay */}
      {isLocked && !isPurchased && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center z-10">
          <div 
            className="rounded-full p-3"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          >
            <Icon name="lock" size={24} style={{ color: 'var(--color-neutral-500)' }} />
          </div>
        </div>
      )}

      <CardContent className="p-0 space-y-4">
        {/* Program Image */}
        {imageUrl && (
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <ImageWithFallback
              src={imageUrl}
              alt={imageAlt || title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            {category && (
              <Badge 
                className="absolute top-2 left-2"
                style={{ 
                  backgroundColor: 'var(--color-bg-card)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-xs)'
                }}
              >
                {category}
              </Badge>
            )}
          </div>
        )}

        {/* Content */}
        <div className="space-y-3">
          {/* Header */}
          <div className="space-y-2">
            <h2 
              style={{ 
                fontSize: 'var(--text-lg)', 
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--line-height-sm)'
              }}
            >
              {title}
            </h2>
            
            <div className="flex items-center gap-2">
              {difficulty && (
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: getDifficultyColor(difficulty),
                    color: getDifficultyColor(difficulty),
                    fontSize: 'var(--text-xs)'
                  }}
                >
                  {difficulty}
                </Badge>
              )}
              
              {duration && (
                <div className="flex items-center gap-1">
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

          {/* Description */}
          <p 
            style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--line-height-md)'
            }}
          >
            {description}
          </p>

          {/* Progress */}
          {(hasProgress || (totalSessions && completedSessions !== undefined)) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span 
                  style={{ 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  Progress
                </span>
                {totalSessions && (
                  <span 
                    style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    {completedSessions || 0}/{totalSessions} sessions
                  </span>
                )}
              </div>
              <Progress 
                value={progress} 
                className="h-2"
                style={{ 
                  backgroundColor: 'var(--color-bg-muted)',
                  borderRadius: 'var(--radius-pill)'
                }}
              />
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleAction}
            disabled={isLocked && !isPurchased && !onPurchase}
            className="w-full gap-2"
            variant={isLocked && !isPurchased ? "outline" : "default"}
            style={{
              backgroundColor: isLocked && !isPurchased ? 'transparent' : 'var(--color-primary-default)',
              color: isLocked && !isPurchased ? 'var(--color-primary-default)' : 'var(--color-primary-on)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            {isLocked && !isPurchased && (
              <Icon name="lock" size={16} />
            )}
            {hasProgress && !isCompleted && (
              <Icon name="arrow_forward" size={16} />
            )}
            {getActionText()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProgramCard;