import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useNotifications } from '../../contexts/NotificationContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { cn } from '../ui/utils';
import { 
  FileText, 
  Share2, 
  Download, 
  MoreHorizontal, 
  Heart, 
  Flame, 
  Moon, 
  Brain, 
  Award, 
  Book, 
  Filter 
} from 'lucide-react';

export function Analytics({ className, onNavigate }: { className?: string, onNavigate?: (route: string) => void }) {
  const isMobile = useIsMobile();
  const { showToast } = useNotifications();

  return (
    <div 
      className={cn("w-full mx-auto", className)}
      style={{
        padding: isMobile ? 'var(--spacing-4)' : '20px',
        backgroundColor: 'var(--color-bg-page)',
        maxWidth: 'var(--constraint-nav-desktop-max)',
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 style={{
            fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)'
          }}>
            Health Analytics
          </h1>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-muted)',
            fontWeight: 'var(--font-weight-normal)'
          }}>
            Detailed insights into your mental wellness journey
          </p>
        </div>

        {/* Detailed Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CumulativeHealthReport onNavigate={onNavigate} />
        </motion.div>
      </div>
    </div>
  );
}

// Cumulative Health Report Section (Moved from Dashboard)
function CumulativeHealthReport({ onNavigate }: { onNavigate?: (route: string) => void }) {
  
  // Sample cumulative data
  const reportData = {
    period: '30 Days',
    totalActivities: 127,
    averageMood: 7.2,
    moodTrend: 'stable',
    assessmentsCompleted: 8,
    programsActive: 3,
    streakDays: 12,
    improvementAreas: [
      { area: 'Sleep Quality', improvement: '+23%', color: 'var(--color-status-success)' },
      { area: 'Anxiety Levels', improvement: '-15%', color: 'var(--color-status-success)' },
      { area: 'Physical Activity', improvement: '+40%', color: 'var(--color-status-success)' },
      { area: 'Stress Management', improvement: '+12%', color: 'var(--color-status-info)' }
    ],
    insights: [
      {
        type: 'positive',
        title: 'Great Progress on Sleep',
        description: 'Your sleep patterns have improved significantly over the past month.',
        icon: Moon
      },
      {
        type: 'attention',
        title: 'Consider Stress Management',
        description: 'Stress levels show room for improvement. Try our stress relief program.',
        icon: Brain
      },
      {
        type: 'achievement',
        title: 'Consistency Achievement',
        description: 'You\'ve maintained a 12-day streak! Keep up the excellent work.',
        icon: Award
      }
    ]
  };

  return (
    <Card 
      style={{
        background: 'linear-gradient(135deg, var(--color-status-info)08 0%, var(--color-bg-card) 100%)',
        border: '1px solid var(--color-status-info)20',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={20} style={{ color: 'var(--color-status-info)' }} />
            <span style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              Health Report
            </span>
            <Badge 
              variant="secondary"
              style={{
                backgroundColor: 'var(--color-status-info)15',
                color: 'var(--color-status-info)',
                fontSize: 'var(--text-xs)'
              }}
            >
              {reportData.period}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Share2 size={16} />
            </Button>
            <Button variant="ghost" size="sm">
              <Download size={16} />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal size={16} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div style={{ 
              fontSize: 'var(--text-2xl)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              {reportData.totalActivities}
            </div>
            <div style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-muted)'
            }}>
              Total Activities
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}>
                {reportData.averageMood}
              </span>
              <Heart size={16} style={{ color: 'var(--color-status-danger)' }} />
            </div>
            <div style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-muted)'
            }}>
              Avg Mood Score
            </div>
          </div>
          
          <div className="text-center">
            <div style={{ 
              fontSize: 'var(--text-2xl)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              {reportData.assessmentsCompleted}
            </div>
            <div style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-muted)'
            }}>
              Assessments
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}>
                {reportData.streakDays}
              </span>
              <Flame size={16} style={{ color: 'var(--color-status-warning)' }} />
            </div>
            <div style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-muted)'
            }}>
              Day Streak
            </div>
          </div>
        </div>

        {/* Improvement Areas */}
        <div>
          <h4 style={{ 
            fontSize: 'var(--text-base)', 
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-3)'
          }}>
            Key Improvements
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {reportData.improvementAreas.map((area, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-muted)' }}
              >
                <span style={{ 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 'var(--font-weight-normal)',
                  color: 'var(--color-text-primary)'
                }}>
                  {area.area}
                </span>
                <span style={{ 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: area.color
                }}>
                  {area.improvement}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div>
          <h4 style={{ 
            fontSize: 'var(--text-base)', 
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-3)'
          }}>
            Personalized Insights
          </h4>
          <div className="space-y-3">
            {reportData.insights.map((insight, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-muted)' }}
              >
                <div 
                  className="p-2 rounded-full"
                  style={{ 
                    backgroundColor: insight.type === 'positive' 
                      ? 'var(--color-status-success)15'
                      : insight.type === 'attention'
                        ? 'var(--color-status-warning)15'
                        : 'var(--color-status-info)15'
                  }}
                >
                  <insight.icon 
                    size={16} 
                    style={{ 
                      color: insight.type === 'positive' 
                        ? 'var(--color-status-success)'
                        : insight.type === 'attention'
                          ? 'var(--color-status-warning)'
                          : 'var(--color-status-info)'
                    }} 
                  />
                </div>
                <div className="flex-1">
                  <h5 style={{ 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: '2px'
                  }}>
                    {insight.title}
                  </h5>
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-text-muted)',
                    lineHeight: 'var(--line-height-sm)'
                  }}>
                    {insight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline"
            style={{
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)'
            }}
          >
            <Filter size={16} />
            Customize
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}