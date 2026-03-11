import { useState } from 'react';
import { Search, MessageSquarePlus } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { PageHero } from '../ui/PageHero';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../ui/accordion';

interface FAQProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

// FAQ data organised into categories
const faqCategories = [
  {
    id: 'about',
    title: 'About iKan',
    items: [
      {
        question: 'What is iKan and how does it support mental health?',
        answer:
          'iKan is a mental health progressive web app (PWA) that provides access to professional consultants, self-guided programs, mood journaling, and clinically validated assessments — all in one place. Our goal is to make mental wellness accessible, private, and stigma-free.',
      },
      {
        question: 'Is iKan a replacement for therapy?',
        answer:
          'No. iKan is a complement to professional care, not a replacement. Our Equip programs, mood tracking, and resources are designed to support your wellbeing between sessions or as a first step. For clinical concerns, we always encourage working with a licensed professional — and our consultation feature can connect you with one.',
      },
      {
        question: 'How is iKan different from other mental health apps?',
        answer:
          'iKan combines self-paced CBT-based programs, professional consultations, mood journaling, and a resource library into a single platform. We follow "Calm Tech" design principles — our interface is intentionally subtle so you can use the app comfortably in any setting without drawing attention.',
      },
    ],
  },
  {
    id: 'getting-started',
    title: 'Signing Up & Getting Started',
    items: [
      {
        question: 'How do I create an account?',
        answer:
          'Tap "Get Started" on the homepage, enter your name, email, and a secure password. Your account will be confirmed automatically — no email verification required during the beta period.',
      },
      {
        question: 'Is iKan free to use?',
        answer:
          'Browsing resources, assessments, and our library is free. Individual Equip programs and professional consultations are paid services. Pricing is displayed clearly before purchase — no hidden fees.',
      },
      {
        question: 'Can I use iKan without signing in?',
        answer:
          'Yes. Public pages like Resources, Assessments (overview), Equip program listings, and informational content are accessible without an account. Signing in unlocks mood journaling, program enrolment, consultation booking, and personalised recommendations.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Managing Your Account',
    items: [
      {
        question: 'How do I update my profile information?',
        answer:
          'Navigate to your Account page from the bottom navigation (mobile) or the profile menu (desktop). You can update your name, phone number, bio, date of birth, gender, location, and emergency contact details.',
      },
      {
        question: 'How do I change my password or email?',
        answer:
          'Go to Account → Security section. You can change your password by entering your current and new password. To change your email, submit a change request and verify via the confirmation link sent to the new address.',
      },
      {
        question: 'Can I export or delete my data?',
        answer:
          'Yes. Under Account → Data & Privacy, you can export all your data (profile, journal entries, assessment results, and program progress) as a JSON file. You can also permanently delete your account — this action is irreversible and removes all data from our systems.',
      },
    ],
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions & Billing',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept all major credit and debit cards, UPI, and net banking through our secure Razorpay integration. All transactions are encrypted and processed in INR.',
      },
      {
        question: 'How do I view my payment history?',
        answer:
          'Go to Account → Payment History to see a complete record of your transactions, including program purchases, consultation fees, and any refunds.',
      },
      {
        question: 'What is your refund policy?',
        answer:
          'We offer refunds on a case-by-case basis. If you are unsatisfied with a program or session, please contact our support team within 7 days of purchase. Detailed terms are available on our Return Policy page.',
      },
    ],
  },
  {
    id: 'sessions',
    title: 'Sessions & Programs',
    items: [
      {
        question: 'How do I book a consultation with a therapist?',
        answer:
          'Navigate to the Consultation page, browse our verified professionals by category, and select a time slot that works for you. You can filter by expertise, language, availability, and session mode (video, call, chat, or in-person).',
      },
      {
        question: 'Are the Equip programs self-paced?',
        answer:
          'Yes. Equip programs are structured into daily modules you can complete at your own pace. Each program includes exercises, reflections, and progress tracking to help you build lasting habits.',
      },
      {
        question: 'What mental health assessments are available?',
        answer:
          'We offer clinically validated assessments for anxiety (GAD-7), depression (PHQ-9), stress, well-being, and more. Results are private and can help guide your journey or inform conversations with a professional.',
      },
      {
        question: 'How does mood journaling work?',
        answer:
          'The Mood Journal lets you log your mood daily with a rating, emotions, energy level, and free-text reflections. Over time, iKan visualises trends so you can understand patterns in your mental health.',
      },
    ],
  },
  {
    id: 'trust-safety',
    title: 'Trust, Safety & Privacy',
    items: [
      {
        question: 'Is my data private and secure?',
        answer:
          'Absolutely. All user data is encrypted and treated as highly sensitive. We follow strict privacy guidelines and never share your data with third parties. Our designs are intentionally subtle so you can use the app comfortably in any setting.',
      },
      {
        question: 'What should I do in a mental health emergency?',
        answer:
          'If you or someone you know is in immediate danger, please call your local emergency services (911) or the iCALL Suicide Prevention Helpline at 915298721. iKan always provides visible access to crisis resources throughout the app.',
      },
      {
        question: 'How are consultants verified?',
        answer:
          'All consultants on iKan are licensed professionals. We verify their credentials, qualifications, and experience before they join the platform. You can view each consultant\'s profile, specialisations, and user reviews before booking.',
      },
    ],
  },
];

export function FAQ({ className, onNavigate }: FAQProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter FAQ items based on search
  const filteredCategories = searchQuery.trim()
    ? faqCategories
        .map((cat) => ({
          ...cat,
          items: cat.items.filter(
            (item) =>
              item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((cat) => cat.items.length > 0)
    : faqCategories;

  const totalResults = filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div
      className={`min-h-screen ${className || ''}`}
      style={{
        backgroundColor: 'var(--color-bg-page)',
        fontFamily: 'var(--font-family-base)',
      }}
    >
      {/* Hero Section */}
      <PageHero
        title="FAQs & Help Center"
        subtitle="Find answers to common questions about iKan, your account, programs, and more."
      />

      {/* Content */}
      <div
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile
            ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)'
            : 'var(--ikan-component-spacing-large) var(--spacing-12)',
        }}
      >
        {/* Search Bar */}
        <div
          className="relative w-full mx-auto"
          style={{
            maxWidth: '640px',
            marginBottom: isMobile ? '32px' : '48px',
          }}
        >
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            size={20}
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for answers..."
            style={{
              width: '100%',
              height: 'var(--ikan-component-input-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              border: '1px solid var(--color-border-default)',
              backgroundColor: 'var(--color-bg-card)',
              paddingLeft: '48px',
              paddingRight: '16px',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-regular)',
              fontFamily: 'var(--font-family-base)',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
        </div>

        {/* Search result count */}
        {searchQuery.trim() && (
          <p
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-muted)',
              marginBottom: '24px',
            }}
          >
            {totalResults === 0
              ? 'No results found. Try a different search term.'
              : `Showing ${totalResults} result${totalResults !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* FAQ Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '24px' : '32px' }}>
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-light)',
                overflow: 'hidden',
              }}
            >
              {/* Category Header */}
              <div
                style={{
                  padding: isMobile ? '16px 16px 0' : '24px 32px 0',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    margin: '0 0 4px 0',
                    lineHeight: '1.4',
                  }}
                >
                  {category.title}
                </h2>
              </div>

              {/* Accordion */}
              <div style={{ padding: isMobile ? '0 16px 8px' : '0 32px 8px' }}>
                <Accordion type="single" collapsible>
                  {category.items.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.id}-${index}`}
                      className="border-b last:border-b-0"
                      style={{ borderColor: 'var(--color-border-default)' }}
                    >
                      <AccordionTrigger
                        className="py-5 hover:no-underline"
                        style={{
                          fontFamily: 'var(--font-family-base)',
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)',
                          lineHeight: '1.5',
                          textDecoration: 'none',
                        }}
                      >
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p
                          style={{
                            fontFamily: 'var(--font-family-base)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-regular)',
                            color: 'var(--color-text-muted)',
                            lineHeight: '1.7',
                            margin: 0,
                          }}
                        >
                          {item.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support CTA */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            padding: isMobile ? '32px 20px' : '48px 40px',
            textAlign: 'center',
            marginTop: isMobile ? '32px' : '48px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              backgroundColor: 'var(--color-text-primary)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <MessageSquarePlus style={{ width: '26px', height: '26px', color: 'white' }} />
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              margin: '0 0 8px 0',
            }}
          >
            Still have questions?
          </h3>

          <p
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-muted)',
              lineHeight: '1.6',
              maxWidth: '460px',
              margin: '0 auto 24px',
            }}
          >
            We are here to help you on your mental health journey. Submit a ticket and our team will get back to you.
          </p>

          <button
            onClick={() => onNavigate?.('/contact')}
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'white',
              backgroundColor: 'var(--color-primary-default)',
              border: 'none',
              borderRadius: 'var(--ikan-component-border-radius)',
              padding: '14px 40px',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}