import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Book, Target, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../ui/utils';
import { getEquipProgramContent, getStoredProgram, EquipProgramDetails } from '../../lib/equip-program-content';

interface EquipProgramFlowProps {
  onBack?: () => void;
  onComplete?: () => void;
}

// Sample program content structure
interface ProgramModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  activities: ProgramActivity[];
  completed?: boolean;
}

interface ProgramActivity {
  id: string;
  type: 'reading' | 'exercise' | 'reflection' | 'assessment';
  title: string;
  description: string;
  duration: string;
  content?: string;
  completed?: boolean;
}

// Enhanced activity interface for calendar view
interface DailyActivity extends ProgramActivity {
  date: string;
  time: string;
  status: 'completed' | 'in-progress' | 'pending';
  tags?: string[];
  mood?: string;
}

// Sample program data with calendar activities
const getProgramModules = (programSlug: string): ProgramModule[] => {
  const baseModules: ProgramModule[] = [
    {
      id: 'onboarding',
      title: 'Welcome & Assessment',
      description: 'Get started with your program and complete initial assessment',
      duration: '15 mins',
      activities: [
        {
          id: 'welcome',
          type: 'reading',
          title: 'Program Introduction',
          description: 'Learn about your journey ahead',
          duration: '5 mins',
          content: 'Welcome to your mental health journey...'
        },
        {
          id: 'initial-assessment',
          type: 'assessment',
          title: 'Initial Assessment',
          description: 'Help us understand your current state',
          duration: '10 mins'
        }
      ]
    }
  ];

  if (programSlug === 'burnout-recovery') {
    return [
      ...baseModules,
      {
        id: 'week1',
        title: 'Understanding Burnout',
        description: 'Recognize burnout patterns and establish foundations for recovery',
        duration: '45 mins',
        activities: [
          {
            id: 'burnout-signs',
            type: 'reading',
            title: 'Recognizing Burnout Signs',
            description: 'Learn to identify the physical and emotional signs of burnout',
            duration: '15 mins',
            content: 'Burnout manifests in various ways...'
          },
          {
            id: 'energy-audit',
            type: 'exercise',
            title: 'Energy Audit Exercise',
            description: 'Assess your current energy levels and patterns',
            duration: '20 mins'
          },
          {
            id: 'reflection-journal',
            type: 'reflection',
            title: 'Daily Reflection',
            description: 'Record your thoughts and feelings about burnout',
            duration: '10 mins'
          }
        ]
      },
      {
        id: 'week2',
        title: 'Rest and Recovery',
        description: 'Master the art of rest and create space for healing',
        duration: '50 mins',
        activities: [
          {
            id: 'rest-types',
            type: 'reading',
            title: 'Types of Rest',
            description: 'Understanding different forms of rest and recovery',
            duration: '15 mins'
          },
          {
            id: 'rest-plan',
            type: 'exercise',
            title: 'Personal Rest Plan',
            description: 'Create your customized rest and recovery schedule',
            duration: '25 mins'
          },
          {
            id: 'mindfulness',
            type: 'exercise',
            title: 'Mindfulness Practice',
            description: 'Guided mindfulness session for deep rest',
            duration: '10 mins'
          }
        ]
      }
    ];
  }

  // Add other program types as needed
  return baseModules;
};

// Generate sample daily activities for calendar view
const generateDailyActivities = (programSlug: string): DailyActivity[] => {
  const today = new Date();
  const activities: DailyActivity[] = [];
  
  // Generate activities for the past week
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Add 1-3 activities per day based on program
    const activityCount = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < activityCount; j++) {
      const baseActivities = [
        {
          type: 'reading' as const,
          title: 'Daily Reflection',
          description: 'Reflect on your progress and feelings',
          mood: ['Great', 'Good', 'Okay', 'Not Great', 'Struggling'][Math.floor(Math.random() * 5)],
          tags: ['mindful', 'calm', 'focused', 'grateful', 'hopeful', 'tired', 'anxious', 'peaceful']
        },
        {
          type: 'exercise' as const,
          title: 'Breathing Exercise',
          description: 'Complete mindfulness breathing practice',
          mood: ['Fine', 'Relaxed', 'Centered', 'Better', 'Peaceful'][Math.floor(Math.random() * 5)],
          tags: ['breathing', 'mindful', 'relaxed', 'centered', 'calm']
        },
        {
          type: 'reflection' as const,
          title: 'Journal Entry',
          description: 'Write about your thoughts and experiences',
          mood: ['Thoughtful', 'Clear', 'Processing', 'Insightful', 'Contemplative'][Math.floor(Math.random() * 5)],
          tags: ['journaling', 'reflective', 'insightful', 'processing', 'thoughtful']
        }
      ];
      
      const baseActivity = baseActivities[Math.floor(Math.random() * baseActivities.length)];
      const hour = 9 + Math.floor(Math.random() * 12); // 9 AM to 9 PM
      const minute = Math.floor(Math.random() * 60);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      
      activities.push({
        id: `activity-${dateStr}-${j}`,
        type: baseActivity.type,
        title: baseActivity.title,
        description: baseActivity.description,
        duration: '10 mins',
        date: dateStr,
        time: `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`,
        status: i === 0 ? 'in-progress' : 'completed',
        tags: baseActivity.tags.slice(0, Math.floor(Math.random() * 3) + 1),
        mood: baseActivity.mood,
        completed: i !== 0
      });
    }
  }
  
  return activities.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });
};

// Helper function to get week dates
const getWeekDates = (centerDate: Date = new Date()) => {
  const dates = [];
  const startOfWeek = new Date(centerDate);
  startOfWeek.setDate(centerDate.getDate() - centerDate.getDay() + 1); // Monday
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

// Helper function to format date
const formatDate = (date: Date) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return {
    dayName: days[date.getDay() === 0 ? 6 : date.getDay() - 1], // Convert Sunday = 0 to Monday = 0
    dayNumber: date.getDate(),
    month: months[date.getMonth()],
    fullDayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
    dateStr: date.toISOString().split('T')[0]
  };
};

export function EquipProgramFlow({ onBack, onComplete }: EquipProgramFlowProps) {
  const isMobile = useIsMobile();
  const [content, setContent] = useState<EquipProgramDetails | null>(null);
  const [modules, setModules] = useState<ProgramModule[]>([]);
  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());

  // Load program content
  useEffect(() => {
    const storedProgram = getStoredProgram();
    if (storedProgram && storedProgram.slug) {
      const programContent = getEquipProgramContent(storedProgram.slug);
      
      if (programContent) {
        setContent(programContent);
        const programModules = getProgramModules(programContent.slug);
        setModules(programModules);
      } else {
        // Use fallback content and modules if specific content not found
        const fallbackContent = {
          id: storedProgram.slug || 'default',
          title: 'Program Flow',
          slug: storedProgram.slug || 'default',
          overview: {
            title: 'Program Overview',
            description: 'Complete the program modules to achieve your goals.'
          },
          whatYoullGet: {
            title: 'What You\'ll Get',
            description: 'A structured program to support your mental health journey.'
          },
          programDetails: {
            duration: '6 weeks',
            accessPeriod: '6 months',
            modules: '5 modules'
          },
          structure: {
            title: 'Program Structure',
            weeks: [],
            moreCount: 0
          },
          pricing: {
            amount: 'Free',
            currency: 'USD',
            description: 'No cost'
          }
        };
        setContent(fallbackContent);
        const programModules = getProgramModules('default');
        setModules(programModules);
      }
    } else {
      // Set fallback content if no stored program
      const fallbackContent = {
        id: 'default',
        title: 'Program Flow',
        slug: 'default',
        overview: {
          title: 'Program Overview',
          description: 'Complete the program modules to achieve your goals.'
        },
        whatYoullGet: {
          title: 'What You\'ll Get',
          description: 'A structured program to support your mental health journey.'
        },
        programDetails: {
          duration: '6 weeks',
          accessPeriod: '6 months',
          modules: '5 modules'
        },
        structure: {
          title: 'Program Structure',
          weeks: [],
          moreCount: 0
        },
        pricing: {
          amount: 'Free',
          currency: 'USD',
          description: 'No cost'
        }
      };
      setContent(fallbackContent);
      const programModules = getProgramModules('default');
      setModules(programModules);
    }
    
    // Generate daily activities for calendar view
    const activities = generateDailyActivities(content?.slug || 'default');
    setDailyActivities(activities);
  }, []);

  // Calendar view data calculations
  const weekDates = getWeekDates(selectedWeek);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayFormatted = formatDate(today);
  const selectedDateActivities = dailyActivities.filter(activity => activity.date === selectedDate);
  const totalActivities = dailyActivities.length;
  const completedCount = dailyActivities.filter(activity => activity.status === 'completed').length;
  const progressPercentage = totalActivities > 0 ? (completedCount / totalActivities) * 100 : 0;

  const handleActivityComplete = (activityId: string) => {
    setDailyActivities(prev => 
      prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, status: 'completed' as const }
          : activity
      )
    );
    setCompletedActivities(prev => new Set([...prev, activityId]));
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(selectedWeek.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(newWeek);
  };

  if (!content) {
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reading': return <Book size={20} />;
      case 'exercise': return <Target size={20} />;
      case 'reflection': return <Clock size={20} />;
      case 'assessment': return <CheckCircle size={20} />;
      default: return <Book size={20} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'reading': return 'var(--color-status-info)';
      case 'exercise': return 'var(--color-status-success)';
      case 'reflection': return 'var(--color-status-warning)';
      case 'assessment': return 'var(--color-primary-default)';
      default: return 'var(--color-primary-default)';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood?.toLowerCase()) {
      case 'great':
      case 'excellent': 
        return 'var(--color-status-success)';
      case 'good':
      case 'fine':
      case 'okay':
        return 'var(--color-status-info)';
      case 'not great':
      case 'struggling':
      case 'difficult':
        return 'var(--color-status-warning)';
      case 'terrible':
      case 'awful':
        return 'var(--color-status-danger)';
      default: 
        return 'var(--color-neutral-400)';
    }
  };

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        backgroundColor: 'var(--color-bg-page)',
        padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)',
        maxWidth: '100%'
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-normal)',
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)'
            }}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          
          <div className="text-center">
            <h1 style={{ 
              fontSize: isMobile ? 'var(--text-lg)' : 'var(--text-xl)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              {content.title}
            </h1>
          </div>

          <div className="w-16"></div> {/* Spacer for alignment */}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            <span>Overall Progress</span>
            <span>{completedCount} of {totalActivities} completed</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2" 
            style={{
              backgroundColor: 'var(--color-bg-muted)'
            }}
          />
        </div>

        {/* Week Calendar Navigation */}
        <div 
          className="flex items-center justify-between mb-4"
          style={{
            padding: 'var(--spacing-4)',
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)'
          }}
        >
          <Button
            variant="ghost"
            onClick={() => handleWeekChange('prev')}
            size="sm"
            style={{
              color: 'var(--color-text-muted)',
              padding: 'var(--spacing-2)'
            }}
          >
            <ChevronLeft size={20} />
          </Button>
          
          <div 
            className="flex gap-1"
            style={{
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {weekDates.map((date) => {
              const formatted = formatDate(date);
              const isToday = formatted.dateStr === todayStr;
              const isSelected = formatted.dateStr === selectedDate;
              const hasActivities = dailyActivities.some(activity => activity.date === formatted.dateStr);
              
              return (
                <button
                  key={formatted.dateStr}
                  onClick={() => setSelectedDate(formatted.dateStr)}
                  className="flex flex-col items-center min-w-0 transition-all duration-200"
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected 
                      ? 'var(--color-primary-default)' 
                      : isToday 
                        ? 'var(--color-accent-default)'
                        : 'transparent',
                    color: isSelected 
                      ? 'var(--color-primary-on)'
                      : isToday
                        ? 'var(--color-accent-on)'
                        : 'var(--color-text-primary)',
                    border: 'none',
                    cursor: 'pointer',
                    minWidth: isMobile ? '44px' : '52px'
                  }}
                >
                  <span style={{ 
                    fontSize: 'var(--text-xs)', 
                    fontWeight: 'var(--font-weight-normal)',
                    marginBottom: '2px'
                  }}>
                    {formatted.dayName}
                  </span>
                  <span style={{ 
                    fontSize: 'var(--text-base)', 
                    fontWeight: 'var(--font-weight-medium)'
                  }}>
                    {formatted.dayNumber}
                  </span>
                  {hasActivities && (
                    <div 
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? 'var(--color-primary-on)' : 'var(--color-primary-default)',
                        marginTop: '2px'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          
          <Button
            variant="ghost"
            onClick={() => handleWeekChange('next')}
            size="sm"
            style={{
              color: 'var(--color-text-muted)',
              padding: 'var(--spacing-2)'
            }}
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      {/* Main Content - Activities for Selected Date */}
      <div>
        {/* Today Header - Only show if selected date is today */}
        {selectedDate === todayStr && (
          <div className="mb-6">
            <h2 style={{ 
              fontSize: 'var(--text-xl)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-1)'
            }}>
              Today, {todayFormatted.dayNumber} {todayFormatted.month}
            </h2>
            <p style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: 'var(--font-weight-normal)',
              color: 'var(--color-text-muted)'
            }}>
              {todayFormatted.fullDayName}
            </p>
          </div>
        )}

        {/* Selected Date Header - Show if not today */}
        {selectedDate !== todayStr && (
          <div className="mb-6">
            {(() => {
              const selectedDateObj = new Date(selectedDate);
              const selectedFormatted = formatDate(selectedDateObj);
              return (
                <>
                  <h2 style={{ 
                    fontSize: 'var(--text-xl)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-1)'
                  }}>
                    {selectedFormatted.dayNumber} {selectedFormatted.month}
                  </h2>
                  <p style={{ 
                    fontSize: 'var(--text-base)', 
                    fontWeight: 'var(--font-weight-normal)',
                    color: 'var(--color-text-muted)'
                  }}>
                    {selectedFormatted.fullDayName}
                  </p>
                </>
              );
            })()}
          </div>
        )}

        {/* Activity Cards */}
        <div className="space-y-4">
          {selectedDateActivities.length === 0 ? (
            <Card 
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-6)',
                textAlign: 'center'
              }}
            >
              <div style={{ color: 'var(--color-text-muted)' }}>
                <Calendar size={48} style={{ margin: '0 auto var(--spacing-4)' }} />
                <p style={{ 
                  fontSize: 'var(--text-base)', 
                  fontWeight: 'var(--font-weight-normal)'
                }}>
                  No activities for this date
                </p>
                <p style={{ 
                  fontSize: 'var(--text-sm)', 
                  marginTop: 'var(--spacing-2)'
                }}>
                  Check back or select a different date
                </p>
              </div>
            </Card>
          ) : (
            selectedDateActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="cursor-pointer transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border-light)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-4)',
                    position: 'relative'
                  }}
                  onClick={() => activity.status !== 'completed' && handleActivityComplete(activity.id)}
                >
                  {/* Activity Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-full"
                        style={{ 
                          backgroundColor: getMoodColor(activity.mood || '') + '20',
                          color: getMoodColor(activity.mood || '')
                        }}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <h3 style={{ 
                          fontSize: 'var(--text-lg)', 
                          fontWeight: 'var(--font-weight-medium)',
                          color: activity.mood ? getMoodColor(activity.mood) : 'var(--color-text-primary)',
                          marginBottom: '2px'
                        }}>
                          {activity.mood || activity.title}
                        </h3>
                        {activity.mood && (
                          <p style={{ 
                            fontSize: 'var(--text-sm)', 
                            color: 'var(--color-text-muted)',
                            fontWeight: 'var(--font-weight-normal)'
                          }}>
                            {activity.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p style={{ 
                        fontSize: 'var(--text-sm)', 
                        color: 'var(--color-text-muted)',
                        fontWeight: 'var(--font-weight-normal)'
                      }}>
                        {activity.time}
                      </p>
                      {activity.status === 'completed' && (
                        <CheckCircle 
                          size={16} 
                          style={{ 
                            color: 'var(--color-status-success)',
                            marginTop: '4px',
                            marginLeft: 'auto'
                          }} 
                        />
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {activity.tags && activity.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activity.tags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            backgroundColor: 'var(--color-bg-muted)',
                            color: 'var(--color-text-muted)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-weight-normal)',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            display: 'inline-block'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Status Indicator */}
                  {activity.status === 'in-progress' && (
                    <div 
                      className="absolute top-3 right-3 w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--color-status-warning)' }}
                    />
                  )}
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Add Activity Button */}
        {selectedDate === todayStr && (
          <div className="mt-6">
            <Button
              className="w-full gap-2 justify-center"
              style={{
                backgroundColor: 'var(--semantic-button-primary-bg)',
                color: 'var(--semantic-button-primary-fg)',
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                border: 'none'
              }}
              onClick={() => {
                // Add new activity logic here
                console.log('Add new activity for today');
              }}
            >
              <Target size={16} />
              Add Today's Activity
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}