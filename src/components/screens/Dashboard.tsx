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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="text-neutral-500">Loading your wellness space...</p>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-4 space-y-8 ${className} pb-24`}>
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-medium text-neutral-900">
          {greeting}, {userName}.
        </h1>
        <p className="text-neutral-500">Focus on today.</p>
      </div>

      {/* HERO: Active Program or Recommendation */}
      <section>
        {activeEnrollment && activeProgram ? (
          <Card className="bg-neutral-900 text-white overflow-hidden border-none shadow-lg relative">
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
          <Card className="border-neutral-200 shadow-sm bg-white overflow-hidden">
             <div className="md:flex">
               <div className="p-6 md:p-8 flex-1 space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                   <Sparkles className="w-5 h-5 text-amber-500" />
                   <span className="text-sm font-medium text-amber-600">Recommended for you</span>
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
               <div className="bg-amber-50 md:w-1/3 flex items-center justify-center p-8">
                  <BookOpen className="w-16 h-16 text-amber-200" />
               </div>
             </div>
          </Card>
        ) : (
          <Card className="border-dashed border-2 border-neutral-200 bg-neutral-50/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <BookOpen className="w-8 h-8 text-neutral-300" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-neutral-900 text-lg">No active programs</h3>
                <p className="text-neutral-500 max-w-sm mx-auto">
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
           <h3 className="font-medium text-neutral-900">Also Recommended</h3>
           <div className="grid gap-4 md:grid-cols-2">
             {recommendations.slice(1).map((rec: any) => (
                <Card key={rec.equip_id} className="cursor-pointer hover:border-neutral-400 transition-colors group" onClick={() => onNavigate?.(`/equip-detail?id=${rec.equip_id}`)}>
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors">{rec.equip_name}</CardTitle>
                    <CardDescription className="line-clamp-2">{rec.reason}</CardDescription>
                  </CardHeader>
                </Card>
             ))}
           </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h3 className="font-medium text-neutral-900 mb-4">Quick Check-in</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div 
            onClick={() => onNavigate?.('/mood-journal')}
            className="bg-indigo-50 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-indigo-100 transition-colors border border-indigo-100"
          >
             <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700">
               <Moon className="w-5 h-5" />
             </div>
             <div>
               <span className="block font-medium text-indigo-900">Sleep Log</span>
               <span className="text-xs text-indigo-600/70">Track your rest</span>
             </div>
          </div>

          <div 
            onClick={() => onNavigate?.('/mood-journal')}
            className="bg-rose-50 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-rose-100 transition-colors border border-rose-100"
          >
             <div className="w-10 h-10 bg-rose-200 rounded-full flex items-center justify-center text-rose-700">
               <Activity className="w-5 h-5" />
             </div>
             <div>
               <span className="block font-medium text-rose-900">Mood Check</span>
               <span className="text-xs text-rose-600/70">How are you feeling?</span>
             </div>
          </div>

          <div 
            onClick={() => onNavigate?.('/consultation')}
            className="bg-emerald-50 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-emerald-100 transition-colors border border-emerald-100 col-span-2 md:col-span-1"
          >
             <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700">
               <Calendar className="w-5 h-5" />
             </div>
             <div>
               <span className="block font-medium text-emerald-900">Book Session</span>
               <span className="text-xs text-emerald-600/70">Talk to a professional</span>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
