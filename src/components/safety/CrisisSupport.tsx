import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AlertTriangle, Phone, MessageSquare, ExternalLink, Heart, Shield } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

interface CrisisSupportProps {
  isVisible: boolean;
  onClose: () => void;
  triggerReason?: 'keywords' | 'user_request' | 'assessment_score';
}

export function CrisisSupport({ isVisible, onClose, triggerReason = 'user_request' }: CrisisSupportProps) {
  const isMobile = useIsMobile();
  const [hasInteracted, setHasInteracted] = useState(false);

  const crisisResources = [
    {
      name: 'National Suicide Prevention Lifeline',
      phone: '988',
      description: 'Free, confidential support 24/7',
      action: () => {
        setHasInteracted(true);
        window.open('tel:988', '_self');
      },
      icon: Phone,
      priority: 'high'
    },
    {
      name: 'Crisis Text Line',
      phone: '741741',
      description: 'Text HOME to 741741',
      action: () => {
        setHasInteracted(true);
        window.open('sms:741741?body=HOME', '_self');
      },
      icon: MessageSquare,
      priority: 'high'
    },
    {
      name: 'International Crisis Lines',
      description: 'Find help in your country',
      action: () => {
        setHasInteracted(true);
        window.open('https://findahelpline.com', '_blank', 'noopener,noreferrer');
      },
      icon: ExternalLink,
      priority: 'medium'
    },
    {
      name: 'Emergency Services',
      phone: '911',
      description: 'For immediate medical emergencies',
      action: () => {
        setHasInteracted(true);
        window.open('tel:911', '_self');
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
                  <strong>Remember:</strong> This app is not a substitute for professional mental health care. 
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
                    window.open('tel:988', '_self');
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
                  Call 988
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to manage crisis support display
export function useCrisisSupport() {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerReason, setTriggerReason] = useState<'keywords' | 'user_request' | 'assessment_score'>('user_request');

  const showCrisisSupport = (reason: 'keywords' | 'user_request' | 'assessment_score' = 'user_request') => {
    setTriggerReason(reason);
    setIsVisible(true);
    
    // Log crisis support activation (anonymized)
    console.log(`Crisis support activated: ${reason}`);
  };

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