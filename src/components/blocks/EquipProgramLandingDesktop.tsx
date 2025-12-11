import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Card } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Icon } from '../Icon';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface EquipProgramLandingDesktopProps {
  onStartProgram?: (programId: string) => void;
  onNewsletterSubmit?: (data: { email: string; firstName: string; newsletters: boolean; tips: boolean }) => void;
  className?: string;
}

export function EquipProgramLandingDesktop({ 
  onStartProgram, 
  onNewsletterSubmit,
  className 
}: EquipProgramLandingDesktopProps) {
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
      answer: 'Burnout prevention involves building resilience and developing coping strategies to manage stress before it becomes overwhelming. Our program focuses on practical techniques and lifestyle changes that help maintain mental wellness.'
    },
    {
      id: 'program-duration',
      question: 'How long is the Equip Program?',
      answer: 'The program typically runs for 6-8 weeks, with daily activities and weekly check-ins. You can progress at your own pace and revisit modules as needed.'
    },
    {
      id: 'who-can-join',
      question: 'Who can join the program?',
      answer: 'Adults aiming to prevent burnout and build resilience are welcome. If you\'re currently managing other mental health conditions, we recommend consulting with your healthcare provider first.'
    },
    {
      id: 'what-included',
      question: 'What\'s included in the program?',
      answer: 'The program includes interactive modules, daily exercises, stress management techniques, mindfulness practices, personalized recommendations, and access to our support community.'
    },
    {
      id: 'support-available',
      question: 'What support is available?',
      answer: 'You\'ll have access to our expert team, peer support groups, and 24/7 crisis resources. We also provide regular check-ins and personalized guidance throughout your journey.'
    }
  ];

  return (
    <div 
      className={`w-full min-h-screen ${className || ''}`}
      style={{ backgroundColor: 'var(--color-accent-default)' }}
    >
      {/* Hero Section */}
      <section 
        className="relative w-full"
        style={{
          height: '900px',
          background: `linear-gradient(135deg, var(--color-primary-default) 0%, #404040 100%)`,
          borderRadius: '0 0 80px 80px'
        }}
      >
        <div 
          className="flex items-center justify-center h-full"
          style={{ padding: '0 100px' }}
        >
          <div 
            className="max-w-2xl"
            style={{ color: 'var(--color-text-inverse)' }}
          >
            <h1 
              style={{
                fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--font-weight-semibold)',
                lineHeight: 'var(--line-height-sm)',
                marginBottom: 'var(--ikan-component-spacing-default)',
                color: 'var(--color-text-inverse)'
              }}
            >
              Build Resilience Against Burnout
            </h1>
            <p 
              style={{
                fontSize: 'var(--text-base)',
                lineHeight: 'var(--line-height-md)',
                marginBottom: 'var(--ikan-component-spacing-large)',
                color: 'var(--color-text-inverse)',
                opacity: 0.9
              }}
            >
              Ready to develop resilience against burnout? Adults aiming for preventing burnout, join us! If you're managing other mental health stuff, just check with your doc first.
            </p>
            <Button
              onClick={() => onStartProgram && onStartProgram('burnout-prevention-program')}
              className="ikan-button"
              style={{
                backgroundColor: 'var(--color-text-inverse)',
                color: 'var(--color-primary-default)',
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                padding: `0 var(--ikan-component-spacing-large)`,
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              Start Program
            </Button>
          </div>
        </div>
      </section>

      {/* Video Interview Section */}
      <section 
        style={{
          padding: '100px',
          backgroundColor: 'var(--color-bg-card)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <Card 
            className="relative overflow-hidden"
            style={{
              borderRadius: 'var(--radius-lg)',
              height: '400px',
              background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), 
                          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect width="800" height="400" fill="%23e5e5e5"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="24">Burnout Prevention Interview</text></svg>')`
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
                    width: '60px',
                    height: '60px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: 'var(--radius-pill)',
                    color: 'var(--color-primary-default)'
                  }}
                >
                  <Icon name="play" size={24} />
                </div>
                <div className="text-left">
                  <div 
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-inverse)'
                    }}
                  >
                    Watch Full Interview
                  </div>
                  <div 
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-inverse)',
                      opacity: 0.8
                    }}
                  >
                    Learn about burnout prevention
                  </div>
                </div>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section 
        style={{
          padding: '100px',
          backgroundColor: 'var(--color-bg-page)'
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--ikan-component-spacing-large)'
            }}
          >
            Discover Our Programs
          </h2>
          <Button
            onClick={() => onStartProgram && onStartProgram('explore-programs')}
            className="ikan-button"
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
        </div>
      </section>

      {/* Program Cards Section */}
      <section 
        style={{
          padding: '100px',
          backgroundColor: 'var(--color-bg-muted)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--ikan-component-spacing-large)',
              textAlign: 'center'
            }}
          >
            Our Evidence-Based Programs
          </h2>
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            style={{ gap: 'var(--spacing-8)' }}
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
                description: 'Comprehensive strategies to prevent burnout and maintain sustainable work-life balance.',
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
                className="p-8 h-full hover:shadow-lg transition-all duration-300 cursor-pointer group"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--spacing-8)',
                  border: '1px solid var(--color-border-light)'
                }}
                onClick={() => onStartProgram && onStartProgram(`program-${index + 1}`)}
              >
                <div 
                  className="flex items-center justify-between mb-4"
                >
                  <span 
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-primary-default)',
                      backgroundColor: 'var(--color-accent-default)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-sm)',
                      textTransform: 'uppercase',
                      letterSpacing: 'var(--letter-spacing-wide)'
                    }}
                  >
                    {program.level}
                  </span>
                  <div 
                    className="flex items-center gap-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Icon name="clock" size={16} />
                    <span style={{ fontSize: 'var(--text-sm)' }}>
                      {program.duration}
                    </span>
                  </div>
                </div>
                
                <h3 
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--ikan-component-spacing-default)'
                  }}
                >
                  {program.title}
                </h3>
                
                <p 
                  style={{
                    fontSize: 'var(--text-sm)',
                    lineHeight: 'var(--line-height-md)',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--ikan-component-spacing-large)'
                  }}
                >
                  {program.description}
                </p>
                
                <div 
                  className="flex items-center justify-between mb-6"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <div className="flex items-center gap-2">
                    <Icon name="book-open" size={16} />
                    <span style={{ fontSize: 'var(--text-sm)' }}>
                      {program.modules} modules
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="users" size={16} />
                    <span style={{ fontSize: 'var(--text-sm)' }}>
                      Community support
                    </span>
                  </div>
                </div>
                
                <Button
                  className="w-full ikan-button group-hover:shadow-md transition-all"
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
        </div>
      </section>

      {/* FAQ Section */}
      <section 
        style={{
          padding: '100px',
          backgroundColor: 'var(--color-bg-card)'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 
            style={{
              fontSize: 'var(--text-3xl)',
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
                    className="w-full justify-between text-left p-6 h-auto hover:bg-muted/50"
                    style={{
                      backgroundColor: 'var(--color-bg-muted)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      border: '1px solid var(--color-border-light)'
                    }}
                  >
                    <span 
                      style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {faq.question}
                    </span>
                    {openFAQ === faq.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent 
                  className="px-6 pb-6"
                  style={{
                    backgroundColor: 'var(--color-bg-page)',
                    borderRadius: 'var(--ikan-component-border-radius)',
                    marginTop: 'var(--ikan-component-spacing-small)'
                  }}
                >
                  <p 
                    style={{
                      fontSize: 'var(--text-base)',
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
        </div>
      </section>

      {/* Newsletter Section */}
      <section 
        style={{
          padding: '100px',
          backgroundColor: 'var(--color-bg-page)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 
                style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--ikan-component-spacing-default)'
                }}
              >
                Newsletter Subscription
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="ikan-input"
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
                      className="ikan-input"
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
                      id="newsletter-desktop"
                      checked={newsletterConsent}
                      onCheckedChange={setNewsletterConsent}
                    />
                    <label 
                      htmlFor="newsletter-desktop"
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
                      id="tips-desktop"
                      checked={tipsConsent}
                      onCheckedChange={setTipsConsent}
                    />
                    <label 
                      htmlFor="tips-desktop"
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
                  className="w-full ikan-button"
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
                  marginTop: 'var(--ikan-component-spacing-default)'
                }}
              >
                Privacy: iKan stores and processes your personal data based on our privacy policy. 
                You can unsubscribe at any time.
              </p>
            </div>
            
            <div 
              className="hidden lg:block"
              style={{
                height: '400px',
                backgroundColor: 'var(--color-bg-muted)',
                borderRadius: 'var(--radius-lg)',
                backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="18">Wellness Programs</text></svg>')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}