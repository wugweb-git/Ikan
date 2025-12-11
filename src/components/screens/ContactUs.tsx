import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';

interface ContactUsProps {
  className?: string;
  onBack?: () => void;
}

export function ContactUs({ className, onBack }: ContactUsProps) {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', formData);
  };

  const contactMethods = [
    {
      icon: 'mail',
      title: 'Email Support',
      description: 'Get help with your account and services',
      value: 'support@ikan.health',
      action: 'mailto:support@ikan.health'
    },
    {
      icon: 'phone',
      title: 'Crisis Support',
      description: '24/7 immediate mental health assistance',
      value: '988 Suicide & Crisis Lifeline',
      action: 'tel:988'
    },
    {
      icon: 'message-circle',
      title: 'Live Chat',
      description: 'Chat with our support team',
      value: 'Available 9 AM - 6 PM EST',
      action: '#'
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
          padding: isMobile ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)' : 'var(--spacing-12) var(--ikan-component-spacing-large)'
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
            <button
              onClick={onBack}
              className="flex items-center gap-2 mb-6 touch-target hover:opacity-80 transition-all duration-200"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-regular)',
                color: 'rgba(255, 255, 255, 0.8)',
                background: 'none',
                border: 'none',
                padding: '0',
                cursor: 'pointer',
                marginBottom: 'var(--ikan-component-spacing-large)'
              }}
            >
              <Icon name="arrow-left" size={16} />
              Back
            </button>
          )}

          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center mb-6">
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--ikan-component-spacing-default)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Icon name="headphones" size={32} style={{ color: 'var(--color-text-inverse)' }} />
              </div>
            </div>
            
            <h1 
              style={{
                fontSize: isMobile ? 'var(--text-3xl)' : 'var(--text-4xl)',
                fontWeight: 'var(--font-weight-medium)',
                lineHeight: 'var(--line-height-sm)',
                margin: '0',
                marginBottom: 'var(--ikan-component-spacing-default)'
              }}
            >
              We're Here to Help
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
              Your mental health journey matters to us. Reach out for support, questions, or just to connect.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)' : 'var(--spacing-12) var(--ikan-component-spacing-large)',
          marginTop: '-var(--ikan-component-spacing-large)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Contact Methods Grid */}
        <div 
          className="grid gap-6 mb-12"
          style={{
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            marginBottom: 'var(--spacing-12)'
          }}
        >
          {contactMethods.map((method, index) => (
            <Card 
              key={index}
              className="hover:shadow-md transition-all duration-300 cursor-pointer group"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-light)',
                overflow: 'hidden'
              }}
              onClick={() => {
                if (method.action.startsWith('#')) return;
                window.open(method.action, '_blank');
              }}
            >
              <CardContent 
                style={{
                  padding: 'var(--ikan-component-spacing-large)',
                  textAlign: 'center'
                }}
              >
                <div className="space-y-4">
                  <div 
                    className="inline-flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{
                      backgroundColor: 'var(--color-primary-default)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--ikan-component-spacing-small)',
                      color: 'var(--color-text-inverse)'
                    }}
                  >
                    <Icon name={method.icon as any} size={24} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 
                      style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)',
                        margin: '0'
                      }}
                    >
                      {method.title}
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
                      {method.description}
                    </p>
                    
                    <p 
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-primary-default)',
                        margin: '0'
                      }}
                    >
                      {method.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <div 
          className="grid gap-8"
          style={{
            gridTemplateColumns: isMobile ? '1fr' : '1fr 400px',
            alignItems: 'start'
          }}
        >
          <Card
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-light)',
              overflow: 'hidden'
            }}
          >
            <CardContent style={{ padding: 'var(--ikan-component-spacing-large)' }}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 
                    style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      margin: '0'
                    }}
                  >
                    Send us a Message
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
                    We typically respond within 24 hours during business days.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4" style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                    <div className="space-y-2">
                      <label 
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        Full Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="ikan-input"
                        style={{
                          height: 'var(--ikan-component-input-height)',
                          borderRadius: 'var(--ikan-component-border-radius)',
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-regular)'
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label 
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="ikan-input"
                        style={{
                          height: 'var(--ikan-component-input-height)',
                          borderRadius: 'var(--ikan-component-border-radius)',
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-regular)'
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label 
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      Subject
                    </label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="What can we help you with?"
                      className="ikan-input"
                      style={{
                        height: 'var(--ikan-component-input-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-weight-regular)'
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label 
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      Message
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about your question or concern..."
                      rows={6}
                      style={{
                        borderRadius: 'var(--ikan-component-border-radius)',
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-weight-regular)',
                        background: 'var(--semantic-input-bg)',
                        border: 'var(--semantic-input-border)',
                        color: 'var(--semantic-input-fg)',
                        padding: 'var(--ikan-component-spacing-small)',
                        resize: 'vertical',
                        minHeight: '120px'
                      }}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full ikan-button"
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
                    Send Message
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Crisis Support Sidebar */}
          <Card
            style={{
              backgroundColor: 'var(--color-status-danger)',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              color: 'var(--color-text-inverse)'
            }}
          >
            <CardContent style={{ padding: 'var(--ikan-component-spacing-large)' }}>
              <div className="space-y-4 text-center">
                <div 
                  className="inline-flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--ikan-component-spacing-small)'
                  }}
                >
                  <Icon name="shield-alert" size={24} />
                </div>
                
                <h3 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    margin: '0'
                  }}
                >
                  Need Immediate Help?
                </h3>
                
                <p 
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-regular)',
                    lineHeight: 'var(--line-height-md)',
                    opacity: 0.9,
                    margin: '0'
                  }}
                >
                  If you're having thoughts of self-harm or suicide, please reach out for immediate support.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => window.open('tel:988', '_blank')}
                    variant="outline"
                    className="w-full"
                    style={{
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--color-text-inverse)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    Call 988 - Crisis Lifeline
                  </Button>
                  
                  <Button
                    onClick={() => window.open('tel:911', '_blank')}
                    variant="outline"
                    className="w-full"
                    style={{
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--color-text-inverse)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    Call 911 - Emergency
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Quick Links */}
        <Card 
          className="mt-12"
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            marginTop: 'var(--spacing-12)'
          }}
        >
          <CardContent style={{ padding: 'var(--ikan-component-spacing-large)' }}>
            <div className="text-center space-y-4">
              <h3 
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  margin: '0'
                }}
              >
                Looking for Quick Answers?
              </h3>
              
              <p 
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-regular)',
                  color: 'var(--color-text-muted)',
                  margin: '0',
                  lineHeight: 'var(--line-height-md)'
                }}
              >
                Check our FAQ section for instant answers to common questions about assessments, programs, and your account.
              </p>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = '/faq'}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginTop: 'var(--ikan-component-spacing-default)'
                }}
              >
                Visit FAQ Section
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}