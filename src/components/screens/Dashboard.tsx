import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiClient as client } from '../../lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { useNotifications } from '../../contexts/NotificationContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { GoogleFitSync } from '../GoogleFitSync';
import { cn } from '../ui/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  Brain,
  Heart,
  Activity,
  Award,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  Zap,
  Flame,
  CheckCircle2,
  BarChart3,
  LineChart,
  Users,
  BookOpen,
  MessageSquare,
  Shield,
  Sun,
  Moon,
  Coffee,
  Smile,
  Frown,
  Meh,
  Plus,
  ChevronRight,
  Circle,
  Timer,
  Eye,
  Sparkles,
  Trophy,
  PlayCircle,
  BookOpen as Book,
  FileText,
  Download,
  Share2,
  Filter,
  Calendar as CalendarIcon,
  MoreHorizontal
} from 'lucide-react';

interface DashboardProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

// Modern KPI Card Component
function KPICard({ 
  title, 
  value, 
  trend, 
  trendValue, 
  icon: IconComponent, 
  color = "var(--color-primary-default)",
  period = "This week",
  onClick
}: {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  icon: React.ComponentType<any>;
  color?: string;
  period?: string;
  onClick?: () => void;
}) {
  const isMobile = useIsMobile();

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={onClick ? "cursor-pointer" : ""}
    >
      <Card 
        style={{
          background: 'linear-gradient(135deg, var(--color-bg-card) 0%, rgba(255,255,255,0.8) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--color-border-light)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle gradient overlay */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            background: `linear-gradient(45deg, transparent 0%, ${color}08 100%)`,
            pointerEvents: 'none'
          }}
        />
        
        <CardContent style={{ padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-6)' }}>
          <div className="flex items-start justify-between mb-4">
            <div 
              className="p-3 rounded-xl"
              style={{ 
                backgroundColor: `${color}15`,
                border: `1px solid ${color}25`
              }}
            >
              <IconComponent 
                size={isMobile ? 20 : 24} 
                style={{ color }} 
              />
            </div>
            
            <div className="flex items-center gap-1">
              {trend === 'up' ? (
                <ArrowUp size={12} style={{ color: 'var(--color-status-success)' }} />
              ) : trend === 'down' ? (
                <ArrowDown size={12} style={{ color: 'var(--color-status-danger)' }} />
              ) : (
                <Circle size={8} style={{ color: 'var(--color-text-muted)' }} />
              )}
              <span 
                style={{ 
                  fontSize: 'var(--text-xs)', 
                  color: trend === 'up' 
                    ? 'var(--color-status-success)' 
                    : trend === 'down' 
                      ? 'var(--color-status-danger)' 
                      : 'var(--color-text-muted)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                {trendValue}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 
              style={{ 
                fontSize: isMobile ? 'var(--text-2xl)' : 'var(--text-3xl)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                lineHeight: '1'
              }}
            >
              {value}
            </h3>
            <p 
              style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: '2px'
              }}
            >
              {title}
            </p>
            <p 
              style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)'
              }}
            >
              {period}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Interactive Mood Ring Component
function MoodRing({ currentMood, weeklyMoods }: { currentMood: number; weeklyMoods: number[] }) {
  const isMobile = useIsMobile();
  const moodColors = {
    1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#84cc16', 5: '#22c55e',
    6: '#10b981', 7: '#06b6d4', 8: '#3b82f6', 9: '#8b5cf6', 10: '#d946ef'
  };

  const getMoodEmoji = (mood: number) => {
    if (mood <= 3) return '😢';
    if (mood <= 5) return '😐';
    if (mood <= 7) return '🙂';
    return '😊';
  };

  return (
    <Card 
      style={{
        background: 'linear-gradient(135deg, var(--color-bg-card) 0%, rgba(255,255,255,0.9) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      <CardHeader style={{ paddingBottom: 'var(--spacing-2)' }}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={20} style={{ color: 'var(--color-status-danger)' }} />
            <span style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              Mood Overview
            </span>
          </div>
          <Badge 
            variant="secondary" 
            style={{
              backgroundColor: `${moodColors[currentMood]}20`,
              color: moodColors[currentMood],
              border: `1px solid ${moodColors[currentMood]}30`
            }}
          >
            {getMoodEmoji(currentMood)} {currentMood}/10
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Mood Ring Visualization */}
          <div className="flex justify-center">
            <div className="relative">
              <motion.div
                className="w-32 h-32 rounded-full border-8 flex items-center justify-center"
                style={{
                  borderColor: moodColors[currentMood],
                  backgroundColor: `${moodColors[currentMood]}10`
                }}
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  repeatType: "reverse" 
                }}
              >
                <span style={{ fontSize: '2rem' }}>
                  {getMoodEmoji(currentMood)}
                </span>
              </motion.div>
              
              {/* Surrounding mood indicators */}
              {weeklyMoods.slice(-7).map((mood, index) => {
                const angle = (index * 51.43) - 90; // 360/7 = 51.43
                const radius = 70;
                const x = Math.cos(angle * Math.PI / 180) * radius;
                const y = Math.sin(angle * Math.PI / 180) * radius;
                
                return (
                  <motion.div
                    key={index}
                    className="absolute w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                    style={{
                      backgroundColor: moodColors[mood],
                      left: `calc(50% + ${x}px - 12px)`,
                      top: `calc(50% + ${y}px - 12px)`,
                      fontSize: '0.7rem'
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {getMoodEmoji(mood)}
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {/* Quick Mood Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)'
              }}
            >
              <Plus size={16} />
              Log Mood
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)'
              }}
            >
              <BarChart3 size={16} />
              View Trends
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Activity Streak Component
function ActivityStreak() {
  const streakDays = 12;
  const todayCompleted = true;
  
  return (
    <Card 
      style={{
        background: 'linear-gradient(135deg, var(--color-status-success)15 0%, var(--color-bg-card) 100%)',
        border: '1px solid var(--color-status-success)30',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <CardContent style={{ padding: 'var(--spacing-4)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame size={24} style={{ color: 'var(--color-status-warning)' }} />
            </motion.div>
            <div>
              <h3 style={{ 
                fontSize: 'var(--text-lg)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}>
                {streakDays} Day Streak
              </h3>
              <p style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)'
              }}>
                Keep it up!
              </p>
            </div>
          </div>
          
          <div className="flex gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2"
                style={{
                  backgroundColor: i < 6 || (i === 6 && todayCompleted) 
                    ? 'var(--color-status-success)' 
                    : 'transparent',
                  borderColor: 'var(--color-status-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {(i < 6 || (i === 6 && todayCompleted)) && (
                  <CheckCircle2 size={12} style={{ color: 'white' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Action Tiles
function QuickActionTile({ 
  icon: IconComponent, 
  title, 
  subtitle, 
  color,
  onClick,
  badge
}: {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  color: string;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="cursor-pointer relative"
        onClick={onClick}
        style={{
          background: `linear-gradient(135deg, ${color}08 0%, var(--color-bg-card) 100%)`,
          border: `1px solid ${color}20`,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden'
        }}
      >
        {badge && (
          <div 
            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'var(--color-status-danger)',
              color: 'white',
              fontSize: '0.6rem',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            {badge}
          </div>
        )}
        
        <CardContent style={{ padding: 'var(--spacing-4)' }}>
          <div className="flex items-center gap-3">
            <div 
              className="p-3 rounded-xl"
              style={{ 
                backgroundColor: `${color}15`,
                border: `1px solid ${color}25`
              }}
            >
              <IconComponent size={24} style={{ color }} />
            </div>
            
            <div className="flex-1">
              <h3 style={{ 
                fontSize: 'var(--text-base)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: '2px'
              }}>
                {title}
              </h3>
              <p style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-sm)'
              }}>
                {subtitle}
              </p>
            </div>
            
            <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Progress Ring Component
function ProgressRing({ 
  value, 
  max, 
  label, 
  color = "var(--color-primary-default)",
  size = 80 
}: {
  value: number;
  max: number;
  label: string;
  color?: string;
  size?: number;
}) {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * (size / 2 - 8);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            stroke="var(--color-border-light)"
            strokeWidth="4"
            fill="transparent"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            stroke={color}
            strokeWidth="4"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
        >
          <span style={{ color: 'var(--color-text-primary)' }}>{value}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            /{max}
          </span>
        </div>
      </div>
      <span style={{ 
        fontSize: 'var(--text-xs)', 
        color: 'var(--color-text-muted)',
        textAlign: 'center'
      }}>
        {label}
      </span>
    </div>
  );
}

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
      // Use user_id from our custom User type, falling back to id if it exists (Supabase type)
      const userId = user?.user_id || (user as any)?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Fetch Mood Data (Journal Entries)
        const journalResponse = await client.getJournalEntries(undefined, undefined, 30); // Last 30 entries
        const entries = journalResponse?.entries || [];
        setMoodData(entries);

        // 2. Fetch Assessment History
        const assessmentResponse = await client.getUserAssessmentResponses();
        const assessments = assessmentResponse?.responses || [];
        setAssessmentData(assessments);

        // 3. Fetch Programs
        // Get purchased programs
        const purchasedPrograms = await client.getUserPurchasedPrograms(userId);
        // Get progress for each (or assuming the endpoint returns some progress)
        // For now, we'll use the purchased list. If we need detailed progress, we'd need to fetch per program
        // but that might be too many requests. We'll verify what purchasedPrograms returns.
        setProgramData(purchasedPrograms || []);

        // 4. Fetch Resources Read Count (from LocalStorage as fallback for now)
        try {
          const readResources = JSON.parse(localStorage.getItem(`ikan-read-resources-${userId}`) || '[]');
          setReadResourceCount(readResources.length);
        } catch (e) {
          console.warn('Failed to read local resource history');
        }

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Don't show toast on dashboard load error to avoid annoyance, just log it
        // showToast('error', 'Dashboard Error', 'Failed to load some data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className={cn("w-full h-screen flex items-center justify-center", className)} style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate KPIs based on real data
  const currentMoodEntry = moodData.length > 0 ? moodData[0] : null;
  const currentMoodValue = currentMoodEntry?.mood_rating || 0;
  
  // Calculate average mood for this week vs last week for trend
  const calculateMoodTrend = () => {
    if (moodData.length < 2) return { trend: 'stable', change: '0.0' };
    
    // Sort by date descending
    const sortedMoods = [...moodData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recent = sortedMoods.slice(0, 7);
    const previous = sortedMoods.slice(7, 14);
    
    const recentAvg = recent.reduce((sum, item) => sum + (item.mood_rating || 0), 0) / (recent.length || 1);
    const prevAvg = previous.reduce((sum, item) => sum + (item.mood_rating || 0), 0) / (previous.length || 1);
    
    const diff = recentAvg - prevAvg;
    const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable';
    const change = diff !== 0 ? (diff > 0 ? '+' : '') + diff.toFixed(1) : 'stable';
    
    return { trend, change };
  };

  const moodTrend = calculateMoodTrend();

  // Calculate streak (mock for now, or derive from consecutive days in moodData)
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

  // Prepare chart data
  const weeklyMoods = moodData
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)
    .map(e => e.mood_rating || 0);
  
  // Fill with 0s if less than 7
  const filledWeeklyMoods = [...Array(Math.max(0, 7 - weeklyMoods.length)).fill(0), ...weeklyMoods];

  const kpiData = {
    moodScore: { current: currentMoodValue || '-', trend: moodTrend.trend as any, change: moodTrend.change },
    streakDays: { current: streakDays, trend: 'up', change: 'Keep it up!' },
    assessments: { current: assessmentData.length, trend: 'stable', change: 'Total' },
    resources: { current: readResourceCount, trend: 'up', change: 'Read' },
    sessions: { current: 0, trend: 'stable', change: 'Coming Soon' }, // Placeholder for sessions
    goals: { current: 0, trend: 'stable', change: 'Coming Soon' }
  };


  return (
    <div 
      className={cn("w-full", className)}
      style={{
        padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-6)',
        backgroundColor: 'var(--color-bg-page)',
        // minHeight: '100vh' - Removed to prevent double scrollbars/unnecessary scrolling
      }}
    >
      <div className="space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={24} style={{ color: 'var(--color-status-warning)' }} />
            </motion.div>
            <h1 style={{
              fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name || 'there'}!
            </h1>
          </div>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-muted)',
            fontWeight: 'var(--font-weight-normal)'
          }}>
            Here's your mental wellness overview for today
          </p>
        </motion.div>

        {/* KPI Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={isMobile ? "grid grid-cols-2 gap-4" : "grid grid-cols-3 lg:grid-cols-6 gap-6"}
        >
          <KPICard
            title="Mood Score"
            value={kpiData.moodScore.current}
            trend="up"
            trendValue={kpiData.moodScore.change}
            icon={Heart}
            color="var(--color-status-danger)"
            onClick={() => onNavigate?.('/mood-journal')}
          />
          
          <KPICard
            title="Active Streak"
            value={`${kpiData.streakDays.current}d`}
            trend="up"
            trendValue={kpiData.streakDays.change}
            icon={Flame}
            color="var(--color-status-warning)"
          />
          
          <KPICard
            title="Assessments"
            value={kpiData.assessments.current}
            trend="stable"
            trendValue={kpiData.assessments.change}
            icon={Brain}
            color="var(--color-status-info)"
            onClick={() => onNavigate?.('/assessments')}
          />
          
          <KPICard
            title="Resources Read"
            value={kpiData.resources.current}
            trend="up"
            trendValue={kpiData.resources.change}
            icon={BookOpen}
            color="var(--color-status-success)"
            onClick={() => onNavigate?.('/library')}
          />
          
          <KPICard
            title="Sessions"
            value={kpiData.sessions.current}
            trend="up"
            trendValue={kpiData.sessions.change}
            icon={MessageSquare}
            color="var(--color-primary-default)"
            onClick={() => onNavigate?.('/consultation')}
          />
          
          <KPICard
            title="Goals"
            value={`${kpiData.goals.current}/4`}
            trend="up"
            trendValue={kpiData.goals.change}
            icon={Target}
            color="var(--color-status-success)"
          />
        </motion.div>

          {/* Main Content Grid */}
        <div className={isMobile ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
          {/* Mood Overview - Takes full width on mobile, 2 cols on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={isMobile ? "" : "lg:col-span-2"}
          >
            <MoodRing currentMood={currentMoodValue} weeklyMoods={filledWeeklyMoods} />
          </motion.div>

          {/* Activity Streak - Right column on desktop */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="space-y-4">
              <ActivityStreak />
              
              {/* Weekly Progress */}
              <Card style={{
                background: 'linear-gradient(135deg, var(--color-bg-card) 0%, rgba(255,255,255,0.9) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <CardHeader style={{ paddingBottom: 'var(--spacing-2)' }}>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={20} style={{ color: 'var(--color-primary-default)' }} />
                    <span style={{ 
                      fontSize: 'var(--text-base)', 
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)'
                    }}>
                      Weekly Goals
                    </span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <ProgressRing 
                      value={5} 
                      max={7} 
                      label="Mood Logs"
                      color="var(--color-status-danger)"
                      size={60}
                    />
                    <ProgressRing 
                      value={3} 
                      max={3} 
                      label="Assessments"
                      color="var(--color-status-info)"
                      size={60}
                    />
                    <ProgressRing 
                      value={8} 
                      max={10} 
                      label="Articles"
                      color="var(--color-status-success)"
                      size={60}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-4)'
          }}>
            Quick Actions
          </h2>
          
          <div className={isMobile ? "space-y-3" : "grid grid-cols-2 lg:grid-cols-4 gap-4"}>
            <QuickActionTile
              icon={Brain}
              title="Take Assessment"
              subtitle="Check your mental health"
              color="var(--color-status-info)"
              onClick={() => onNavigate?.('/assessment-landing')}
              badge="2"
            />
            
            <QuickActionTile
              icon={Heart}
              title="Log Mood"
              subtitle="How are you feeling?"
              color="var(--color-status-danger)"
              onClick={() => onNavigate?.('/mood-journal')}
            />
            
            <QuickActionTile
              icon={BookOpen}
              title="Read Resources"
              subtitle="Explore helpful articles"
              color="var(--color-status-success)"
              onClick={() => onNavigate?.('/library')}
              badge="5"
            />
            
            <QuickActionTile
              icon={MessageSquare}
              title="Book Session"
              subtitle="Talk to a professional"
              color="var(--color-primary-default)"
              onClick={() => onNavigate?.('/consultation')}
            />
          </div>
        </motion.div>

        {/* Today's Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card style={{
            background: 'linear-gradient(135deg, var(--color-status-info)08 0%, var(--color-bg-card) 100%)',
            border: '1px solid var(--color-status-info)20',
            borderRadius: 'var(--radius-lg)'
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={20} style={{ color: 'var(--color-status-info)' }} />
                <span style={{ 
                  fontSize: 'var(--text-base)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Today's Insights
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                  <TrendingUp size={20} style={{ color: 'var(--color-status-success)' }} />
                  <div>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      marginBottom: '2px'
                    }}>
                      Your mood has improved 15% this week!
                    </p>
                    <p style={{ 
                      fontSize: 'var(--text-xs)', 
                      color: 'var(--color-text-muted)'
                    }}>
                      Keep up the great work with your daily mood tracking.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                  <Star size={20} style={{ color: 'var(--color-status-warning)' }} />
                  <div>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      marginBottom: '2px'
                    }}>
                      You're on a 12-day streak!
                    </p>
                    <p style={{ 
                      fontSize: 'var(--text-xs)', 
                      color: 'var(--color-text-muted)'
                    }}>
                      Consistency is key to mental wellness. You're doing amazing!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Google Fit Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-4)'
          }}>
            Health & Fitness
          </h2>
          
          <GoogleFitSync />
        </motion.div>

        {/* Programs Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <h2 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-4)'
          }}>
            Your Programs
          </h2>
          
          <div className={isMobile ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-2 gap-6"}>
            <EquipProgramsProgress onNavigate={onNavigate} programs={programData} />
            <AssessmentProgramsProgress onNavigate={onNavigate} assessments={assessmentData} />
          </div>
        </motion.div>

        {/* Cumulative Health Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <h2 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-4)'
          }}>
            Health Analytics
          </h2>
          
          <CumulativeHealthReport onNavigate={onNavigate} />
        </motion.div>
      </div>
    </div>
  );
}

// Equip Programs Progress Section
function EquipProgramsProgress({ onNavigate, programs = [] }: { onNavigate?: (route: string) => void, programs?: any[] }) {
  const isMobile = useIsMobile();
  
  // Transform API programs to display format or use empty state
  const displayPrograms = programs.slice(0, 3).map(p => ({
    id: p.id || p.program_id,
    title: p.title || 'Untitled Program',
    progress: p.progress || 0, // Assuming progress is in the object, otherwise need to fetch
    currentModule: p.current_module || 'Not started',
    totalModules: p.total_modules || 10,
    completedModules: p.completed_modules || 0,
    nextActivity: p.next_activity || 'Start Program',
    dueDate: p.due_date ? new Date(p.due_date) : null,
    badge: (p.progress || 0) >= 100 ? 'Completed' : (p.progress || 0) > 0 ? 'In Progress' : 'Not Started',
    color: (p.progress || 0) >= 100 ? 'var(--color-status-success)' : 'var(--color-status-info)'
  }));

  if (displayPrograms.length === 0) {
    return (
      <Card 
      style={{
        background: 'linear-gradient(135deg, var(--color-bg-card) 0%, rgba(255,255,255,0.9) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={20} style={{ color: 'var(--color-status-warning)' }} />
            <span style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              Equip Programs
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <p className="text-muted-foreground mb-4">You haven't started any programs yet.</p>
        <Button onClick={() => onNavigate?.('/equip-programs')}>Browse Programs</Button>
      </CardContent>
    </Card>
    );
  }

  return (
    <Card 
      style={{
        background: 'linear-gradient(135deg, var(--color-bg-card) 0%, rgba(255,255,255,0.9) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={20} style={{ color: 'var(--color-status-warning)' }} />
            <span style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              Equip Programs
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate?.('/equip-programs')}
          >
            View All
            <ChevronRight size={16} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {displayPrograms.map((program) => (
            <motion.div
              key={program.id}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer"
              onClick={() => onNavigate?.('/equip-program-onboarding')} 
            >
              <div 
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-bg-muted)',
                  borderColor: 'var(--color-border-light)'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 style={{ 
                        fontSize: 'var(--text-base)', 
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)'
                      }}>
                        {program.title}
                      </h4>
                      <Badge 
                        variant="secondary"
                        style={{
                          backgroundColor: `${program.color}20`,
                          color: program.color,
                          border: `1px solid ${program.color}30`,
                          fontSize: 'var(--text-xs)'
                        }}
                      >
                        {program.badge}
                      </Badge>
                    </div>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-text-muted)',
                      fontWeight: 'var(--font-weight-normal)'
                    }}>
                      {program.currentModule}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div style={{ 
                      fontSize: 'var(--text-lg)', 
                      fontWeight: 'var(--font-weight-medium)',
                      color: program.color
                    }}>
                      {program.progress}%
                    </div>
                    <div style={{ 
                      fontSize: 'var(--text-xs)', 
                      color: 'var(--color-text-muted)'
                    }}>
                      {program.completedModules}/{program.totalModules} modules
                    </div>
                  </div>
                </div>
                
                <Progress 
                  value={program.progress} 
                  className="mb-3"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    height: '6px'
                  }}
                />
                
                {program.nextActivity && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlayCircle size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span style={{ 
                        fontSize: 'var(--text-sm)', 
                        color: 'var(--color-text-muted)'
                      }}>
                        Next: {program.nextActivity}
                      </span>
                    </div>
                    {program.dueDate && (
                      <span style={{ 
                        fontSize: 'var(--text-xs)', 
                        color: 'var(--color-status-warning)'
                      }}>
                        Due {program.dueDate.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Assessment Programs Progress Section
function AssessmentProgramsProgress({ onNavigate, assessments = [] }: { onNavigate?: (route: string) => void, assessments?: any[] }) {
  const isMobile = useIsMobile();
  
  // Transform API assessments to display format
  // We need to group by assessment ID to find "last score" and "previous score"
  const assessmentsById: Record<string, any[]> = {};
  assessments.forEach(a => {
    const id = a.assessment_id || a.id;
    if (!assessmentsById[id]) assessmentsById[id] = [];
    assessmentsById[id].push(a);
  });

  const displayAssessments = Object.keys(assessmentsById).map(id => {
    const history = assessmentsById[id].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    const latest = history[0];
    const previous = history[1];
    
    const lastScore = latest.score || 0;
    const previousScore = previous?.score || 0;
    const trend = lastScore < previousScore ? 'improved' : lastScore > previousScore ? 'increased' : 'stable';
    
    // Determine category based on score (simplified logic)
    let category = 'Normal';
    let color = 'var(--color-status-success)';
    if (lastScore > 15) { category = 'High'; color = 'var(--color-status-danger)'; }
    else if (lastScore > 10) { category = 'Moderate'; color = 'var(--color-status-warning)'; }
    else if (lastScore > 5) { category = 'Mild'; color = 'var(--color-status-info)'; }

    return {
      id: id,
      name: latest.title || latest.assessment_title || 'Assessment',
      lastScore,
      previousScore,
      trend,
      lastTaken: new Date(latest.completed_at),
      frequency: 'Weekly', // Placeholder
      nextDue: new Date(new Date(latest.completed_at).getTime() + 7 * 24 * 60 * 60 * 1000), // Next due in 7 days
      category,
      color
    };
  }).slice(0, 3);

  if (displayAssessments.length === 0) {
    return (
      <Card 
      style={{
        background: 'linear-gradient(135deg, var(--color-bg-card) 0%, rgba(255,255,255,0.9) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={20} style={{ color: 'var(--color-status-info)' }} />
            <span style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              Assessment Progress
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <p className="text-muted-foreground mb-4">No assessment history found.</p>
        <Button onClick={() => onNavigate?.('/assessment-landing')}>Take an Assessment</Button>
      </CardContent>
    </Card>
    );
  }

  return (
    <Card 
      style={{
        background: 'linear-gradient(135deg, var(--color-bg-card) 0%, rgba(255,255,255,0.9) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={20} style={{ color: 'var(--color-status-info)' }} />
            <span style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              Assessment Progress
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate?.('/assessments')}
          >
            View All
            <ChevronRight size={16} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {displayAssessments.map((assessment) => (
            <motion.div
              key={assessment.id}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer"
              onClick={() => onNavigate?.('/assessment-flow')} // Ideally navigate to specific assessment results
            >
              <div 
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-bg-muted)',
                  borderColor: 'var(--color-border-light)'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 style={{ 
                        fontSize: 'var(--text-base)', 
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)'
                      }}>
                        {assessment.name}
                      </h4>
                      <Badge 
                        variant="secondary"
                        style={{
                          backgroundColor: `${assessment.color}20`,
                          color: assessment.color,
                          border: `1px solid ${assessment.color}30`,
                          fontSize: 'var(--text-xs)'
                        }}
                      >
                        {assessment.category}
                      </Badge>
                    </div>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-text-muted)',
                      fontWeight: 'var(--font-weight-normal)'
                    }}>
                      Last taken: {assessment.lastTaken.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span style={{ 
                        fontSize: 'var(--text-lg)', 
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)'
                      }}>
                        {assessment.lastScore}
                      </span>
                      {assessment.trend === 'improved' ? (
                        <TrendingDown size={16} style={{ color: 'var(--color-status-success)' }} />
                      ) : (
                        <TrendingUp size={16} style={{ color: 'var(--color-status-warning)' }} />
                      )}
                    </div>
                    <div style={{ 
                      fontSize: 'var(--text-xs)', 
                      color: assessment.trend === 'improved' 
                        ? 'var(--color-status-success)' 
                        : 'var(--color-status-warning)'
                    }}>
                      {assessment.trend === 'improved' ? '▼' : '▲'}
                      {Math.abs(assessment.lastScore - assessment.previousScore)} from last
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-text-muted)'
                    }}>
                      {assessment.frequency}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: assessment.nextDue.getTime() <= Date.now() 
                        ? 'var(--color-status-danger)' 
                        : 'var(--color-text-muted)'
                    }}>
                      {assessment.nextDue.getTime() <= Date.now() 
                        ? 'Due now' 
                        : `Due ${assessment.nextDue.toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Cumulative Health Report Section
function CumulativeHealthReport({ onNavigate }: { onNavigate?: (route: string) => void }) {
  const isMobile = useIsMobile();
  
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
            className="flex-1"
            style={{
              backgroundColor: 'var(--semantic-button-primary-bg)',
              color: 'var(--semantic-button-primary-fg)',
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)'
            }}
            onClick={() => onNavigate?.('/mood-journal')}
          >
            <Book size={16} />
            View Detailed Report
          </Button>
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