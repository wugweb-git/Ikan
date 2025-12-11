import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Card } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Icon } from '../Icon';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface EquipProgramLandingMobileProps {
  onStartProgram?: (programId: string) => void;
  onNewsletterSubmit?: (data: { email: string; firstName: string; newsletters: boolean; tips: boolean }) => void;
  className?: string;
}

export function EquipProgramLandingMobile({ 
  onStartProgram, 
  onNewsletterSubmit,
  className 
}: EquipProgramLandingMobileProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [tipsConsent, setTipsConsent] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNewsletterSubmit && email && firstName) {
      onNewsletterSubmit({
        email,
        firstName,
        newsletters: newsletterConsent,
        tips: tipsConsent
      });
      setEmail('');
      setFirstName('');
      setNewsletterConsent(false);
      setTipsConsent(false);
    }
  };

  const faqData = [
    {
      id: 'burnout-prevention',
      question: 'What is burnout prevention?',
      answer: 'Burnout prevention involves building resilience and developing coping strategies to manage stress before it becomes overwhelming.'
    },
    {
      id: 'program-duration',
      question: 'How long is the Equip Program?',
      answer: 'The program typically runs for 6-8 weeks, with daily activities and weekly check-ins. You can progress at your own pace.'
    },
    {
      id: 'who-can-join',
      question: 'Who can join the program?',
      answer: 'Adults aiming to prevent burnout and build resilience are welcome. Consult your healthcare provider if managing other conditions.'
    },
    {
      id: 'what-included',
      question: 'What\'s included?',
      answer: 'Interactive modules, daily exercises, stress management techniques, mindfulness practices, and community support.'
    }
  ];

  return (
    <div 
      className={`w-full min-h-screen mobile-optimized ${className || ''}`}
      style={{ backgroundColor: 'var(--color-accent-default)' }}
    >
      {/* Hero Section */}
      <section 
        className="relative w-full"
        style={{
          height: '884px',
          background: `linear-gradient(135deg, var(--color-primary-default) 0%, #404040 100%)`,
          borderRadius: '0 0 32px 32px',
          padding: '80px var(--ikan-component-spacing-default)'
        }}
      >
        <div 
          className="flex flex-col justify-between h-full"
          style={{ color: 'var(--color-text-inverse)' }}
        >
          <div>
            <h1 
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-semibold)',
                lineHeight: 'var(--line-height-sm)',
                marginBottom: 'var(--ikan-component-spacing-small)',
                color: 'var(--color-text-inverse)'
              }}
            >
              Build Resilience Against Burnout
            </h1>
            <p 
              style={{
                fontSize: 'var(--text-sm)',
                lineHeight: 'var(--line-height-md)',
                color: 'var(--color-text-inverse)',
                opacity: 0.9
              }}
            >
              Ready to develop resilience against burnout? Adults aiming for preventing burnout, join us! If you're managing other mental health stuff, just check with your doc first.
            </p>
          </div>
          
          <Button
            onClick={() => onStartProgram && onStartProgram('burnout-prevention-program')}
            className="mobile-button w-full"
            style={{
              backgroundColor: 'var(--color-text-inverse)',
              color: 'var(--color-primary-default)',
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            Start Program
          </Button>
        </div>
      </section>

      {/* Video Interview Section */}
      <section 
        style={{
          padding: 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)',
          backgroundColor: 'var(--color-bg-card)'
        }}
      >
        <Card 
          className="relative overflow-hidden"
          style={{
            borderRadius: 'var(--radius-lg)',
            height: '200px',
            background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), 
                        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="%23e5e5e5"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="14">Burnout Prevention</text></svg>')`
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              className="flex items-center gap-3 text-white hover:text-white hover:bg-white/20"
              onClick={() => alert('Video player would open here')}
            >
              <div 
                className="flex items-center justify-center"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 'var(--radius-pill)',
                  color: 'var(--color-primary-default)'
                }}
              >
                <Icon name="play" size={20} />
              </div>
              <div className="text-left">
                <div 
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-inverse)'
                  }}
                >
                  Watch Full Interview
                </div>
              </div>
            </Button>
          </div>
        </Card>
      </section>

      {/* Features Section */}
      <section 
        style={{
          padding: 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)',
          backgroundColor: 'var(--color-bg-page)',
          textAlign: 'center'
        }}
      >
        <h2 
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--ikan-component-spacing-default)'
          }}
        >
          Discover Our Programs
        </h2>
        <Button
          onClick={() => onStartProgram && onStartProgram('explore-programs')}
          className="mobile-button"
          style={{
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-primary-on)',
            height: 'var(--ikan-component-button-height)',
            borderRadius: 'var(--ikan-component-border-radius)',
            padding: `0 var(--ikan-component-spacing-large)`
          }}
        >
          Explore Programs
        </Button>
      </section>

      {/* Program Cards Section */}
      <section 
        style={{
          padding: 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)',
          backgroundColor: 'var(--color-bg-muted)'
        }}
      >
        <h2 
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--ikan-component-spacing-large)',
            textAlign: 'center'
          }}
        >
          Our Evidence-Based Programs
        </h2>
        <div 
          className="space-y-4"
          style={{ gap: 'var(--ikan-component-spacing-default)' }}
        >
          {[
            {
              title: 'Stress Management Essentials',
              description: 'Learn practical techniques to identify, manage, and reduce stress in your daily life.',
              duration: '4 weeks',
              modules: 16,
              level: 'Beginner'
            },
            {
              title: 'Burnout Prevention Toolkit',
              description: 'Comprehensive strategies to prevent burnout and maintain work-life balance.',
              duration: '6 weeks',
              modules: 24,
              level: 'Intermediate'
            },
            {
              title: 'Resilience Building Program',
              description: 'Advanced techniques for building mental resilience and emotional strength.',
              duration: '8 weeks',
              modules: 32,
              level: 'Advanced'
            }
          ].map((program, index) => (
            <Card 
              key={index}
              className="mobile-card p-6 hover:shadow-md transition-shadow"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--ikan-component-spacing-large)',
                border: '1px solid var(--color-border-light)',
                cursor: 'pointer'
              }}
              onClick={() => onStartProgram && onStartProgram(`program-${index + 1}`)}
            >
              <div 
                className="flex items-center justify-between mb-3"
              >
                <span 
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-primary-default)',
                    backgroundColor: 'var(--color-accent-default)',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--letter-spacing-wide)'
                  }}
                >
                  {program.level}
                </span>
                <div 
                  className="flex items-center gap-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Icon name="clock" size={14} />
                  <span style={{ fontSize: 'var(--text-xs)' }}>
                    {program.duration}
                  </span>
                </div>
              </div>
              
              <h3 
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--ikan-component-spacing-small)'
                }}
              >
                {program.title}
              </h3>
              
              <p 
                style={{
                  fontSize: 'var(--text-sm)',
                  lineHeight: 'var(--line-height-md)',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--ikan-component-spacing-default)'
                }}
              >
                {program.description}
              </p>
              
              <div 
                className="flex items-center justify-between mb-4"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <div className="flex items-center gap-1">
                  <Icon name="book-open" size={14} />
                  <span style={{ fontSize: 'var(--text-xs)' }}>
                    {program.modules} modules
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="users" size={14} />
                  <span style={{ fontSize: 'var(--text-xs)' }}>
                    Community
                  </span>
                </div>
              </div>
              
              <Button
                className="w-full mobile-button"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'var(--color-primary-on)'
                }}
              >
                Learn More
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section 
        style={{
          padding: 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)',
          backgroundColor: 'var(--color-bg-card)'
        }}
      >
        <h2 
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--ikan-component-spacing-large)',
            textAlign: 'center'
          }}
        >
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqData.map((faq) => (
            <Collapsible
              key={faq.id}
              open={openFAQ === faq.id}
              onOpenChange={(isOpen) => setOpenFAQ(isOpen ? faq.id : null)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-left p-4 h-auto"
                  style={{
                    backgroundColor: 'var(--color-bg-muted)',
                    borderRadius: 'var(--ikan-component-border-radius)',
                    border: '1px solid var(--color-border-light)'
                  }}
                >
                  <span 
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {faq.question}
                  </span>
                  {openFAQ === faq.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent 
                className="px-4 pb-4"
                style={{
                  backgroundColor: 'var(--color-bg-page)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  marginTop: 'var(--ikan-component-spacing-small)'
                }}
              >
                <p 
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 'var(--line-height-md)',
                    padding: 'var(--ikan-component-spacing-default)'
                  }}
                >
                  {faq.answer}
                </p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section 
        style={{
          padding: 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)',
          backgroundColor: 'var(--color-bg-page)'
        }}
      >
        <h2 
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--ikan-component-spacing-large)',
            textAlign: 'center'
          }}
        >
          Newsletter Subscription
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label 
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  display: 'block',
                  marginBottom: 'var(--ikan-component-spacing-small)'
                }}
              >
                First Name
              </label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className="mobile-input"
                style={{
                  height: 'var(--ikan-component-input-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </div>
            
            <div>
              <label 
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  display: 'block',
                  marginBottom: 'var(--ikan-component-spacing-small)'
                }}
              >
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="mobile-input"
                style={{
                  height: 'var(--ikan-component-input-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="newsletter-mobile-equip"
                checked={newsletterConsent}
                onCheckedChange={setNewsletterConsent}
              />
              <label 
                htmlFor="newsletter-mobile-equip"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer'
                }}
              >
                News & Offers
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <Checkbox
                id="tips-mobile-equip"
                checked={tipsConsent}
                onCheckedChange={setTipsConsent}
              />
              <label 
                htmlFor="tips-mobile-equip"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer'
                }}
              >
                Practical Tips and Exercises
              </label>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full mobile-button"
            disabled={!email || !firstName}
            style={{
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)'
            }}
          >
            Subscribe Now
          </Button>
        </form>
        
        <p 
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--ikan-component-spacing-default)',
            textAlign: 'center'
          }}
        >
          Privacy: iKan stores and processes your personal data based on our privacy policy. 
          You can unsubscribe at any time.
        </p>
      </section>
    </div>
  );
}