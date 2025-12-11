import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';

// Payment & Journey Components
import { 
  PaymentProvider, 
  usePayment,
  RazorpayPayment,
  PaymentFlow,
  formatCurrency,
  PAYMENT_CONSTANTS 
} from './payments';

import { 
  JourneyProvider, 
  useJourney,
  JourneyManager,
  QuickJourneyStart,
  JOURNEY_FLOWS,
  STEP_METADATA 
} from './journeys';

import { cn } from './ui/utils';
import { Icon } from './Icon';

// Demo Components
function PaymentDemoContent() {
  const { showToast } = usePayment();
  
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  // Sample programs from JSON monetization spec
  const samplePrograms = [
    {
      id: 'anxiety-relief-program',
      title: 'Anxiety Relief Program',
      description: 'Evidence-based techniques to manage anxiety and build resilience',
      longDescription: 'This comprehensive 8-week program combines cognitive behavioral therapy techniques, mindfulness practices, and daily exercises to help you understand and manage anxiety. You\'ll learn practical tools that you can use immediately and build long-term coping strategies.',
      price: 4999, // ₹49.99 in paise
      currency: 'INR',
      duration: '8 weeks',
      features: [
        '56 days of guided content',
        'CBT-based anxiety management techniques',
        'Daily mindfulness exercises',
        'Progress tracking and insights',
        'Expert-curated resources',
        '24/7 access for 180 days'
      ],
      category: 'anxiety',
      level: 'beginner' as const,
      estimatedCompletion: '8-12 weeks'
    },
    {
      id: 'mindfulness-mastery',
      title: 'Mindfulness Mastery',
      description: 'Develop a sustainable meditation and mindfulness practice',
      longDescription: 'Master the art of mindfulness through this structured 6-week program. Learn various meditation techniques, understand the science behind mindfulness, and integrate these practices into your daily life for lasting mental health benefits.',
      price: 3999, // ₹39.99 in paise
      currency: 'INR',
      duration: '6 weeks',
      features: [
        '42 days of meditation guides',
        'Multiple meditation styles',
        'Scientific insights on mindfulness',
        'Habit formation strategies',
        'Community support access',
        'Lifetime access to core content'
      ],
      category: 'mindfulness',
      level: 'intermediate' as const,
      estimatedCompletion: '6-8 weeks'
    },
    {
      id: 'depression-support',
      title: 'Depression Support Program',
      description: 'Comprehensive support for managing depression symptoms',
      longDescription: 'A compassionate, evidence-based program designed to support individuals experiencing depression. Includes mood tracking, behavioral activation techniques, cognitive restructuring, and self-care strategies developed by mental health professionals.',
      price: 5999, // ₹59.99 in paise
      currency: 'INR',
      duration: '12 weeks',
      features: [
        '84 days of structured support',
        'Mood tracking and analytics',
        'Behavioral activation exercises',
        'Cognitive restructuring techniques',
        'Crisis support resources',
        'Professional guidance materials'
      ],
      category: 'depression',
      level: 'advanced' as const,
      estimatedCompletion: '12-16 weeks'
    }
  ];

  const handlePurchase = (program: any) => {
    setSelectedProgram(program);
    setShowPaymentFlow(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentFlow(false);
    setSelectedProgram(null);
    showToast('success', 'Welcome to your program!', 'Your mental health journey begins now.');
  };

  return (
    <div className="space-y-8">
      
      {/* Payment Flow Demo */}
      {showPaymentFlow && selectedProgram && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Purchase</CardTitle>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              JSON Monetization Spec: Razorpay integration with one-time purchase model
            </p>
          </CardHeader>
          <CardContent>
            <PaymentFlow
              program={selectedProgram}
              onComplete={handlePaymentComplete}
              onCancel={() => setShowPaymentFlow(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Program Showcase */}
      {!showPaymentFlow && (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h2 
              style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)'
              }}
            >
              Mental Health Programs
            </h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Evidence-based programs designed to support your mental health journey. 
              One-time purchase with 180 days access as per JSON specification.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {samplePrograms.map((program) => (
              <Card key={program.id} className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
                      {program.category}
                    </Badge>
                    <Badge 
                      variant={program.level === 'beginner' ? 'outline' : program.level === 'intermediate' ? 'secondary' : 'default'}
                      style={{ fontSize: 'var(--text-xs)' }}
                    >
                      {program.level}
                    </Badge>
                  </div>
                  <CardTitle style={{ fontSize: 'var(--text-lg)' }}>
                    {program.title}
                  </CardTitle>
                  <p style={{ 
                    color: 'var(--color-text-muted)', 
                    fontSize: 'var(--text-sm)',
                    lineHeight: 'var(--line-height-md)'
                  }}>
                    {program.description}
                  </p>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Icon name="clock" size={16} style={{ color: 'var(--color-text-muted)' }} />
                      <span style={{ fontSize: 'var(--text-sm)' }}>{program.duration}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon name="target" size={16} style={{ color: 'var(--color-text-muted)' }} />
                      <span style={{ fontSize: 'var(--text-sm)' }}>{program.estimatedCompletion}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon name="calendar" size={16} style={{ color: 'var(--color-text-muted)' }} />
                      <span style={{ fontSize: 'var(--text-sm)' }}>180 days access</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div 
                          style={{ 
                            fontSize: 'var(--text-lg)', 
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          {formatCurrency(program.price, program.currency)}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          One-time purchase
                        </div>
                      </div>
                      <Button 
                        onClick={() => handlePurchase(program)}
                        className="gap-2"
                      >
                        <Icon name="creditCard" size={14} />
                        Purchase
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Features */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Features</CardTitle>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                JSON Monetization Specification Implementation
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <Icon name="shield" size={32} className="mx-auto" style={{ color: 'var(--color-status-success)' }} />
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>Secure Payments</h4>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Razorpay integration with server-side verification
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <Icon name="creditCard" size={32} className="mx-auto" style={{ color: 'var(--color-status-info)' }} />
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>Multiple Methods</h4>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Cards, UPI, wallets & net banking
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <Icon name="calendar" size={32} className="mx-auto" style={{ color: 'var(--color-status-warning)' }} />
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>180 Days Access</h4>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Extended access with 7-day reminders
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <Icon name="bell" size={32} className="mx-auto" style={{ color: 'var(--color-primary-default)' }} />
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>Smart Reminders</h4>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Expiry notifications and renewal prompts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function JourneyDemoContent() {
  const { startJourney, journeyState, getProgress } = useJourney();
  
  const progress = getProgress();

  return (
    <div className="space-y-8">
      
      {/* Current Journey Status */}
      {journeyState.currentFlow ? (
        <JourneyManager 
          onNavigate={(route) => console.log('Navigate to:', route)}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Start Your Journey</CardTitle>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              Choose a journey path based on the JSON journeys specification
            </p>
          </CardHeader>
          <CardContent>
            <QuickJourneyStart 
              onJourneyStart={(flow) => console.log('Started journey:', flow)}
            />
          </CardContent>
        </Card>
      )}

      {/* Journey Flows Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Available Journey Flows</CardTitle>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            JSON Specification: Phase 1 journey flows with step-by-step guidance
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {Object.entries(JOURNEY_FLOWS).map(([flowKey, steps]) => (
            <div key={flowKey} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 
                  style={{ 
                    fontSize: 'var(--text-base)', 
                    fontWeight: 'var(--font-weight-medium)',
                    textTransform: 'capitalize'
                  }}
                >
                  {flowKey.replace('_', ' ')} Journey
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startJourney(flowKey as any)}
                  className="gap-2"
                >
                  <Icon name="play" size={14} />
                  Start
                </Button>
              </div>
              
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                {steps.map((step, index) => {
                  const metadata = STEP_METADATA[step];
                  const isActive = journeyState.currentFlow === flowKey && journeyState.currentStep === step;
                  const isCompleted = journeyState.completedSteps.includes(step);
                  
                  return (
                    <div 
                      key={step}
                      className={cn(
                        "p-3 rounded-lg border transition-all",
                        isActive && "border-primary bg-muted",
                        isCompleted && "bg-success/10 border-success"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                            isCompleted ? "bg-success text-white" : 
                            isActive ? "bg-primary text-primary-foreground" : 
                            "bg-muted"
                          )}
                        >
                          {isCompleted ? (
                            <Icon name="check" size={12} />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <Icon 
                          name={metadata.icon as any} 
                          size={14} 
                          style={{ 
                            color: isActive ? 'var(--color-primary-default)' : 'var(--color-text-muted)'
                          }}
                        />
                      </div>
                      <div 
                        style={{ 
                          fontSize: 'var(--text-sm)', 
                          fontWeight: 'var(--font-weight-medium)',
                          marginBottom: '4px'
                        }}
                      >
                        {metadata.name}
                      </div>
                      <p style={{ 
                        fontSize: 'var(--text-xs)', 
                        color: 'var(--color-text-muted)',
                        lineHeight: 'var(--line-height-md)'
                      }}>
                        {metadata.description}
                      </p>
                      {metadata.estimatedTime && (
                        <div 
                          className="mt-2 text-xs"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          ⏱️ {metadata.estimatedTime}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Phase 2 Deferred Features */}
      <Card>
        <CardHeader>
          <CardTitle>Phase 2 Features (Deferred)</CardTitle>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            JSON Specification: Features planned for future releases
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                feature: 'CommunityFeatures',
                name: 'Community Support',
                description: 'Peer support groups and community interactions',
                icon: 'users'
              },
              {
                feature: 'AdvancedBilling',
                name: 'Advanced Billing',
                description: 'Subscriptions, refunds, invoices, and complex billing',
                icon: 'creditCard'
              },
              {
                feature: 'LiveConsults',
                name: 'Live Consultations',
                description: 'Real-time video/audio sessions with professionals',
                icon: 'video'
              },
              {
                feature: 'BookmarkProgress',
                name: 'Advanced Progress',
                description: 'Bookmarks, favorites, and detailed progress analytics',
                icon: 'bookmark'
              }
            ].map((item) => (
              <div 
                key={item.feature}
                className="p-4 rounded-lg border-2 border-dashed opacity-60"
                style={{ borderColor: 'var(--color-border-default)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon 
                    name={item.icon as any} 
                    size={20} 
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {item.name}
                  </h4>
                  <Badge variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
                    Phase 2
                  </Badge>
                </div>
                <p style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--line-height-md)'
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function MonetizationJourneysShowcase() {
  return (
    <div className="min-h-screen p-4 space-y-8" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4 mb-8">
          <h1 
            style={{ 
              fontSize: 'var(--text-3xl)', 
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)'
            }}
          >
            iKan Monetization & Journeys Showcase
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)' }}>
            Complete implementation of payment flows and user journey management with JSON specification compliance.
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary" className="w-fit">Monetization JSON</Badge>
            <Badge variant="secondary" className="w-fit">Journeys JSON</Badge>
            <Badge variant="outline" className="w-fit">Razorpay Integration</Badge>
          </div>
        </div>

        <PaymentProvider>
          <JourneyProvider>
            <Tabs defaultValue="payments" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="payments">Payment System</TabsTrigger>
                <TabsTrigger value="journeys">User Journeys</TabsTrigger>
              </TabsList>

              <TabsContent value="payments" className="space-y-6">
                <PaymentDemoContent />
              </TabsContent>

              <TabsContent value="journeys" className="space-y-6">
                <JourneyDemoContent />
              </TabsContent>
            </Tabs>

            {/* Implementation Summary */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>JSON Implementation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                      Payment System
                    </h4>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                      <li>• Razorpay integration (client + server)</li>
                      <li>• One-time purchase model (INR currency)</li>
                      <li>• 180 days access with 7-day reminders</li>
                      <li>• Transaction tracking and receipts</li>
                      <li>• Webhook verification and fulfillment</li>
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                      User Journeys
                    </h4>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                      <li>• Three core flows: new_user, returning_user, equip_purchase</li>
                      <li>• Step-by-step guidance with progress tracking</li>
                      <li>• Context persistence and state management</li>
                      <li>• Smart journey detection and recommendations</li>
                      <li>• Phase 2 feature planning and deferral</li>
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                      Integration Features
                    </h4>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                      <li>• React Context state management</li>
                      <li>• TypeScript type safety throughout</li>
                      <li>• Server-side verification and webhooks</li>
                      <li>• Offline fallbacks and error handling</li>
                      <li>• Mental health UX considerations</li>
                    </ul>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    Production Ready Features
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <div>
                      <p><strong>Security:</strong> Server-side payment verification, secure token handling</p>
                      <p><strong>UX:</strong> Gentle error messages, supportive language, accessibility</p>
                    </div>
                    <div>
                      <p><strong>Reliability:</strong> Transaction retry logic, webhook handling, state recovery</p>
                      <p><strong>Scalability:</strong> Modular contexts, efficient state updates, caching</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                    Complete implementation of the monetization and journeys JSON specifications with Razorpay payment integration, 
                    user journey management, transaction tracking, and webhook handling. Ready for production deployment with 
                    mental health-focused UX patterns and robust error handling.
                  </p>
                </div>
              </CardContent>
            </Card>
          </JourneyProvider>
        </PaymentProvider>
      </div>
    </div>
  );
}