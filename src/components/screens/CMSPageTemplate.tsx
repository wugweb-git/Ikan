import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { LogoIcon } from '../Logo';
import { apiClient } from '../../lib/api-client';

interface CMSPageTemplateProps {
  pageId: string;
  title: string;
  onBack?: () => void;
  className?: string;
}

interface CMSContent {
  title: string;
  content: string;
  lastUpdated?: string;
  sections?: Array<{
    heading: string;
    content: string;
  }>;
}

export function CMSPageTemplate({ 
  pageId, 
  title, 
  onBack,
  className 
}: CMSPageTemplateProps) {
  const isMobile = useIsMobile();
  const [content, setContent] = useState<CMSContent | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fallback timer - never show loading for more than 3 seconds
  React.useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (loading) {
        console.log(`CMS fallback timer triggered for page ${pageId} - forcing fallback content`);
        setContent(getDefaultContent(pageId, title));
        setLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(fallbackTimer);
  }, [loading, pageId, title]);
  const [error, setError] = useState<string | null>(null);

  // Load CMS content from backend
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Set a very aggressive timeout - use fallback after 2 seconds if CMS is slow
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('CMS timeout - using fallback')), 2000);
        });
        
        // Try to fetch content from backend CMS with aggressive timeout race
        const response = await Promise.race([
          apiClient.getCMSPage(pageId).catch((err) => {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.log(`CMS API call failed for ${pageId}: ${errorMessage}`);
            // Don't throw for timeout errors - just return null to use fallback
            if (errorMessage.includes('CMS_TIMEOUT') || errorMessage.includes('timeout')) {
              console.log(`Using fallback content for ${pageId} due to timeout`);
              return null;
            }
            throw err;
          }),
          timeoutPromise
        ]);
        
        if (response && (response.content || response.title)) {
          setContent(response as CMSContent);
        } else {
          // Fallback to default content if CMS response is invalid
          setContent(getDefaultContent(pageId, title));
        }
      } catch (err) {
        console.log(`CMS content loading failed for page ${pageId}, using fallback:`, err instanceof Error ? err.message : 'Unknown error');
        // Always use fallback content - never show error to user for CMS failures
        setContent(getDefaultContent(pageId, title));
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [pageId, title]);

  // Default fallback content for different page types
  const getDefaultContent = (id: string, pageTitle: string): CMSContent => {
    const defaults: { [key: string]: CMSContent } = {
      'privacy': {
        title: 'Privacy Policy',
        content: `
          <h2>Information We Collect</h2>
          <p>At iKan, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our mental health services.</p>
          
          <h3>Personal Information</h3>
          <p>We collect information you provide directly to us, such as when you create an account, complete assessments, or contact our support team. This may include your name, email address, and mental health assessment responses.</p>
          
          <h3>Usage Information</h3>
          <p>We automatically collect certain information about your use of our platform, including your interaction with features, session duration, and device information to improve our services.</p>
          
          <h2>How We Use Your Information</h2>
          <p>Your information is used to provide personalized mental health support, improve our services, and ensure the security of our platform. We never sell your personal data to third parties.</p>
          
          <h2>Data Security</h2>
          <p>We implement industry-standard security measures to protect your personal information and maintain the confidentiality of your mental health data.</p>
          
          <h2>Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@ikan.health.</p>
        `,
        lastUpdated: new Date().toISOString(),
        sections: []
      },
      'terms': {
        title: 'Terms of Service',
        content: `
          <h2>Acceptance of Terms</h2>
          <p>By accessing and using iKan's mental health platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          
          <h2>Use of Services</h2>
          <p>Our platform is designed to support your mental health journey through assessments, programs, and resources. You agree to use our services responsibly and in accordance with their intended purpose.</p>
          
          <h2>User Responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          
          <h2>Mental Health Disclaimer</h2>
          <p>Our services are designed to support mental wellness but are not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers.</p>
          
          <h2>Limitation of Liability</h2>
          <p>iKan shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.</p>
          
          <h2>Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notifications.</p>
        `,
        lastUpdated: new Date().toISOString(),
        sections: []
      },
      'faq': {
        title: 'Frequently Asked Questions',
        content: `
          <h2>General Questions</h2>
          
          <h3>What is iKan?</h3>
          <p>iKan is a comprehensive mental health platform that provides evidence-based assessments, personalized equip programs, and a resource library to support your mental wellness journey.</p>
          
          <h3>How do I get started?</h3>
          <p>Simply create an account and complete our initial assessment. Based on your responses, we'll recommend personalized programs and resources to support your mental health goals.</p>
          
          <h3>Is my information secure?</h3>
          <p>Yes, we use industry-standard encryption and security measures to protect your personal and mental health information. Your privacy is our top priority.</p>
          
          <h2>Assessments</h2>
          
          <h3>How long do assessments take?</h3>
          <p>Most assessments take 10-15 minutes to complete. You can save your progress and return to finish at any time.</p>
          
          <h3>How often should I take assessments?</h3>
          <p>We recommend retaking assessments monthly to track your progress and adjust your personalized recommendations.</p>
          
          <h2>Equip Programs</h2>
          
          <h3>What are Equip Programs?</h3>
          <p>Equip Programs are structured, evidence-based mental health interventions designed to help you develop coping skills and improve your overall wellbeing.</p>
          
          <h3>How do I access programs?</h3>
          <p>Programs are recommended based on your assessment results. You can also browse our program library and choose ones that interest you.</p>
          
          <h2>Support</h2>
          
          <h3>How can I contact support?</h3>
          <p>You can reach our support team at support@ikan.health or through the contact form on our website. We typically respond within 24 hours.</p>
        `,
        lastUpdated: new Date().toISOString(),
        sections: []
      },
      'contact': {
        title: 'Contact Us',
        content: `
          <h2>Get in Touch</h2>
          <p>We're here to support you on your mental health journey. Reach out to us for any questions, concerns, or feedback.</p>
          
          <h2>Support Team</h2>
          <p>Our dedicated support team is available to help with technical issues, account questions, and general inquiries.</p>
          <p><strong>Email:</strong> support@ikan.health<br>
          <strong>Response Time:</strong> Within 24 hours</p>
          
          <h2>Crisis Support</h2>
          <p>If you're experiencing a mental health crisis, please reach out for immediate help:</p>
          <p><strong>National Suicide Prevention Lifeline:</strong> 988<br>
          <strong>Crisis Text Line:</strong> Text HOME to 741741<br>
          <strong>Emergency Services:</strong> 911</p>
          
          <h2>Partnerships</h2>
          <p>For partnership opportunities and collaborations:</p>
          <p><strong>Email:</strong> partnerships@ikan.health</p>
          
          <h2>Media Inquiries</h2>
          <p>For press and media inquiries:</p>
          <p><strong>Email:</strong> press@ikan.health</p>
          
          <h2>Office Address</h2>
          <p>iKan Health Inc.<br>
          123 Mental Health Boulevard<br>
          Wellness City, CA 90210<br>
          United States</p>
        `,
        lastUpdated: new Date().toISOString(),
        sections: []
      },
      'return-policy': {
        title: 'Return Policy',
        content: `
          <h2>Our Commitment</h2>
          <p>At iKan, we're committed to your satisfaction with our mental health services. If you're not completely satisfied with your purchase, we offer a comprehensive return policy.</p>
          
          <h2>Digital Services Refund</h2>
          <p>For digital assessment reports, equip programs, and consultations:</p>
          <ul>
            <li>Full refund available within 7 days of purchase</li>
            <li>Partial refund may be available for unused portions of programs</li>
            <li>Refund requests must be submitted via email to billing@ikan.health</li>
          </ul>
          
          <h2>Subscription Services</h2>
          <p>For monthly or annual subscription plans:</p>
          <ul>
            <li>Cancel anytime with no cancellation fees</li>
            <li>Refunds prorated to the date of cancellation</li>
            <li>Access continues until the end of the current billing period</li>
          </ul>
          
          <h2>Consultation Services</h2>
          <p>For one-on-one consultation services:</p>
          <ul>
            <li>Cancellation with full refund available up to 24 hours before appointment</li>
            <li>Rescheduling available with at least 2 hours notice</li>
            <li>No-show appointments are non-refundable</li>
          </ul>
          
          <h2>How to Request a Refund</h2>
          <p>To request a refund, please contact our billing team at billing@ikan.health with your order number and reason for the refund request. We'll process your request within 3-5 business days.</p>
          
          <h2>Processing Time</h2>
          <p>Refunds are typically processed within 5-7 business days and will appear on your original payment method.</p>
        `,
        lastUpdated: new Date().toISOString(),
        sections: []
      },
      'cancellation-policy': {
        title: 'Cancellation Policy',
        content: `
          <h2>Account Cancellation</h2>
          <p>You may cancel your iKan account at any time. Here's what you need to know about our cancellation process.</p>
          
          <h2>How to Cancel</h2>
          <p>You can cancel your account through:</p>
          <ul>
            <li>Your account settings page</li>
            <li>Contacting our support team at support@ikan.health</li>
            <li>Using our online cancellation form</li>
          </ul>
          
          <h2>Subscription Cancellation</h2>
          <p>For subscription services:</p>
          <ul>
            <li>Cancel anytime before your next billing date</li>
            <li>No cancellation fees or penalties</li>
            <li>Access continues until the end of your current billing period</li>
            <li>Automatic renewal will be disabled upon cancellation</li>
          </ul>
          
          <h2>Appointment Cancellation</h2>
          <p>For consultation appointments:</p>
          <ul>
            <li>Cancel up to 24 hours before for full refund</li>
            <li>Cancel 2-24 hours before for rescheduling credit</li>
            <li>Cancellations less than 2 hours before are non-refundable</li>
          </ul>
          
          <h2>Data Retention</h2>
          <p>After account cancellation:</p>
          <ul>
            <li>Personal data will be deleted within 30 days</li>
            <li>Assessment results may be retained for research purposes (anonymized)</li>
            <li>You can request immediate data deletion by contacting privacy@ikan.health</li>
          </ul>
          
          <h2>Reactivation</h2>
          <p>You can reactivate your account within 30 days of cancellation by logging in. After 30 days, you'll need to create a new account.</p>
          
          <h2>Questions?</h2>
          <p>If you have questions about cancellation, please contact our support team at support@ikan.health.</p>
        `,
        lastUpdated: new Date().toISOString(),
        sections: []
      },
      'sitemap': {
        title: 'Sitemap',
        content: `
          <h2>Site Navigation</h2>
          <p>Find all the pages and resources available on the iKan platform.</p>
          
          <h2>Main Sections</h2>
          <h3>Getting Started</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/login">Sign In</a></li>
          </ul>
          
          <h3>Mental Health Tools</h3>
          <ul>
            <li><a href="/assessments">Assessments</a></li>
            <li><a href="/equip-programs">Equip Programs</a></li>
            <li><a href="/library">Resource Library</a></li>
            <li><a href="/consultation">Consultation Services</a></li>
          </ul>
          
          <h3>User Dashboard</h3>
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/mood-journal">Mood Journal</a></li>
            <li><a href="/account">Account Settings</a></li>
          </ul>
          
          <h2>Support & Information</h2>
          <h3>Help Center</h3>
          <ul>
            <li><a href="/faq">Frequently Asked Questions</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/crisis-support">Crisis Support Resources</a></li>
          </ul>
          
          <h3>Legal & Policies</h3>
          <ul>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/return-policy">Return Policy</a></li>
            <li><a href="/cancellation-policy">Cancellation Policy</a></li>
          </ul>
          
          <h2>Resources by Category</h2>
          <h3>Mental Health Topics</h3>
          <ul>
            <li>Anxiety Management</li>
            <li>Depression Support</li>
            <li>Stress Relief</li>
            <li>Sleep Improvement</li>
            <li>Mindfulness & Meditation</li>
            <li>Relationship Wellness</li>
          </ul>
          
          <h3>Assessment Types</h3>
          <ul>
            <li>Mental Health Screening</li>
            <li>Anxiety Assessment</li>
            <li>Depression Screening</li>
            <li>Stress Level Evaluation</li>
            <li>Wellness Check-in</li>
          </ul>
          
          <h2>Mobile App</h2>
          <p>Access iKan on mobile devices through our progressive web app (PWA) for a seamless experience across all platforms.</p>
        `,
        lastUpdated: new Date().toISOString(),
        sections: []
      }
    };

    return defaults[id] || {
      title: pageTitle,
      content: `<h2>${pageTitle}</h2><p>Content for this page will be available soon.</p>`,
      lastUpdated: new Date().toISOString(),
      sections: []
    };
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: 'var(--color-bg-page)',
          padding: isMobile ? 'var(--ikan-component-spacing-default)' : 'var(--ikan-component-spacing-large)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="animate-spin">
            <LogoIcon 
              size={24} 
              style={{ color: 'var(--color-primary-default)' }} 
            />
          </div>
          <span 
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)'
            }}
          >
            Loading content...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: 'var(--color-bg-page)',
          padding: isMobile ? 'var(--ikan-component-spacing-default)' : 'var(--ikan-component-spacing-large)'
        }}
      >
        <div className="text-center space-y-4">
          <Icon 
            name="alert-circle" 
            size={48}
            style={{ color: 'var(--color-status-danger)' }}
          />
          <div>
            <h2 
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--ikan-component-spacing-small)'
              }}
            >
              Content Unavailable
            </h2>
            <p 
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)'
              }}
            >
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen ${className || ''}`}
      style={{
        backgroundColor: 'var(--color-bg-page)'
      }}
    >
      {/* Page Container */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile 
            ? 'var(--ikan-component-spacing-default)' 
            : 'var(--ikan-component-spacing-large)'
        }}
      >
        {/* Header Section */}
        <div 
          className="mb-8"
          style={{ marginBottom: 'var(--spacing-8)' }}
        >
          {/* Back Navigation */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 mb-6 touch-target hover:opacity-80 transition-opacity"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
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

          {/* Page Title */}
          <div className="space-y-2">
            <h1 
              style={{
                fontSize: isMobile ? 'var(--text-2xl)' : 'var(--text-3xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--line-height-sm)',
                margin: '0'
              }}
            >
              {content?.title || title}
            </h1>
            
            {content?.lastUpdated && (
              <p 
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  margin: '0'
                }}
              >
                Last updated: {new Date(content.lastUpdated).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div 
          className="w-full"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: isMobile 
              ? 'var(--ikan-component-spacing-large)' 
              : 'calc(var(--ikan-component-spacing-large) * 1.5)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Main Content */}
          <div 
            className="prose prose-ikan max-w-none"
            style={{
              fontSize: 'var(--text-base)',
              lineHeight: 'var(--line-height-md)',
              color: 'var(--color-text-primary)'
            }}
            dangerouslySetInnerHTML={{ 
              __html: content?.content || `<p>Content loading...</p>` 
            }}
          />

          {/* Sections */}
          {content?.sections && content.sections.length > 0 && (
            <div 
              className="mt-8 space-y-6"
              style={{ 
                marginTop: 'var(--spacing-8)',
                gap: 'var(--ikan-component-spacing-large)'
              }}
            >
              {content.sections.map((section, index) => (
                <div 
                  key={index}
                  className="border-t pt-6"
                  style={{
                    borderTop: `1px solid var(--color-border-light)`,
                    paddingTop: 'var(--ikan-component-spacing-large)'
                  }}
                >
                  <h3 
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--ikan-component-spacing-default)'
                    }}
                  >
                    {section.heading}
                  </h3>
                  <div 
                    className="prose prose-ikan"
                    style={{
                      fontSize: 'var(--text-base)',
                      lineHeight: 'var(--line-height-md)',
                      color: 'var(--color-text-primary)'
                    }}
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Footer */}
        <div 
          className="mt-8 text-center"
          style={{ 
            marginTop: 'var(--spacing-8)',
            padding: 'var(--ikan-component-spacing-large)',
            backgroundColor: 'var(--color-bg-muted)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <h3 
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--ikan-component-spacing-small)'
            }}
          >
            Questions about this page?
          </h3>
          <p 
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              margin: '0'
            }}
          >
            Contact our support team at{' '}
            <a 
              href="mailto:support@ikan.health"
              style={{
                color: 'var(--color-primary-default)',
                textDecoration: 'none'
              }}
            >
              support@ikan.health
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}