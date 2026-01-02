import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { apiClient } from '../../lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Sparkles, Play, ArrowRight, BookOpen, Activity, Moon, Sun, Calendar } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { SPECIAL_PROGRAM_IDS } from '../../lib/constants/content';

interface DashboardProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

export function Dashboard({ className, onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activeProgram, setActiveProgram] = useState<any>(null);
  const [userName, setUserName] = useState('Friend');

  useEffect(() => {
    if (user?.user_metadata?.full_name || user?.email) {
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Friend');
    }
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    const CACHE_KEY = `dashboard_data_${user.id}`;

    // 1. Try to load from cache first
    let hasCachedData = false;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { enrollments, recommendations, activeProgram, timestamp } = JSON.parse(cached);
        // Basic freshness check (e.g. 24 hours) - currently disabled to prioritize offline access
        // const isFresh = Date.now() - timestamp < 1000 * 60 * 60 * 24; 
        
        if (enrollments) {
          setEnrollments(enrollments);
          setRecommendations(recommendations || []);
          setActiveProgram(activeProgram || null);
          setLoading(false); // Show cached content immediately
          hasCachedData = true;
        }
      }
    } catch (e) {
      // Ignore cache errors
      console.warn('Failed to parse dashboard cache');
    }

    if (!hasCachedData) {
      setLoading(true);
    }

    try {
      const [enrollData, recData] = await Promise.all([
        apiClient.getUserEnrollments(),
        apiClient.getRecommendations()
      ]);
      
      let programDetails = null;

      // If there is an active enrollment, fetch its details to get the title
      const active = enrollData.find((e: any) => e.status === 'active');
      if (active) {
        try {
          programDetails = await apiClient.getEquipProgram(active.equip_id);
          setActiveProgram(programDetails);
        } catch (e) {
          console.error("Failed to load active program details", e);
        }
      } else {
        setActiveProgram(null);
      }
      
      setEnrollments(enrollData);
      setRecommendations(recData);
      
      // Update cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        enrollments: enrollData,
        recommendations: recData,
        activeProgram: programDetails,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Dashboard load error', error);
      // If we failed to load and didn't have cache, we are in trouble.
      // But if we had cache, the user still sees the old data, which is good.
    } finally {
      setLoading(false);
    }
  };

  const activeEnrollment = enrollments.find(e => e.status === 'active');
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-default)]"></div>
        <p className="text-[var(--color-text-muted)]">Loading your wellness space...</p>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-4 space-y-8 ${className} pb-24`}>
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-medium text-[var(--color-text-primary)]">
          {greeting}, {userName}.
        </h1>
        <p className="text-[var(--color-text-muted)]">Focus on today.</p>
      </div>

      {/* HERO: Active Program or Recommendation */}
      <section>
        {activeEnrollment && activeProgram ? (
          <Card className="bg-[var(--color-primary-default)] text-[var(--color-primary-on)] overflow-hidden border-none shadow-lg relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
               <Activity size={200} />
            </div>
            <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
               <div className="flex-1 space-y-4">
                 <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                   Current Program
                 </Badge>
                 <div>
                   <h2 className="text-3xl font-light mb-1">
                     {activeProgram.title || 'Your Program'}
                   </h2>
                   <div className="flex items-center gap-2 text-neutral-400 text-sm uppercase tracking-wider font-medium">
                     <span>Day {activeEnrollment.current_day_number}</span>
                     <span>•</span>
                     <span>{activeProgram.daily_content?.length || 0} Days Total</span>
                   </div>
                 </div>
                 
                 <p className="text-neutral-300 max-w-lg">
                   Ready for your next session? Takes about 10 minutes.
                 </p>
                 
                 <Button 
                   className="bg-white text-black hover:bg-neutral-200 mt-4 h-12 px-6 text-base"
                   onClick={() => onNavigate?.(`/equip-program-flow?id=${activeEnrollment.equip_id}`)}
                 >
                   <Play className="w-4 h-4 mr-2" fill="currentColor" /> Start Session
                 </Button>
               </div>
               
               {/* Progress Ring (Visual) */}
               <div className="hidden md:flex flex-col items-center justify-center bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="text-3xl font-bold">{Math.round((activeEnrollment.current_day_number / (activeProgram.daily_content?.length || 1)) * 100)}%</div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wider">Complete</div>
               </div>
            </CardContent>
          </Card>
        ) : recommendations.length > 0 ? (
          <Card className="border-[var(--color-border-default)] shadow-sm bg-[var(--color-bg-card)] overflow-hidden">
             <div className="md:flex">
               <div className="p-6 md:p-8 flex-1 space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                   <Sparkles className="w-5 h-5 text-[var(--color-status-warning)]" />
                   <span className="text-sm font-medium text-[var(--color-status-warning)]">Recommended for you</span>
                 </div>
                 <div>
                   <CardTitle className="text-2xl mb-2">{recommendations[0].equip_name}</CardTitle>
                   <CardDescription className="text-base">{recommendations[0].reason}</CardDescription>
                 </div>
                 <Button 
                   onClick={() => onNavigate?.(`/equip-detail?id=${recommendations[0].equip_id}`)}
                   className="mt-4"
                 >
                   View Program <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
               </div>
               <div className="bg-[var(--color-status-warning-light)] md:w-1/3 flex items-center justify-center p-8">
                  <BookOpen className="w-16 h-16 text-[var(--color-status-warning)]" />
               </div>
             </div>
          </Card>
        ) : (
          <Card className="border-dashed border-2 border-[var(--color-border-default)] bg-[var(--color-bg-muted)]">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-[var(--color-bg-card)] rounded-full flex items-center justify-center shadow-sm">
                <BookOpen className="w-8 h-8 text-[var(--color-text-muted)]" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-[var(--color-text-primary)] text-lg">No active programs</h3>
                <p className="text-[var(--color-text-muted)] max-w-sm mx-auto">
                  Browse our catalog to find a program that suits your needs.
                </p>
              </div>
              <Button onClick={() => onNavigate?.('/equip')}>
                Browse Catalog
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Secondary Recommendations (if any) */}
      {!activeEnrollment && recommendations.length > 1 && (
        <section className="space-y-4">
           <h3 className="font-medium text-[var(--color-text-primary)]">Also Recommended</h3>
           <div className="grid gap-4 md:grid-cols-2">
             {recommendations.slice(1).map((rec: any) => (
                <Card key={rec.equip_id} className="cursor-pointer hover:border-neutral-400 transition-colors group" onClick={() => onNavigate?.(`/equip-detail?id=${rec.equip_id}`)}>
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-[var(--color-primary-default)] transition-colors">{rec.equip_name}</CardTitle>
                    <CardDescription className="line-clamp-2">{rec.reason}</CardDescription>
                  </CardHeader>
                </Card>
             ))}
           </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h3 className="font-medium text-[var(--color-text-primary)] mb-4">Quick Check-in</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div 
            onClick={() => onNavigate?.(`/equip-program-flow?id=${SPECIAL_PROGRAM_IDS.DAILY_TRACKER}`)}
            className="bg-[var(--color-status-info-light)] p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-indigo-100 transition-colors border border-transparent hover:border-indigo-200"
          >
             <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-[var(--color-status-info)]">
               <Moon className="w-5 h-5" />
             </div>
             <div>
               <span className="block font-medium text-[var(--color-status-info)]">Sleep Log</span>
               <span className="text-xs text-[var(--color-text-muted)]">Track your rest</span>
             </div>
          </div>

          <div 
            onClick={() => onNavigate?.(`/equip-program-flow?id=${SPECIAL_PROGRAM_IDS.DAILY_TRACKER}`)}
            className="bg-[var(--color-status-danger-light)] p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-rose-100 transition-colors border border-transparent hover:border-rose-200"
          >
             <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-[var(--color-status-danger)]">
               <Activity className="w-5 h-5" />
             </div>
             <div>
               <span className="block font-medium text-[var(--color-status-danger)]">Mood Check</span>
               <span className="text-xs text-[var(--color-text-muted)]">How are you feeling?</span>
             </div>
          </div>

          <div 
            onClick={() => onNavigate?.('/consultation')}
            className="bg-[var(--color-status-success-light)] p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-emerald-100 transition-colors border border-transparent hover:border-emerald-200 col-span-2 md:col-span-1"
          >
             <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-[var(--color-status-success)]">
               <Calendar className="w-5 h-5" />
             </div>
             <div>
               <span className="block font-medium text-[var(--color-status-success)]">Book Session</span>
               <span className="text-xs text-[var(--color-text-muted)]">Talk to a professional</span>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
