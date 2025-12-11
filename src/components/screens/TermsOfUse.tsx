import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

interface TermsOfUseProps {
  className?: string;
  onBack?: () => void;
}

export function TermsOfUse({ className, onBack }: TermsOfUseProps) {
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const lastUpdated = "January 4, 2025";
  const effectiveDate = "January 4, 2025";

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: 'file-check',
      important: true,
      content: `
        By accessing or using iKan's mental health platform ("Service"), you agree to be bound by these Terms of Service ("Terms") and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our Service.

        **Legal Agreement**
        These Terms constitute a legally binding agreement between you and iKan Health Inc. ("Company," "we," "us," or "our"). By creating an account, using our platform, or accessing our services, you acknowledge that you have read, understood, and agree to be bound by these Terms.

        **Age Requirements**
        • You must be at least 18 years old to use our Service
        • Users aged 13-17 may use the Service with parental consent
        • Parents or guardians are responsible for minors' use of the platform
        • Special protections apply to data from users under 18

        **Capacity to Contract**
        By using our Service, you represent and warrant that:
        • You have the legal capacity to enter into this agreement
        • You are not prohibited from receiving services under applicable law
        • You will comply with all terms and conditions outlined herein
        • All information you provide is accurate and truthful

        **Updates to Terms**
        We reserve the right to modify these Terms at any time. We will notify users of material changes via email or platform notifications. Your continued use of the Service after changes become effective constitutes acceptance of the new Terms.
      `
    },
    {
      id: 'services',
      title: 'Description of Services',
      icon: 'heart',
      content: `
        iKan provides a comprehensive digital mental health platform designed to support your wellness journey through evidence-based tools and resources.

        **Core Services**
        • **Mental Health Assessments**: Clinically validated screening tools and questionnaires
        • **Equip Programs**: Structured therapeutic interventions based on proven methodologies
        • **Resource Library**: Curated educational content and wellness materials
        • **Progress Tracking**: Tools to monitor your mental health journey over time
        • **Consultation Services**: Access to licensed mental health professionals (where available)

        **Service Availability**
        • Services are available 24/7 through our web platform and mobile app
        • Some features may require internet connectivity
        • Consultation services have scheduled availability
        • We strive for 99.9% uptime but cannot guarantee uninterrupted service

        **Service Updates**
        We continuously improve our platform by:
        • Adding new assessment tools and programs
        • Updating existing content based on latest research
        • Enhancing user experience and functionality
        • Implementing new safety and security features

        **Platform Compatibility**
        Our Service is designed to work on:
        • Modern web browsers (Chrome, Firefox, Safari, Edge)
        • iOS and Android mobile devices
        • Desktop and laptop computers
        • Tablets and other compatible devices

        **Geographic Availability**
        Services are currently available in the United States and select international markets. Some features may be limited based on local regulations and licensing requirements.
      `
    },
    {
      id: 'medical-disclaimer',
      title: 'Medical Disclaimer',
      icon: 'alert-triangle',
      important: true,
      content: `
        **Important Medical Disclaimer**
        iKan's services are designed to support mental wellness but are not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with any questions you may have regarding a medical or mental health condition.

        **Not a Medical Device**
        • Our platform provides educational and wellness support tools
        • Assessments are for informational purposes and self-awareness
        • Results should not be used for medical diagnosis
        • Professional evaluation is recommended for clinical concerns

        **Emergency Situations**
        If you are experiencing a mental health crisis or having thoughts of self-harm:
        • Call 911 for immediate emergency assistance
        • Contact the National Suicide Prevention Lifeline at 988
        • Reach out to your local crisis center or emergency room
        • Do not rely solely on our platform for crisis intervention

        **Professional Care**
        We strongly encourage users to:
        • Maintain relationships with licensed healthcare providers
        • Discuss our assessment results with qualified professionals
        • Seek professional help for persistent or severe symptoms
        • Use our platform as a complement to, not replacement for, professional care

        **Therapeutic Limitations**
        Our platform cannot:
        • Provide medical diagnoses or prescribe medications
        • Replace individual therapy or counseling
        • Guarantee specific therapeutic outcomes
        • Provide crisis intervention or emergency services

        **Medical Supervision**
        If you are currently under medical or psychiatric care, please consult with your healthcare provider before using our services. Our platform is designed to complement professional treatment, not replace it.
      `
    },
    {
      id: 'user-responsibilities',
      title: 'User Responsibilities',
      icon: 'user-check',
      content: `
        As a user of iKan's platform, you agree to certain responsibilities to ensure a safe and effective experience for yourself and others.

        **Account Security**
        • Maintain the confidentiality of your login credentials
        • Use strong, unique passwords for your account
        • Enable two-factor authentication when available
        • Notify us immediately of any unauthorized access
        • Log out of shared or public devices

        **Accurate Information**
        • Provide truthful and accurate information in assessments
        • Keep your profile information current and up-to-date
        • Report any errors or inconsistencies in your data
        • Use your real identity (no fake accounts or impersonation)

        **Appropriate Use**
        You agree to use our platform only for its intended purposes:
        • Supporting your mental health and wellness journey
        • Accessing educational resources and tools
        • Participating in evidence-based programs
        • Communicating respectfully with support staff

        **Prohibited Activities**
        You agree not to:
        • Share your account with others or create multiple accounts
        • Attempt to hack, reverse engineer, or compromise our systems
        • Upload harmful content, malware, or viruses
        • Use the platform for commercial purposes without authorization
        • Violate any applicable laws or regulations
        • Interfere with other users' experience or privacy
        • Attempt to extract or scrape data from our platform

        **Content Standards**
        When interacting with our platform:
        • Be honest and authentic in your responses
        • Respect the privacy and confidentiality of the platform
        • Avoid sharing personally identifiable information unnecessarily
        • Report any concerning behavior or content to our support team

        **Compliance**
        You are responsible for ensuring your use of our services complies with all applicable local, state, federal, and international laws and regulations.
      `
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      icon: 'copyright',
      content: `
        **Platform Ownership**
        The iKan platform, including all content, features, functionality, software, and design, is owned by iKan Health Inc. and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.

        **User License**
        We grant you a limited, non-exclusive, non-transferable, revocable license to:
        • Access and use our platform for personal, non-commercial purposes
        • Download and use our mobile application on your devices
        • Access educational content and resources for your personal wellness
        • Participate in programs and assessments as intended

        **User Content**
        When you submit content to our platform (assessments, journal entries, messages):
        • You retain ownership of your personal content and data
        • You grant us a license to use this content to provide our services
        • We may use anonymized, aggregated data for research and improvement
        • You can request deletion of your content at any time

        **Restrictions**
        You may not:
        • Copy, modify, or distribute our proprietary content
        • Create derivative works based on our platform
        • Use our trademarks or branding without permission
        • Reverse engineer or attempt to extract source code
        • Sell, transfer, or sublicense your access to others

        **Third-Party Content**
        Our platform may include content from third parties:
        • We respect the intellectual property rights of others
        • Third-party content is used under appropriate licenses
        • Users must respect third-party intellectual property rights
        • Report any suspected infringement to our team

        **DMCA Policy**
        We respond to valid DMCA takedown notices. If you believe your copyrighted work has been infringed, please contact us at legal@ikan.health with detailed information about the alleged infringement.

        **Trademark Notice**
        iKan, the iKan logo, and other marks are trademarks of iKan Health Inc. All other trademarks are the property of their respective owners.
      `
    },
    {
      id: 'payment-terms',
      title: 'Payment & Billing',
      icon: 'credit-card',
      content: `
        **Subscription Plans**
        iKan offers various subscription tiers:
        • **Free Tier**: Basic assessments and limited resources
        • **Premium Plans**: Full access to programs, assessments, and features
        • **Enterprise Plans**: Custom solutions for organizations

        **Billing Terms**
        • Subscriptions are billed monthly or annually in advance
        • Prices are displayed in USD and may vary by region
        • Payment is due immediately upon subscription activation
        • Failed payments may result in service suspension
        • We accept major credit cards and digital payment methods

        **Auto-Renewal**
        • Subscriptions automatically renew unless cancelled
        • We will charge your payment method before each renewal period
        • You will receive email reminders before renewal charges
        • You can cancel auto-renewal in your account settings

        **Price Changes**
        • We reserve the right to modify subscription prices
        • Existing subscribers will receive 30 days notice of price changes
        • Price changes take effect at your next renewal period
        • You can cancel if you don't agree to new pricing

        **Refund Policy**
        • Full refunds available within 7 days of initial purchase
        • Pro-rated refunds may be available for unused subscription periods
        • Consultation services may have different refund terms
        • Contact billing@ikan.health for refund requests

        **Taxes**
        • Prices may not include applicable taxes
        • You are responsible for any taxes, duties, or fees
        • Tax rates are determined by your billing address
        • Tax receipts are available in your account

        **Payment Security**
        • We use secure, encrypted payment processing
        • Credit card information is handled by PCI-compliant processors
        • We do not store complete payment details on our servers
        • Payment disputes should be directed to our billing team
      `
    },
    {
      id: 'termination',
      title: 'Account Termination',
      icon: 'user-x',
      content: `
        **User Termination**
        You may terminate your account at any time:
        • Cancel through your account settings
        • Contact our support team for assistance
        • Cancellation takes effect at the end of your current billing period
        • You retain access to paid features until period expires

        **Company Termination**
        We may terminate or suspend your account:
        • For violation of these Terms of Service
        • For fraudulent or illegal activity
        • For safety concerns or policy violations
        • Upon request from law enforcement
        • If your account remains inactive for extended periods

        **Effect of Termination**
        Upon account termination:
        • Your access to premium features will cease
        • Personal data will be deleted per our privacy policy
        • Some data may be retained for legal or safety reasons
        • Outstanding payments remain due and payable
        • These Terms survive termination where applicable

        **Data After Termination**
        • Personal account data is deleted within 30 days
        • You can request immediate data deletion
        • Some anonymized data may be retained for research
        • Billing and legal records may be kept per regulations
        • Contact us to request expedited data deletion

        **Reactivation**
        • Accounts can be reactivated within 30 days of cancellation
        • After 30 days, you'll need to create a new account
        • Previous assessment data may not be recoverable
        • New subscription terms may apply upon reactivation

        **Service Discontinuation**
        If we discontinue our services:
        • Users will receive at least 90 days advance notice
        • Refunds will be provided for unused subscription periods
        • Data export tools will be made available
        • Alternative service recommendations may be provided
      `
    },
    {
      id: 'limitation-liability',
      title: 'Limitation of Liability',
      icon: 'shield',
      important: true,
      content: `
        **Disclaimer of Warranties**
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING:
        • MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT
        • ACCURACY, RELIABILITY, OR COMPLETENESS OF CONTENT
        • UNINTERRUPTED OR ERROR-FREE OPERATION
        • SECURITY OF DATA TRANSMISSION

        **Limitation of Liability**
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, iKAN HEALTH INC. SHALL NOT BE LIABLE FOR:
        • INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES
        • LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES
        • DAMAGES ARISING FROM USE OR INABILITY TO USE THE SERVICE
        • DAMAGES RESULTING FROM THIRD-PARTY CONTENT OR SERVICES
        • DAMAGES EXCEEDING THE AMOUNT PAID FOR THE SERVICE

        **Maximum Liability**
        Our total liability to you for all claims arising from or relating to the service shall not exceed the greater of:
        • $100 USD
        • The amount you paid us in the 12 months preceding the claim

        **Exceptions**
        These limitations do not apply to:
        • Death or personal injury caused by our negligence
        • Fraud or fraudulent misrepresentation
        • Violations of your privacy rights under applicable law
        • Any liability that cannot be excluded by law

        **Indemnification**
        You agree to indemnify and hold us harmless from any claims, damages, losses, or expenses arising from:
        • Your use of the service
        • Your violation of these Terms
        • Your infringement of third-party rights
        • Your negligent or wrongful conduct

        **Force Majeure**
        We are not liable for any failure to perform due to circumstances beyond our reasonable control, including natural disasters, government actions, internet outages, or other unforeseeable events.
      `
    },
    {
      id: 'governing-law',
      title: 'Governing Law & Disputes',
      icon: 'scale',
      content: `
        **Governing Law**
        These Terms are governed by the laws of the State of California, United States, without regard to conflict of law principles. Any legal action or proceeding shall be brought exclusively in the courts of California.

        **Dispute Resolution**
        Before filing any legal action, you agree to:
        • Contact our support team to discuss the issue
        • Participate in good faith negotiations for resolution
        • Allow 30 days for informal resolution attempts
        • Consider mediation if direct negotiation fails

        **Arbitration Agreement**
        For disputes that cannot be resolved informally:
        • Most disputes will be resolved through binding arbitration
        • Arbitration will be conducted by the American Arbitration Association
        • Arbitration proceedings will be held in California
        • You waive your right to participate in class action lawsuits

        **Exceptions to Arbitration**
        The following disputes are not subject to arbitration:
        • Claims for intellectual property infringement
        • Privacy violations under state or federal law
        • Small claims court actions (under jurisdictional limits)
        • Injunctive or equitable relief requests

        **Class Action Waiver**
        You agree that any dispute resolution proceedings will be conducted individually, not as part of a class, consolidated, or representative action. You waive any right to participate in a class action lawsuit.

        **Severability**
        If any provision of these Terms is found to be unenforceable:
        • The remaining provisions will remain in full effect
        • The unenforceable provision will be modified to be enforceable
        • The overall intent of the Terms will be preserved

        **International Users**
        If you access our service from outside the United States:
        • You are responsible for compliance with local laws
        • Some features may not be available in your jurisdiction
        • Data processing may be governed by additional regulations
        • Contact us for information about local compliance
      `
    },
    {
      id: 'contact-legal',
      title: 'Legal Contact & Updates',
      icon: 'mail',
      content: `
        **Legal Questions**
        For questions about these Terms of Service:
        • Email: legal@ikan.health
        • Mail: iKan Health Inc., Legal Department, 123 Mental Health Blvd, Wellness City, CA 90210
        • Phone: 1-800-IKAN-HELP (business hours)

        **Terms Updates**
        • Material changes will be communicated via email
        • Updates will be posted on this page with revision dates
        • Continued use constitutes acceptance of updated terms
        • You can view the change history in your account settings

        **Entire Agreement**
        These Terms constitute the entire agreement between you and iKan Health Inc. regarding the use of our service. They supersede all prior agreements, communications, and proposals between the parties.

        **No Waiver**
        Our failure to enforce any provision of these Terms does not constitute a waiver of that provision or any other provision. Any waiver must be in writing and signed by our authorized representative.

        **Assignment**
        • You may not transfer or assign your rights under these Terms
        • We may assign these Terms in connection with a merger, acquisition, or sale of assets
        • Your obligations under these Terms are personal to you
        • Any attempted unauthorized assignment is void

        **Survival**
        The following sections survive termination of these Terms:
        • Intellectual Property
        • Limitation of Liability  
        • Governing Law & Disputes
        • Payment obligations
        • Data retention provisions

        **Electronic Communications**
        You consent to receive electronic communications from us, including:
        • Terms updates and policy changes
        • Service announcements and notifications
        • Billing and payment confirmations
        • Legal notices and compliance communications

        **Language**
        These Terms are written in English. Any translations are provided for convenience only. In case of conflicts, the English version prevails.
      `
    }
  ];

  const tableOfContents = sections.map(section => ({
    id: section.id,
    title: section.title,
    icon: section.icon,
    important: section.important
  }));

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
                <Icon name="file-text" size={32} style={{ color: 'var(--color-text-inverse)' }} />
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
              Terms of Service
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
              Important legal terms governing your use of iKan's mental health platform and services.
            </p>
            
            <div 
              className="flex flex-wrap justify-center gap-4 mt-6"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-regular)'
              }}
            >
              <div 
                className="inline-flex items-center gap-2"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: 'var(--spacing-2) var(--spacing-4)',
                  borderRadius: 'var(--radius-pill)'
                }}
              >
                <Icon name="calendar" size={16} />
                Last updated: {lastUpdated}
              </div>
              
              <div 
                className="inline-flex items-center gap-2"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: 'var(--spacing-2) var(--spacing-4)',
                  borderRadius: 'var(--radius-pill)'
                }}
              >
                <Icon name="clock" size={16} />
                Effective: {effectiveDate}
              </div>
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
            backgroundColor: 'var(--color-status-warning-light)',
            border: '1px solid var(--color-status-warning)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--spacing-6)'
          }}
        >
          <Icon name="alert-triangle" size={20} style={{ color: 'var(--color-status-warning)' }} />
          <AlertDescription 
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--line-height-md)'
            }}
          >
            <strong style={{ fontWeight: 'var(--font-weight-medium)' }}>Please read carefully:</strong> These terms contain important information about your rights, legal obligations, and limitations of liability. Pay special attention to sections marked as "Important" regarding medical disclaimers and liability limitations.
          </AlertDescription>
        </Alert>
      </div>

      {/* Content Layout */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile ? '0 var(--spacing-4) var(--spacing-8)' : '0 var(--spacing-6) var(--spacing-12)'
        }}
      >
        <div 
          className="grid gap-8"
          style={{
            gridTemplateColumns: isMobile ? '1fr' : '300px 1fr',
            alignItems: 'start'
          }}
        >
          {/* Table of Contents - Desktop Sidebar */}
          {!isMobile && (
            <div className="sticky top-8">
              <Card
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-light)'
                }}
              >
                <CardContent style={{ padding: 'var(--spacing-6)' }}>
                  <h3 
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      margin: '0 0 var(--spacing-4) 0'
                    }}
                  >
                    Contents
                  </h3>
                  
                  <nav className="space-y-2">
                    {tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-regular)',
                          color: activeSection === item.id ? 'var(--color-primary-default)' : 'var(--color-text-muted)',
                          textDecoration: 'none',
                          backgroundColor: activeSection === item.id ? 'var(--color-accent-default)' : 'transparent'
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSection(item.id);
                          document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <Icon name={item.icon as any} size={16} />
                        {item.title}
                        {item.important && (
                          <Icon name="alert-circle" size={12} style={{ color: 'var(--color-status-warning)' }} />
                        )}
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className="space-y-8">
            {sections.map((section) => (
              <Card
                key={section.id}
                id={section.id}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: section.important 
                    ? '1px solid var(--color-status-warning)' 
                    : '1px solid var(--color-border-light)',
                  scrollMarginTop: '100px',
                  position: 'relative'
                }}
              >
                {section.important && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'var(--spacing-4)',
                      right: 'var(--spacing-4)',
                      backgroundColor: 'var(--color-status-warning)',
                      color: 'var(--color-text-inverse)',
                      padding: 'var(--spacing-1) var(--spacing-2)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-medium)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Important
                  </div>
                )}
                
                <CardContent style={{ padding: 'var(--spacing-8)' }}>
                  <div className="space-y-6">
                    {/* Section Header */}
                    <div className="flex items-center gap-4">
                      <div
                        style={{
                          backgroundColor: section.important 
                            ? 'var(--color-status-warning)' 
                            : 'var(--color-primary-default)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--spacing-3)',
                          color: 'var(--color-text-inverse)'
                        }}
                      >
                        <Icon name={section.icon as any} size={24} />
                      </div>
                      
                      <h2 
                        style={{
                          fontSize: 'var(--text-2xl)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)',
                          margin: '0'
                        }}
                      >
                        {section.title}
                      </h2>
                    </div>

                    {/* Section Content */}
                    <div 
                      className="prose prose-ikan max-w-none"
                      style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-weight-regular)',
                        lineHeight: 'var(--line-height-md)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {section.content.split('\n\n').map((paragraph, index) => {
                        if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
                          // Handle bold headings
                          return (
                            <h3 
                              key={index}
                              style={{
                                fontSize: 'var(--text-lg)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--color-text-primary)',
                                margin: 'var(--spacing-4) 0 var(--spacing-2) 0'
                              }}
                            >
                              {paragraph.replace(/\*\*/g, '')}
                            </h3>
                          );
                        } else if (paragraph.trim().startsWith('•')) {
                          // Handle bullet points
                          const items = paragraph.split('\n').filter(item => item.trim().startsWith('•'));
                          return (
                            <ul 
                              key={index}
                              style={{
                                listStyle: 'none',
                                padding: '0',
                                margin: 'var(--spacing-4) 0'
                              }}
                            >
                              {items.map((item, itemIndex) => (
                                <li 
                                  key={itemIndex}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 'var(--spacing-2)',
                                    marginBottom: 'var(--spacing-2)'
                                  }}
                                >
                                  <span style={{ color: 'var(--color-primary-default)', marginTop: '2px' }}>•</span>
                                  <span>{item.replace('•', '').trim()}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        } else {
                          // Handle regular paragraphs and uppercase legal text
                          const isUppercase = paragraph.trim() === paragraph.trim().toUpperCase() && paragraph.trim().length > 20;
                          return (
                            <p 
                              key={index}
                              style={{
                                margin: 'var(--spacing-4) 0',
                                lineHeight: 'var(--line-height-md)',
                                fontSize: isUppercase ? 'var(--text-sm)' : 'var(--text-base)',
                                fontWeight: isUppercase ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                                color: isUppercase ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
                                backgroundColor: isUppercase ? 'var(--color-bg-muted)' : 'transparent',
                                padding: isUppercase ? 'var(--spacing-3)' : '0',
                                borderRadius: isUppercase ? 'var(--radius-sm)' : '0',
                                letterSpacing: isUppercase ? '0.025em' : 'normal'
                              }}
                            >
                              {paragraph.trim()}
                            </p>
                          );
                        }
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Legal Contact Section */}
        <Card 
          className="mt-12"
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            marginTop: 'var(--spacing-12)',
            textAlign: 'center'
          }}
        >
          <CardContent style={{ padding: 'var(--spacing-8)' }}>
            <div className="space-y-4">
              <h3 
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  margin: '0'
                }}
              >
                Questions about these Terms?
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
                Our legal team is available to clarify any provisions or answer questions about your rights and obligations.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <a
                  href="mailto:legal@ikan.health"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: 'var(--color-primary-default)',
                    color: 'var(--color-text-inverse)',
                    textDecoration: 'none',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  <Icon name="mail" size={20} />
                  legal@ikan.health
                </a>
                
                <button
                  onClick={() => window.location.href = '/contact'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border hover:opacity-80 transition-opacity"
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}