import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { AlertTriangle, Phone, MessageSquare, ExternalLink, Heart, Shield } from 'lucide-react';
import { useIsMobile } from '../../ui/hooks/useIsMobile';

interface CrisisSupportProps {
  isVisible: boolean;
  onClose: () => void;
  triggerReason?: 'keywords' | 'user_request' | 'assessment_score';
}

export function CrisisSupport({ isVisible, onClose, triggerReason = 'user_request' }: CrisisSupportProps) {
  const isMobile = useIsMobile();
  const [hasInteracted, setHasInteracted] = useState(false);

  // Localised to India 2026-09-01. These were US numbers (988 Lifeline,
  // 741741 Crisis Text Line, 911) on an India-facing product — dialling any of
  // them from an Indian handset reaches nobody.
  //
  // Tele-MANAS is the Government of India's national mental-health helpline
  // (24/7, multilingual, free). iCALL is TISS's counselling line. AASRA is a
  // 24/7 suicide-prevention line. 112 is India's single emergency number.
  //
  // VERIFY THESE BEFORE EACH RELEASE — helpline numbers change, and a dead
  // number in a crisis panel is worse than no panel.
  const crisisResources = [
    {
      name: 'Tele-MANAS',
      phone: '14416',
      description: 'Government of India mental health helpline — 24/7, free, multilingual',
      action: () => {
        setHasInteracted(true);
        window.open('tel:14416', '_self');
      },
      icon: Phone,
      priority: 'high'
    },
    {
      name: 'iCALL',
      phone: '9152987821',
      description: 'TISS counselling helpline — Mon to Sat, 10am to 8pm',
      action: () => {
        setHasInteracted(true);
        window.open('tel:9152987821', '_self');
      },
      icon: Phone,
      priority: 'high'
    },
    {
      name: 'AASRA',
      phone: '9820466726',
      description: 'Suicide prevention helpline — 24/7, confidential',
      action: () => {
        setHasInteracted(true);
        window.open('tel:9820466726', '_self');
      },
      icon: MessageSquare,
      priority: 'high'
    },
    {
      name: 'Find a helpline near you',
      description: 'Verified helplines by country and region',
      action: () => {
        setHasInteracted(true);
        window.open('https://findahelpline.com/in', '_blank', 'noopener,noreferrer');
      },
      icon: ExternalLink,
      priority: 'medium'
    },
    {
      name: 'Emergency Services',
      phone: '112',
      description: "India's emergency number — for immediate medical emergencies",
      action: () => {
        setHasInteracted(true);
        window.open('tel:112', '_self');
      },
      icon: AlertTriangle,
      priority: 'emergency'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'var(--color-status-danger)';
      case 'high': return 'var(--color-status-warning)';
      case 'medium': return 'var(--color-status-info)';
      default: return 'var(--color-primary-default)';
    }
  };

  const getMessage = () => {
    switch (triggerReason) {
      case 'keywords':
        return "We noticed you might be going through a difficult time. You're not alone, and help is available.";
      case 'assessment_score':
        return "Your assessment responses suggest you might benefit from immediate support. Please consider reaching out.";
      default:
        return "If you're having thoughts of self-harm or suicide, please reach out for help immediately.";
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-md"
        >
          <Card 
            style={{
              background: 'var(--color-bg-card)',
              border: `2px solid var(--color-status-danger)`,
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            <CardHeader 
              className="text-center"
              style={{ 
                backgroundColor: 'var(--color-status-danger-light)',
                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart size={24} style={{ color: 'var(--color-status-danger)' }} />
                <Shield size={24} style={{ color: 'var(--color-status-danger)' }} />
              </div>
              <CardTitle style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                textAlign: 'center'
              }}>
                You Matter & Help is Available
              </CardTitle>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                marginTop: 'var(--spacing-2)'
              }}>
                {getMessage()}
              </p>
            </CardHeader>

            <CardContent style={{ padding: 'var(--spacing-4)' }}>
              <div className="space-y-3">
                {crisisResources.map((resource, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      onClick={resource.action}
                      className="w-full justify-start p-4 h-auto"
                      variant={resource.priority === 'emergency' ? 'destructive' : 'outline'}
                      style={{
                        borderColor: getPriorityColor(resource.priority),
                        backgroundColor: resource.priority === 'emergency' 
                          ? 'var(--color-status-danger)' 
                          : 'transparent',
                        color: resource.priority === 'emergency' 
                          ? 'white' 
                          : getPriorityColor(resource.priority),
                        borderWidth: '2px'
                      }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <resource.icon size={20} />
                        <div className="flex-1 text-left">
                          <div style={{ 
                            fontWeight: 'var(--font-weight-medium)',
                            fontSize: 'var(--text-sm)'
                          }}>
                            {resource.name}
                            {resource.phone && (
                              <span style={{ marginLeft: '8px' }}>({resource.phone})</span>
                            )}
                          </div>
                          <div style={{ 
                            fontSize: 'var(--text-xs)', 
                            opacity: 0.8,
                            marginTop: '2px'
                          }}>
                            {resource.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>

              <div 
                className="mt-6 p-3 rounded-lg"
                style={{ 
                  backgroundColor: 'var(--color-status-info-light)',
                  border: `1px solid var(--color-status-info)`
                }}
              >
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-primary)',
                  textAlign: 'center',
                  lineHeight: 'var(--line-height-sm)'
                }}>
                  <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Remember:</span> This app is not a substitute for professional mental health care. 
                  If you're in crisis, please contact emergency services or a crisis hotline immediately.
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)'
                  }}
                >
                  I'm Safe Now
                </Button>
                <Button
                  onClick={() => {
                    setHasInteracted(true);
                    window.open('tel:14416', '_self');
                  }}
                  className="flex-1"
                  style={{
                    backgroundColor: 'var(--color-status-danger)',
                    color: 'white',
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)'
                  }}
                >
                  <Phone size={16} />
                  Call 14416
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export type CrisisReason = 'keywords' | 'user_request' | 'assessment_score';

/**
 * Module-level trigger.
 *
 * The panel's state lives in App.tsx via useCrisisSupport(), but the places
 * that can detect distress — the mood-journal note, a free-text assessment
 * block, a severe assessment band — are many levels down the tree. Rather than
 * thread a callback through every intermediate component or add another
 * provider around the app, the mounted hook registers its setter here and any
 * module can call triggerCrisisSupport().
 *
 * Before 2026-09-01 nothing called showCrisisSupport at all: App.tsx
 * destructured every other value from the hook and omitted it, and
 * detectCrisisKeywords had zero call sites, so the panel could not be opened by
 * any input method.
 */
let activeCrisisTrigger: ((reason?: CrisisReason) => void) | null = null;

/** Open the crisis panel from anywhere. No-ops if the hook is not mounted. */
export function triggerCrisisSupport(reason: CrisisReason = 'user_request'): void {
  if (activeCrisisTrigger) {
    activeCrisisTrigger(reason);
  } else {
    // Loud on purpose: a silently missing crisis panel is how this went
    // unnoticed for as long as it did.
    console.warn('[crisis] triggerCrisisSupport called but no CrisisSupport host is mounted');
  }
}

// Hook to manage crisis support display
export function useCrisisSupport() {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerReason, setTriggerReason] = useState<CrisisReason>('user_request');

  const showCrisisSupport = useCallback((reason: CrisisReason = 'user_request') => {
    setTriggerReason(reason);
    setIsVisible(true);

    // Log crisis support activation (anonymized — never log the text that
    // triggered it).
    console.log(`Crisis support activated: ${reason}`);
  }, []);

  // Register this instance as the app-wide trigger for as long as it is mounted.
  useEffect(() => {
    activeCrisisTrigger = showCrisisSupport;
    return () => {
      if (activeCrisisTrigger === showCrisisSupport) activeCrisisTrigger = null;
    };
  }, [showCrisisSupport]);

  const hideCrisisSupport = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    triggerReason,
    showCrisisSupport,
    hideCrisisSupport
  };
}