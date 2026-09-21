import { projectId } from '../../utils/supabase/info';
import { getAuthHeaders } from '../../lib/supabase-client';
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { OnboardingData } from '../../lib/equip-types';
import { OnboardingQuestionSet } from '../../lib/equip-onboarding-types';
import { Icon } from '../../components/Icon';
import { ProgramPlayer } from '../features/player/ProgramPlayer';
import { EquipProgram } from '../../lib/blocks/block-model';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface EquipOnboardingProps {
  programId?: string;
  onComplete?: (data?: any) => void;
  onBack?: () => void;
  onNavigate?: (path: string) => void;
}

export function EquipOnboarding({ programId: propProgramId, onComplete, onBack, onNavigate }: EquipOnboardingProps) {
  const [programId, setProgramId] = useState<string>(propProgramId || '');
  const [questionSet, setQuestionSet] = useState<OnboardingQuestionSet | null>(null);
  const [unifiedProgram, setUnifiedProgram] = useState<EquipProgram | null>(null);
  const [hasDay0, setHasDay0] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [programData, setProgramData] = useState<any>(null);
  const { showToast } = useNotifications();
  const { user } = useAuth();

  // ✅ Fetch Onboarding Questions from Database
  useEffect(() => {
    let id = propProgramId;
    
    if (!id) {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('id');
      const storedProgramStr = localStorage.getItem('ikan-selected-program');
      let storedProgram = null;
      try {
        storedProgram = storedProgramStr ? JSON.parse(storedProgramStr) : null;
      } catch (e) {
        storedProgram = { slug: storedProgramStr };
      }
      id = urlId || storedProgram?.slug || storedProgram?.id;
    }
    
    if (!id) {
      setError('No program ID provided');
      setLoading(false);
      return;
    }
    
    setProgramId(id);

    const fetchOnboardingQuestions = async () => {
      try {
        setLoading(true);
        
        console.log('📥 Fetching onboarding questions for program:', id);

        // Fetch the equip program to get its onboarding configuration
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/equip/programs/${id}`,
          {
            headers: await getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load program');
        }

        const data = await response.json();
        const program = data.program;
        
        // Store full program data for payment checks
        setProgramData(program);

        // UNIFIED SYSTEM CHECK: Does this program have Day 0 (Onboarding Blocks)?
        const day0 = program?.daily_content?.find((d: any) => d.day === 0);
        if (day0 && day0.activities && day0.activities.length > 0) {
           console.log('✅ Unified Onboarding Found (Day 0)');
           setUnifiedProgram(program);
           setHasDay0(true);
           setLoading(false);
           return;
        }

        console.log('🔍 DEBUG: Fetched Program Data:', {
          programId: program?.id || program?.equip_id,
          title: program?.title,
          hasOnboarding: !!program?.onboarding,
          onboardingQuestionsCount: program?.onboarding?.questions?.length || 0,
          onboardingRaw: program?.onboarding
        });

        // Extract onboarding questions from program
        const onboarding = program?.onboarding;
        
        if (!onboarding || !onboarding.questions || onboarding.questions.length === 0) {
          console.error('❌ Program has no onboarding questions!', {
            programId: id,
            program
          });
          setError('This program has no onboarding questions configured.');
          setLoading(false);
          return;
        }

        // Map to OnboardingQuestionSet format
        const questionSet: OnboardingQuestionSet = {
          id: onboarding.id || `${program.id}-onboarding`,
          equip_id: program.id || program.equip_id,
          title: onboarding.title || 'Program Setup',
          description: onboarding.description || 'Please answer a few questions to personalize your experience.',
          is_required_before_start: onboarding.is_required_before_start !== false,
          version: onboarding.version || '1.0.0',
          sections: onboarding.sections || [],
          questions: onboarding.questions
        };

        console.log('✅ Onboarding questions loaded:', {
          id: questionSet.id,
          questionsCount: questionSet.questions.length
        });

        setQuestionSet(questionSet);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching onboarding questions:', err);
        setError('Failed to load program onboarding. Please try again.');
        setLoading(false);
      }
    };

    fetchOnboardingQuestions();
  }, [propProgramId]);

  const submitOnboarding = async (answers: Record<string, any>) => {
    try {
      // Get program ID from state or localStorage
      const storedProgramStr = localStorage.getItem('ikan-selected-program');
      let storedProgram = null;
      try {
        storedProgram = storedProgramStr ? JSON.parse(storedProgramStr) : null;
      } catch (e) {
        storedProgram = { slug: storedProgramStr };
      }
      
      const slug = programId || storedProgram?.slug || storedProgram?.id;
      
      if (!slug) {
        throw new Error('No program ID available for enrollment');
      }

      // 🛑 Auth Check: If not logged in, save progress and redirect to login
      if (!user) {
        console.log('🔒 User not logged in, saving progress and redirecting to login');
        localStorage.setItem('ikan-pending-onboarding-answers', JSON.stringify(answers));
        localStorage.setItem('ikan-pending-onboarding-program', slug);
        
        showToast('info', 'Account Required', 'Please sign in or create an account to save your progress.');
        
        // Use onNavigate if available, or force window location
        if (onNavigate) {
          onNavigate('/login?returnTo=onboarding');
        } else {
          window.location.href = '/login?returnTo=onboarding';
        }
        return;
      }

      // 💳 Payment Gate: Check if program is paid and require purchase
      const isPaid = programData?.is_paid && (programData?.price > 0);
      if (isPaid) {
        const purchaseCheck = await apiClient.checkProgramPurchase(slug);
        if (!purchaseCheck.purchased) {
          console.log('💳 Program requires payment, initiating Razorpay checkout');
          localStorage.setItem('ikan-pending-onboarding-answers', JSON.stringify(answers));
          localStorage.setItem('ikan-pending-onboarding-program', slug);
          
          try {
            // Create order on server
            const priceInRupees = programData.price / 100; // price stored in paise
            const orderRes = await apiClient.createPaymentOrder({
              program_id: slug,
              amount: priceInRupees,
              currency: programData.currency || 'INR',
              description: `${programData.title || 'Program'} enrollment`,
            });

            if (!orderRes?.order_id || !orderRes?.key_id) {
              throw new Error('Failed to create payment order');
            }

            // Load Razorpay script
            await new Promise<void>((resolve, reject) => {
              if ((window as any).Razorpay) { resolve(); return; }
              const s = document.createElement('script');
              s.src = 'https://checkout.razorpay.com/v1/checkout.js';
              s.onload = () => resolve();
              s.onerror = () => reject(new Error('Failed to load payment gateway'));
              document.body.appendChild(s);
            });

            // Open Razorpay checkout
            const rzp = new (window as any).Razorpay({
              key: orderRes.key_id,
              amount: orderRes.amount,
              currency: orderRes.currency || 'INR',
              name: 'iKan',
              description: programData.title || 'Program Purchase',
              order_id: orderRes.order_id,
              handler: async (response: any) => {
                try {
                  // Verify payment
                  const verifyRes = await apiClient.verifyPayment({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    transaction_id: orderRes.transaction_id,
                  });

                  if (verifyRes?.success) {
                    // Record in payment history
                    await apiClient.recordProgramPayment({
                      programId: slug,
                      programTitle: programData.title || 'Program',
                      amount: programData.price,
                      currency: programData.currency || 'INR',
                      transactionId: response.razorpay_payment_id,
                      paymentMethod: 'razorpay',
                    });

                    showToast('success', 'Payment Successful', 'Proceeding with enrollment...');
                    // Re-submit onboarding (payment is now done)
                    const savedAnswers = JSON.parse(localStorage.getItem('ikan-pending-onboarding-answers') || '{}');
                    localStorage.removeItem('ikan-pending-onboarding-answers');
                    localStorage.removeItem('ikan-pending-onboarding-program');
                    await submitOnboarding(savedAnswers);
                  } else {
                    showToast('error', 'Payment Verification Failed', 'Please contact support.');
                  }
                } catch (verifyErr) {
                  console.error('Payment verification failed:', verifyErr);
                  showToast('error', 'Payment Error', 'Verification failed. Please contact support.');
                }
              },
              prefill: {
                email: user.email || '',
                name: user.name || user.email?.split('@')[0] || '',
              },
              theme: { color: '#2A2A2A' },
              modal: {
                ondismiss: () => {
                  showToast('info', 'Payment Cancelled', 'You can complete the payment anytime to start the program.');
                },
              },
            });
            rzp.open();
          } catch (payErr) {
            console.error('Payment initialization failed:', payErr);
            showToast('error', 'Payment Error', 'Failed to initialize payment. Please try again.');
          }
          return; // Stop enrollment flow — will resume in handler after successful payment
        }
      }

      // Legacy mapping for backward compatibility
      const legacyData: OnboardingData = {
        personalInfo: { name: 'Equip User', preferredName: '', age: '', pronouns: '' },
        programGoals: { what: 'Not specified', why: '', when: '', expectations: '' },
        currentState: { primaryConcern: 'General', severityLevel: 5, previousExperience: answers['q-therapy-history'] || '', currentSupport: [] },
        preferences: { reminderTime: '09:00', communicationStyle: 'balanced', privacyLevel: 'medium' },
        consent: { dataProcessing: true, communications: true, research: false }
      };

      // Create enrollment with onboarding data
      const enrollmentData = {
        programId: slug,
        onboardingData: {
            answers,
            legacyMapping: legacyData
        }
      };
      
      console.log('📤 Submitting onboarding:', enrollmentData);
      
      const response = await apiClient.createEquipEnrollment(enrollmentData);
      
      if (response?.enrollment) {
        localStorage.setItem('ikan-current-enrollment', response.enrollment.enrollmentId);
        localStorage.setItem('ikan-equip-onboarding-answers', JSON.stringify(answers));
        
        showToast('success', 'Enrollment Complete', 'Your program has been set up!');
        
        if (onComplete) {
          onComplete(answers);
        } else if (onNavigate && slug) {
          // Default behavior: Navigate to the program flow
          onNavigate(`/equip-program-flow?id=${slug}`);
        } else {
          // Fallback if onNavigate is missing
          window.location.href = `/equip-program-flow?id=${slug}`;
        }
      } else {
        // Fallback: If we got a 200 OK but no explicit enrollment object, assume success?
        // Some backends might just return { success: true }
        if (response && !response.error) {
           console.warn('⚠️ No enrollment object returned, but assuming success based on 200 OK');
           if (onComplete) {
             onComplete(answers);
           } else {
             const target = `/equip-program-flow?id=${slug}`;
             if (onNavigate) onNavigate(target);
             else window.location.href = target;
           }
        } else {
           console.error('❌ No enrollment returned from server:', response);
           showToast('error', 'Enrollment Failed', 'Server did not return enrollment data.');
        }
      }
    } catch (error) {
      console.error('❌ Enrollment error:', error);
      showToast('error', 'Enrollment Failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  // UNIFIED PLAYER RENDER
  if (!loading && hasDay0 && unifiedProgram) {
    return (
      <div className="fixed inset-0 z-50" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <ProgramPlayer
          program={unifiedProgram}
          initialDay={0}
          onComplete={(results) => {
             // Extract simple answers map for enrollment
             // Note: ProgramPlayer returns responses keyed by Block ID.
             // We pass this directly.
             submitOnboarding(results.responses);
          }}
          onExit={onBack || (() => {})}
          mode="live"
        />
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <LoadingSpinner message="Loading program setup..." />
      </div>
    );
  }

  // Error State
  if (error || !questionSet) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-page)] flex items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-4 text-center max-w-md">
          <Icon name="alertCircle" size={48} style={{ color: 'var(--color-status-danger)' }} />
          <h3 className="text-xl font-medium">Unable to Load Program Setup</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>{error || 'Program onboarding not found or unavailable.'}</p>
          <Button onClick={onBack} variant="outline" className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // ── No Day 0 ────────────────────────────────────────────────────
  // Reaching here means the programme loaded and has onboarding questions, but
  // carries no Day 0 in `daily_content`, so ProgramPlayer cannot render it.
  //
  // This used to fall back to `components/wizard/` (TypeformWizard), a parallel
  // 13-value `FieldType` vocabulary imported from Figma Make and rendered only
  // here. It was deleted 2026-09-04: every live programme has a Day 0 (verified
  // against `equip:` in KV) and the admin auto-creates one at
  // `EquipProgramWizard.tsx:315`, so this branch is unreachable in practice.
  //
  // This is a knowingly accepted regression: a programme authored without Day 0
  // now shows an error instead of a working fallback. If that ever fires, the
  // fix is to give the programme a Day 0, not to restore the wizard.
  console.error(
    '[EquipProgramOnboarding] Programme has onboarding questions but no Day 0 — ' +
    'cannot render. Add a Day 0 to its daily_content.',
    { programId, title: unifiedProgram?.title }
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-4 text-center max-w-md">
        <Icon name="error" size={48} style={{ color: 'var(--color-status-danger)' }} />
        <h3 className="text-xl font-medium">Unable to Load Program Setup</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          This program is missing its first day and cannot be started yet.
        </p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    </div>
  );
}
