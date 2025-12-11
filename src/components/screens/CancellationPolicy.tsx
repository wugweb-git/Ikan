import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';

interface CancellationPolicyProps {
  className?: string;
  onBack?: () => void;
}

export function CancellationPolicy({ className, onBack }: CancellationPolicyProps) {
  const isMobile = useIsMobile();

  const lastUpdated = "January 4, 2025";

  const cancellationTypes = [
    {
      icon: 'user-minus',
      title: 'Account Cancellation',
      description: 'Complete account closure and data removal',
      timeline: 'Immediate',
      features: [
        'Close your account permanently',
        'Delete all personal data within 30 days',
        'Stop all billing and subscriptions',
        'Option to export data before deletion'
      ],
      buttonText: 'Cancel Account',
      buttonAction: () => window.location.href = '/account'
    },
    {
      icon: 'calendar-x',
      title: 'Subscription Cancellation',
      description: 'End recurring billing while keeping account',
      timeline: 'End of billing period',
      features: [
        'Stop automatic renewal',
        'Keep account and free tier access',
        'Maintain assessment history',
        'Reactivate anytime'
      ],
      buttonText: 'Manage Subscription',
      buttonAction: () => window.location.href = '/account'
    },
    {
      icon: 'video-off',
      title: 'Appointment Cancellation',
      description: 'Cancel or reschedule consultation sessions',
      timeline: '24 hours before',
      features: [
        'Cancel up to 24 hours before for full refund',
        'Late cancellations may incur fees',
        'Reschedule without penalty (24h+ notice)',
        'Automatic reminders sent'
      ],
      buttonText: 'View Appointments',
      buttonAction: () => window.location.href = '/consultation'
    }
  ];

  const dataRetentionInfo = [
    {
      period: 'Immediate',
      items: ['Account access disabled', 'Billing stopped', 'Auto-renewal cancelled'],
      color: 'var(--color-status-danger)'
    },
    {
      period: '7 Days',
      items: ['Grace period for reactivation', 'Data remains accessible', 'No charges applied'],
      color: 'var(--color-status-warning)'
    },
    {
      period: '30 Days',
      items: ['Personal data permanently deleted', 'Account cannot be recovered', 'Anonymized research data retained'],
      color: 'var(--color-status-info)'
    }
  ];

  const steps = [
    {
      icon: 'settings',
      title: 'Access Settings',
      description: 'Go to your account settings or contact support'
    },
    {
      icon: 'check-square',
      title: 'Choose Option',
      description: 'Select subscription cancellation or full account closure'
    },
    {
      icon: 'download',
      title: 'Export Data',
      description: 'Download your assessment history and journal entries (optional)'
    },
    {
      icon: 'trash-2',
      title: 'Confirm',
      description: 'Confirm your cancellation choice and timeline'
    }
  ];

  return (
    <div 
      className={`min-h-screen ${className || ''}`}
      style={{
        backgroundColor: 'var(--color-bg-page)',
        fontFamily: 'var(--font-family-base)'
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-default) 0%, #1a1a1a 100%)',
          color: 'var(--color-text-inverse)',
          padding: isMobile ? 'var(--spacing-8) var(--spacing-4)' : 'var(--spacing-12) var(--spacing-6)'
        }}
      >
        <div 
          className="w-full mx-auto"
          style={{
            maxWidth: 'var(--constraint-content-max)'
          }}
        >
          {/* Back Navigation */}
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-6"
              style={{
                height: '48px',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'rgba(255, 255, 255, 0.9)',
                padding: '0 var(--spacing-3)'
              }}
            >
              <Icon name="arrow-left" size={16} className="mr-2" />
              Back
            </Button>
          )}

          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center mb-6">
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--spacing-4)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Icon name="user-x" size={32} style={{ color: 'var(--color-text-inverse)' }} />
              </div>
            </div>
            
            <h1 
              style={{
                fontSize: isMobile ? 'var(--text-3xl)' : 'var(--text-4xl)',
                fontWeight: 'var(--font-weight-medium)',
                lineHeight: 'var(--line-height-sm)',
                margin: '0',
                marginBottom: 'var(--spacing-4)'
              }}
            >
              Cancellation Policy
            </h1>
            
            <p 
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-regular)',
                lineHeight: 'var(--line-height-md)',
                opacity: 0.9,
                maxWidth: '600px',
                margin: '0 auto'
              }}
            >
              We understand plans change. Cancel anytime with no penalties or hidden fees. Your mental health journey is always in your control.
            </p>
            
            <div 
              className="inline-flex items-center gap-2 mt-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: 'var(--spacing-2) var(--spacing-4)',
                borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-regular)'
              }}
            >
              <Icon name="calendar" size={16} />
              Last updated: {lastUpdated}
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile ? 'var(--spacing-6) var(--spacing-4) 0' : 'var(--spacing-8) var(--spacing-6) 0',
          marginTop: '-var(--spacing-8)',
          position: 'relative',
          zIndex: 10
        }}
      >
        <Alert
          style={{
            backgroundColor: 'var(--color-status-info-light)',
            border: '1px solid var(--color-status-info)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--spacing-6)'
          }}
        >
          <Icon name="info" size={20} style={{ color: 'var(--color-status-info)' }} />
          <AlertDescription 
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--line-height-md)'
            }}
          >
            <strong style={{ fontWeight: 'var(--font-weight-medium)' }}>Good news:</strong> All cancellations are free and immediate. No cancellation fees, no questions asked. You can always reactivate your account later.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile ? '0 var(--spacing-4) var(--spacing-8)' : '0 var(--spacing-6) var(--spacing-12)'
        }}
      >
        {/* Cancellation Types */}
        <div 
          className="grid gap-6 mb-12"
          style={{
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
            marginBottom: 'var(--spacing-12)'
          }}
        >
          {cancellationTypes.map((type, index) => (
            <Card 
              key={index}
              className="relative overflow-hidden hover:shadow-md transition-shadow duration-300"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-light)'
              }}
            >
              {/* Timeline Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: 'var(--spacing-4)',
                  right: 'var(--spacing-4)',
                  backgroundColor: 'var(--color-status-success)',
                  color: 'var(--color-text-inverse)',
                  padding: 'var(--spacing-1) var(--spacing-3)',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {type.timeline}
              </div>

              <CardContent style={{ padding: 'var(--spacing-6)' }}>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div
                      style={{
                        backgroundColor: 'var(--color-primary-default)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-3)',
                        color: 'var(--color-text-inverse)',
                        flexShrink: 0
                      }}
                    >
                      <Icon name={type.icon as any} size={24} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 
                        style={{
                          fontSize: 'var(--text-lg)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)',
                          margin: '0 0 var(--spacing-1) 0'
                        }}
                      >
                        {type.title}
                      </h3>
                      <p 
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-regular)',
                          color: 'var(--color-text-muted)',
                          margin: '0',
                          lineHeight: 'var(--line-height-md)'
                        }}
                      >
                        {type.description}
                      </p>
                    </div>
                  </div>
                  
                  <ul className="space-y-2">
                    {type.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex}
                        className="flex items-start gap-2"
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-regular)',
                          color: 'var(--color-text-primary)',
                          lineHeight: 'var(--line-height-md)'
                        }}
                      >
                        <Icon 
                          name="check" 
                          size={16} 
                          style={{ 
                            color: 'var(--color-status-success)', 
                            marginTop: '2px',
                            flexShrink: 0
                          }} 
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={type.buttonAction}
                    variant="outline"
                    className="w-full"
                    style={{
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      border: '1px solid var(--color-border-default)',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {type.buttonText}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cancellation Process */}
        <Card
          className="mb-12"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            marginBottom: 'var(--spacing-12)'
          }}
        >
          <CardContent style={{ padding: 'var(--spacing-8)' }}>
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    margin: '0'
                  }}
                >
                  How to Cancel
                </h2>
                <p 
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--color-text-muted)',
                    margin: '0',
                    lineHeight: 'var(--line-height-md)'
                  }}
                >
                  Simple steps to cancel your subscription or account
                </p>
              </div>

              <div 
                className="grid gap-6"
                style={{
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))'
                }}
              >
                {steps.map((step, index) => (
                  <div key={index} className="text-center space-y-3">
                    <div 
                      className="relative inline-flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--color-accent-default)',
                        borderRadius: '50%',
                        width: '64px',
                        height: '64px',
                        color: 'var(--color-primary-default)'
                      }}
                    >
                      <Icon name={step.icon as any} size={24} />
                      <div
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          backgroundColor: 'var(--color-primary-default)',
                          color: 'var(--color-text-inverse)',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-weight-medium)'
                        }}
                      >
                        {index + 1}
                      </div>
                    </div>
                    
                    <div>
                      <h3 
                        style={{
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)',
                          margin: '0 0 var(--spacing-1) 0'
                        }}
                      >
                        {step.title}
                      </h3>
                      <p 
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-regular)',
                          color: 'var(--color-text-muted)',
                          margin: '0',
                          lineHeight: 'var(--line-height-md)'
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Button
                  onClick={() => window.location.href = '/account'}
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)',
                    backgroundColor: 'var(--semantic-button-primary-bg)',
                    color: 'var(--semantic-button-primary-fg)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    border: 'none'
                  }}
                >
                  <Icon name="settings" size={20} style={{ marginRight: 'var(--spacing-2)' }} />
                  Go to Account Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention Timeline */}
        <Card
          className="mb-12"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            marginBottom: 'var(--spacing-12)'
          }}
        >
          <CardContent style={{ padding: 'var(--spacing-8)' }}>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    margin: '0'
                  }}
                >
                  What Happens to Your Data
                </h2>
                <p 
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--color-text-muted)',
                    margin: '0',
                    lineHeight: 'var(--line-height-md)'
                  }}
                >
                  Clear timeline of data retention after cancellation
                </p>
              </div>

              <div className="space-y-4">
                {dataRetentionInfo.map((period, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-bg-muted)',
                      border: '1px solid var(--color-border-light)'
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: period.color,
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text-inverse)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        flexShrink: 0
                      }}
                    >
                      <Icon name="clock" size={16} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 
                        style={{
                          fontSize: 'var(--text-lg)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)',
                          margin: '0 0 var(--spacing-2) 0'
                        }}
                      >
                        {period.period}
                      </h3>
                      
                      <ul className="space-y-1">
                        {period.items.map((item, itemIndex) => (
                          <li 
                            key={itemIndex}
                            className="flex items-start gap-2"
                            style={{
                              fontSize: 'var(--text-sm)',
                              fontWeight: 'var(--font-weight-regular)',
                              color: 'var(--color-text-muted)',
                              lineHeight: 'var(--line-height-md)'
                            }}
                          >
                            <Icon 
                              name="circle" 
                              size={8} 
                              style={{ 
                                marginTop: '6px',
                                flexShrink: 0,
                                color: period.color
                              }} 
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card 
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            textAlign: 'center'
          }}
        >
          <CardContent style={{ padding: 'var(--spacing-8)' }}>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    margin: '0'
                  }}
                >
                  Need Help with Cancellation?
                </h3>
                
                <p 
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--color-text-muted)',
                    margin: '0',
                    lineHeight: 'var(--line-height-md)',
                    maxWidth: '500px',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                >
                  Our support team can help you cancel, pause, or modify your subscription. We're here to make the process as smooth as possible.
                </p>
              </div>

              <div className="grid gap-4" style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                <a
                  href="mailto:support@ikan.health?subject=Cancellation Request"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: 'var(--color-primary-default)',
                    color: 'var(--color-text-inverse)',
                    textDecoration: 'none',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  <Icon name="mail" size={20} />
                  Email Support
                </a>
                
                <button
                  onClick={() => window.location.href = '/contact'}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-default)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    cursor: 'pointer'
                  }}
                >
                  <Icon name="message-circle" size={20} />
                  Contact Form
                </button>
              </div>

              <div 
                className="text-center text-sm"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-regular)',
                  color: 'var(--color-text-muted)',
                  padding: 'var(--spacing-4)',
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-light)'
                }}
              >
                <Icon name="heart" size={16} style={{ marginRight: 'var(--spacing-1)', color: 'var(--color-status-danger)' }} />
                We're sorry to see you go, but your mental health journey is personal. You can always come back when you're ready.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}