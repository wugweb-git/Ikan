import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { apiClient } from '../../lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Sparkles, Play, ArrowRight, BookOpen, Activity, Moon, Sun, Calendar, ClipboardCheck } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { SPECIAL_PROGRAM_IDS } from '../../lib/constants/content';
import { DUMMY_EQUIP_PROGRAM, ALL_DUMMY_PROGRAMS } from '../../lib/demo-data';
import { ProgramCheckIn } from '../equip/ProgramCheckIn';
import { ReassessmentPrompt } from '../assessments/ReassessmentPrompt';
import { checkReassessmentTriggers, ReassessmentReason } from '../../lib/reassessment-triggers';
import { ActivityCard } from '../integrations/ActivityCard';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface DashboardProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

const PROGRAM_CONTENT: Record<string, any> = {
  "Sleep Tight": {
    benefits: [
      "Establishing healthier sleep routines",
      "Calming the mind before bedtime",
      "Improving sleep quality over time"
    ],
    time: "10–20 minutes a day"
  },
  "Stress Buster": {
    benefits: [
      "Understanding your stress triggers",
      "Grounding and mindfulness techniques",
      "Managing thoughts and emotional overload"
    ],
    time: "10–15 minutes a day"
  },
  "Burnout Reset": {
     benefits: [
      "Reducing mental and physical exhaustion",
      "Rebalancing effort and expectations",
      "Reconnecting with motivation and clarity"
    ],
    time: "15–20 minutes a day"
  },
   "Burnout Recovery": {
     benefits: [
      "Reducing mental and physical exhaustion",
      "Rebalancing effort and expectations",
      "Reconnecting with motivation and clarity"
    ],
    time: "15–20 minutes a day"
  },
  "Anxiety 101": {
      benefits: [
          "Understanding anxiety triggers",
          "Learning grounding techniques",
          "Managing anxious thoughts"
      ],
      time: "10-15 minutes a day"
  }
};

export function Dashboard({ className, onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activeProgram, setActiveProgram] = useState<any>(null);
  const [topRecDetails, setTopRecDetails] = useState<any>(null);
  const [userName, setUserName] = useState('Friend');
  const [hasLoggedMoodToday, setHasLoggedMoodToday] = useState(false);
  
  // Check-in State
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInProgram, setCheckInProgram] = useState<{id: string, title: string, day: number} | null>(null);

  // Reassessment State
  const [reassessment, setReassessment] = useState<{ isOpen: boolean, reason: ReassessmentReason }>({ isOpen: false, reason: 'manual' });

  useEffect(() => {
    if (user?.user_metadata?.full_name || user?.email) {
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Friend');
    }
    if (user) {
      loadDashboardData();
      runReassessmentChecks();
    }
  }, [user]);

  const runReassessmentChecks = async () => {
    if (!user) return;
    
    // Check cooldown (don't pester user if they dismissed recently)
    const dismissedAt = localStorage.getItem(`reassessment_dismissed_${user.id}`);
    if (dismissedAt) {
      const hoursSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60);
      if (hoursSince < 24) return;
    }

    const { shouldTrigger, reason } = await checkReassessmentTriggers(user.id);
    if (shouldTrigger && reason) {
      // Delay slightly for UX
      setTimeout(() => {
        setReassessment({ isOpen: true, reason });
      }, 2000);
    }
  };

  const handleManualReassessment = () => {
    setReassessment({ isOpen: true, reason: 'manual' });
  };

  const handleReassessmentConfirm = () => {
    setReassessment({ ...reassessment, isOpen: false });
    onNavigate?.(`/assessment-flow?reason=${reassessment.reason}`);
  };

  const handleReassessmentClose = () => {
    setReassessment({ ...reassessment, isOpen: false });
    // Set cooldown
    if (user) {
      localStorage.setItem(`reassessment_dismissed_${user.id}`, Date.now().toString());
    }
  };

  const loadDashboardData = async () => {
    if (!user) return;
    const CACHE_KEY = `dashboard_data_${user.id}`;

    // 1. Try to load from cache first
    let hasCachedData = false;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { enrollments, recommendations, activeProgram, topRecDetails, timestamp } = JSON.parse(cached);
        // Basic freshness check (e.g. 24 hours) - currently disabled to prioritize offline access
        // const isFresh = Date.now() - timestamp < 1000 * 60 * 60 * 24; 
        
        if (enrollments) {
          setEnrollments(enrollments);
          setRecommendations(recommendations || []);
          setActiveProgram(activeProgram || null);
          setTopRecDetails(topRecDetails || null);
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
      // Check for today's mood log
      const today = new Date().toISOString().split('T')[0];
      const journalData = await apiClient.getJournalEntries(today, today).catch(() => ({ entries: [] }));
      const entries = (journalData as any).entries || [];
      setHasLoggedMoodToday(entries.length > 0);

      const [enrollData, recData] = await Promise.all([
        apiClient.getUserEnrollments(),
        apiClient.getRecommendations()
      ]);

      // ⚡ CHECK LOCAL DEMO ENROLLMENT
      const dummyProgramId = localStorage.getItem('ikan-active-dummy-program');
      const dummyProgram = dummyProgramId ? ALL_DUMMY_PROGRAMS.find(p => p.id === dummyProgramId) : null;
      
      if (dummyProgram && dummyProgramId) {
          const exists = enrollData.some((e: any) => e.equip_id === dummyProgramId);
          if (!exists) {
              const storedProgress = localStorage.getItem(`demo-progress-${dummyProgramId}`);
              const progress = storedProgress ? JSON.parse(storedProgress) : { currentDay: 1 };
              
              const totalDays = dummyProgram.daily_content.length;
              const isCompleted = progress.currentDay > totalDays;
              
              enrollData.unshift({
                  id: 'dummy-enrollment',
                  equip_id: dummyProgramId,
                  status: isCompleted ? 'completed' : 'active',
                  current_day_number: progress.currentDay || 1,
                  created_at: new Date().toISOString(),
                  completed_at: isCompleted ? new Date().toISOString() : null
              });
          }
      }
      
      let programDetails = null;

      // If there is an active enrollment, fetch its details to get the title
      const active = enrollData.find((e: any) => e.status === 'active');
      if (active) {
        if (active.equip_id === DUMMY_EQUIP_PROGRAM.id) {
            programDetails = DUMMY_EQUIP_PROGRAM;
            setActiveProgram(DUMMY_EQUIP_PROGRAM);
        } else {
            try {
              programDetails = await apiClient.getEquipProgram(active.equip_id);
              setActiveProgram(programDetails);
            } catch (e: any) {
              if (!e.message?.includes('404')) {
                console.error("Failed to load active program details", e);
              }
              // If the program doesn't exist (404), clear the active state so the user isn't blocked
              setActiveProgram(null);
            }
        }
      } else {
        setActiveProgram(null);
      }

      // Fetch details for top recommendation if exists
      let topRec = null;
      if (recData && recData.length > 0) {
         try {
             topRec = await apiClient.getEquipProgram(recData[0].equip_id);
             setTopRecDetails(topRec);
         } catch (e) {
             console.error("Failed to load top recommendation details", e);
         }
      } else {
         setTopRecDetails(null);
      }
      
      setEnrollments(enrollData);
      setRecommendations(recData);
      
      // Update cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        enrollments: enrollData,
        recommendations: recData,
        activeProgram: programDetails,
        topRecDetails: topRec,
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
  const completedEnrollments = enrollments.filter(e => e.status === 'completed');
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-default)]"></div>
        <p className="text-[var(--color-text-muted)]">Loading your wellness space...</p>
      </div>
    );
  }

  const handleManualCheckIn = () => {
    if (activeEnrollment && activeProgram) {
      setCheckInProgram({
        id: activeEnrollment.equip_id,
        title: activeProgram.title,
        day: activeEnrollment.current_day_number
      });
      setShowCheckIn(true);
    } else {
      showToast('info', 'No Active Program', 'Join a program first to check your progress.');
    }
  };

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
                 
                 <div className="flex flex-wrap gap-3 mt-4">
                   <Button 
                     className="bg-white text-black hover:bg-neutral-200 h-12 px-6 text-base"
                     onClick={() => onNavigate?.(`/equip-program-flow?id=${activeEnrollment.equip_id}`)}
                   >
                     <Play className="w-4 h-4 mr-2" fill="currentColor" /> Start Session
                   </Button>
                   <Button
                     className="bg-white/10 text-white hover:bg-white/20 border-white/20 h-12 px-6"
                     variant="outline"
                     onClick={handleManualCheckIn}
                   >
                     <ClipboardCheck className="w-4 h-4 mr-2" /> Check Progress
                   </Button>
                 </div>
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
             <div className="md:flex flex-col md:flex-row">
               <div className="p-6 md:p-8 flex-1 space-y-6">
                 {/* 1. Header */}
                 <div>
                   <div className="text-sm font-medium text-[var(--color-text-muted)] mb-1">
                     Based on your responses, we recommend starting with:
                   </div>
                   <h2 className="text-3xl font-light text-[var(--color-text-primary)]">
                     {recommendations[0].equip_name}
                   </h2>
                 </div>

                 {/* 2. Reason */}
                 <div className="bg-[var(--color-bg-muted)]/50 p-4 rounded-lg border border-[var(--color-border-default)]">
                    <p className="text-[var(--color-text-primary)] leading-relaxed">
                       {recommendations[0].reason || "Your responses suggest this program will help you build the right skills."}
                    </p>
                 </div>

                 {/* 3. What You'll Work On */}
                 {PROGRAM_CONTENT[recommendations[0].equip_name] && (
                   <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                        What you’ll work on
                      </h3>
                      <ul className="space-y-2">
                        {PROGRAM_CONTENT[recommendations[0].equip_name].benefits.map((benefit: string, idx: number) => (
                           <li key={idx} className="flex items-start gap-2 text-[var(--color-text-primary)]">
                             <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-primary-default)] shrink-0" />
                             <span>{benefit}</span>
                           </li>
                        ))}
                      </ul>
                   </div>
                 )}

                 {/* 4. Time Commitment */}
                 <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Time commitment: <span className="text-[var(--color-text-primary)] font-medium">
                        {PROGRAM_CONTENT[recommendations[0].equip_name]?.time || "10-15 minutes a day"}
                      </span>
                    </span>
                 </div>

                 {/* 5. Actions */}
                 <div className="flex flex-col sm:flex-row gap-3 pt-2">
                   <Button 
                     onClick={() => onNavigate?.(`/equip-program-onboarding?id=${recommendations[0].equip_id}`)}
                     className="bg-[var(--color-primary-default)] text-[var(--color-primary-on)] hover:opacity-90 min-w-[140px]"
                   >
                     Start Program
                   </Button>
                   <Button 
                     variant="outline"
                     onClick={() => onNavigate?.(`/equip-detail?id=${recommendations[0].equip_id}`)}
                     className="min-w-[140px]"
                   >
                     Learn more
                   </Button>
                   <Button 
                     variant="ghost"
                     onClick={handleManualReassessment}
                     className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                   >
                     Re-check progress
                   </Button>
                 </div>
                 
                 {/* 7. Gentle Footer */}
                 <p className="text-xs text-[var(--color-text-muted)] pt-2">
                   You’re always in control. You can switch programs or explore others anytime.
                 </p>
               </div>
               
               {/* Image Section (Desktop Right, Mobile Top/Hidden) */}
               {topRecDetails?.image_url && (
                   <div className="hidden md:block w-1/3 relative min-h-[400px]">
                      <ImageWithFallback
                        src={topRecDetails.image_url}
                        alt={recommendations[0].equip_name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[var(--color-bg-card)]/10" />
                   </div>
               )}
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

      {/* COMPLETED PROGRAMS HISTORY */}
      {(completedEnrollments.length > 0 || true) && ( // Force show for UI audit as requested
        <section className="space-y-6">
          <h3 className="font-medium text-[var(--color-text-primary)]">Your History</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Completed Programs */}
            {completedEnrollments.length > 0 ? completedEnrollments.map((enrollment: any) => {
              const isDummy = enrollment.equip_id === DUMMY_EQUIP_PROGRAM.id;
              const title = isDummy ? DUMMY_EQUIP_PROGRAM.title : 'Completed Program';
              const date = enrollment.completed_at ? new Date(enrollment.completed_at).toLocaleDateString() : 'Recently';

              return (
                <Card 
                  key={enrollment.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-[var(--color-status-success)]"
                  onClick={() => onNavigate?.(`/equip-program-flow?id=${enrollment.equip_id}`)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                       <div>
                         <CardTitle className="text-lg">{title}</CardTitle>
                         <CardDescription>Program • Completed {date}</CardDescription>
                       </div>
                       <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                         Done
                       </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="link" className="p-0 h-auto text-[var(--color-primary-default)]">
                      Review Journey <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            }) : (
               // Placeholder for audit if no programs completed
               <Card className="border-dashed border-2 border-[var(--color-border-default)] bg-[var(--color-bg-muted)] opacity-60">
                 <CardContent className="p-6 text-center text-[var(--color-text-muted)] text-sm">
                   No completed programs yet.
                 </CardContent>
               </Card>
            )}

            {/* Completed Assessments (Mock for Audit) */}
            <Card 
               className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-indigo-500"
               onClick={() => onNavigate?.('/assessment-results')}
            >
               <CardHeader>
                 <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Anxiety Screening</CardTitle>
                      <CardDescription>Assessment • Completed Jan 2</CardDescription>
                    </div>
                    <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">
                      Moderate
                    </div>
                 </div>
               </CardHeader>
               <CardContent>
                 <Button variant="link" className="p-0 h-auto text-indigo-600">
                   View Results <ArrowRight size={14} className="ml-1" />
                 </Button>
               </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* DAILY INSIGHTS GRID */}
      <section>
        <h3 className="font-medium text-[var(--color-text-primary)] mb-4">Daily Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           
           {/* A. MOOD TRACKER CARD */}
           <Card className={cn(
             "border-none shadow-sm transition-all overflow-hidden relative",
             hasLoggedMoodToday 
               ? "bg-gradient-to-br from-green-50 to-emerald-50 ring-1 ring-green-100" 
               : "bg-white ring-1 ring-black/5 hover:ring-indigo-200 hover:shadow-md cursor-pointer"
           )}
             onClick={() => !hasLoggedMoodToday && onNavigate?.(`/equip-program-flow?id=${SPECIAL_PROGRAM_IDS.DAILY_TRACKER}`)}
           >
             <CardContent className="p-6 flex items-center justify-between">
               <div className="space-y-1">
                 <h3 className="font-semibold text-gray-900">How are you feeling today?</h3>
                 <p className="text-sm text-gray-500">
                   {hasLoggedMoodToday 
                     ? "You've checked in today." 
                     : "Take a moment to reflect."}
                 </p>
               </div>
               
               <div className={cn(
                 "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors",
                 hasLoggedMoodToday ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
               )}>
                 {hasLoggedMoodToday ? <ClipboardCheck size={24} /> : <Moon size={24} />}
               </div>
               
               {/* Background decoration */}
               {hasLoggedMoodToday && (
                 <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                    <ClipboardCheck size={80} />
                 </div>
               )}
             </CardContent>
           </Card>

           {/* D. GOOGLE FIT ACTIVITY CARD */}
           <ActivityCard />

           {/* B. PROGRAM PROGRESS CARD (Conditional) */}
           {activeEnrollment && (activeEnrollment.status === 'completed' || [7, 14, 30].includes(activeEnrollment.current_day_number)) && (
             <Card className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white border-none shadow-lg cursor-pointer md:col-span-2 relative overflow-hidden group"
               onClick={handleManualCheckIn}
             >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Activity size={120} />
                </div>
                <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                     <div className="flex items-center gap-2 mb-2">
                       <Badge className="bg-white/20 text-white hover:bg-white/30 border-none">
                         Check-in Ready
                       </Badge>
                     </div>
                     <h3 className="text-xl font-semibold">How is this program working for you?</h3>
                     <p className="text-indigo-100 max-w-md">
                       We're checking in to make sure you're getting the most out of {activeProgram?.title || 'your journey'}.
                     </p>
                  </div>
                  <Button className="bg-white text-indigo-900 hover:bg-indigo-50 shrink-0">
                    Check Progress
                  </Button>
                </CardContent>
             </Card>
           )}

           {/* C. RE-CHECK ASSESSMENT CARD (Conditional) */}
           {reassessment.isOpen && reassessment.reason !== 'manual' && (
              <Card className="bg-orange-50 border-orange-100 md:col-span-2 cursor-pointer hover:bg-orange-100/80 transition-colors">
                <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                   <div className="flex items-center gap-4 flex-1">
                     <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                       <Activity size={20} />
                     </div>
                     <div>
                        <h3 className="font-semibold text-orange-900">Want to check where you are now?</h3>
                        <p className="text-sm text-orange-700 mt-1">
                          You’ve made some changes since your last check. Retaking this assessment can help us understand what’s helping and what to adjust.
                        </p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                     <Button 
                       variant="ghost" 
                       className="text-orange-700 hover:text-orange-900 hover:bg-orange-200 flex-1 sm:flex-none"
                       onClick={handleReassessmentClose}
                     >
                       Not now
                     </Button>
                     <Button 
                       className="bg-orange-600 hover:bg-orange-700 text-white border-none flex-1 sm:flex-none"
                       onClick={handleReassessmentConfirm}
                     >
                       Retake assessment
                     </Button>
                   </div>
                </CardContent>
              </Card>
           )}
        </div>
      </section>

      {/* Quick Actions (Legacy/Secondary) */}
      <section>
        <h3 className="font-medium text-[var(--color-text-primary)] mb-4">Resources</h3>
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => onNavigate?.('/consultation')}
            className="bg-[var(--color-status-success-light)] p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-emerald-100 transition-colors border border-transparent hover:border-emerald-200"
          >
             <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-[var(--color-status-success)]">
               <Calendar className="w-5 h-5" />
             </div>
             <div>
               <span className="block font-medium text-[var(--color-status-success)]">Book Session</span>
               <span className="text-xs text-[var(--color-text-muted)]">Talk to a professional</span>
             </div>
          </div>
          
          <div 
             onClick={() => onNavigate?.('/library')}
             className="bg-gray-100 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-gray-200 transition-colors"
          >
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600">
               <BookOpen className="w-5 h-5" />
             </div>
             <div>
               <span className="block font-medium text-gray-900">Library</span>
               <span className="text-xs text-gray-500">Read articles</span>
             </div>
          </div>
        </div>
      </section>


      {/* Program Check-in Modal */}
      {checkInProgram && (
        <ProgramCheckIn
          programId={checkInProgram.id}
          programTitle={checkInProgram.title}
          currentDay={checkInProgram.day}
          isOpen={showCheckIn}
          onClose={() => setShowCheckIn(false)}
        />
      )}
      {/* Reassessment Prompt - Manual Only */}
      <ReassessmentPrompt 
        isOpen={reassessment.isOpen && reassessment.reason === 'manual'}
        onClose={handleReassessmentClose}
        onConfirm={handleReassessmentConfirm}
      />
    </div>
  );
}
