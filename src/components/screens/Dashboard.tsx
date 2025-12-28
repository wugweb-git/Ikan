import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { apiClient as client } from '../../lib/api-client';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { cn } from '../ui/utils';
import { Skeleton } from '../ui/skeleton-loader';
import { 
  Heart, 
  Flame, 
  Brain, 
  BookOpen, 
  MessageSquare, 
  Target, 
  Plus, 
  BarChart3, 
  ChevronRight, 
  Check, 
  Sparkles,
  ArrowUp, 
  ArrowDown, 
  Settings,
  Calendar,
  Zap,
  Activity,
  Moon
} from 'lucide-react';

interface DashboardProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

// --- Components ---

// 1. Header Section
const DashboardHeader = ({ userName }: { userName: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center space-y-2 mb-8"
  >
    <h1 className="text-2xl md:text-3xl font-medium text-[var(--ikan-color-text-primary)] flex items-center justify-center gap-2">
      <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-500" />
      Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {userName}!
    </h1>
    <p className="text-[var(--ikan-color-text-muted)] text-base">
      Here's your mental wellness overview for today
    </p>
  </motion.div>
);

// 2. Stat Card
interface StatCardProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  subtext: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  color: string;
  delay?: number;
}

const StatCard = ({ icon: Icon, value, label, subtext, trend, trendDirection, color, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="h-full"
  >
    <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200 bg-white rounded-[16px]">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-xl bg-opacity-10" style={{ backgroundColor: `${color}15` }}>
            <Icon size={24} style={{ color }} />
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trendDirection === 'up' ? "text-emerald-600 bg-emerald-50" : 
              trendDirection === 'down' ? "text-rose-600 bg-rose-50" : "text-gray-500 bg-gray-50"
            )}>
              {trendDirection === 'up' && '↑ '}
              {trendDirection === 'down' && '↓ '}
              {trend}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-3xl font-medium text-[var(--ikan-color-text-primary)] mb-1">{value}</h3>
          <p className="text-sm font-medium text-[var(--ikan-color-text-primary)]">{label}</p>
          <p className="text-xs text-[var(--ikan-color-text-muted)] mt-1">{subtext}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// 3. Mood Overview
const MoodOverview = ({ currentMood }: { currentMood: number }) => {
  const moods = ['😭', '😢', '😕', '😐', '🙂', '😊', '😁', '🤩'];
  const getMoodEmoji = (score: number) => {
    if (score === 0) return '😶';
    const index = Math.min(Math.floor((score - 1) / 10 * moods.length), moods.length - 1);
    return moods[index] || '😐';
  };

  return (
    <Card className="border-none shadow-sm bg-white rounded-[20px] overflow-hidden h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <span className="font-medium text-lg">Mood Overview</span>
          </div>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-none px-3 py-1">
            {getMoodEmoji(currentMood)} {currentMood}/10
          </Badge>
        </div>

        <div className="flex-1 flex items-center justify-center py-8">
          <div className="relative w-48 h-48">
            {/* Circular Track */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="transparent"
                stroke="#FEF3C7" // yellow-100
                strokeWidth="12"
                strokeLinecap="round"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                fill="transparent"
                stroke="#F59E0B" // yellow-500
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 88}
                initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - currentMood / 10) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            
            {/* Center Emoji */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl"
              >
                {getMoodEmoji(currentMood)}
              </motion.div>
            </div>
            
            {/* Orbital Emojis (Decorative) */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const angle = (i * 45) * (Math.PI / 180);
              const r = 88; // radius
              const x = 96 + r * Math.cos(angle);
              const y = 96 + r * Math.sin(angle);
              return (
                <div 
                  key={i}
                  className="absolute w-6 h-6 flex items-center justify-center text-xs bg-white rounded-full shadow-sm border border-gray-100"
                  style={{ 
                    left: x - 12, 
                    top: y - 12,
                    opacity: 0.8 
                  }}
                >
                  {moods[i]}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-auto pt-6">
          <Button variant="outline" className="w-full h-12 bg-gray-50 border-none hover:bg-gray-100 text-[var(--ikan-color-text-primary)]">
            <Plus className="w-4 h-4 mr-2" /> Log Mood
          </Button>
          <Button variant="outline" className="w-full h-12 bg-gray-50 border-none hover:bg-gray-100 text-[var(--ikan-color-text-primary)]">
            <BarChart3 className="w-4 h-4 mr-2" /> View Trends
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// 4. Goals & Streak
const GoalsAndStreak = ({ streakDays, goals }: { streakDays: number, goals: any }) => (
  <div className="flex flex-col gap-6 h-full">
    {/* Streak Card */}
    <Card className="border-none shadow-sm bg-white rounded-[20px] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)', color: 'var(--ikan-color-text-primary)' }}>{streakDays} Day Streak</h3>
            <p className="text-sm text-[var(--ikan-color-text-muted)]">Keep it up!</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[...Array(7)].map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2",
                i < 5 ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-200 text-gray-300"
              )}
            >
              <Check className="w-4 h-4" />
            </div>
          ))}
        </div>
      </div>
    </Card>

    {/* Weekly Goals */}
    <Card className="border-none shadow-sm bg-white rounded-[20px] p-6 flex-1">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-[var(--ikan-color-text-primary)]" />
        <h3 className="font-medium text-lg">Weekly Goals</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Mood Logs', current: 5, total: 7, color: '#EF4444' },
          { label: 'Assessments', current: 3, total: 3, color: '#8B5CF6' },
          { label: 'Articles', current: 8, total: 10, color: '#10B981' },
        ].map((goal, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="relative w-20 h-20 mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#F3F4F6"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke={goal.color}
                  strokeWidth="6"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 36}
                  strokeDashoffset={2 * Math.PI * 36 * (1 - goal.current / goal.total)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>{goal.current}</span>
                <span className="text-xs text-gray-400">/{goal.total}</span>
              </div>
            </div>
            <span className="text-xs font-medium text-center text-gray-600">{goal.label}</span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// 5. Quick Actions
const QuickActions = ({ onNavigate }: { onNavigate?: (route: string) => void }) => {
  const actions = [
    { 
      title: 'Take Assessment', 
      subtitle: 'Check your mental health', 
      icon: Brain, 
      color: '#8B5CF6', 
      bg: '#F5F3FF',
      route: '/assessment',
      badge: '2' 
    },
    { 
      title: 'Log Mood', 
      subtitle: 'How are you feeling?', 
      icon: Heart, 
      color: '#EF4444', 
      bg: '#FEF2F2',
      route: '/mood-journal'
    },
    { 
      title: 'Read Resources', 
      subtitle: 'Explore helpful articles', 
      icon: BookOpen, 
      color: '#10B981', 
      bg: '#ECFDF5',
      route: '/resource',
      badge: '5'
    },
    { 
      title: 'Book Session', 
      subtitle: 'Talk to a professional', 
      icon: MessageSquare, 
      color: '#3B82F6', 
      bg: '#EFF6FF',
      route: '/consultation'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[var(--ikan-color-text-primary)]">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate?.(action.route)}
            className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-left group relative overflow-hidden"
          >
            {action.badge && (
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }} className="absolute top-3 right-3 w-5 h-5 bg-rose-500 text-white flex items-center justify-center rounded-full shadow-sm z-10">
                {action.badge}
              </span>
            )}
            <div className="p-3 rounded-xl mr-4 transition-colors" style={{ backgroundColor: action.bg }}>
              <action.icon size={24} style={{ color: action.color }} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 group-hover:text-[var(--ikan-color-primary-default)] transition-colors">
                {action.title}
              </h4>
              <p className="text-xs text-gray-500">{action.subtitle}</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-gray-500 transition-colors" size={20} />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// 6. Health Analytics & Insights
const HealthAnalytics = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-end">
      <h3 className="text-lg font-medium text-[var(--ikan-color-text-primary)]">Health Analytics</h3>
    </div>
    
    <Card className="border-none shadow-sm bg-white rounded-[20px] overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-8 border-b border-gray-100">
           <div className="text-center md:text-left">
             <div className="flex items-center gap-2 mb-1">
               <span className="text-3xl font-bold text-gray-900">127</span>
             </div>
             <p className="text-sm text-gray-500">Total Activities</p>
           </div>
           <div className="text-center md:text-left mt-4 md:mt-0">
             <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
               <span className="text-3xl font-bold text-gray-900">7.2</span>
               <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
             </div>
             <p className="text-sm text-gray-500">Avg Mood Score</p>
           </div>
           <div className="text-center md:text-left mt-4 md:mt-0">
             <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
               <span className="text-3xl font-bold text-gray-900">8</span>
             </div>
             <p className="text-sm text-gray-500">Assessments</p>
           </div>
           <div className="text-center md:text-left mt-4 md:mt-0">
             <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
               <span className="text-3xl font-bold text-gray-900">12</span>
               <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
             </div>
             <p className="text-sm text-gray-500">Day Streak</p>
           </div>
        </div>

        <h4 className="font-medium text-gray-900 mb-4">Key Improvements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Sleep Quality', change: '+23%', positive: true },
            { label: 'Anxiety Levels', change: '-15%', positive: true },
            { label: 'Physical Activity', change: '+40%', positive: true },
            { label: 'Stress Management', change: '+12%', positive: true },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className={cn("font-bold", item.positive ? "text-emerald-500" : "text-rose-500")}>
                {item.change}
              </span>
            </div>
          ))}
        </div>

        <h4 className="font-medium text-gray-900 mb-4">Personalized Insights</h4>
        <div className="space-y-3">
          <div className="p-4 bg-emerald-50 rounded-xl flex gap-4">
             <div className="p-2 bg-emerald-100 rounded-lg h-fit">
               <Moon className="w-5 h-5 text-emerald-600" />
             </div>
             <div>
               <h5 className="font-bold text-emerald-900 mb-1">Great Progress on Sleep</h5>
               <p className="text-sm text-emerald-700">Your sleep patterns have improved significantly over the past month.</p>
             </div>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl flex gap-4">
             <div className="p-2 bg-orange-100 rounded-lg h-fit">
               <Brain className="w-5 h-5 text-orange-600" />
             </div>
             <div>
               <h5 className="font-bold text-orange-900 mb-1">Consider Stress Management</h5>
               <p className="text-sm text-orange-700">Stress levels show room for improvement. Try our stress relief program.</p>
             </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
             <Button className="bg-[var(--ikan-color-primary-default)] text-white hover:opacity-90">
               <BookOpen className="w-4 h-4 mr-2" /> View Detailed Report
             </Button>
             <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" /> Customize
             </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// --- Main Dashboard Component ---

export function Dashboard({ className, onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  
  const [loading, setLoading] = useState(true);
  const [moodData, setMoodData] = useState<any[]>([]);
  const [assessmentData, setAssessmentData] = useState<any[]>([]);
  const [programData, setProgramData] = useState<any[]>([]);
  const [readResourceCount, setReadResourceCount] = useState(0);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      const userId = user?.user_id || (user as any)?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [
          journalResult,
          assessmentResult,
          programResult
        ] = await Promise.allSettled([
          client.getJournalEntries(undefined, undefined, 30),
          client.getUserAssessmentResponses(),
          client.getUserPurchasedPrograms(userId)
        ]);

        if (journalResult.status === 'fulfilled') setMoodData(journalResult.value?.entries || []);
        if (assessmentResult.status === 'fulfilled') setAssessmentData(assessmentResult.value?.responses || []);
        if (programResult.status === 'fulfilled') setProgramData(programResult.value || []);

        try {
          const readResources = JSON.parse(localStorage.getItem(`ikan-read-resources-${userId}`) || '[]');
          setReadResourceCount(readResources.length);
        } catch (e) {
          console.warn('Failed to read local resource history');
        }

      } catch (error) {
        console.error('Unexpected error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Derived Data
  const currentMood = moodData.length > 0 ? (moodData[0].mood_rating || 0) : 0;
  
  // Calculate Streak
  const calculateStreak = () => {
    if (moodData.length === 0) return 0;
    let streak = 0;
    const sortedDates = [...new Set(moodData.map(e => new Date(e.date).toDateString()))];
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (sortedDates.includes(today)) {
      streak = 1;
      let checkDate = new Date(Date.now() - 86400000);
      while (sortedDates.includes(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else if (sortedDates.includes(yesterday)) {
       let checkDate = new Date(Date.now() - 86400000);
       while (sortedDates.includes(checkDate.toDateString())) {
         streak++;
         checkDate.setDate(checkDate.getDate() - 1);
       }
    }
    return streak;
  };
  const streakDays = calculateStreak();

  if (loading) {
    return (
      <div className="w-full min-h-screen p-8 bg-[var(--ikan-color-bg-page)] max-w-7xl mx-auto space-y-8">
        <Skeleton variant="text" height="40px" width="300px" className="mx-auto" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
             <Skeleton key={i} variant="rectangular" height="120px" className="rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Skeleton variant="rectangular" height="400px" className="rounded-2xl" />
             <Skeleton variant="rectangular" height="400px" className="rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-[var(--ikan-color-bg-page)]", className)}>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        <DashboardHeader userName={user?.name || 'Alex'} />

        {/* 1. Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard 
            icon={Heart} 
            value={currentMood || '-'} 
            label="Mood Score" 
            subtext="This week" 
            trend="+3.0" 
            trendDirection="up"
            color="#EF4444" // Red
            delay={0.1}
          />
          <StatCard 
            icon={Flame} 
            value={`${streakDays}d`} 
            label="Active Streak" 
            subtext="This week" 
            trend="Keep it up!" 
            trendDirection="up"
            color="#F59E0B" // Amber
            delay={0.2}
          />
          <StatCard 
            icon={Brain} 
            value={assessmentData.length} 
            label="Assessments" 
            subtext="This week" 
            trend="Total" 
            trendDirection="neutral"
            color="#8B5CF6" // Violet
            delay={0.3}
          />
          <StatCard 
            icon={BookOpen} 
            value={readResourceCount} 
            label="Resources Read" 
            subtext="This week" 
            trend="Read" 
            trendDirection="up"
            color="#10B981" // Emerald
            delay={0.4}
          />
          <StatCard 
            icon={MessageSquare} 
            value="0" 
            label="Sessions" 
            subtext="This week" 
            trend="Coming Soon" 
            trendDirection="neutral"
            color="#3B82F6" // Blue
            delay={0.5}
          />
          <StatCard 
            icon={Target} 
            value="0/4" 
            label="Goals" 
            subtext="This week" 
            trend="Coming Soon" 
            trendDirection="neutral"
            color="#EC4899" // Pink
            delay={0.6}
          />
        </div>

        {/* 2. Middle Section: Mood + Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MoodOverview currentMood={currentMood} />
          <GoalsAndStreak streakDays={streakDays} goals={{}} />
        </div>

        {/* 3. Quick Actions */}
        <QuickActions onNavigate={onNavigate} />

        {/* 4. Insights Section */}
        <HealthAnalytics />

        {/* 5. Google Fit (Existing) */}
        {/* <div className="pt-4">
           <h3 className="text-lg font-medium text-[var(--ikan-color-text-primary)] mb-4">Integrations</h3>
           <GoogleFitSync />
        </div> */}

      </div>
    </div>
  );
}