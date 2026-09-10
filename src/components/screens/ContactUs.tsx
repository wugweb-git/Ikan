import React, { useState, useMemo } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { DEFAULT_CMS_CONTENT } from '../../utils/cms-defaults';
import { PageHero } from '../ui/PageHero';
import { apiClient } from '../../lib/api-client';
import { useNotifications } from '../../contexts/NotificationContext';

interface ContactUsProps {
  className?: string;
  onNavigate?: (route: string) => void;
  onBack?: () => void;
}

export function ContactUs({ className, onNavigate, onBack }: ContactUsProps) {
  const isMobile = useIsMobile();
  const content = DEFAULT_CMS_CONTENT['contact'];
  const { showToast } = useNotifications();

  // ── CMS structured content ──
  const cmsFull = DEFAULT_CMS_CONTENT['page-contact'];
  const cms = useMemo(() => {
    if (!cmsFull?.content) return null;
    try { return JSON.parse(cmsFull.content); } catch { return null; }
  }, [cmsFull]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      showToast('error', 'Missing Fields', 'Please fill in your name, email, and message.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.submitContactForm(formData);
      if (response.success) {
        showToast('success', 'Message Sent', response.message || 'We will get back to you soon.');
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        showToast('error', 'Error', response.error || 'Failed to send message.');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      showToast('error', 'Error', 'Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportEmail = cms?.supportEmail || content?.contactEmail || 'support@ikanhealth.in';
  const crisisPhone = cms?.crisisPhone || content?.crisisPhone || '9152987821';
  const crisisLabel = cms?.crisisLabel || content?.crisisLabel || 'iCALL Suicide Prevention Helpline';

  const contactMethods = cms?.contactMethods || [
    {
      icon: 'mail',
      title: 'Email Support',
      description: 'Get help with your account and services',
      value: supportEmail,
      action: `mailto:${supportEmail}`
    },
    {
      icon: 'phone',
      title: 'Crisis Support',
      description: crisisLabel,
      value: crisisPhone,
      action: `tel:${crisisPhone}`
    }
  ];

  const formTitle = cms?.formTitle || 'Send us a Message';
  const formSubtitle = cms?.formSubtitle || 'We typically respond within 24 hours during business days.';
  const crisisCard = cms?.crisisCard || { title: 'Need Immediate Help?', description: "If you're having thoughts of self-harm or suicide, please reach out for immediate support.", buttons: [{ label: 'Call iCALL - 9152987821', action: 'tel:9152987821' }] };
  const faqCard = cms?.faqCard || { title: 'Looking for Quick Answers?', description: 'Check our FAQ section for instant answers to common questions about assessments, programs, and your account.', buttonText: 'Visit FAQ Section', buttonRoute: '/faq' };

  const heroTitle = cms?.heroTitle || content?.title || "We're Here to Help";

  return (
    <div 
      className={`min-h-screen ${className || ''}`}
      style={{
        backgroundColor: 'var(--color-bg-page)',
        fontFamily: 'var(--font-family-base)'
      }}
    >
      {/* Hero Section */}
      <PageHero 
        title={heroTitle}
        className="text-[var(--font-family-base)]"
      >
        {content?.content ? (
           <div 
             dangerouslySetInnerHTML={{ __html: content.content }}
             className="prose prose-invert max-w-2xl mx-auto text-lg opacity-90 text-white font-normal"
             style={{ fontFamily: 'var(--font-family-base)' }}
           />
        ) : (
          <p 
            className="text-white/90 max-w-2xl text-lg opacity-90 font-normal"
            style={{ fontFamily: 'var(--font-family-base)' }}
          >
            {cms?.heroSubtitle || 'Your mental health journey matters to us. Reach out for support, questions, or just to connect.'}
          </p>
        )}
      </PageHero>

      {/* Main Content */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)' : 'var(--spacing-12) var(--ikan-component-spacing-large)',
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
                    {formTitle}
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
                    {formSubtitle}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4" style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                    <div className="space-y-2">
                      <label 
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-family-base)'
                        }}
                      >
                        Full Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your name"
                        className="ikan-input"
                        startIcon={<Icon name="user" size={18} />}
                        style={{
                          height: 'var(--ikan-component-input-height)',
                          borderRadius: 'var(--ikan-component-border-radius)',
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-regular)',
                          fontFamily: 'var(--font-family-base)'
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label 
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-family-base)'
                        }}
                      >
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="ikan-input"
                        startIcon={<Icon name="mail" size={18} />}
                        style={{
                          height: 'var(--ikan-component-input-height)',
                          borderRadius: 'var(--ikan-component-border-radius)',
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-regular)',
                          fontFamily: 'var(--font-family-base)'
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label 
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-family-base)'
                      }}
                    >
                      Subject
                    </label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="What can we help you with?"
                      className="ikan-input"
                      startIcon={<Icon name="helpCircle" size={18} />}
                      style={{
                        height: 'var(--ikan-component-input-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-weight-regular)',
                        fontFamily: 'var(--font-family-base)'
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label 
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-family-base)'
                      }}
                    >
                      Message
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
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
                        minHeight: '120px',
                        fontFamily: 'var(--font-family-base)'
                      }}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className="w-full ikan-button"
                    style={{
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      backgroundColor: isSubmitted ? 'var(--color-status-success)' : 'var(--semantic-button-primary-bg)',
                      color: 'var(--semantic-button-primary-fg)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      border: 'none'
                    }}
                  >
                    {isSubmitted ? 'Message Sent' : isSubmitting ? 'Sending...' : 'Send Message'}
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
                  {crisisCard.title}
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
                  {crisisCard.description}
                </p>

                <div className="space-y-3">
                  {crisisCard.buttons.map((btn: any, i: number) => (
                  <Button
                    key={i}
                    onClick={() => window.open(btn.action, '_blank')}
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
                    {btn.label}
                  </Button>
                  ))}
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
                {faqCard.title}
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
                {faqCard.description}
              </p>
              
              <Button
                variant="outline"
                onClick={() => onNavigate ? onNavigate(faqCard.buttonRoute || '/faq') : window.location.href = '/faq'}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginTop: 'var(--ikan-component-spacing-default)'
                }}
              >
                {faqCard.buttonText}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}