import { useState, useMemo } from 'react';
import { Search, MessageSquarePlus } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { DEFAULT_CMS_CONTENT } from '../../utils/cms-defaults';
import { PageHero } from '../../components/ui/PageHero';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../components/ui/accordion';

interface FAQProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

export function FAQ({ className, onNavigate }: FAQProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');

  // ── CMS content ──
  const cmsContent = DEFAULT_CMS_CONTENT['page-faq'];
  const cms = useMemo(() => {
    if (!cmsContent?.content) return null;
    try { return JSON.parse(cmsContent.content); } catch { return null; }
  }, [cmsContent]);

  const heroTitle = cmsContent?.heroTitle || cms?.heroTitle || 'FAQs & Help Center';
  const heroSubtitle = cmsContent?.heroSubtitle || cms?.heroSubtitle || 'Find answers to common questions about iKan, your account, programs, and more.';
  const searchPlaceholder = cms?.searchPlaceholder || 'Search for answers...';
  const noResultsText = cms?.noResultsText || 'No results found. Try a different search term.';
  const ctaTitle = cms?.ctaTitle || 'Still have questions?';
  const ctaDescription = cms?.ctaDescription || 'We are here to help you on your mental health journey. Submit a ticket and our team will get back to you.';
  const ctaButtonText = cms?.ctaButtonText || 'Contact Support';
  const ctaButtonRoute = cms?.ctaButtonRoute || '/contact';

  const faqCategories = cms?.categories || [
    {
      id: 'about',
      title: 'About iKan',
      items: [
        {
          question: 'What is iKan and how does it support mental health?',
          answer: 'iKan is a mental health progressive web app (PWA) that provides access to professional consultants, self-guided programs, mood journaling, and clinically validated assessments — all in one place. Our goal is to make mental wellness accessible, private, and stigma-free.',
        },
        {
          question: 'Is iKan a replacement for therapy?',
          answer: 'No. iKan is designed to complement professional therapy, not replace it. Our tools — like mood journaling, self-guided Equip programs, and validated assessments — can support your well-being between sessions or help you decide when to seek professional help. For clinical concerns, we always recommend consulting a licensed therapist.',
        },
        {
          question: 'How is iKan different from other mental health apps?',
          answer: 'iKan combines clinically validated assessments, structured self-help programs, mood journaling, and direct access to verified consultants — all within a single, privacy-first platform. We focus on accessibility, evidence-based approaches, and a stigma-free experience tailored for users in India.',
        },
      ],
    },
    {
      id: 'getting-started',
      title: 'Signing Up & Getting Started',
      items: [
        {
          question: 'How do I create an account?',
          answer: 'Tap the "Sign Up" button on the homepage, enter your name, email, and a password. Your account will be created instantly — no email verification required during our beta period. You can start exploring assessments, programs, and resources right away.',
        },
        {
          question: 'Is iKan free to use?',
          answer: 'iKan offers a free tier that includes mood journaling, mental health assessments, and access to the resource library. Premium features — such as Equip programs and one-on-one consultations — may require a subscription or per-session payment.',
        },
        {
          question: 'Can I use iKan without signing in?',
          answer: 'Yes! You can browse the resource library, read articles, explore the About page, and view available programs and consultants without an account. However, features like mood journaling, assessments, and booking consultations require you to sign in.',
        },
      ],
    },
    {
      id: 'account',
      title: 'Managing Your Account',
      items: [
        {
          question: 'How do I update my profile information?',
          answer: 'Go to your Account page from the bottom navigation (or top nav on desktop), then tap "Personal Information". You can update your name, phone number, bio, date of birth, gender, location, and emergency contact details.',
        },
        {
          question: 'How do I change my password or email?',
          answer: 'Navigate to Account → Security Settings. From there you can change your password by entering your current and new password. To change your email, go to Account → Personal Information and use the email change option — a verification step will confirm the update.',
        },
        {
          question: 'Can I export or delete my data?',
          answer: 'Yes. Under Account → Privacy Settings, you can request a full data export or account deletion. Data exports are delivered as a downloadable file. Account deletion permanently removes all your data from our systems in compliance with privacy regulations.',
        },
      ],
    },
    {
      id: 'billing',
      title: 'Subscriptions & Billing',
      items: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major payment methods through Razorpay, including credit cards, debit cards, UPI, net banking, and popular digital wallets. All transactions are securely processed and encrypted.',
        },
        {
          question: 'How do I view my payment history?',
          answer: 'Go to Account → Payment History to see a complete record of all your transactions, including program purchases and consultation bookings. Each entry shows the date, amount, and status of the payment.',
        },
        {
          question: 'What is your refund policy?',
          answer: 'Refund eligibility depends on the type of purchase. Consultation cancellations made at least 24 hours in advance are eligible for a full refund. Program subscriptions may be refunded within the first 7 days if no content has been accessed. Visit our Return Policy page for full details.',
        },
      ],
    },
    {
      id: 'sessions-programs',
      title: 'Sessions & Programs',
      items: [
        {
          question: 'How do I book a consultation with a therapist?',
          answer: 'Navigate to the Consultation page, browse verified therapists by speciality, and select a time slot that works for you. You can view each consultant\'s profile, qualifications, and areas of expertise before booking. Payment is processed securely at the time of booking.',
        },
        {
          question: 'Are the Equip programs self-paced?',
          answer: 'Yes! Equip programs are structured as daily activities but are entirely self-paced. Each day includes a mix of content — readings, reflections, audio exercises, and check-ins. You can progress at your own speed and revisit completed days anytime.',
        },
        {
          question: 'What mental health assessments are available?',
          answer: 'iKan offers screening tools for depression, anxiety (GAD-7), stress, well-being and more. These assessments provide instant insights into your mental well-being and can help guide conversations with a professional. They are screening tools, not diagnoses.',
        },
        {
          question: 'How does mood journaling work?',
          answer: 'The Mood Journal lets you log your emotional state daily using simple mood selectors and optional notes. Over time, you can track patterns and trends on your Wellness Timeline. It takes less than a minute and helps build self-awareness about your mental health.',
        },
      ],
    },
    {
      id: 'privacy-safety',
      title: 'Trust, Safety & Privacy',
      items: [
        {
          question: 'Is my data private and secure?',
          answer: 'Your data is treated as highly sensitive. It is sent over an encrypted connection and stored in an access-controlled database, we follow strict privacy guidelines, and we never share it with third parties. Note that some content is cached on your own device so the app works offline — sign out on a shared device to clear it. Our designs are intentionally subtle so you can use the app comfortably in any setting.',
        },
        {
          question: 'What should I do in a mental health emergency?',
          answer: 'If you or someone you know is in immediate danger, please call emergency services (112 in India) or reach out to a crisis helpline such as iCall (9152987821) or Vandrevala Foundation (1860-2662-345). iKan provides quick access to crisis resources from within the app, but is not a substitute for emergency services.',
        },
        {
          question: 'How are consultants verified?',
          answer: 'All consultants on iKan go through a thorough verification process. We verify their professional qualifications, licenses, and years of experience. Each consultant\'s profile displays their credentials, specialisations, and areas of expertise so you can make an informed choice.',
        },
      ],
    },
  ];

  // Filter FAQ items based on search
  const filteredCategories = searchQuery.trim()
    ? faqCategories
        .map((cat: any) => ({
          ...cat,
          items: cat.items.filter(
            (item: any) =>
              item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((cat: any) => cat.items.length > 0)
    : faqCategories;

  const totalResults = filteredCategories.reduce((sum: number, cat: any) => sum + cat.items.length, 0);

  return (
    <div
      className={`min-h-screen ${className || ''}`}
      style={{
        backgroundColor: 'var(--color-bg-page)',
        fontFamily: 'var(--font-family-base)',
      }}
    >
      <PageHero title={heroTitle} subtitle={heroSubtitle} backgroundImage={cmsContent?.heroImage} />

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
          style={{ maxWidth: '640px', marginBottom: isMobile ? '32px' : '48px' }}
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
            placeholder={searchPlaceholder}
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
              ? noResultsText
              : `Showing ${totalResults} result${totalResults !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* FAQ Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '24px' : '32px' }}>
          {filteredCategories.map((category: any) => (
            <div
              key={category.id}
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-light)',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: isMobile ? '16px 16px 0' : '24px 32px 0' }}>
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

              <div style={{ padding: isMobile ? '0 16px 8px' : '0 32px 8px' }}>
                <Accordion type="single" collapsible>
                  {category.items.map((item: any, index: number) => (
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
            {ctaTitle}
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
            {ctaDescription}
          </p>

          <button
            onClick={() => onNavigate?.(ctaButtonRoute)}
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
            {ctaButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}