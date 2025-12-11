import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface FAQProps {
  className?: string;
  onBack?: () => void;
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

export function FAQ({ className, onBack }: FAQProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqData: FAQItem[] = [
    {
      id: '1',
      category: 'Getting Started',
      question: 'What is iKan and how does it work?',
      answer: 'iKan is a comprehensive mental health platform that provides evidence-based assessments, personalized equip programs, and a curated resource library. Our platform uses validated psychological assessments to understand your mental health needs and recommends tailored programs to support your wellness journey.',
      tags: ['platform', 'assessments', 'programs']
    },
    {
      id: '2',
      category: 'Getting Started',
      question: 'How do I create an account and get started?',
      answer: 'Getting started is simple! Click the "Get Started" button on our homepage, create your account with an email and password, and complete our initial wellness assessment. Based on your responses, we\'ll recommend personalized programs and resources.',
      tags: ['account', 'signup', 'onboarding']
    },
    {
      id: '3',
      category: 'Getting Started',
      question: 'Is my personal information secure and private?',
      answer: 'Absolutely. We use bank-level encryption to protect all your data. Your mental health information is treated with the highest level of confidentiality and is never shared with third parties without your explicit consent. We are HIPAA-compliant and follow strict privacy protocols.',
      tags: ['privacy', 'security', 'data']
    },
    {
      id: '4',
      category: 'Assessments',
      question: 'How long do assessments take to complete?',
      answer: 'Most of our assessments take between 10-15 minutes to complete. You can save your progress at any time and return to finish later. The initial wellness assessment is our longest at about 20 minutes, while check-in assessments are typically 5-7 minutes.',
      tags: ['time', 'duration', 'progress']
    },
    {
      id: '5',
      category: 'Assessments',
      question: 'How often should I retake assessments?',
      answer: 'We recommend retaking your primary wellness assessment every 4-6 weeks to track your progress. Quick check-in assessments can be taken weekly or whenever you feel your mental state has changed significantly. Regular assessment helps us provide better recommendations.',
      tags: ['frequency', 'tracking', 'progress']
    },
    {
      id: '6',
      category: 'Assessments',
      question: 'Are the assessments clinically validated?',
      answer: 'Yes, all our assessments are based on clinically validated psychological scales and tools used by mental health professionals. We use established instruments like PHQ-9, GAD-7, and other evidence-based measures to ensure accuracy and reliability.',
      tags: ['clinical', 'validated', 'professional']
    },
    {
      id: '7',
      category: 'Equip Programs',
      question: 'What are Equip Programs and how do they help?',
      answer: 'Equip Programs are structured, evidence-based mental health interventions designed to help you develop coping skills and improve your wellbeing. Each program includes interactive modules, exercises, and tools based on proven therapeutic approaches like CBT, mindfulness, and positive psychology.',
      tags: ['programs', 'interventions', 'skills']
    },
    {
      id: '8',
      category: 'Equip Programs',
      question: 'How long does it take to complete a program?',
      answer: 'Program length varies depending on the specific intervention. Most programs take 4-8 weeks to complete, with 10-20 minutes of daily engagement. You can progress at your own pace and the platform will adapt to your schedule and preferences.',
      tags: ['duration', 'schedule', 'pace']
    },
    {
      id: '9',
      category: 'Equip Programs',
      question: 'Can I do multiple programs at the same time?',
      answer: 'While you can enroll in multiple programs, we recommend focusing on one primary program at a time for maximum effectiveness. Once you complete a program, you can move on to others. Our algorithm will suggest the optimal sequence based on your needs.',
      tags: ['multiple', 'sequence', 'effectiveness']
    },
    {
      id: '10',
      category: 'Account & Billing',
      question: 'How much does iKan cost?',
      answer: 'We offer flexible pricing plans including a free tier with basic assessments and limited resources. Premium plans start at $19.99/month and include unlimited assessments, all Equip Programs, one-on-one consultations, and priority support. Annual plans receive a 20% discount.',
      tags: ['pricing', 'plans', 'cost']
    },
    {
      id: '11',
      category: 'Account & Billing',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time through your account settings. There are no cancellation fees, and you\'ll continue to have access to premium features until the end of your current billing period. You can also downgrade to our free tier.',
      tags: ['cancellation', 'subscription', 'billing']
    },
    {
      id: '12',
      category: 'Support',
      question: 'What if I need immediate mental health support?',
      answer: 'If you\'re experiencing a mental health crisis, please contact emergency services (911) or the National Suicide Prevention Lifeline (988) immediately. iKan is designed to support ongoing wellness but is not a substitute for emergency mental health care.',
      tags: ['crisis', 'emergency', 'immediate']
    },
    {
      id: '13',
      category: 'Support',
      question: 'How can I contact customer support?',
      answer: 'You can reach our support team at support@ikan.health or through the contact form on our website. Premium subscribers also have access to live chat support during business hours (9 AM - 6 PM EST). We typically respond to emails within 24 hours.',
      tags: ['support', 'contact', 'help']
    }
  ];

  const categories = ['all', ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
                <Icon name="help-circle" size={32} style={{ color: 'var(--color-text-inverse)' }} />
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
              Frequently Asked Questions
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
              Find quick answers to common questions about iKan's mental health platform, assessments, and programs.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)' : 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-large)',
          marginTop: '-var(--ikan-component-spacing-large)',
          position: 'relative',
          zIndex: 10
        }}
      >
        <Card
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <CardContent style={{ padding: 'var(--ikan-component-spacing-large)' }}>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Icon 
                  name="search" 
                  size={20} 
                  style={{
                    position: 'absolute',
                    left: 'var(--ikan-component-spacing-small)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    pointerEvents: 'none'
                  }}
                />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    height: 'var(--ikan-component-input-height)',
                    borderRadius: 'var(--ikan-component-border-radius)',
                    paddingLeft: '48px',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-regular)',
                    backgroundColor: 'var(--semantic-input-bg)',
                    border: 'var(--semantic-input-border)'
                  }}
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      height: '36px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      textTransform: 'capitalize',
                      backgroundColor: selectedCategory === category 
                        ? 'var(--color-primary-default)' 
                        : 'transparent',
                      color: selectedCategory === category 
                        ? 'var(--color-text-inverse)' 
                        : 'var(--color-text-primary)',
                      border: selectedCategory === category 
                        ? 'none' 
                        : '1px solid var(--color-border-default)'
                    }}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </Button>
                ))}
              </div>
              
              {/* Results Count */}
              <p 
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-regular)',
                  color: 'var(--color-text-muted)',
                  margin: '0'
                }}
              >
                Showing {filteredFAQs.length} {filteredFAQs.length === 1 ? 'result' : 'results'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Content */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile ? '0 var(--ikan-component-spacing-default) var(--ikan-component-spacing-large)' : '0 var(--ikan-component-spacing-large) var(--spacing-12)'
        }}
      >
        {filteredFAQs.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFAQs.map((item) => (
              <AccordionItem 
                key={item.id} 
                value={item.id}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-light)',
                  padding: '0',
                  marginBottom: 'var(--ikan-component-spacing-default)'
                }}
              >
                <AccordionTrigger 
                  className="text-left hover:no-underline"
                  style={{
                    padding: 'var(--ikan-component-spacing-default) var(--ikan-component-spacing-large)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--line-height-md)'
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-primary-default)',
                          backgroundColor: 'var(--color-accent-default)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      >
                        {item.category}
                      </span>
                    </div>
                    <span>{item.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent 
                  style={{
                    padding: '0 var(--ikan-component-spacing-large) var(--ikan-component-spacing-large)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--line-height-md)'
                  }}
                >
                  <div className="space-y-4">
                    <p style={{ margin: '0' }}>{item.answer}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-weight-regular)',
                            color: 'var(--color-text-muted)',
                            backgroundColor: 'var(--color-bg-muted)',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Card
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-light)',
              textAlign: 'center'
            }}
          >
            <CardContent style={{ padding: 'var(--ikan-component-spacing-large)' }}>
              <div className="space-y-4">
                <Icon name="search-x" size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto' }} />
                <h3 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    margin: '0'
                  }}
                >
                  No results found
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
                  Try adjusting your search terms or browse all categories.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  variant="outline"
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    marginTop: 'var(--ikan-component-spacing-default)'
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contact Support Section */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)' : 'var(--spacing-12) var(--ikan-component-spacing-large)',
          marginTop: 'var(--ikan-component-spacing-large)'
        }}
      >
        <Card
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            textAlign: 'center'
          }}
        >
          <CardContent style={{ padding: 'var(--ikan-component-spacing-large)' }}>
            <div className="space-y-4">
              <h3 
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  margin: '0'
                }}
              >
                Still have questions?
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
                Can't find what you're looking for? Our support team is here to help you with personalized assistance.
              </p>
              
              <Button
                onClick={() => window.location.href = '/contact'}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  backgroundColor: 'var(--semantic-button-primary-bg)',
                  color: 'var(--semantic-button-primary-fg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  border: 'none',
                  marginTop: 'var(--ikan-component-spacing-default)'
                }}
              >
                <Icon name="message-circle" size={20} style={{ marginRight: 'var(--ikan-component-spacing-small)' }} />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}