import React from 'react';
import { ErrorBoundary } from '../../ErrorBoundary';
import { MessageSquare } from 'lucide-react';
import { useIsMobile } from '../../../hooks/useIsMobile';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../ui/accordion';

interface FAQSectionProps {
  onNavigate?: (route: string) => void;
}

const faqItems = [
  {
    question: 'What is iKan and how does it support mental health?',
    answer:
      'iKan is a mental health PWA that provides access to professional consultants, self-guided programs, mood journaling, and mental health assessments — all in one place. Our goal is to make mental wellness accessible, private, and stigma-free.',
  },
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
    question: 'Is my data private and secure on iKan?',
    answer:
      'Absolutely. All user data is encrypted and treated as highly sensitive. We follow strict privacy guidelines, and our designs are intentionally subtle so you can use the app comfortably in any setting.',
  },
  {
    question: 'What mental health assessments are available?',
    answer:
      'We offer clinically validated assessments for anxiety, depression, stress, well-being, and more. Results are private and can help guide your journey or inform conversations with a professional.',
  },
];

export function FAQSection({ onNavigate }: FAQSectionProps) {
  const isMobile = useIsMobile();

  const handleNavigateToFAQ = () => {
    if (onNavigate) {
      onNavigate('/faq');
    }
  };

  const handleNavigateToContact = () => {
    if (onNavigate) {
      onNavigate('/contact');
    }
  };

  return (
    <ErrorBoundary>
      <section
        style={{
          backgroundColor: 'var(--color-bg-card)',
          padding: '80px 0',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 24px',
          }}
        >
          {/* Section Title */}
          <h2
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: isMobile ? '32px' : '40px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              lineHeight: '1.15',
              marginBottom: '48px',
              margin: '0 0 48px 0',
            }}
          >
            Frequently
            <br />
            asked questions
          </h2>

          {/* Two-column layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 340px',
              gap: '40px',
            }}
          >
            {/* Left: Radix Accordion */}
            <div>
              <Accordion type="single" collapsible defaultValue="item-0">
                {faqItems.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-b border-[#EBEBEB] last:border-b-0"
                    style={{ borderColor: '#EBEBEB' }}
                  >
                    <AccordionTrigger
                      className="py-5 hover:no-underline"
                      style={{
                        fontFamily: 'var(--font-family-base)',
                        fontSize: '16px',
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
                          fontSize: '14px',
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

              {/* View all FAQs link */}
              <button
                onClick={handleNavigateToFAQ}
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: '14px',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '16px 0 0 0',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  textAlign: 'left',
                }}
              >
                View all FAQs
              </button>
            </div>

            {/* Right: Contact / Know More Card */}
            <div
              style={{
                border: '1px solid #EBEBEB',
                borderRadius: '16px',
                padding: '40px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                alignSelf: 'start',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: 'var(--color-text-primary)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                }}
              >
                <MessageSquare
                  style={{ width: '26px', height: '26px', color: 'white' }}
                  fill="white"
                />
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: '18px',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  lineHeight: '1.35',
                  margin: '0 0 12px 0',
                }}
              >
                Do you have more questions?
              </h3>

              <p
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: '14px',
                  fontWeight: 'var(--font-weight-regular)',
                  color: 'var(--color-text-muted)',
                  lineHeight: '1.6',
                  margin: '0 0 28px 0',
                  maxWidth: '260px',
                }}
              >
                We are here to help you on your mental health journey. Reach out
                and we will get back to you.
              </p>

              <button
                onClick={handleNavigateToContact}
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: '15px',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'white',
                  backgroundColor: '#F97066',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 32px',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}
