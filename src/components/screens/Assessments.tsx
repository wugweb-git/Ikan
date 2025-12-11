import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { AssessmentFlow } from './AssessmentFlow';
import { AssessmentResults } from './AssessmentResults';
import { Icon } from '../Icon';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../ui/utils';
import { assessmentsData } from '../../lib/sample-data/assessments';
import { apiClient } from '../../lib/api-client';

interface Assessment {
  id: string;
  slug: string;
  title: string;
  description: string;
  estimatedTime: string;
  questionCount: number;
  status: 'available' | 'in-progress' | 'completed';
  lastCompletedDate?: string;
  category: 'anxiety' | 'depression' | 'stress' | 'wellness' | 'burnout' | 'sleep' | 'work-life';
  metadata?: any;
  questions?: any[];
}

// Function to transform assessment data from the new format
const transformAssessmentData = (data: any, userHistory?: Record<string, any>): Assessment => {
  const assessmentId = data.slug || data.id;
  const userResponse = userHistory?.[assessmentId] || userHistory?.[data.assessment_id];
  
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

  return {
    id: assessmentId,
    slug: data.slug,
    title: data.title,
    description: data.description,
    estimatedTime: `${data.metadata?.estimated_minutes || 3} minutes`,
    questionCount: data.questions?.length || 0,
    status,
    lastCompletedDate,
    category: data.metadata?.category || 'wellness',
    metadata: data.metadata,
    questions: data.questions
  };
};

interface AssessmentsProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

type ViewState = 'list' | 'landing' | 'flow' | 'results';
type TabState = 'catalogue' | 'history';

// Helper to get Unsplash images
const getAssessmentImage = (category: string) => {
  const normalizedCategory = category.toLowerCase();
  if (normalizedCategory.includes('anxiety')) return "https://images.unsplash.com/photo-1702032773321-afc433d91ce8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwcGVhY2VmdWwlMjBtaW5kJTIwc2VyZW5lJTIwd2F0ZXJ8ZW58MXx8fHwxNzY1NDU5MTU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
  if (normalizedCategory.includes('depression')) return "https://images.unsplash.com/photo-1600262912301-d288169c6cda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3BlJTIwc3Vuc2hpbmUlMjBjbG91ZHN8ZW58MXx8fHwxNzY1NDU5MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
  if (normalizedCategory.includes('stress')) return "https://images.unsplash.com/photo-1676386749756-1987d8a0e32a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwcGVhY2VmdWwlMjBuYXR1cmUlMjBzdHJlc3MlMjByZWxpZWZ8ZW58MXx8fHwxNzY1NDU4MzIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
  if (normalizedCategory.includes('burnout')) return "https://images.unsplash.com/photo-1564341505027-b410c159e1b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5yaXNlJTIwZW5lcmd5fGVufDF8fHx8MTc2NTQ1ODM0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
  if (normalizedCategory.includes('sleep')) return "https://images.unsplash.com/photo-1743748978909-169017ab0720?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMHNsZWVwJTIwYmVkfGVufDF8fHx8MTc2NTQ1ODMxOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
  if (normalizedCategory.includes('work')) return "https://images.unsplash.com/photo-1698047682320-1ea97303dbd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JrJTIwbGlmZSUyMGJhbGFuY2UlMjBsYXB0b3AlMjBuYXR1cmV8ZW58MXx8fHwxNzY1NDU5MTY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
  
  // Default/General
  return "https://images.unsplash.com/photo-1758274539447-a675587a2b6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbGlmZXN0eWxlJTIwYmFsYW5jZSUyMG5hdHVyZXxlbnwxfHx8fDE3NjU0NTkxNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
};

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
  const [currentTab, setCurrentTab] = useState<TabState>('catalogue');

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
    const loadAssessments = async () => {
      try {
        // 1. Initial load from hardcoded data
        const initialAssessments = assessmentsData.assessments.map(data => transformAssessmentData(data, {}));
        
        // 2. Fetch assessments from API (KV store)
        let apiAssessments: Assessment[] = [];
        try {
          const response = await apiClient.getAssessments();
          if (response && response.assessments) {
            apiAssessments = response.assessments;
          }
        } catch (error) {
          console.warn('Failed to fetch API assessments, falling back to local only', error);
        }

        // 3. Merge: API assessments take precedence if they share the same ID/Slug
        const mergedAssessmentsMap = new Map<string, Assessment>();
        
        // Add hardcoded first
        initialAssessments.forEach(a => mergedAssessmentsMap.set(a.id, a));
        
        // Add/Overwrite with API assessments
        apiAssessments.forEach(a => mergedAssessmentsMap.set(a.id, a));
        
        let finalAssessments = Array.from(mergedAssessmentsMap.values());
        
        // Filter to show the main clinical assessments or custom ones
        // We include anything that is in the "clinical" list OR any custom ones (that might not be in that list)
        // Actually, let's just show all available assessments for now, or filter by category if needed.
        // For now, let's just keep the filter if it exists in the clinical list, BUT allow new ones if they don't match the list but are valid.
        
        // Simpler logic: If it's from API, show it. If it's local, show it if it matches the list.
        finalAssessments = finalAssessments.filter(assessment => {
           // If it came from the API (we can check if it exists in apiAssessments), show it
           const isFromApi = apiAssessments.some(apiA => apiA.id === assessment.id);
           if (isFromApi) return true;
           
           // Otherwise apply the hardcoded filter
           return ['general-health', 'anxiety', 'depression', 'stress', 'burnout', 'sleep', 'work-life'].includes(assessment.slug);
        });
        
        setAssessments(finalAssessments);
        setLoading(false);

        // Background: Load user assessment history if authenticated
        if (user) {
          setTimeout(async () => {
            try {
              const historyResponse = await apiClient.getUserAssessmentResponses();
              
              if (historyResponse && historyResponse.responses) {
                const { responses } = historyResponse;
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
  }, [showToast, user]);

  const handleStartAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    try {
      localStorage.setItem('ikan-selected-assessment', JSON.stringify(assessment));
    } catch (error) {
      console.warn('Could not store assessment in localStorage:', error);
    }
    
    if (onNavigate) {
      onNavigate('/assessment-landing');
    } else {
      setCurrentView('landing');
    }
  };

  const handleViewLanding = () => {
    if (selectedAssessment) {
      try {
        localStorage.setItem('ikan-selected-assessment', JSON.stringify(selectedAssessment));
      } catch (error) {
        console.warn('Could not store assessment in localStorage:', error);
      }
    }
    
    if (onNavigate) {
      onNavigate('/assessment-landing');
    } else {
      setShowDisclaimerModal(true);
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
    setAssessmentResults(results);
    setCurrentView('results');
    
    if (user && selectedAssessment) {
      try {
        const historyResponse = await apiClient.getUserAssessmentResponses();
        if (historyResponse && historyResponse.responses) {
          const { responses } = historyResponse;
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Anxiety': return 'var(--color-status-warning)';
      case 'Depression': return 'var(--color-status-info)';
      case 'Stress': return 'var(--color-status-danger)';
      case 'Burnout': return 'var(--color-status-danger)';
      case 'General': return 'var(--color-primary-default)';
      case 'Worklife Balance': return 'var(--color-status-success)';
      default: return 'var(--color-text-muted)';
    }
  };

  // Assessment Landing Page View
  if (currentView === 'landing' && selectedAssessment) {
    return (
      <>
        <div className={cn("space-y-6 pb-20 md:pb-6 pt-24 lg:pt-36", className)}>
          <Button
            variant="ghost"
            onClick={handleReturnToList}
            className="gap-2"
          >
            <Icon name="arrowLeft" size={16} />
            Back to Assessments
          </Button>

          <div className="space-y-2">
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-semibold)' }}>
              {selectedAssessment.title}
            </h1>
            <p className="text-muted-foreground">
              Learn more about this assessment before you begin
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Icon name="clipboard" size={24} style={{ color: getCategoryColor(selectedAssessment.category) }} />
                {selectedAssessment.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-base font-medium">About This Assessment</h3>
                <p className="text-muted-foreground">{selectedAssessment.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <Icon name="clock" size={20} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Time Required</p>
                    <p className="text-xs text-muted-foreground">{selectedAssessment.estimatedTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <Icon name="list" size={20} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Questions</p>
                    <p className="text-xs text-muted-foreground">{selectedAssessment.questionCount} questions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <Icon name="tag" size={20} style={{ color: getCategoryColor(selectedAssessment.category) }} />
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-xs" style={{ color: getCategoryColor(selectedAssessment.category) }}>{selectedAssessment.category}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleViewLanding} className="w-full gap-2 text-base h-12">
                  <Icon name="play" size={20} />
                  Begin Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
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
                  <Icon name="info" size={20} className="text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="text-base font-medium">Not a medical diagnosis</h4>
                    <p className="text-sm text-muted-foreground">For informational purposes only. Consult a professional for diagnosis.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="lock" size={20} className="text-green-500 mt-0.5" />
                  <div>
                    <h4 className="text-base font-medium">Privacy Protected</h4>
                    <p className="text-sm text-muted-foreground">All responses are encrypted and stored securely.</p>
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
      <div className={cn("w-full pt-24 lg:pt-36", className)}>
        <div className="space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-primary font-base">
              Health Assessments
            </h1>
            <p className="text-muted-foreground font-base">
              Assessment Programs
            </p>
          </div>

          {/* Hero Section */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 min-h-[300px] flex items-center">
             <div className="absolute inset-0 z-0">
               <img 
                 src="https://images.unsplash.com/photo-1758274539447-a675587a2b6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbGlmZXN0eWxlJTIwYmFsYW5jZSUyMG5hdHVyZXxlbnwxfHx8fDE3NjU0NTkxNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                 alt="Wellness"
                 className="w-full h-full object-cover opacity-80"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-transparent"></div>
             </div>
             
             <div className="relative z-10 p-8 md:p-12 max-w-xl space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
                  Quick and easy mental health screenings.
                </h2>
                <p className="text-lg text-gray-700">
                  Check your mental health anytime, anywhere with iKan’s effortless assessments.
                </p>
                <Button 
                  className="mt-4 gap-2"
                  onClick={() => {
                    const el = document.getElementById('assessments-grid');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Start Assessment
                  <Icon name="arrowDown" size={16} />
                </Button>
             </div>
          </div>

          <div id="assessments-grid" className="scroll-mt-32" />
          
          {/* Content */}
          {!user && currentTab === 'history' ? (
            <Card>
              <CardContent className="text-center p-6">
                <Icon name="lock" size={24} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Please sign in to view your assessment history</p>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] bg-muted animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assessments.filter(assessment => {
                const hasHistory = userAssessmentHistory[assessment.id];
                if (currentTab === 'history' && !hasHistory) return false;
                return true;
              }).map((assessment, index) => {
                const isCompleted = assessment.status === 'completed' && userAssessmentHistory[assessment.id];
                const imageUrl = getAssessmentImage(assessment.category);

                return (
                  <div key={assessment.id} className="group h-full">
                    {/* Desktop Card Layout (using EquipPrograms style) */}
                    <div className="hidden md:block h-full">
                      <Card 
                        className="relative overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer h-full flex flex-col"
                        style={{
                          backgroundColor: 'var(--color-bg-card)',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--color-border-default)'
                        }}
                        onClick={() => {
                           if (isCompleted) {
                             // Show previous results logic
                             const userResponse = userAssessmentHistory[assessment.id];
                             const mockResults = {
                               assessmentId: assessment.id,
                               assessmentTitle: assessment.title,
                               score: userResponse.score || 0,
                               maxScore: 21,
                               interpretation: userResponse.interpretation || {
                                 label: 'Previous Result',
                                 description: 'Your previous assessment results.',
                                 icon: 'info',
                                 recommendations: ['Continue practicing healthy coping strategies']
                               },
                               completedAt: userResponse.completed_at,
                               equipProgramSuggestion: { title: 'Recommended Program', route: '/equip-programs' }
                             };
                             setAssessmentResults(mockResults);
                             setCurrentView('results');
                           } else {
                             handleStartAssessment(assessment);
                           }
                        }}
                      >
                        <div className="flex flex-col p-6 h-full gap-6">
                          {/* Top: Category */}
                          <div className="space-y-2">
                             <p 
                               className="text-xs uppercase tracking-widest font-semibold"
                               style={{ 
                                 color: isCompleted ? 'var(--color-status-success)' : 'var(--color-text-primary)',
                                 fontFamily: 'var(--font-family-base)'
                               }}
                             >
                               {isCompleted ? 'COMPLETED' : assessment.category}
                             </p>
                             <h3 
                               className="text-3xl font-semibold text-primary"
                               style={{ fontFamily: 'var(--font-family-base)' }}
                             >
                               {assessment.title}
                             </h3>
                          </div>

                          {/* Summary */}
                          <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                            {assessment.description}
                          </p>

                          {/* Bottom Section */}
                          <div className="flex gap-4 items-end mt-auto">
                            {/* Image */}
                            <div className="w-32 h-32 shrink-0 rounded-lg overflow-hidden bg-muted">
                              <img 
                                src={imageUrl} 
                                alt={assessment.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Info & CTA */}
                            <div className="flex flex-col gap-3 flex-grow">
                               <div className="flex items-center gap-2 text-sm font-medium">
                                  <Icon name="clock" size={16} />
                                  <span>{assessment.estimatedTime}</span>
                               </div>
                               <div className="flex items-center gap-2 text-sm font-medium">
                                  <Icon name="list" size={16} />
                                  <span>{assessment.questionCount} Questions</span>
                               </div>

                               <Button
                                 className="w-full mt-2 gap-2"
                                 style={{
                                   backgroundColor: isCompleted ? 'var(--color-status-success)' : '#2A2A2A',
                                   color: 'white'
                                 }}
                               >
                                 <Icon name="arrowRight" size={16} className="text-white" />
                                 {isCompleted ? 'VIEW RESULTS' : 'TAKE TEST'}
                               </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Mobile Layout */}
                    <div className="block md:hidden">
                       <Card 
                         className="cursor-pointer hover:shadow-md transition-shadow"
                         onClick={() => isCompleted ? null : handleStartAssessment(assessment)}
                       >
                         <CardHeader>
                           <div className="flex justify-between items-start">
                             <CardTitle className="text-xl">{assessment.title}</CardTitle>
                             {isCompleted && <Badge className="bg-green-500">Completed</Badge>}
                           </div>
                           <Badge variant="secondary" className="text-xs">{assessment.category}</Badge>
                         </CardHeader>
                         <CardContent className="space-y-4">
                           <div className="w-full h-40 rounded-lg overflow-hidden mb-4">
                             <img src={imageUrl} alt={assessment.title} className="w-full h-full object-cover" />
                           </div>
                           <p className="text-sm text-muted-foreground line-clamp-3">{assessment.description}</p>
                           <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Icon name="clock" size={16} className="mr-1" />
                                {assessment.estimatedTime}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Icon name="list" size={16} className="mr-1" />
                                {assessment.questionCount} Qs
                              </div>
                           </div>
                           <Button 
                             className="w-full mt-4" 
                             variant={isCompleted ? "default" : "outline"}
                             style={{ backgroundColor: isCompleted ? 'var(--color-status-success)' : undefined }}
                           >
                             {isCompleted ? 'View Results' : 'Take Test'}
                           </Button>
                         </CardContent>
                       </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {assessments.length === 0 && !loading && (
             <div className="text-center py-12">
               <Icon name="clipboard" size={48} className="mx-auto text-muted-foreground mb-4" />
               <h3 className="text-lg font-medium text-primary">No Assessments Available</h3>
             </div>
          )}
        </div>
      </div>
    );
  }

  // Assessment Flow View
  if (currentView === 'flow' && selectedAssessment) {
    return (
      <div className="space-y-4 pt-24 lg:pt-36">
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
  if (currentView === 'results' && assessmentResults) {
    return (
      <div className="space-y-4 pt-24 lg:pt-36">
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
          results={assessmentResults}
          onReturnToDashboard={handleReturnToList}
        />
      </div>
    );
  }

  return null;
}