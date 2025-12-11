import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { CheckCircle, Trophy, Calendar, Target, Download, Share2, ArrowRight, Star } from 'lucide-react';
import { cn } from '../ui/utils';
import { getEquipProgramContent, getStoredProgram, EquipProgramDetails } from '../../lib/equip-program-content';

interface EquipProgramCompletionProps {
  onContinue?: () => void;
  onBackToDashboard?: () => void;
}

interface CompletionStats {
  activitiesCompleted: number;
  totalActivities: number;
  daysActive: number;
  totalDays: number;
  skillsLearned: string[];
  certificateEarned: boolean;
}

// Sample completion data
const getCompletionStats = (programSlug: string): CompletionStats => {
  const baseStats = {
    activitiesCompleted: 15,
    totalActivities: 18,
    daysActive: 28,
    totalDays: 42,
    skillsLearned: [
      'Stress recognition',
      'Mindfulness techniques',
      'Boundary setting',
      'Energy management'
    ],
    certificateEarned: true
  };

  if (programSlug === 'burnout-recovery') {
    return {
      ...baseStats,
      skillsLearned: [
        'Burnout recognition and prevention',
        'Rest and recovery techniques',
        'Work-life boundary setting',
        'Energy audit and management',
        'Sustainable work practices',
        'Stress management strategies'
      ]
    };
  }

  return baseStats;
};

export function EquipProgramCompletion({ onContinue, onBackToDashboard }: EquipProgramCompletionProps) {
  const isMobile = useIsMobile();
  const [content, setContent] = useState<EquipProgramDetails | null>(null);
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [showCelebration, setShowCelebration] = useState(true);

  // Load program content and stats
  useEffect(() => {
    const storedProgram = getStoredProgram();
    if (storedProgram && storedProgram.slug) {
      const programContent = getEquipProgramContent(storedProgram.slug);
      setContent(programContent);
      
      if (programContent) {
        const completionStats = getCompletionStats(programContent.slug);
        setStats(completionStats);
      }
    }

    // Hide celebration animation after 3 seconds
    const timer = setTimeout(() => {
      setShowCelebration(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!content || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-48 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const completionPercentage = (stats.activitiesCompleted / stats.totalActivities) * 100;
  const activePercentage = (stats.daysActive / stats.totalDays) * 100;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4 animate-scale-in">
            <div 
              className="p-8 rounded-full mx-auto animate-bounce"
              style={{ backgroundColor: 'var(--color-status-success)' }}
            >
              <Trophy size={64} style={{ color: 'white' }} />
            </div>
            <h1 style={{ 
              fontSize: 'var(--text-3xl)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-status-success)'
            }}>
              Congratulations!
            </h1>
            <p style={{ 
              fontSize: 'var(--text-lg)', 
              color: 'var(--color-text-primary)'
            }}>
              You've completed the program!
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Card */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="text-center space-y-6">
              <div 
                className="p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-status-success)' }}
              >
                <Trophy size={48} style={{ color: 'white' }} />
              </div>
              
              <div>
                <h1 style={{ 
                  fontSize: 'var(--text-2xl)', 
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  Program Completed!
                </h1>
                <h2 style={{ 
                  fontSize: 'var(--text-xl)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  {content.title}
                </h2>
                <p style={{ 
                  fontSize: 'var(--text-base)', 
                  color: 'var(--color-text-muted)'
                }}>
                  You've successfully completed your mental health journey. Here's a summary of your achievements.
                </p>
              </div>

              {stats.certificateEarned && (
                <Badge className="gap-2 px-4 py-2" variant="secondary">
                  <CheckCircle size={16} />
                  Certificate Earned
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Activities Completed */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div 
                  className="p-3 rounded-full mx-auto w-12 h-12 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-status-info)' + '20' }}
                >
                  <CheckCircle size={24} style={{ color: 'var(--color-status-info)' }} />
                </div>
                <div>
                  <p style={{ 
                    fontSize: 'var(--text-2xl)', 
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)'
                  }}>
                    {stats.activitiesCompleted}
                  </p>
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    color: 'var(--color-text-muted)'
                  }}>
                    Activities Completed
                  </p>
                </div>
                <Progress value={completionPercentage} className="h-2" />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {completionPercentage.toFixed(0)}% Complete
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Days Active */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div 
                  className="p-3 rounded-full mx-auto w-12 h-12 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-status-success)' + '20' }}
                >
                  <Calendar size={24} style={{ color: 'var(--color-status-success)' }} />
                </div>
                <div>
                  <p style={{ 
                    fontSize: 'var(--text-2xl)', 
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)'
                  }}>
                    {stats.daysActive}
                  </p>
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    color: 'var(--color-text-muted)'
                  }}>
                    Days Active
                  </p>
                </div>
                <Progress value={activePercentage} className="h-2" />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {activePercentage.toFixed(0)}% Consistency
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Skills Learned */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div 
                  className="p-3 rounded-full mx-auto w-12 h-12 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-status-warning)' + '20' }}
                >
                  <Target size={24} style={{ color: 'var(--color-status-warning)' }} />
                </div>
                <div>
                  <p style={{ 
                    fontSize: 'var(--text-2xl)', 
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)'
                  }}>
                    {stats.skillsLearned.length}
                  </p>
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    color: 'var(--color-text-muted)'
                  }}>
                    Skills Learned
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Rating */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div 
                  className="p-3 rounded-full mx-auto w-12 h-12 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary-default)' + '20' }}
                >
                  <Star size={24} style={{ color: 'var(--color-primary-default)' }} />
                </div>
                <div>
                  <p style={{ 
                    fontSize: 'var(--text-2xl)', 
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)'
                  }}>
                    Excellent
                  </p>
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    color: 'var(--color-text-muted)'
                  }}>
                    Performance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Acquired */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle style={{ fontSize: 'var(--text-lg)' }}>
              Skills You've Mastered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.skillsLearned.map((skill, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <CheckCircle size={20} style={{ color: 'var(--color-status-success)' }} />
                  <span style={{ 
                    fontSize: 'var(--text-sm)', 
                    color: 'var(--color-text-primary)'
                  }}>
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle style={{ fontSize: 'var(--text-lg)' }}>
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline"
                className="gap-2 h-auto p-4 justify-start"
              >
                <Download size={20} />
                <div className="text-left">
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Download Certificate
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Get your completion certificate
                  </p>
                </div>
              </Button>

              <Button 
                variant="outline"
                className="gap-2 h-auto p-4 justify-start"
              >
                <Share2 size={20} />
                <div className="text-left">
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Share Achievement
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Celebrate your success
                  </p>
                </div>
              </Button>

              <Button 
                variant="outline"
                className="gap-2 h-auto p-4 justify-start"
                onClick={onContinue}
              >
                <Target size={20} />
                <div className="text-left">
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Explore More Programs
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Continue your journey
                  </p>
                </div>
              </Button>

              <Button 
                variant="outline"
                className="gap-2 h-auto p-4 justify-start"
              >
                <Calendar size={20} />
                <div className="text-left">
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Schedule Check-in
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Maintain your progress
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onBackToDashboard}
            variant="outline"
            className="gap-2"
          >
            Back to Dashboard
          </Button>

          <Button
            onClick={onContinue}
            className="gap-2"
            style={{
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)'
            }}
          >
            Explore More Programs
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}