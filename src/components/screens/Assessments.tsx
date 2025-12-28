import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Icon } from '../Icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { ChevronRight, Clock, FileText, TrendingUp, Calendar, Brain, Shield, Activity, ArrowRight, Play, Info, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../ui/utils';
import { apiClient } from '../../lib/api-client';
import { AssessmentFlow } from './AssessmentFlow';
import { AssessmentResults } from './AssessmentResults';
import { Skeleton } from '../ui/skeleton-loader';
import { EmptyState } from '../ui/empty-state';
import { TouchFeedback } from '../ui/touch-feedback';

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
          // Fallback to mock data for demo purposes
          const mockAssessments: Assessment[] = [
            {
              id: 'anxiety-screen',
              slug: 'anxiety-screen',
              title: 'Anxiety Screening',
              description: 'A brief assessment to check for signs of anxiety.',
              estimatedTime: '5 minutes',
              questionCount: 7,
              status: 'available',
              category: 'anxiety',
              questions: [
                { id: 'q1', text: 'I feel nervous', type: 'scale' }
              ]
            },
            {
              id: 'depression-screen',
              slug: 'depression-screen',
              title: 'Depression Screening',
              description: 'Check your mood and signs of depression.',
              estimatedTime: '5 minutes',
              questionCount: 9,
              status: 'available',
              category: 'depression',
              questions: []
            },
            {
              id: 'stress-test',
              slug: 'stress-test',
              title: 'Stress Level Test',
              description: 'Evaluate your current stress levels and coping mechanisms.',
              estimatedTime: '3 minutes',
              questionCount: 5,
              status: 'available',
              category: 'stress',
              questions: []
            },
            {
              id: 'wellness-check',
              slug: 'wellness-check',
              title: 'General Wellness Check',
              description: 'A comprehensive check of your overall mental well-being.',
              estimatedTime: '10 minutes',
              questionCount: 15,
              status: 'available',
              category: 'wellness',
              questions: []
            },
             {
              id: 'burnout-assess',
              slug: 'burnout-assess',
              title: 'Burnout Assessment',
              description: 'Are you experiencing signs of professional burnout?',
              estimatedTime: '7 minutes',
              questionCount: 10,
              status: 'available',
              category: 'burnout',
              questions: []
            },
             {
              id: 'sleep-quality',
              slug: 'sleep-quality',
              title: 'Sleep Quality Quiz',
              description: 'Assess the quality of your sleep and identify potential issues.',
              estimatedTime: '4 minutes',
              questionCount: 6,
              status: 'available',
              category: 'sleep',
              questions: []
            }
          ];
          apiAssessments = mockAssessments;
          showToast('info', 'Demo Mode', 'Loaded sample assessments due to connection issue.');
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
      onNavigate(`/assessment-detail?id=${assessment.id || assessment.slug}`);
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
      onNavigate(`/assessment-detail?id=${selectedAssessment?.id || selectedAssessment?.slug}`);
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
      <div className={cn("w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8", className)}>
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-center md:text-left"
        >
          <h1 style={{ 
            fontSize: 'var(--text-3xl)', 
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)'
          }}>
            Health Assessments
          </h1>
          <p className="text-lg text-[var(--ikan-color-text-muted)] max-w-2xl">
            Quick, evidence-based screenings to help you understand your mental well-being.
          </p>
        </motion.div>

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
               bg: "bg-purple-50"
             },
             {
               title: "Private & Secure",
               desc: "Your results are encrypted and strictly confidential.",
               icon: Shield,
               color: "var(--color-status-success)",
               bg: "bg-emerald-50"
             },
             {
               title: "Instant Insights",
               desc: "Get immediate feedback and personalized recommendations.",
               icon: Activity,
               color: "var(--color-status-warning)",
               bg: "bg-orange-50"
             }
           ].map((item, i) => (
             <Card key={i} className="border-none shadow-sm bg-white rounded-[16px] h-full">
               <CardContent className="p-6 flex flex-col gap-4 h-full">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg}`}>
                   <item.icon size={24} style={{ color: item.color }} />
                 </div>
                 <div>
                   <h3 className="font-medium text-lg text-[var(--ikan-color-text-primary)] mb-1">{item.title}</h3>
                   <p className="text-sm text-[var(--ikan-color-text-muted)] leading-relaxed">
                     {item.desc}
                   </p>
                 </div>
               </CardContent>
             </Card>
           ))}
        </motion.div>

        {/* How it works (Simplified) */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="py-6"
        >
           <h3 className="text-lg font-medium text-[var(--ikan-color-text-primary)] mb-6">How it works</h3>
           <div className="flex flex-col md:flex-row gap-8 relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-5 left-8 right-8 h-0.5 bg-gray-100 -z-10" />
              
              {[
                { step: 1, title: "Check In", desc: "Select an assessment based on how you feel." },
                { step: 2, title: "Answer", desc: "Complete a few simple questions honestly." },
                { step: 3, title: "Understand", desc: "Receive immediate insights and next steps." }
              ].map((step, i) => (
                <div key={i} className="flex-1 flex flex-col items-center text-center gap-3 bg-white/50 backdrop-blur-sm p-4 rounded-xl md:bg-transparent md:p-0">
                   <div className="w-10 h-10 rounded-full bg-[var(--ikan-color-primary-default)] text-white flex items-center justify-center font-bold shadow-md">
                     {step.step}
                   </div>
                   <div>
                     <h4 className="font-medium text-[var(--ikan-color-text-primary)]">{step.title}</h4>
                     <p className="text-sm text-[var(--ikan-color-text-muted)]">{step.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </motion.div>

        <div id="assessments-grid" className="scroll-mt-32" />
        
        {/* Assessment Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-[var(--ikan-color-text-primary)]">Available Assessments</h3>
          </div>

          {!user && currentTab === 'history' ? (
            <Card className="border-none shadow-sm bg-white rounded-[16px]">
              <CardContent className="text-center p-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={24} className="text-[var(--ikan-color-text-muted)]" />
                </div>
                <h3 className="text-lg font-medium text-[var(--ikan-color-text-primary)] mb-2">Sign in required</h3>
                <p className="text-[var(--ikan-color-text-muted)] mb-6">Please sign in to view your assessment history</p>
                <Button className="bg-[var(--ikan-color-primary-default)] text-white">Sign In</Button>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} variant="rectangular" height="320px" className="rounded-[16px]" />
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
                  <motion.div
                    key={assessment.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="h-full"
                  >
                    <Card 
                      className="h-full border-none shadow-sm hover:shadow-lg transition-all duration-300 bg-white rounded-[16px] overflow-hidden cursor-pointer group flex flex-col"
                      onClick={() => handleStartAssessment(assessment)}
                    >
                      {/* Image Header */}
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={assessment.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                        
                        {/* Status Badge */}
                        {isCompleted && (
                           <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                             <Activity size={12} /> Completed
                           </div>
                        )}
                        
                        {/* Title Overlay */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white/90 text-xs font-medium uppercase tracking-wider mb-1">
                            {assessment.category}
                          </p>
                          <h3 className="text-white text-xl font-medium leading-tight">
                            {assessment.title}
                          </h3>
                        </div>
                      </div>

                      <CardContent className="p-5 flex flex-col flex-grow gap-4">
                        <p className="text-sm text-[var(--ikan-color-text-muted)] line-clamp-2 flex-grow">
                          {assessment.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-[var(--ikan-color-text-muted)] font-medium">
                          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                            <Clock size={14} className="text-[var(--ikan-color-primary-default)]" />
                            {assessment.estimatedTime}
                          </div>
                          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                            <FileText size={14} className="text-[var(--ikan-color-primary-default)]" />
                            {assessment.questionCount} Questions
                          </div>
                        </div>

                        <Button 
                          className="w-full mt-2 bg-gray-50 text-[var(--ikan-color-text-primary)] hover:bg-[var(--ikan-color-primary-default)] hover:text-white border-none group-hover:bg-[var(--ikan-color-primary-default)] group-hover:text-white transition-colors"
                          variant="outline"
                        >
                          {isCompleted ? 'Retake Assessment' : 'Start Assessment'}
                          <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
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