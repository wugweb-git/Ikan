import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ProgramCard } from './atoms/ProgramCard';
import { EquipDayTile } from './organisms/EquipDayTile';
import { apiClient, EquipProgram, EquipProgress } from '../lib/api-client';
import { useAuth } from '../contexts/AuthContext';
import { useJourney } from '../contexts/JourneyContext';
import { PaymentFlow } from './payments/PaymentFlow';
import { Wrench, Clock, DollarSign, Calendar, CheckCircle, Lock, Play, Star, Award, CreditCard } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface EquipCardProps {
  program: EquipProgram;
  userProgress?: EquipProgress | null;
  onPurchase: (program: EquipProgram) => void;
  onContinue: (program: EquipProgram, progress: EquipProgress) => void;
}

function EquipCard({ program, userProgress, onPurchase, onContinue }: EquipCardProps) {
  const { startJourney } = useJourney();
  const isOwned = !!userProgress;
  const isCompleted = userProgress && userProgress.progress_percentage === 100;

  const handlePurchaseClick = () => {
    // Start purchase journey as per JSON journeys spec
    startJourney('equip_purchase', { programId: program.equip_id });
    onPurchase(program);
  };

  const handleStart = () => {
    if (isOwned && userProgress) {
      onContinue(program, userProgress);
    } else {
      handlePurchaseClick();
    }
  };

  return (
    <ProgramCard
      title={program.title}
      description={program.description}
      category="Mental Health"
      difficulty="Beginner" // Could be derived from program data
      progress={userProgress?.progress_percentage || 0}
      totalSessions={userProgress?.total_days}
      completedSessions={userProgress?.completed_days.length}
      duration={`${program.duration_days} days`}
      price={program.price / 100} // Convert from cents
      isPurchased={isOwned}
      isLocked={!isOwned}
      onStart={handleStart}
      onContinue={() => isOwned && userProgress && onContinue(program, userProgress)}
      onPurchase={handlePurchaseClick}
    />
  );
}

interface PurchaseModalProps {
  program: EquipProgram | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (program: EquipProgram, onboardingData: any) => void;
}

function PurchaseModal({ program, isOpen, onClose, onConfirm }: PurchaseModalProps) {
  const [step, setStep] = useState(1); // 1: Onboarding, 2: Payment
  const [onboardingData, setOnboardingData] = useState({
    goals: '',
    experience_level: '',
    preferred_time: '',
    motivation: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (program) {
      setStep(1);
      setOnboardingData({
        goals: '',
        experience_level: '',
        preferred_time: '',
        motivation: ''
      });
    }
  }, [program]);

  if (!program) return null;

  const handleOnboardingSubmit = () => {
    setStep(2);
  };

  const handlePurchase = async () => {
    try {
      setIsProcessing(true);
      await onConfirm(program, onboardingData);
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench size={20} style={{ color: 'var(--color-primary-default)' }} />
            {program.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 
                  style={{ 
                    fontSize: 'var(--text-lg)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: '16px'
                  }}
                >
                  Tell us about yourself
                </h3>
                <p 
                  style={{ 
                    fontSize: 'var(--text-sm)', 
                    color: 'var(--color-text-muted)',
                    lineHeight: 'var(--line-height-md)'
                  }}
                >
                  This helps us personalize your program experience.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>What are your main goals for this program?</Label>
                  <Input
                    value={onboardingData.goals}
                    onChange={(e) => setOnboardingData(prev => ({...prev, goals: e.target.value}))}
                    placeholder="e.g., reduce anxiety, improve mood, build resilience"
                  />
                </div>

                <div className="space-y-2">
                  <Label>What's your experience level?</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                      <Button
                        key={level}
                        variant={onboardingData.experience_level === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOnboardingData(prev => ({...prev, experience_level: level}))}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>When do you prefer to practice?</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Morning', 'Afternoon', 'Evening'].map((time) => (
                      <Button
                        key={time}
                        variant={onboardingData.preferred_time === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOnboardingData(prev => ({...prev, preferred_time: time}))}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>What motivates you to start this program?</Label>
                  <Input
                    value={onboardingData.motivation}
                    onChange={(e) => setOnboardingData(prev => ({...prev, motivation: e.target.value}))}
                    placeholder="Share what brought you here..."
                  />
                </div>
              </div>

              <Button 
                onClick={handleOnboardingSubmit}
                className="w-full"
                disabled={!onboardingData.goals || !onboardingData.experience_level}
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 
                  style={{ 
                    fontSize: 'var(--text-lg)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: '16px'
                  }}
                >
                  Confirm Purchase
                </h3>
              </div>

              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--color-bg-muted)',
                  borderColor: 'var(--color-border-default)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Program</span>
                    <span>{program.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Duration</span>
                    <span>{program.duration_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Access Period</span>
                    <span>{program.expires_in_days_after_payment} days</span>
                  </div>
                  <div className="flex justify-between border-t pt-3" style={{ borderColor: 'var(--color-border-default)' }}>
                    <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-lg)' }}>Total</span>
                    <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-lg)' }}>
                      {program.currency} {program.price}
                    </span>
                  </div>
                </div>
              </div>

              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--color-status-info-light)',
                  borderColor: 'var(--color-status-info)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <p 
                  style={{ 
                    fontSize: 'var(--text-sm)', 
                    color: 'var(--color-status-info)'
                  }}
                >
                  <strong>Note:</strong> This is a demo purchase. In production, this would integrate with a payment processor like Razorpay.
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isProcessing}
                >
                  Back
                </Button>
                <Button 
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  className="flex-1 gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Confirm Purchase
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ProgramViewModalProps {
  program: EquipProgram | null;
  progress: EquipProgress | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteDay: (day: number) => void;
}

function ProgramViewModal({ program, progress, isOpen, onClose, onCompleteDay }: ProgramViewModalProps) {
  if (!program || !progress) return null;

  const currentDay = progress.current_day;
  const maxAccessibleDay = Math.min(currentDay, progress.total_days);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench size={20} style={{ color: 'var(--color-primary-default)' }} />
            {program.title} - Day {currentDay}
          </DialogTitle>
          <div className="flex items-center justify-between pt-2">
            <div 
              style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-muted)'
              }}
            >
              Day {currentDay} of {progress.total_days}
            </div>
            <div className="w-32">
              <Progress value={progress.progress_percentage} className="h-2" />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Day Navigation */}
          <div className="grid grid-cols-7 gap-3 p-4" style={{ backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-lg)' }}>
            {Array.from({ length: progress.total_days }, (_, i) => i + 1).map((day) => {
              const isCompleted = progress.completed_days.includes(day);
              const isCurrent = day === currentDay;
              const isAccessible = day <= maxAccessibleDay;

              const getStatus = () => {
                if (!isAccessible) return 'locked';
                if (isCompleted) return 'completed';
                return 'unlocked';
              };

              return (
                <EquipDayTile
                  key={day}
                  day={day}
                  title={`Day ${day}`}
                  description={`Practice session ${day}`}
                  duration="15 min"
                  status={getStatus()}
                  isToday={isCurrent}
                  onStart={() => {
                    // Navigate to specific day content
                    console.log(`Starting day ${day}`);
                  }}
                />
              );
            })}
          </div>

          {/* Day Content */}
          <Card>
            <CardHeader>
              <CardTitle>Day {currentDay}: Daily Practice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                This is where the actual program content would go. In a real implementation, this would contain:
              </p>

              <ul className="space-y-2 ml-4">
                <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  • Video lessons or audio guides
                </li>
                <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  • Interactive exercises
                </li>
                <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  • Worksheets and reflection prompts
                </li>
                <li style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  • Progress tracking activities
                </li>
              </ul>

              <div 
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: 'var(--color-bg-muted)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                  Today's Exercise
                </h4>
                <p style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--line-height-md)'
                }}>
                  Practice mindful breathing for 10 minutes. Focus on your breath and gently bring your attention back when your mind wanders.
                </p>
              </div>

              {!progress.completed_days.includes(currentDay) && (
                <Button 
                  onClick={() => onCompleteDay(currentDay)}
                  className="w-full gap-2"
                >
                  <CheckCircle size={16} />
                  Complete Day {currentDay}
                </Button>
              )}

              {progress.completed_days.includes(currentDay) && (
                <div 
                  className="text-center p-3 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--color-status-success-light)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <p 
                    style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-status-success)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    ✓ Day {currentDay} completed! Great job!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EquipFlowProps {
  className?: string;
}

export function EquipFlow({ className }: EquipFlowProps) {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<EquipProgram[]>([]);
  const [userProgresses, setUserProgresses] = useState<Record<string, EquipProgress>>({});
  const [selectedProgram, setSelectedProgram] = useState<EquipProgram | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<EquipProgress | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserProgresses();
    }
  }, [user, programs]);

  const loadPrograms = async () => {
    try {
      const { programs } = await apiClient.getEquipPrograms();
      setPrograms(programs || []);
    } catch (error) {
      console.error('Failed to load programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgresses = async () => {
    try {
      const progresses: Record<string, EquipProgress> = {};
      
      for (const program of programs) {
        try {
          const { progress } = await apiClient.getEquipProgress(program.equip_id);
          if (progress) {
            progresses[program.equip_id] = progress;
          }
        } catch (error) {
          // No progress found for this program, which is fine
        }
      }
      
      setUserProgresses(progresses);
    } catch (error) {
      console.error('Failed to load user progresses:', error);
    }
  };

  const handlePurchase = (program: EquipProgram) => {
    setSelectedProgram(program);
    setIsPurchaseModalOpen(true);
  };

  const handleContinue = (program: EquipProgram, progress: EquipProgress) => {
    setSelectedProgram(program);
    setSelectedProgress(progress);
    setIsProgramModalOpen(true);
  };

  const handleConfirmPurchase = async (program: EquipProgram, onboardingData: any) => {
    try {
      const { purchase, progress } = await apiClient.purchaseEquipProgram(
        program.equip_id,
        onboardingData,
        'demo_payment'
      );

      setUserProgresses(prev => ({
        ...prev,
        [program.equip_id]: progress
      }));

      toast.success(`Successfully purchased ${program.title}!`, {
        description: 'You can now access your program content.'
      });

      setIsPurchaseModalOpen(false);
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };

  const handleCompleteDay = async (day: number) => {
    if (!selectedProgram) return;

    try {
      const { progress } = await apiClient.completeEquipDay(selectedProgram.equip_id, day);
      
      setUserProgresses(prev => ({
        ...prev,
        [selectedProgram.equip_id]: progress
      }));
      
      setSelectedProgress(progress);

      toast.success(`Day ${day} completed!`, {
        description: progress.progress_percentage === 100 ? 
          'Congratulations! You\'ve completed the entire program!' : 
          `Great progress! ${progress.completed_days.length} of ${progress.total_days} days complete.`
      });
    } catch (error) {
      console.error('Failed to complete day:', error);
      toast.error('Failed to mark day as complete');
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {programs.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Wrench size={24} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>
              No programs available at this time
            </p>
          </CardContent>
        </Card>
      ) : (
        programs.map((program) => (
          <EquipCard
            key={program.equip_id}
            program={program}
            userProgress={userProgresses[program.equip_id] || null}
            onPurchase={handlePurchase}
            onContinue={handleContinue}
          />
        ))
      )}

      <PurchaseModal
        program={selectedProgram}
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onConfirm={handleConfirmPurchase}
      />

      <ProgramViewModal
        program={selectedProgram}
        progress={selectedProgress}
        isOpen={isProgramModalOpen}
        onClose={() => setIsProgramModalOpen(false)}
        onCompleteDay={handleCompleteDay}
      />
    </div>
  );
}