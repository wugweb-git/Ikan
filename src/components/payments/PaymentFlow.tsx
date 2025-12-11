import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Icon } from '../Icon';
import { RazorpayPayment } from './RazorpayPayment';
import { useJourney } from '../../contexts/JourneyContext';
import { usePayment } from '../../contexts/PaymentContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../ui/utils';
import { format, addDays } from '../../lib/date-utils';

interface EquipProgram {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedCompletion: string;
}

interface PaymentFlowProps {
  program: EquipProgram;
  onComplete?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function PaymentFlow({ 
  program, 
  onComplete, 
  onCancel,
  className 
}: PaymentFlowProps) {
  const { journeyState, nextStep, jumpToStep, getProgress } = useJourney();
  const { currentTransaction } = usePayment();
  const { addNotification } = useNotifications();
  
  const [paymentStep, setPaymentStep] = useState<'preview' | 'payment' | 'success' | 'setup'>('preview');
  const [accessDetails, setAccessDetails] = useState<{
    purchaseDate: Date;
    expiryDate: Date;
    transactionId?: string;
  } | null>(null);

  // Journey progress for equip_purchase flow
  const journeyProgress = journeyState.currentFlow === 'equip_purchase' ? getProgress() : 0;

  const handlePurchaseConfirm = () => {
    setPaymentStep('payment');
    if (journeyState.currentFlow === 'equip_purchase') {
      jumpToStep('Payment');
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('🎉 Payment successful:', paymentId);
    
    const purchaseDate = new Date();
    const expiryDate = addDays(purchaseDate, 180); // JSON spec: expiry_days_default: 180
    
    setAccessDetails({
      purchaseDate,
      expiryDate,
      transactionId: paymentId
    });
    
    setPaymentStep('success');
    
    // Add success notification
    addNotification({
      type: 'success',
      title: 'Program Access Granted!',
      message: `You now have access to ${program.title} until ${format(expiryDate, 'MMM dd, yyyy')}`,
      action: {
        label: 'Start Program',
        onClick: () => {
          setPaymentStep('setup');
          if (journeyState.currentFlow === 'equip_purchase') {
            jumpToStep('EquipProgramAccess');
          }
        }
      }
    });
    
    if (journeyState.currentFlow === 'equip_purchase') {
      nextStep({ 
        programId: program.id, 
        paymentId,
        purchaseDate: purchaseDate.toISOString(),
        expiryDate: expiryDate.toISOString()
      });
    }
  };

  const handlePaymentFailure = (error: any) => {
    console.error('💥 Payment failed:', error);
    // Stay on payment step to allow retry
  };

  const handleSetupComplete = () => {
    setPaymentStep('setup');
    if (journeyState.currentFlow === 'equip_purchase') {
      jumpToStep('ReminderSetup');
      setTimeout(() => {
        onComplete?.();
      }, 1000);
    } else {
      onComplete?.();
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'preview', label: 'Preview', icon: 'eye' },
      { key: 'payment', label: 'Payment', icon: 'creditCard' },
      { key: 'success', label: 'Confirmation', icon: 'checkCircle' },
      { key: 'setup', label: 'Setup', icon: 'settings' }
    ];

    const currentIndex = steps.findIndex(step => step.key === paymentStep);

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          {steps.map((step, index) => (
            <div 
              key={step.key} 
              className={cn(
                "flex items-center gap-2",
                index <= currentIndex ? "opacity-100" : "opacity-40"
              )}
            >
              <div 
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                  index < currentIndex && "bg-primary border-primary",
                  index === currentIndex && "border-primary",
                  index > currentIndex && "border-gray-300"
                )}
                style={{
                  backgroundColor: index < currentIndex ? 'var(--color-primary-default)' : 'transparent',
                  borderColor: index <= currentIndex ? 'var(--color-primary-default)' : 'var(--color-border-default)',
                  color: index < currentIndex ? 'var(--color-primary-on)' : 'var(--color-text-primary)'
                }}
              >
                <Icon 
                  name={index < currentIndex ? 'check' : step.icon as any} 
                  size={14}
                />
              </div>
              <span 
                className="hidden sm:inline text-sm"
                style={{ 
                  color: index <= currentIndex ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
                }}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
        
        <Progress 
          value={(currentIndex / (steps.length - 1)) * 100} 
          className="h-2"
        />
      </div>
    );
  };

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Icon name="wrench" size={24} style={{ color: 'var(--color-primary-default)' }} />
          <div>
            <h2 
              style={{ 
                fontSize: 'var(--text-xl)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              {program.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                {program.category}
              </Badge>
              <Badge variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
                {program.level}
              </Badge>
            </div>
          </div>
        </div>

        <p style={{ 
          color: 'var(--color-text-muted)', 
          lineHeight: 'var(--line-height-md)',
          marginBottom: 'var(--spacing-4)'
        }}>
          {program.longDescription}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 style={{ fontWeight: 'var(--font-weight-medium)' }}>
            What's Included
          </h3>
          <ul className="space-y-2">
            {program.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <Icon 
                  name="check" 
                  size={16} 
                  style={{ color: 'var(--color-status-success)' }}
                />
                <span style={{ fontSize: 'var(--text-sm)' }}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 style={{ fontWeight: 'var(--font-weight-medium)' }}>
            Program Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Icon name="clock" size={16} style={{ color: 'var(--color-text-muted)' }} />
              <div>
                <div style={{ fontSize: 'var(--text-sm)' }}>Duration</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {program.duration}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="calendar" size={16} style={{ color: 'var(--color-text-muted)' }} />
              <div>
                <div style={{ fontSize: 'var(--text-sm)' }}>Access Period</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  180 days from purchase
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="target" size={16} style={{ color: 'var(--color-text-muted)' }} />
              <div>
                <div style={{ fontSize: 'var(--text-sm)' }}>Completion Time</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {program.estimatedCompletion}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <div 
            style={{ 
              fontSize: 'var(--text-2xl)', 
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)'
            }}
          >
            ₹{(program.price / 100).toFixed(2)}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            One-time purchase • No recurring charges
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handlePurchaseConfirm} className="gap-2">
            <Icon name="creditCard" size={16} />
            Purchase Now
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 
          style={{ 
            fontSize: 'var(--text-xl)', 
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-2)'
          }}
        >
          Complete Your Purchase
        </h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Secure payment powered by Razorpay
        </p>
      </div>

      <div className="flex justify-center">
        <RazorpayPayment
          programId={program.id}
          programTitle={program.title}
          amount={program.price}
          currency={program.currency}
          description={program.description}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      </div>

      <div className="text-center">
        <Button variant="ghost" onClick={() => setPaymentStep('preview')}>
          ← Back to Preview
        </Button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <Icon 
          name="checkCircle" 
          size={64} 
          className="mx-auto mb-4"
          style={{ color: 'var(--color-status-success)' }}
        />
        <h2 
          style={{ 
            fontSize: 'var(--text-xl)', 
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-2)'
          }}
        >
          Payment Successful!
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)' }}>
          Welcome to {program.title}. Your journey starts now!
        </p>
      </div>

      {accessDetails && (
        <div 
          className="p-4 rounded-lg text-left max-w-md mx-auto"
          style={{ backgroundColor: 'var(--color-bg-muted)' }}
        >
          <h3 
            style={{ 
              fontWeight: 'var(--font-weight-medium)', 
              marginBottom: 'var(--spacing-3)'
            }}
          >
            Access Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Purchase Date
              </span>
              <span style={{ fontSize: 'var(--text-sm)' }}>
                {format(accessDetails.purchaseDate, 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Valid Until
              </span>
              <span style={{ fontSize: 'var(--text-sm)' }}>
                {format(accessDetails.expiryDate, 'MMM dd, yyyy')}
              </span>
            </div>
            {accessDetails.transactionId && (
              <div className="flex justify-between">
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Transaction ID
                </span>
                <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'monospace' }}>
                  {accessDetails.transactionId.slice(-8)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <Button onClick={handleSetupComplete} className="gap-2">
        <Icon name="arrowRight" size={16} />
        Start Program
      </Button>
    </div>
  );

  const renderSetupStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <Icon 
          name="settings" 
          size={64} 
          className="mx-auto mb-4"
          style={{ color: 'var(--color-primary-default)' }}
        />
        <h2 
          style={{ 
            fontSize: 'var(--text-xl)', 
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-2)'
          }}
        >
          Setup Complete!
        </h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Your program is ready. Let's begin your mental health journey.
        </p>
      </div>

      <Button onClick={onComplete} className="gap-2">
        <Icon name="home" size={16} />
        Go to Dashboard
      </Button>
    </div>
  );

  return (
    <div className={className}>
      {/* Journey Progress (if in equip_purchase flow) */}
      {journeyState.currentFlow === 'equip_purchase' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Purchase Progress
            </span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
              {journeyProgress}%
            </span>
          </div>
          <Progress value={journeyProgress} className="h-2" />
        </div>
      )}

      <Card>
        <CardHeader>
          {renderStepIndicator()}
        </CardHeader>
        
        <CardContent>
          {paymentStep === 'preview' && renderPreviewStep()}
          {paymentStep === 'payment' && renderPaymentStep()}
          {paymentStep === 'success' && renderSuccessStep()}
          {paymentStep === 'setup' && renderSetupStep()}
        </CardContent>
      </Card>
    </div>
  );
}