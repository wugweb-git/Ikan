import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../ui/utils';

// Import desktop and mobile Figma components
import Component05EquipsLp from '../../imports/05EquipsLp-204-5204';
import Component05EquipsLpMobile from '../../imports/05EquipsLpMobile';

interface EquipProgramLandingNewProps {
  onStartProgram?: (programId: string) => void;
  onBack?: () => void;
  onSignIn?: () => void;
}

export function EquipProgramLandingNew({ 
  onStartProgram,
  onBack,
  onSignIn
}: EquipProgramLandingNewProps) {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [tipsConsent, setTipsConsent] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  // FAQ data - converting from likely German content to English
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

  const handleStartProgram = () => {
    if (onSignIn) {
      onSignIn();
    } else if (onStartProgram) {
      onStartProgram('burnout-prevention-program');
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    }
  };

  // Handle newsletter form submission
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && firstName) {
      console.log('Newsletter signup:', { email, firstName, newsletterConsent, tipsConsent });
      alert('Thank you for subscribing to our newsletter!');
      setEmail('');
      setFirstName('');
      setNewsletterConsent(false);
      setTipsConsent(false);
    }
  };

  // Add interactive functionality to existing Figma components
  useEffect(() => {
    const addInteractivity = () => {
      // Primary Program Buttons - Updated to English
      const programButtons = document.querySelectorAll('[data-name="Buttons"]');
      programButtons.forEach(button => {
        const textElement = button.querySelector('p');
        if (textElement && textElement.textContent?.includes('Take Assesment')) {
          // Update to proper English for Equip Programs
          textElement.textContent = 'Start Program';
          
          button.addEventListener('click', (e) => {
            e.preventDefault();
            handleStartProgram();
          });
          
          // Add hover effects
          (button as HTMLElement).style.cursor = 'pointer';
          (button as HTMLElement).style.transition = 'all 0.2s ease';
          
          button.addEventListener('mouseenter', () => {
            (button as HTMLElement).style.transform = 'translateY(-1px)';
            (button as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          });
          
          button.addEventListener('mouseleave', () => {
            (button as HTMLElement).style.transform = 'translateY(0)';
            (button as HTMLElement).style.boxShadow = 'none';
          });
        }
      });

      // "Know More" buttons on program cards
      const knowMoreButtons = document.querySelectorAll('[data-name="Container"]');
      knowMoreButtons.forEach(container => {
        const textElements = container.querySelectorAll('p');
        textElements.forEach(textElement => {
          if (textElement.textContent?.includes('KNOW MORE')) {
            textElement.textContent = 'LEARN MORE';
            
            const buttonElement = textElement.closest('[data-name="Container"]');
            if (buttonElement) {
              buttonElement.addEventListener('click', (e) => {
                e.preventDefault();
                handleStartProgram();
              });
              
              (buttonElement as HTMLElement).style.cursor = 'pointer';
              (buttonElement as HTMLElement).style.transition = 'all 0.2s ease';
              
              buttonElement.addEventListener('mouseenter', () => {
                (buttonElement as HTMLElement).style.transform = 'translateY(-2px)';
                (buttonElement as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
              });
              
              buttonElement.addEventListener('mouseleave', () => {
                (buttonElement as HTMLElement).style.transform = 'translateY(0)';
                (buttonElement as HTMLElement).style.boxShadow = 'none';
              });
            }
          }
        });
      });

      // Newsletter Form - Make functional
      const emailInputs = document.querySelectorAll('[data-name="Input"]');
      emailInputs.forEach((input, index) => {
        const container = input.querySelector('[data-name="Container"]');
        const label = container?.querySelector('p');
        
        if (label) {
          // Create functional input element
          const inputElement = document.createElement('input');
          inputElement.className = 'ikan-input';
          inputElement.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            outline: none;
            background: transparent;
            font-family: Ubuntu, sans-serif;
            font-size: 14px;
            color: #0a0a0f;
            padding: 0;
          `;
          
          if (label.textContent?.includes('Vorname') || label.textContent?.includes('First name')) {
            // First name input
            label.textContent = 'First Name';
            inputElement.type = 'text';
            inputElement.placeholder = 'Enter your first name';
            inputElement.value = firstName;
            inputElement.addEventListener('input', (e) => {
              setFirstName((e.target as HTMLInputElement).value);
            });
          } else if (label.textContent?.includes('Email')) {
            // Email input
            label.textContent = 'Email Address';
            inputElement.type = 'email';
            inputElement.placeholder = 'Enter your email address';
            inputElement.value = email;
            inputElement.addEventListener('input', (e) => {
              setEmail((e.target as HTMLInputElement).value);
            });
          }
          
          // Replace static content with interactive input
          container.innerHTML = '';
          container.appendChild(inputElement);
        }
      });

      // Newsletter checkboxes - Make functional
      const checkboxItems = document.querySelectorAll('[data-name="Item"]');
      checkboxItems.forEach((item, index) => {
        const textElement = item.querySelector('span');
        if (textElement) {
          // Update German text to English
          if (textElement.textContent?.includes('Neuigkeiten')) {
            textElement.textContent = 'News & Offers';
          } else if (textElement.textContent?.includes('Tipps')) {
            textElement.textContent = 'Practical Tips and Exercises';
          }
          
          // Make checkbox interactive
          const checkbox = item.querySelector('[data-name*="checkbox"]');
          if (checkbox) {
            checkbox.addEventListener('click', (e) => {
              e.preventDefault();
              if (index === 0) {
                setNewsletterConsent(!newsletterConsent);
                (checkbox as HTMLElement).style.backgroundColor = !newsletterConsent ? '#2e2a2f' : 'transparent';
              } else if (index === 1) {
                setTipsConsent(!tipsConsent);
                (checkbox as HTMLElement).style.backgroundColor = !tipsConsent ? '#2e2a2f' : 'transparent';
              }
            });
            
            (checkbox as HTMLElement).style.cursor = 'pointer';
          }
        }
      });

      // Newsletter submit button - Make functional
      const submitButtons = document.querySelectorAll('[data-name="Buttons"]');
      submitButtons.forEach(button => {
        const textElement = button.querySelector('p');
        if (textElement && textElement.textContent?.includes('Sign up now')) {
          textElement.textContent = 'Subscribe Now';
          
          button.addEventListener('click', handleNewsletterSubmit);
          (button as HTMLElement).style.cursor = 'pointer';
        }
      });

      // Update German headings to English
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
      headings.forEach(heading => {
        if (heading.textContent?.includes('This is the Heading for Equips')) {
          heading.textContent = 'Build Resilience Against Burnout';
        }
        if (heading.textContent?.includes('Anmeldung zum Newsletter')) {
          heading.textContent = 'Newsletter Subscription';
        }
        if (heading.textContent?.includes('Entdecke unsere Kurse')) {
          heading.textContent = 'Discover Our Programs';
        }
      });

      // Interview video play button - Make functional
      const playButtons = document.querySelectorAll('[data-name*="Component"]');
      playButtons.forEach(button => {
        const container = button.closest('[data-name="Container"]');
        if (container) {
          const textElement = container.querySelector('p');
          if (textElement && textElement.textContent?.includes('Interview anschauen')) {
            textElement.textContent = 'Watch Full Interview';
            
            button.addEventListener('click', (e) => {
              e.preventDefault();
              alert('Video player would open here');
            });
            
            (button as HTMLElement).style.cursor = 'pointer';
          }
        }
      });
    };

    const timer = setTimeout(addInteractivity, 500);
    addInteractivity();

    return () => clearTimeout(timer);
  }, [firstName, email, newsletterConsent, tipsConsent]);

  if (isMobile) {
    return (
      <div 
        className="relative min-h-screen w-full mobile-nav-space"
        style={{ backgroundColor: 'var(--color-accent-default)' }}
      >
        {/* Back button for mobile */}
        <div 
          className="absolute z-50"
          style={{
            top: 'var(--ikan-component-spacing-default)',
            left: 'var(--ikan-component-spacing-default)'
          }}
        >
          <Button
            onClick={handleBackClick}
            variant="ghost"
            size="icon"
            className="mobile-button touch-target backdrop-blur-sm"
            style={{
              width: 'var(--ikan-touch-target-min)',
              height: 'var(--ikan-touch-target-min)',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <ArrowLeft 
              className="w-5 h-5" 
              style={{ color: 'var(--color-text-primary)' }}
            />
          </Button>
        </div>

        {/* Mobile Figma layout */}
        <div className="w-full mobile-optimized">
          <Component05EquipsLpMobile />
        </div>

        {/* Interactive FAQ Section Overlay for Mobile */}
        <div 
          className="absolute pointer-events-auto z-10"
          style={{
            top: '2000px', // Adjust based on mobile layout
            left: 'var(--ikan-component-spacing-default)',
            right: 'var(--ikan-component-spacing-default)',
          }}
        >
          <div className="space-y-4">
            <h3 
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--ikan-component-spacing-default)'
              }}
            >
              Frequently Asked Questions
            </h3>
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
                      backgroundColor: 'var(--color-bg-card)',
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
                    backgroundColor: 'var(--color-bg-muted)',
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
        </div>

        {/* Overlay click handlers for mobile buttons */}
        <div className="absolute inset-0 pointer-events-none mobile-optimized">
          {/* Main hero button */}
          <div 
            className="absolute pointer-events-auto cursor-pointer z-10 mobile-button touch-target"
            style={{
              top: '720px',
              left: 'var(--ikan-component-spacing-default)',
              right: 'var(--ikan-component-spacing-default)',
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)'
            }}
            onClick={handleStartProgram}
          />
          
          {/* Program card buttons */}
          <div 
            className="absolute pointer-events-auto cursor-pointer z-10 mobile-button touch-target"
            style={{
              top: '4640px',
              left: 'calc(var(--ikan-component-spacing-default) * 2.75)',
              right: 'calc(var(--ikan-component-spacing-default) * 2.75)',
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)'
            }}
            onClick={handleStartProgram}
          />
          
          <div 
            className="absolute pointer-events-auto cursor-pointer z-10 mobile-button touch-target"
            style={{
              top: '5220px',
              left: 'calc(var(--ikan-component-spacing-default) * 2.75)',
              right: 'calc(var(--ikan-component-spacing-default) * 2.75)',
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)'
            }}
            onClick={handleStartProgram}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative min-h-screen w-full"
      style={{ backgroundColor: 'var(--color-accent-default)' }}
    >
      {/* Back button for desktop */}
      <div 
        className="absolute z-50"
        style={{
          top: 'var(--spacing-8)',
          left: 'var(--spacing-8)'
        }}
      >
        <Button
          onClick={handleBackClick}
          variant="ghost"
          size="icon"
          className="touch-target backdrop-blur-sm"
          style={{
            width: 'var(--ikan-component-button-height)',
            height: 'var(--ikan-component-button-height)',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <ArrowLeft 
            className="w-6 h-6" 
            style={{ color: 'var(--color-text-primary)' }}
          />
        </Button>
      </div>

      {/* Desktop Figma layout */}
      <div className="w-full">
        <Component05EquipsLp />
      </div>

      {/* Interactive FAQ Section Overlay for Desktop */}
      <div 
        className="absolute pointer-events-auto z-10"
        style={{
          top: '2800px', // Adjust based on desktop layout
          left: '100px',
          right: '100px',
        }}
      >
        <div 
          className="max-w-4xl mx-auto"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            padding: 'var(--ikan-component-spacing-large)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <h3 
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--ikan-component-spacing-large)',
              textAlign: 'center'
            }}
          >
            Frequently Asked Questions
          </h3>
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
                    className="w-full justify-between text-left p-6 h-auto"
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
      </div>

      {/* Overlay click handlers for desktop buttons */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Main hero button */}
        <div 
          className="absolute pointer-events-auto cursor-pointer z-10 touch-target"
          style={{
            top: '680px',
            left: '220px',
            width: '468px',
            height: 'var(--ikan-component-button-height)',
            borderRadius: 'var(--ikan-component-border-radius)'
          }}
          onClick={handleStartProgram}
        />

        {/* Features section button */}
        <div 
          className="absolute pointer-events-auto cursor-pointer z-10 touch-target"
          style={{
            top: '2240px',
            left: '140px',
            width: '200px',
            height: 'var(--ikan-component-button-height)',
            borderRadius: 'var(--ikan-component-border-radius)'
          }}
          onClick={handleStartProgram}
        />

        {/* Equip card "LEARN MORE" buttons */}
        <div 
          className="absolute pointer-events-auto cursor-pointer z-10 touch-target"
          style={{
            top: '4300px',
            left: '121px',
            width: '177px',
            height: 'var(--ikan-component-button-height)',
            borderRadius: 'var(--ikan-component-border-radius)'
          }}
          onClick={handleStartProgram}
        />
        
        <div 
          className="absolute pointer-events-auto cursor-pointer z-10 touch-target"
          style={{
            top: '4300px',
            left: '563px',
            width: '177px',
            height: 'var(--ikan-component-button-height)',
            borderRadius: 'var(--ikan-component-border-radius)'
          }}
          onClick={handleStartProgram}
        />
      </div>
    </div>
  );
}