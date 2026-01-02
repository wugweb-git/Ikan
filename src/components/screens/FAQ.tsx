import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { usePageContent } from '../../hooks/usePageContent';
import { PageHero } from '../ui/PageHero';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface FAQProps {
  className?: string;
  onBack?: () => void;
}

const DEFAULT_FAQS = [
  {
    question: "What is iKan?",
    answer: "iKan is a digital mental health platform designed to help you understand and improve your well-being through assessments, daily tracking, and guided programs."
  },
  {
    question: "Are the assessments clinically valid?",
    answer: "Yes, our assessments are based on standardized clinical instruments like the PHQ-9 (Depression) and GAD-7 (Anxiety) to provide reliable insights."
  },
  {
    question: "Is my data private?",
    answer: "Absolutely. We prioritize your privacy and security. Your personal data is encrypted and we strictly adhere to privacy regulations to ensure your information remains confidential."
  },
  {
    question: "How do the programs work?",
    answer: "Our Equip programs are structured, self-paced courses that guide you through evidence-based techniques (like CBT) to manage specific challenges such as stress, anxiety, or sleep issues."
  },
  {
    question: "Can I talk to a professional?",
    answer: "Yes, you can book sessions with qualified mental health professionals directly through our platform in the 'Consultation' section."
  },
  {
    question: "Is iKan free to use?",
    answer: "iKan offers both free and premium tiers. Basic tracking and some assessments are free, while specialized programs and consultations may require a subscription or one-time payment."
  }
];

export function FAQ({ className, onBack }: FAQProps) {
  const isMobile = useIsMobile();
  const { content, loading } = usePageContent('faq');

  // If content is just HTML string, we might want to parse it or use default if it's empty/placeholder
  // For now, if content.content is "Coming Soon" or empty, we use DEFAULT_FAQS
  const showDefaults = !content?.content || content.content.length < 50;

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
        title={content?.title || 'Frequently Asked Questions'}
        subtitle="Find quick answers to common questions about iKan's mental health platform, assessments, and programs."
      />

      {/* Main Content */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)' : 'var(--ikan-component-spacing-large) var(--spacing-12)',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
             {showDefaults ? (
               <Accordion type="single" collapsible className="w-full">
                 {DEFAULT_FAQS.map((faq, index) => (
                   <AccordionItem key={index} value={`item-${index}`}>
                     <AccordionTrigger className="text-left text-base font-medium text-gray-900">
                       {faq.question}
                     </AccordionTrigger>
                     <AccordionContent className="text-gray-600 leading-relaxed">
                       {faq.answer}
                     </AccordionContent>
                   </AccordionItem>
                 ))}
               </Accordion>
             ) : (
                <div 
                  dangerouslySetInnerHTML={{ __html: content?.content || '' }} 
                  className="prose prose-lg max-w-none"
                />
             )}
          </div>
        )}
      </div>
    </div>
  );
}
