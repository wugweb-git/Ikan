import React from 'react';
import { cn } from '../ui/utils';

interface WellbeingSnapshotWidgetProps {
  user?: {
    name: string;
    moodScore?: number;
    daysActive?: number;
  };
}

function WellbeingSnapshotWidget({ user }: WellbeingSnapshotWidgetProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div 
      className="flex-1 ikan-card-spacing animate-fadeIn mobile-card mobile-optimized"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-default)',
        display: 'flex',
        flexDirection: 'column',
        // Mobile-specific optimizations
        minHeight: '120px',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <div className="ikan-stack-md" style={{ display: 'flex', flexDirection: 'column' }}>
        <div>
          <h2 
            style={{ 
              fontSize: 'var(--text-xl)', 
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-1)'
            }}
          >
            {getGreeting()}, {user?.name || 'Guest'}! 👋
          </h2>
          <p style={{ 
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)'
          }}>
            Here's your wellbeing snapshot
          </p>
        </div>
        
        <div className="grid grid-cols-2 ikan-stack-md" style={{ gap: 'var(--spacing-4)' }}>
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
            <div 
              style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary-default)'
              }}
            >
              {user?.moodScore?.toFixed(1) || '7.2'}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Mood Score
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
            <div 
              style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary-default)'
              }}
            >
              {user?.daysActive || '28'}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Days Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NeedsAttentionWidget() {
  const needsAttention = [
    {
      title: 'Complete Assessment',
      description: 'Mental health check-in overdue',
      urgency: 'high',
      action: 'Take Now'
    },
    {
      title: 'Mood Journal',
      description: 'Log your mood for today',
      urgency: 'medium',
      action: 'Log Mood'
    }
  ];

  return (
    <div 
      className="flex-1 p-6 rounded-lg animate-fadeIn"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-default)'
      }}
    >
      <div className="space-y-4">
        <h3 
          style={{ 
            fontSize: 'var(--text-lg)', 
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)'
          }}
        >
          Needs Attention
        </h3>
        
        <div className="space-y-3">
          {needsAttention.map((item, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-opacity-50 transition-colors cursor-pointer"
              style={{ 
                borderColor: item.urgency === 'high' ? 'var(--color-status-danger)' : 'var(--color-border-default)',
                borderRadius: 'var(--radius-md)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div className="flex-1">
                <div 
                  style={{ 
                    fontWeight: 'var(--font-weight-medium)', 
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {item.title}
                </div>
                <div 
                  style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-text-muted)'
                  }}
                >
                  {item.description}
                </div>
              </div>
              <button
                className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                style={{
                  backgroundColor: item.urgency === 'high' ? 'var(--color-status-danger)' : 'var(--color-primary-default)',
                  color: 'var(--color-text-inverse)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                {item.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface TopSectionUserPersonalizedProps {
  user?: {
    name: string;
    moodScore?: number;
    daysActive?: number;
  };
  className?: string;
}

export function TopSectionUserPersonalized({ user, className }: TopSectionUserPersonalizedProps) {
  return (
    <div 
      className={cn("w-full", className)}
      style={{
        minWidth: 'var(--constraint-content-min)',
        maxWidth: 'var(--constraint-content-max)'
      }}
    >
      <div 
        className="flex flex-col lg:flex-row gap-4"
        style={{ gap: 'var(--spacing-4)' }}
      >
        <WellbeingSnapshotWidget user={user} />
        <NeedsAttentionWidget />
      </div>
    </div>
  );
}