import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Icon } from '../Icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { ChevronRight, Clock, FileText, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../ui/utils';
import { apiClient } from '../../lib/api-client';
import { AssessmentFlow } from './AssessmentFlow';
import { AssessmentResults } from './AssessmentResults';

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
const getAssessmentImage = (category?: string) => {
  const normalizedCategory = (category || 'wellness').toLowerCase();
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
        // Fetch assessments from API (KV store)
        let apiAssessments: Assessment[] = [];
        try {
          const response = await apiClient.getAssessments();
          // getAssessments() already returns the array directly
          if (response && Array.isArray(response)) {
            // Remove duplicates based on assessment_id or slug
            const uniqueAssessments = response.reduce((acc: any[], current: any) => {
              const id = current.slug || current.assessment_id || current.id;
              const exists = acc.find(item => {
                const itemId = item.slug || item.assessment_id || item.id;
                return itemId === id;
              });
              
              if (!exists) {
                acc.push(current);
              }
              return acc;
            }, []);
            
            console.log(`📋 Loaded ${uniqueAssessments.length} unique assessments (removed ${response.length - uniqueAssessments.length} duplicates)`);
            
            apiAssessments = uniqueAssessments.map((a: any) => 
              transformAssessmentData(a, {})
            );
          }
        } catch (error) {
          console.warn('Failed to fetch API assessments:', error);
          showToast('error', 'Failed to load assessments', 'Please try again later.');
        }

        setAssessments(apiAssessments);
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
        <div className={cn("space-y-6 pb-20 md:pb-6", className)}>
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
      <div className={cn("w-full", className)}>
        <div className="space-y-8">
          
          {/* New Hero Content */}
          <div className="space-y-12 pb-8">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl font-medium text-primary">Health Assessments</h1>
              <h2 className="text-2xl font-medium text-primary">Quick and easy mental health screenings.</h2>
              <p className="text-lg text-muted-foreground">
                Check your mental health anytime, anywhere with iKan’s effortless assessments.
              </p>
            </div>

            <div className="space-y-6">
               <h3 className="text-xl font-medium text-primary">What you’ll get.</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6 border-none shadow-sm bg-white h-full">
                    <CardContent className="p-0 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                        <Icon name="clipboard" size={24} className="text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-lg text-primary">Mental Health Screenings</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Including depression, anxiety, insomnia among others
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="p-6 border-none shadow-sm bg-white h-full">
                    <CardContent className="p-0 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                        <Icon name="lock" size={24} className="text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-lg text-primary">Confidential and anonymous</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Only you and those you opt to share it with can access your data. For corporate employees, individual level data is not shared with your employer
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-6 border-none shadow-sm bg-white h-full">
                    <CardContent className="p-0 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                        <Icon name="dashboard" size={24} className="text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-lg text-primary">Analytics Dashboard</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          See results, trends and utilization in real time
                        </p>
                      </div>
                    </CardContent>
                  </Card>
               </div>
            </div>

            <div className="space-y-8">
               <div className="space-y-2">
                 <h3 className="text-xl font-medium text-primary">How does it work?</h3>
                 <p className="text-muted-foreground">Check your mental health in three simple steps.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium text-lg shrink-0">1</div>
                        <div className="h-px bg-border flex-grow hidden md:block"></div>
                     </div>
                     <h4 className="font-medium text-lg text-primary">Tell us how you’re feeling</h4>
                  </div>
                  
                  <div className="flex flex-col space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium text-lg shrink-0">2</div>
                        <div className="h-px bg-border flex-grow hidden md:block"></div>
                     </div>
                     <h4 className="font-medium text-lg text-primary">Answer a few simple questions</h4>
                  </div>

                  <div className="flex flex-col space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium text-lg shrink-0">3</div>
                     </div>
                     <h4 className="font-medium text-lg text-primary">See results</h4>
                  </div>
               </div>
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
                  <div key={assessment.id || index} className="group h-full">
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
                               className="text-xs uppercase tracking-widest font-medium"
                               style={{ 
                                 color: isCompleted ? 'var(--color-status-success)' : 'var(--color-text-primary)',
                                 fontFamily: 'var(--font-family-base)'
                               }}
                             >
                               {isCompleted ? 'COMPLETED' : assessment.category}
                             </p>
                             <h3 
                               className="text-3xl font-medium text-primary"
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
  if (currentView === 'results' && assessmentResults) {
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
          results={assessmentResults}
          onReturnToDashboard={handleReturnToList}
        />
      </div>
    );
  }

  return null;
}