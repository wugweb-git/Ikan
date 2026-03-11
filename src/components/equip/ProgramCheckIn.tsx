import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { apiClient } from '../../lib/api-client';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../ui/utils';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export interface CheckInResult {
  programId: string;
  day: number;
  perceivedChange: 'better' | 'same' | 'worse';
  confidenceLevel: number; // 1-5
  continuationIntent: 'continue' | 'pause' | 'stop';
  feedback: string;
}

interface ProgramCheckInProps {
  programId: string;
  programTitle: string;
  currentDay: number; // 7, 14, 30, etc.
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (result: CheckInResult) => void;
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export function ProgramCheckIn({ 
  programId, 
  programTitle,
  currentDay,
  isOpen, 
  onClose,
  onComplete 
}: ProgramCheckInProps) {
  const { showToast } = useNotifications();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [data, setData] = useState<Partial<CheckInResult>>({
    programId,
    day: currentDay,
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const updateData = (updates: Partial<CheckInResult>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (!data.perceivedChange || !data.confidenceLevel || !data.continuationIntent) {
        showToast('warning', 'Missing Info', 'Please complete all required fields.');
        return;
      }

      const result: CheckInResult = {
        programId,
        day: currentDay,
        perceivedChange: data.perceivedChange,
        confidenceLevel: data.confidenceLevel,
        continuationIntent: data.continuationIntent,
        feedback: data.feedback || ''
      };

      await apiClient.saveProgramCheckIn(result);
      showToast('success', 'Check-in Complete', 'Thank you for your feedback.');
      if (onComplete) onComplete(result);
      onClose();
    } catch (error) {
      console.error('Failed to save check-in:', error);
      showToast('error', 'Error', 'Could not save check-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
          <div>
            <div className="text-xs font-medium tracking-wider uppercase mb-1" style={{ color: 'var(--color-primary-default)' }}>
              Program Check-in • Day {currentDay}
            </div>
            <h2 className="text-xl" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
              {programTitle}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Icon name="x" size={24} />
          </button>
        </div>

        {/* Progress */}
        <div className="h-1 w-full" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          <motion.div 
            className="h-full"
            style={{ backgroundColor: 'var(--color-primary-default)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Perceived Change */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-2xl text-center" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Compared to when you started, how are you feeling now?
                </h3>
                <div className="space-y-3">
                  {[
                    { value: 'better', label: 'Better', icon: 'trending-up' },
                    { value: 'same', label: 'About the same', icon: 'minus' },
                    { value: 'worse', label: 'Worse', icon: 'trending-down' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        updateData({ perceivedChange: opt.value as any });
                        setTimeout(handleNext, 250);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 group text-left",
                        data.perceivedChange === opt.value
                          ? "border-[var(--color-primary-default)] bg-[var(--color-primary-light)] text-[var(--color-primary-default)]"
                          : "border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]"
                      )}
                    >
                      <span className="text-lg" style={{ fontWeight: 'var(--font-weight-medium)' }}>{opt.label}</span>
                      {data.perceivedChange === opt.value && (
                        <Icon name="check" size={20} style={{ color: 'var(--color-primary-default)' }} />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Confidence */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center"
              >
                <h3 className="text-2xl" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  How confident do you feel handling this on your own?
                </h3>
                
                <div className="flex justify-between items-center px-4">
                  <span className="text-sm w-20 text-left" style={{ color: 'var(--color-text-muted)' }}>Not confident</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          updateData({ confidenceLevel: val });
                          setTimeout(handleNext, 250);
                        }}
                        className={cn(
                          "w-12 h-14 rounded-xl text-xl transition-all shadow-sm border-b-4",
                          data.confidenceLevel === val
                            ? "translate-y-1 border-b-0"
                            : ""
                        )}
                        style={data.confidenceLevel === val
                          ? { 
                              backgroundColor: 'var(--color-primary-default)', 
                              color: 'var(--color-text-inverse)',
                              fontWeight: 'var(--font-weight-medium)',
                              borderColor: 'var(--color-primary-dark)'
                            }
                          : { 
                              backgroundColor: 'var(--color-bg-card)',
                              color: 'var(--color-text-primary)',
                              fontWeight: 'var(--font-weight-medium)',
                              borderColor: 'var(--color-border-default)'
                            }
                        }
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm w-20 text-right" style={{ color: 'var(--color-text-muted)' }}>Very confident</span>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Continuation Intent */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-2xl text-center" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  What would you like to do next?
                </h3>
                <div className="space-y-3">
                  {[
                    { value: 'continue', label: 'Continue this program', desc: 'Keep going with daily sessions' },
                    { value: 'pause', label: 'Take a short pause', desc: 'I need a break but will return' },
                    { value: 'stop', label: 'Try something else', desc: 'This isn\'t working for me right now' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        updateData({ continuationIntent: opt.value as any });
                        setTimeout(handleNext, 250);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 text-left",
                        data.continuationIntent === opt.value
                          ? "border-[var(--color-primary-default)] bg-[var(--color-primary-light)]"
                          : "border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-muted)]"
                      )}
                    >
                      <div>
                        <span className="block text-lg" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{opt.label}</span>
                        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{opt.desc}</span>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                        data.continuationIntent === opt.value
                          ? "border-[var(--color-primary-default)] bg-[var(--color-primary-default)]"
                          : ""
                      )}
                      style={data.continuationIntent !== opt.value ? { borderColor: 'var(--color-border-default)' } : undefined}
                      >
                        {data.continuationIntent === opt.value && <Icon name="check" size={14} className="text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Optional Feedback */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    What's helped most so far?
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)' }}>This step is optional.</p>
                </div>
                
                <textarea
                  value={data.feedback || ''}
                  onChange={(e) => updateData({ feedback: e.target.value })}
                  placeholder="The breathing exercises, the daily tips..."
                  className="w-full h-40 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-default)] resize-none text-lg"
                  style={{ 
                    border: '1px solid var(--color-border-default)',
                    backgroundColor: 'var(--color-bg-input)'
                  }}
                />

                <Button 
                  onClick={handleSave} 
                  className="w-full h-14 text-lg rounded-xl shadow-lg shadow-[var(--color-primary-default)]/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Submit Check-in'}
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div 
          className="px-8 py-6 flex justify-between items-center"
          style={{ 
            borderTop: '1px solid var(--color-border-default)',
            backgroundColor: 'color-mix(in srgb, var(--color-bg-muted) 50%, transparent)'
          }}
        >
          {step > 1 ? (
            <button 
              onClick={handlePrev} 
              className="text-sm flex items-center gap-1 px-2 py-2 rounded-lg transition-colors"
              style={{ color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <Icon name="chevronLeft" size={16} /> Back
            </button>
          ) : (
            <div />
          )}
          
          <div className="text-xs" style={{ color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
            Step {step} of {totalSteps}
          </div>
        </div>
      </motion.div>
    </div>
  );
}