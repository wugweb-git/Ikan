import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';
import { EngineResult, SeverityLevel } from '../../lib/recommendation-engine';
import { apiClient } from '../../lib/api-client';

interface AssessmentResultsProps {
  assessmentId?: string;
  score?: number;
  maxScore?: number;
  recommendation?: EngineResult;
  onNavigate?: (route: string) => void;
  onReturnToDashboard?: () => void;
  onRetake?: () => void;
  className?: string;
}

export function AssessmentResults({ 
  assessmentId,
  score,
  maxScore,
  recommendation,
  onNavigate,
  onReturnToDashboard,
  onRetake,
  className 
}: AssessmentResultsProps) {
  
  // State for hydration if props are missing
  const [hydratedData, setHydratedData] = useState<any>(null);

  useEffect(() => {
    if (!assessmentId || !recommendation) {
      try {
        const stored = sessionStorage.getItem('lastAssessmentResults');
        if (stored) {
          setHydratedData(JSON.parse(stored));
        }
      } catch (e) {
        // ignore
      }
    }
  }, [assessmentId, recommendation]);

  const activeData = {
    assessmentId: assessmentId || hydratedData?.assessmentId,
    score: score ?? hydratedData?.score,
    maxScore: maxScore ?? hydratedData?.maxScore,
    recommendation: recommendation || hydratedData?.recommendation as EngineResult | undefined
  };

  // If still no data, show empty state
  if (!activeData.recommendation) {
      return (
          <div className={cn("w-full max-w-3xl mx-auto p-8 text-center", className)}>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="clipboard" size={32} className="text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">No Results Found</h2>
              <p className="text-[var(--color-text-muted)] mb-6">
                  We couldn't find any recent assessment results. Please take an assessment first.
              </p>
              <Button onClick={() => onNavigate?.('/assessment')}>
                  View Assessments
              </Button>
          </div>
      );
  }

  const { recommendation: rec, score: activeScore, maxScore: activeMax } = activeData;

  // Visual polish: Score circle color
  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'low': return 'var(--color-status-success)';
      case 'moderate': return 'var(--color-status-warning)';
      case 'high': return 'var(--color-status-danger)';
      default: return 'var(--color-primary-default)';
    }
  };

  const severityColor = getSeverityColor(rec.severity);
  const scorePercentage = (activeMax || 1) > 0 ? ((activeScore || 0) / (activeMax || 1)) * 100 : 0;

  // We can fetch the program details if we have an ID, to show a nice image
  const [programDetails, setProgramDetails] = useState<any>(null);

  useEffect(() => {
    if (rec.primaryAction.type === 'equip_program' && rec.primaryAction.programId) {
      // Fetch program details for image/title
      const fetchProg = async () => {
         try {
           const prog = await apiClient.getEquipProgram(rec.primaryAction.programId!);
           if (prog) setProgramDetails(prog);
         } catch (e) {
           console.warn('Could not fetch recommended program details');
         }
      };
      fetchProg();
    }
  }, [rec.primaryAction.programId]);

  return (
    <div 
      className={cn("w-full max-w-3xl mx-auto space-y-8 p-4 md:p-6 animate-fadeIn", className)}
    >
      {/* 1. Results Header & Score */}
      <div className="text-center space-y-6">
        <div className="relative inline-flex items-center justify-center">
          {/* Circular Progress (Simple CSS) */}
          <div 
            className="w-32 h-32 rounded-full border-8 border-gray-100 flex items-center justify-center relative"
          >
             <div 
               className="absolute inset-0 rounded-full border-8 border-transparent"
               style={{
                 borderTopColor: severityColor,
                 borderRightColor: scorePercentage > 50 ? severityColor : 'transparent',
                 borderBottomColor: scorePercentage > 75 ? severityColor : 'transparent',
                 borderLeftColor: scorePercentage > 25 ? severityColor : 'transparent',
                 transform: 'rotate(-45deg)', // Start at top
                 transition: 'all 1s ease-out'
               }}
             />
             <div className="text-center z-10">
               <span className="block text-3xl font-bold text-[#1C1C1E]">{activeScore}</span>
               <span className="text-xs text-[#8E8E93] uppercase font-medium">/ {activeMax}</span>
             </div>
          </div>
        </div>
        
        <div className="space-y-2 max-w-lg mx-auto">
          <h2 className="text-2xl font-semibold text-[#1C1C1E] capitalize">
            {rec.severity} Severity
          </h2>
          <p className="text-[17px] text-[#3A3A3C] leading-relaxed">
            {rec.severityMessage}
          </p>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 2. Primary Recommendation Card */}
      {rec.primaryAction.type === 'equip_program' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#8E8E93] uppercase tracking-wide">Recommended for you</h3>
          
          <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 bg-white rounded-[24px]">
            <div className="flex flex-col md:flex-row">
               {/* Image Side (if program loaded) */}
               <div className="w-full md:w-1/3 bg-gray-100 h-48 md:h-auto relative overflow-hidden">
                  <img 
                    src={programDetails?.thumbnail || programDetails?.cover_image || "https://images.unsplash.com/photo-1544367563-12123d895951?w=800&auto=format&fit=crop"} 
                    alt="Program"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10" />
               </div>

               {/* Content Side */}
               <div className="p-6 md:p-8 flex-1 flex flex-col justify-center space-y-4">
                  <div>
                    <h4 className="text-xl font-semibold text-[#1C1C1E] mb-2">
                      {rec.primaryAction.title}
                    </h4>
                    <p className="text-[#3A3A3C] leading-relaxed">
                      {rec.primaryAction.body}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => onNavigate && rec.primaryAction.programId && onNavigate(`/equip-program-onboarding?id=${rec.primaryAction.programId}`)}
                    className="w-full md:w-fit h-12 px-8 rounded-full bg-[#2A2A2A] text-white hover:bg-black font-medium text-[16px] shadow-md transition-all hover:scale-105"
                  >
                    {rec.primaryAction.cta}
                  </Button>
               </div>
            </div>
          </Card>
        </div>
      )}

      {/* 3. Secondary Recommendations */}
      {rec.secondaryActions.length > 0 && (
        <div className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {rec.secondaryActions.map((action, idx) => (
               <Card key={idx} className="p-6 rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-between h-full">
                 <div className="space-y-2 mb-4">
                   <h5 className="text-sm font-medium text-[#8E8E93]">{action.title}</h5>
                   <p className="text-lg font-semibold text-[#1C1C1E]">{action.label}</p>
                 </div>
                 <Button 
                   variant="outline" 
                   className="w-full justify-between group"
                   onClick={() => onNavigate && action.route && onNavigate(action.route)}
                 >
                   Explore
                   <Icon name="arrowRight" size={16} className="text-gray-400 group-hover:text-black transition-colors" />
                 </Button>
               </Card>
             ))}
           </div>
        </div>
      )}

      {/* 4. High Severity Note */}
      {rec.showProfessionalSupportNote && (
        <div className="bg-blue-50/50 p-4 rounded-[16px] flex items-start gap-3 border border-blue-100">
           <div className="mt-0.5 p-1 bg-blue-100 rounded-full text-blue-600">
             <Icon name="info" size={16} />
           </div>
           <p className="text-[15px] text-[#3A3A3C] leading-relaxed">
             If things feel overwhelming, professional support can make a real difference.
           </p>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-center pt-8">
        <Button 
          variant="ghost" 
          onClick={onReturnToDashboard}
          className="text-[#8E8E93] hover:text-[#1C1C1E]"
        >
          Return to Home
        </Button>
      </div>

    </div>
  );
}
