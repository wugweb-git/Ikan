import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Icon } from '../ui/Icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Clock, FileText, Brain, Shield, Activity, Play, Lock, CircleHelp } from 'lucide-react';
import { useAuth } from '../../../shared/state/AuthContext';
import { useNotifications } from '../../../shared/state/NotificationContext';
import { cn } from '../ui/utils';
import { apiClient } from '../../../shared/api/api';
import { AssessmentFlow } from './AssessmentFlow';
import { AssessmentResults } from './AssessmentResults';
import { evaluateAssessment } from '../engines/recommendation-engine';
import { Skeleton } from '../ui/skeleton-loader';

interface Assessment {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** Authored minutes, or null. `estimatedTime` (a pre-formatted string) is
   *  gone: it forced every consumer to parse English back out of it. */
  durationMinutes: number | null;
  /** Item count from `questions.length`, or null. */
  questionCount: number | null;
  status: 'available' | 'in-progress' | 'completed';
  lastCompletedDate?: string;
  category: string;
  metadata?: any;
  questions?: any[];
  /** Authored image, or null. `getAssessmentImage` decides the last resort. */
  imageUrl?: string | null;
  processSteps?: string[];
  safetyNote?: string;
  resultDescription?: string;
  tile1Content?: string;
  tile2Content?: string;
  tile3Content?: string;
  tile4Content?: string;
  tile5Content?: string;
  published?: boolean;
}

// Function to transform assessment data from the new format
const transformAssessmentData = (data: any, userHistory?: Record<string, any>): Assessment => {
  const assessmentId = data.id || data.assessment_id || data.slug;
  const userResponse = userHistory?.[assessmentId] || (data.assessment_id ? userHistory?.[data.assessment_id] : undefined);
  
  let status: 'available' | 'in-progress' | 'completed' = 'available';
  let lastCompletedDate: string | undefined;
  
  if (userResponse) {
    if (userResponse.status === 'completed' && userResponse.completed_at) {
      status = 'completed';
      lastCompletedDate = userResponse.completed_at;
    } else if (userResponse.status === 'in_progress') {
      status = 'in-progress';
    }
  }

  // Extract content for Bento Grid
  // Tile 3: Process Steps
  const processSteps = data.section1_eligibility_points || 
                       data.metadata?.section1_eligibility_points || 
                       data.process_steps ||
                       [];

  // Tile 5: Safety Note
  const safetyNote = data.notes?.[0] || 
                     data.metadata?.notes?.[0] || 
                     data.safety_note || 
                     "This is a screening tool, not a medical diagnosis.";

  // Tile 4: Result Description
  const resultDescription = data.section3_content?.[0] || 
                            data.metadata?.section3_content?.[0] ||
                            "Upon completion, you'll receive a detailed breakdown of your results.";

  // Fallback for missing questions on known assessments (Critical for demo stability)
  const questions = data.questions || [];
  
  return {
    id: assessmentId,
    slug: data.slug || assessmentId,
    title: data.title,
    description: data.description,
    // One source for both, and no defaults. This used to read
    // `duration || estimated_minutes || 3`, so an assessment with no authored
    // duration advertised "3 minutes" here and "5 minutes" on its own detail
    // page. `estimated_minutes` is null on all seven records and always was.
    durationMinutes: assessmentMeta({ questions, duration: data.duration }).minutes,
    questionCount: assessmentMeta({ questions, duration: data.duration }).count,
    status,
    lastCompletedDate,
    category: data.category || data.metadata?.category || 'wellness',
    metadata: data.metadata,
    questions: questions,
    imageUrl: assessmentImage(data),
    processSteps,
    safetyNote,
    resultDescription,
    tile1Content: data.metadata?.tile1_content,
    tile2Content: data.metadata?.tile2_content,
    tile3Content: data.metadata?.tile3_content,
    tile4Content: data.metadata?.tile4_content,
    tile5Content: data.metadata?.tile5_content,
    published: data.published !== false
  };
};

interface AssessmentsProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

type ViewState = 'list' | 'landing' | 'flow' | 'results';
type TabState = 'catalogue' | 'history';

// Helper to get Unsplash images
const getAssessmentImage = (category?: string, customImage?: string | null) => {
  if (customImage) return customImage;

  const normalizedCategory = (category || 'wellness').toLowerCase();
  // Using Unsplash source for placeholders as requested in audit
  if (normalizedCategory.includes('anxiety')) return "https://images.unsplash.com/photo-1702032773321-afc433d91ce8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwcGVhY2VmdWwlMjBtaW5kJTIwc2VyZW5lJTIwd2F0ZXJ8ZW58MXx8fHwxNzY1NDU5MTU1fDA&ixlib=rb-4.1.0&q=80&w=1080";
  if (normalizedCategory.includes('depression')) return "https://images.unsplash.com/photo-1600262912301-d288169c6cda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3BlJTIwc3Vuc2hpbmUlMjBjbG91ZHN8ZW58MXx8fHwxNzY1NDU5MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080";
  if (normalizedCategory.includes('stress')) return "https://images.unsplash.com/photo-1676386749756-1987d8a0e32a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwcGVhY2VmdWwlMjBuYXR1cmUlMjBzdHJlc3MlMjByZWxpZWZ8ZW58MXx8fHwxNzY1NDU4MzIzfDA&ixlib=rb-4.1.0&q=80&w=1080";
  if (normalizedCategory.includes('burnout')) return "https://images.unsplash.com/photo-1564341505027-b410c159e1b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5yaXNlJTIwZW5lcmd5fGVufDF8fHx8MTc2NTQ1ODM0Mnww&ixlib=rb-4.1.0&q=80&w=1080";
  if (normalizedCategory.includes('sleep')) return "https://images.unsplash.com/photo-1743748978909-169017ab0720?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMHNsZWVwJTIwYmVkfGVufDF8fHx8MTc2NTQ1ODMxOHww&ixlib=rb-4.1.0&q=80&w=1080";
  if (normalizedCategory.includes('work')) return "https://images.unsplash.com/photo-1698047682320-1ea97303dbd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JrJTIwbGlmZSUyMGJhbGFuY2UlMjBsYXB0b3AlMjBuYXR1cmV8ZW58MXx8fHwxNzY1NDU5MTY4fDA&ixlib=rb-4.1.0&q=80&w=1080";
  
  // Default/General
  return "https://images.unsplash.com/photo-1758274539447-a675587a2b6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbGlmZXN0eWxlJTIwYmFsYW5jZSUyMG5hdHVyZXxlbnwxfHx8fDE3NjU0NTkxNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080";
};

import { PageHero } from '../ui/PageHero';
import { AssessmentCard } from './AssessmentCard';
import { assessmentMeta, assessmentImage } from './assessment-meta';

export function Assessments({ className, onNavigate }: AssessmentsProps) {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [currentView, setCurrentView] = useState<ViewState>('list');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [userAssessmentHistory, setUserAssessmentHistory] = useState<Record<string, any>>({});
  /**
   * Runs saved but not finished, keyed by assessment id.
   *
   * Partial save has worked since B5 and there was no way to find out: the
   * draft was written and read only inside the player, so the one place a user
   * could have resumed from was the one place they could not get to without
   * starting again. A feature nobody can see is a feature nobody has.
   */
  const [drafts, setDrafts] = useState<Record<string, any>>({});
  const [currentTab, setCurrentTab] = useState<TabState>('catalogue');

  // Load hero banner from admin config
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await apiClient.getAssessmentDrafts().catch(() => []);
      if (cancelled) return;
      const byId: Record<string, any> = {};
      for (const d of rows) {
        const answered = d?.responses ? Object.keys(d.responses).length : 0;
        // A draft with no answers is not a run in progress, it is a page that
        // was opened. Offering to resume it would be noise.
        if (d?.assessment_id && answered > 0) byId[d.assessment_id] = { ...d, answered };
      }
      setDrafts(byId);
    })();
    return () => { cancelled = true; };
  }, []);

  // Handle tab state based on authentication
  useEffect(() => {
    if (!user && currentTab === 'history') {
      setCurrentTab('catalogue');
    }
  }, [user, currentTab]);

  // Check if we need to start assessment from landing page
  useEffect(() => {
    const shouldStartFromLanding = localStorage.getItem('ikan-start-assessment-from-landing');
    if (shouldStartFromLanding === 'true') {
      localStorage.removeItem('ikan-start-assessment-from-landing');
      
      // Get stored assessment and start the flow
      try {
        const storedAssessment = localStorage.getItem('ikan-selected-assessment');
        if (storedAssessment) {
          const assessment = JSON.parse(storedAssessment);
          setSelectedAssessment(assessment);
          setShowDisclaimerModal(true);
        }
      } catch (error) {
        console.warn('Could not retrieve stored assessment:', error);
      }
    }
  }, [currentView]);

  // Fast loading of assessments with background history fetch
  useEffect(() => {
    let isMounted = true;

    const loadAssessments = async () => {
      try {
        // Fetch assessments from API (KV store)
        let apiAssessments: Assessment[] = [];
        try {
          const response = await apiClient.getAssessments();
          if (!isMounted) return;
          // Handle both array and object response formats for robustness
          const data = Array.isArray(response) ? response : (response?.assessments || []);
          
          if (Array.isArray(data)) {
            console.log(`📋 Fetched ${data.length} assessments raw`);
            
            // Remove duplicates based on assessment_id or slug
            const uniqueAssessments = data.reduce((acc: any[], current: any) => {
              const id = current.slug || current.assessment_id || current.id;
              
              if (!id) return acc; // Skip invalid items

              const exists = acc.find((item: any) => {
                const itemId = item.slug || item.assessment_id || item.id;
                return itemId === id;
              });
              
              if (!exists) {
                acc.push(current);
              }
              return acc;
            }, []);
            
            console.log(`📋 Processed ${uniqueAssessments.length} unique assessments`);
            
            apiAssessments = uniqueAssessments.map((a: any) => 
              transformAssessmentData(a, {})
            );
            
            setAssessments(apiAssessments);
          } else {
            console.warn('Assessments response was not an array:', response);
            setAssessments([]);
          }
        } catch (error) {
          console.warn('Failed to fetch API assessments:', error);
          showToast('error', 'Connection Error', 'Failed to load assessments. Please try again later.');
          setAssessments([]);
        }

        setLoading(false);

        // Background: Load user assessment history if authenticated
        if (user) {
          setTimeout(async () => {
            try {
              const historyResponse = await apiClient.getUserAssessmentResponses();
              
              if (historyResponse && (historyResponse.responses || historyResponse.history)) {
                const responses = historyResponse.responses || historyResponse.history || [];
                const historyMap: Record<string, any> = {};
                
                responses.forEach((response: any) => {
                  if (!historyMap[response.assessment_id] || 
                      new Date(response.completed_at || response.started_at) > new Date(historyMap[response.assessment_id].completed_at || historyMap[response.assessment_id].started_at)) {
                    historyMap[response.assessment_id] = response;
                  }
                });
                
                setUserAssessmentHistory(historyMap);
                
                // Update assessments with history data
                // We need to re-merge to update the status
                setAssessments(prev => prev.map(a => {
                   const userResponse = historyMap[a.id] || historyMap[a.slug];
                   if (userResponse) {
                      let status: 'available' | 'in-progress' | 'completed' = 'available';
                      let lastCompletedDate: string | undefined;
                      if (userResponse.status === 'completed' && userResponse.completed_at) {
                        status = 'completed';
                        lastCompletedDate = userResponse.completed_at;
                      } else if (userResponse.status === 'in_progress') {
                        status = 'in-progress';
                      }
                      return { ...a, status, lastCompletedDate };
                   }
                   return a;
                }));
              }
            } catch (historyError) {
              console.log('Background assessment history load failed:', historyError);
            }
          }, 100);
        }
        
      } catch (error) {
        console.error('Error loading assessments:', error);
        showToast('error', 'Failed to load assessments', 'Please try refreshing the page.');
        setLoading(false);
      }
    };

    loadAssessments();

    return () => {
      isMounted = false;
    };
  }, [showToast, user]);

  const handleStartAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    try {
      localStorage.setItem('ikan-selected-assessment', JSON.stringify(assessment));
    } catch (error) {
      console.warn('Could not store assessment in localStorage:', error);
    }
    
    if (onNavigate) {
      onNavigate(assessment.slug ? `/assessment/${assessment.slug}` : `/assessment-detail?id=${assessment.id}`);
    } else {
      setCurrentView('landing');
    }
  };

  const handleDisclaimerAccept = () => {
    setShowDisclaimerModal(false);
    setCurrentView('flow');
  };

  const handleDisclaimerCancel = () => {
    setShowDisclaimerModal(false);
  };

  const handleAssessmentComplete = async (results: any) => {
    // Run Recommendation Engine
    const score = results.score || 0;
    const maxScore = results.maxScore || 0;
    
    const recommendation = evaluateAssessment({
      slug: selectedAssessment?.slug || selectedAssessment?.id || '',
      category: (selectedAssessment as any)?.category,
      score,
      maxScore,
      scoringProfileId: (selectedAssessment as any)?.scoring_profile_id,
    });
    
    setAssessmentResults({ ...results, recommendation });
    setCurrentView('results');
    
    if (user && selectedAssessment) {
      try {
        const historyResponse = await apiClient.getUserAssessmentResponses();
        if (historyResponse && (historyResponse.responses || historyResponse.history)) {
          const responses = historyResponse.responses || historyResponse.history || [];
          const historyMap: Record<string, any> = {};
          responses.forEach((response: any) => {
            if (!historyMap[response.assessment_id] || 
                new Date(response.completed_at || response.started_at) > new Date(historyMap[response.assessment_id].completed_at || historyMap[response.assessment_id].started_at)) {
              historyMap[response.assessment_id] = response;
            }
          });
          setUserAssessmentHistory(historyMap);
          setAssessments(prev => prev.map(assessment => {
            if (assessment.id === selectedAssessment.id) {
              return {
                ...assessment,
                status: 'completed' as const,
                lastCompletedDate: new Date().toISOString()
              };
            }
            return assessment;
          }));
        }
      } catch (error) {
        console.error('Failed to refresh assessment history:', error);
      }
    }
  };

  const handleReturnToList = () => {
    setCurrentView('list');
    setSelectedAssessment(null);
    setAssessmentResults(null);
    setShowDisclaimerModal(false);
  };

  // Assessment Landing Page View
  if (currentView === 'landing' && selectedAssessment) {
    const imageUrl = getAssessmentImage(selectedAssessment.category, selectedAssessment.imageUrl);
    
    return (
      <>
        <div className={cn("w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6", className)}>
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            onClick={handleReturnToList}
            className="w-fit gap-2 pl-0 hover:bg-transparent hover:text-[var(--color-primary-default)]"
          >
            <Icon name="arrowLeft" size={20} />
            <span className="text-lg">Back to Assessments</span>
          </Button>
          
          <div>
            <Badge variant="outline" className="mb-3 px-3 py-1 text-sm font-medium uppercase tracking-wider">
              {selectedAssessment.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-medium text-[var(--color-text-primary)]">
              {selectedAssessment.title}
            </h1>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-min">
          
          {/* TILE 1: Primary (Large Left) - What is this? */}
          <div className="md:col-span-7 rounded-[var(--radius-lg)] p-6 md:p-10 flex flex-col justify-between min-h-[320px] shadow-sm relative overflow-hidden group" style={{ backgroundColor: 'var(--color-bg-card)' }}>
            <div className="relative z-10">
               {selectedAssessment.tile1Content ? (
                  <div className="prose prose-lg max-w-none text-[var(--color-text-muted)] [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_img]:rounded-lg [&_img]:max-w-full [&_a]:text-[var(--color-status-info)] [&_a]:underline" dangerouslySetInnerHTML={{ __html: selectedAssessment.tile1Content }} />
               ) : (
                 <div className="space-y-6">
                   <div>
                     <h2 className="text-2xl font-medium mb-4 text-[var(--color-text-primary)]">What is this assessment?</h2>
                     <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
                       {selectedAssessment.description}
                     </p>
                   </div>
                   
                   <div className="flex flex-wrap gap-4 pt-2">
                     {selectedAssessment.durationMinutes !== null && (
                       <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                         <Clock size={18} style={{ color: 'var(--color-primary-default)' }} />
                         <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{selectedAssessment.durationMinutes} minutes</span>
                       </div>
                     )}
                     {selectedAssessment.questionCount !== null && (
                       <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                         <CircleHelp size={18} style={{ color: 'var(--color-primary-default)' }} />
                         <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{selectedAssessment.questionCount} Questions</span>
                       </div>
                     )}
                   </div>
                 </div>
               )}
            </div>

            <div className="pt-8 relative z-10">
              <Button 
                onClick={() => {
                  if (onNavigate) {
                    onNavigate(`/assessment-flow?id=${selectedAssessment?.id || selectedAssessment?.slug}`);
                  } else {
                    setShowDisclaimerModal(true);
                  }
                }} 
                className="w-full md:w-auto text-base h-12 px-8 rounded-full gap-2 shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: 'var(--color-primary-default)', color: 'white' }}
              >
                <Play size={20} fill="currentColor" />
                Start Assessment
              </Button>
            </div>
            
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-[100px] -z-0 opacity-50" />
          </div>

          {/* TILE 2: Visual (Top Right) */}
          <div className={`md:col-span-5 rounded-[var(--radius-lg)] overflow-hidden min-h-[320px] relative shadow-sm group ${selectedAssessment.tile2Content ? 'p-6 md:p-8' : ''}`} style={{ backgroundColor: selectedAssessment.tile2Content ? 'var(--color-bg-card)' : 'var(--color-bg-muted)' }}>
             {selectedAssessment.tile2Content ? (
               <div className="prose prose-lg max-w-none h-full flex flex-col justify-center [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_img]:rounded-lg [&_img]:max-w-full [&_a]:text-[var(--color-status-info)] [&_a]:underline" dangerouslySetInnerHTML={{ __html: selectedAssessment.tile2Content }} />
             ) : (
               <>
                 <img 
                   src={imageUrl} 
                   alt={selectedAssessment.title}
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                 />
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
               </>
             )}
          </div>

          {/* TILE 3: Process (Bottom Left) - How it works */}
          <div className="md:col-span-5 rounded-[var(--radius-lg)] p-6 md:p-8 shadow-sm flex flex-col justify-center" style={{ backgroundColor: 'var(--color-bg-card)' }}>
             {selectedAssessment.tile3Content ? (
                <div className="prose prose-lg max-w-none [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_img]:rounded-lg [&_img]:max-w-full [&_a]:text-[var(--color-status-info)] [&_a]:underline" dangerouslySetInnerHTML={{ __html: selectedAssessment.tile3Content }} />
             ) : (
               <>
                 <h3 className="text-xl font-medium mb-6 flex items-center gap-2">
                   <Icon name="list" size={24} className="text-[var(--color-primary-default)]" />
                   How it works
                 </h3>
                 <ul className="space-y-4">
                   {(selectedAssessment.processSteps && selectedAssessment.processSteps.length > 0 ? selectedAssessment.processSteps : [
                     `Answer ${selectedAssessment.questionCount} simple questions honestly`,
                     "Your responses are private & secure",
                     "Receive immediate insights & guidance"
                   ]).map((text, i) => (
                     <li key={i} className="flex items-start gap-3">
                       <div className="mt-0.5 p-1 rounded-full" style={{ backgroundColor: 'var(--color-status-success-light)', color: 'var(--color-status-success)' }}>
                         <Icon name="check" size={14} />
                       </div>
                       <span className="text-[var(--color-text-muted)]">{text}</span>
                     </li>
                   ))}
                 </ul>
               </>
             )}
          </div>

          {/* TILE 5: Safety (Mini Middle) - Important Notes */}
          <div className="md:col-span-2 rounded-[var(--radius-lg)] p-6 flex flex-col items-center justify-center text-center shadow-sm" style={{ backgroundColor: 'var(--color-status-warning-light)', border: '1px solid var(--color-border-default)' }}>
             {selectedAssessment.tile5Content ? (
                <div className="prose prose-sm max-w-none [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-0.5" style={{ color: 'var(--color-status-warning)' }} dangerouslySetInnerHTML={{ __html: selectedAssessment.tile5Content }} />
             ) : (
               <>
                 <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-status-warning)' }}>
                   <Icon name="info" size={24} />
                 </div>
                 <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Important</p>
                 <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                   {selectedAssessment.safetyNote}
                 </p>
               </>
             )}
          </div>

          {/* TILE 4: Results (Bottom Right) - What you'll see */}
          <div className="md:col-span-5 bg-[var(--color-primary-default)] text-white rounded-[var(--radius-lg)] p-6 md:p-8 shadow-sm flex flex-col justify-center relative overflow-hidden">
             <div className="relative z-10">
               {selectedAssessment.tile4Content ? (
                  <div className="prose prose-lg max-w-none [&_h1]:text-[var(--color-text-inverse)] [&_h2]:text-[var(--color-text-inverse)] [&_h3]:text-[var(--color-text-inverse)] [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_img]:rounded-lg [&_img]:max-w-full [&_a]:underline" style={{ color: 'rgba(255,255,255,0.7)' }} dangerouslySetInnerHTML={{ __html: selectedAssessment.tile4Content }} />
               ) : (
                 <>
                   <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                     <Icon name="activity" size={24} style={{ color: 'var(--color-status-success)' }} />
                     What you'll see
                   </h3>
                   <p className="mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
                     {selectedAssessment.resultDescription}
                   </p>
                   <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                        <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Score</div>
                        <div className="font-medium" style={{ color: 'var(--color-status-success)' }}>Risk</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                        <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Insight</div>
                        <div className="font-medium" style={{ color: 'var(--color-status-info)' }}>Deep</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                        <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Plan</div>
                        <div className="font-medium" style={{ color: 'var(--color-status-info)' }}>Action</div>
                      </div>
                   </div>
                 </>
               )}
             </div>
             
             {/* Abstract background shape */}
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </div>

        </div>
      </div>

        <Dialog open={showDisclaimerModal} onOpenChange={setShowDisclaimerModal}>
          <DialogContent className="max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Important Information</DialogTitle>
              <DialogDescription>Please read this information carefully before proceeding.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Icon name="info" size={20} className="mt-0.5" style={{ color: 'var(--color-status-info)' }} />
                  <div>
                    <h4 className="text-base font-medium">Not a medical diagnosis</h4>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>For informational purposes only. Consult a professional for diagnosis.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="lock" size={20} className="mt-0.5" style={{ color: 'var(--color-status-success)' }} />
                  <div>
                    <h4 className="text-base font-medium">Privacy Protected</h4>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Your responses are sent over an encrypted connection and stored in an access-controlled database.</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleDisclaimerCancel}>Cancel</Button>
              <Button onClick={handleDisclaimerAccept}>I Understand, Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Assessment List View
  if (currentView === 'list') {
    return (
      <div className={cn("w-full", className)}>
        <PageHero 
          title="Health Assessments"
          subtitle="Quick, evidence-based screenings to help you understand your mental well-being."
        />
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
           {[
             {
               title: "Clinical Screenings",
               desc: "Evidence-based tools for anxiety, depression, and more.",
               icon: Brain,
               color: "var(--color-primary-default)",
               bg: "var(--color-bg-muted)"
             },
             {
               title: "Private & Secure",
               desc: "Your results are private to your account and never shared with third parties.",
               icon: Shield,
               color: "var(--color-status-success)",
               bg: "var(--color-status-success-light)"
             },
             {
               title: "Instant Insights",
               desc: "Get immediate feedback and personalized recommendations.",
               icon: Activity,
               color: "var(--color-status-warning)",
               bg: "var(--color-status-warning-light)"
             }
           ].map((item, i) => (
             <Card key={i} className="border-none shadow-sm rounded-[var(--radius-lg)] h-full" style={{ backgroundColor: 'var(--color-bg-card)' }}>
               <CardContent className="p-6 flex flex-col gap-4 h-full">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: item.bg }}>
                   <item.icon size={24} style={{ color: item.color }} />
                 </div>
                 <div>
                   <h3 style={{ fontWeight: 500, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)', marginBottom: 4 }}>{item.title}</h3>
                   <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)', lineHeight: 1.6, fontWeight: 400 }}>
                     {item.desc}
                   </p>
                 </div>
               </CardContent>
             </Card>
           ))}
        </motion.div>

        {/* How it works (Simplified) */}
        

        <div id="assessments-grid" className="scroll-mt-32" />
        
        {/* Assessment Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-[var(--color-text-primary)]">Available Assessments</h3>
          </div>

          {!user && currentTab === 'history' ? (
            <Card className="border-none shadow-sm rounded-[var(--radius-lg)]" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <CardContent className="text-center p-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                  <Lock size={24} className="text-[var(--color-text-muted)]" />
                </div>
                <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">Sign in required</h3>
                <p className="text-[var(--color-text-muted)] mb-6">Please sign in to view your assessment history</p>
                <Button className="bg-[var(--color-primary-default)] text-white">Sign In</Button>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} variant="rectangular" height="320px" className="rounded-[var(--radius-lg)]" />
              ))}
            </div>
          ) : assessments.length === 0 ? (
            <Card className="border-none shadow-sm rounded-[var(--radius-lg)]" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <CardContent className="text-center p-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                  <FileText size={24} className="text-[var(--color-text-muted)]" />
                </div>
                <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">No assessments available</h3>
                <p className="text-[var(--color-text-muted)]">Assessments will appear here once they are published. Please check back later.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {assessments.filter(assessment => {
                const hasHistory = userAssessmentHistory[assessment.id];
                if (currentTab === 'history' && !hasHistory) return false;
                
                // Only show published assessments in catalogue
                if (currentTab === 'catalogue' && !assessment.published) return false;
                
                return true;
              }).map((assessment, index) => {
                const isCompleted = assessment.status === 'completed' && userAssessmentHistory[assessment.id];
                const draft = drafts[assessment.id];
                // Authored image first. Every one of the seven live records carries
                // a thumbnail, and this call passed none — so the catalogue showed a
                // category-keyed stock photo for all of them.
                const imageUrl = getAssessmentImage(assessment.category, assessment.imageUrl);

                return (
                  <AssessmentCard
                    key={assessment.id || index}
                    index={index}
                    variant="full"
                    item={{
                      id: assessment.id,
                      title: assessment.title,
                      description: assessment.description,
                      eyebrow: assessment.category,
                      image: imageUrl,
                      // Null renders no chip. An assessment that has not said
                      // how long it takes does not get a number invented for it.
                      durationLabel: assessment.durationMinutes !== null
                        ? `${assessment.durationMinutes} min` : null,
                      countLabel: assessment.questionCount !== null
                        ? `${assessment.questionCount} questions` : null,
                      completed: !!isCompleted,
                      // An unfinished run outranks both other states: it is the
                      // only one where the user has work to lose.
                      cta: draft && currentTab !== 'history'
                        ? `Resume · ${draft.answered} answered`
                        : currentTab === 'history' && isCompleted
                          ? 'View history'
                          : isCompleted ? 'Retake assessment' : 'Start assessment',
                    }}
                    onSelect={() => {
                      if (currentTab === 'history' && assessment.status === 'completed') {
                        onNavigate?.(`/assessment-history-detail?id=${assessment.id}`);
                      } else {
                        handleStartAssessment(assessment);
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      </div>
    );
  }  // Assessment Flow View
  if (currentView === 'flow' && selectedAssessment) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={handleReturnToList}
          className="gap-2"
          style={{ marginBottom: 'var(--spacing-4)' }}
        >
          <Icon name="arrowLeft" size={16} />
          Back to Assessments
        </Button>
        
        <AssessmentFlow
          assessment={selectedAssessment ? {
            id: selectedAssessment.slug,
            title: selectedAssessment.title,
            description: selectedAssessment.description,
            questions: selectedAssessment.questions || [],
            scoring: {
              type: 'sum' as const,
              ranges: [
                {
                  min: 0,
                  max: 4,
                  label: 'Minimal',
                  interpretation: 'Your responses suggest minimal symptoms. Continue practicing healthy coping strategies.',
                  icon: 'success' as const
                },
                {
                  min: 5,
                  max: 9,
                  label: 'Mild',
                  interpretation: 'Your responses suggest mild symptoms. Consider incorporating stress-reduction techniques into your daily routine.',
                  icon: 'warning' as const
                },
                {
                  min: 10,
                  max: 21,
                  label: 'Moderate to Severe',
                  interpretation: 'Your responses suggest significant symptoms. We recommend speaking with a mental health professional.',
                  icon: 'error' as const
                }
              ]
            }
          } : undefined}
          onComplete={handleAssessmentComplete}
        />
      </div>
    );
  }

  // Assessment Results View
  if (currentView === 'results' && assessmentResults && selectedAssessment) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={handleReturnToList}
          className="gap-2"
          style={{ marginBottom: 'var(--spacing-4)' }}
        >
          <Icon name="arrowLeft" size={16} />
          Back to Assessments
        </Button>
        
        <AssessmentResults
          assessmentId={selectedAssessment.id}
                sectionScores={assessmentResults.sectionScores}
          score={assessmentResults.score}
          maxScore={assessmentResults.maxScore}
          recommendation={assessmentResults.recommendation}
          onNavigate={onNavigate}
          onReturnToDashboard={handleReturnToList}
          onRetake={() => setCurrentView('flow')}
        />
      </div>
    );
  }

  return null;
}