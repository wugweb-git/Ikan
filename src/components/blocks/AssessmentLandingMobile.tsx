import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Card } from '../ui/card';
import { Icon } from '../Icon';

interface AssessmentLandingMobileProps {
  onStartAssessment?: () => void;
  onNewsletterSubmit?: (data: { email: string; firstName: string; newsletters: boolean; tips: boolean }) => void;
  className?: string;
}

export function AssessmentLandingMobile({ 
  onStartAssessment, 
  onNewsletterSubmit,
  className 
}: AssessmentLandingMobileProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [tipsConsent, setTipsConsent] = useState(false);

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

  return (
    <div 
      className={`w-full min-h-screen mobile-optimized ${className || ''}`}
      style={{ backgroundColor: 'var(--color-bg-page)' }}
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
              Anxiety and Depression Test (K10)
            </h1>
            <p 
              style={{
                fontSize: 'var(--text-sm)',
                lineHeight: 'var(--line-height-md)',
                color: 'var(--color-text-inverse)',
                opacity: 0.9
              }}
            >
              We're glad you're taking the time to check-in on your mental health. Whatever you're going through, you're not alone – support is available. Completing the K10 test will help you understand what kind of support you might need right now.
            </p>
          </div>
          
          <Button
            onClick={onStartAssessment}
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
            Take Assessment
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
                        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="%23e5e5e5"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="16">Mental Health Interview</text></svg>')`
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

      {/* About Section */}
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
            marginBottom: 'var(--ikan-component-spacing-default)'
          }}
        >
          About
        </h2>
        <p 
          style={{
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--line-height-md)',
            color: 'var(--color-text-muted)'
          }}
        >
          Professor Ronald C Kessler of the Department of Health Care Policy, Harvard Medical School is thanked for the use of research on the K10 funded by US Public Health Service Grants. There may be a wait before a counsellor is available.
        </p>
      </section>

      {/* Features Section */}
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
          What's Included
        </h2>
        <div 
          className="space-y-4"
          style={{ gap: 'var(--ikan-component-spacing-default)' }}
        >
          {[
            {
              icon: 'heart',
              title: 'Mental Health Screening',
              description: 'Comprehensive assessment of your current mental wellness'
            },
            {
              icon: 'brain',
              title: 'Personalized Insights',
              description: 'Tailored recommendations based on your responses'
            },
            {
              icon: 'shield',
              title: 'Privacy Protected',
              description: 'Your responses are confidential and secure'
            },
            {
              icon: 'clock',
              title: '5 Minute Assessment',
              description: 'Quick and easy to complete at your own pace'
            }
          ].map((feature, index) => (
            <Card 
              key={index}
              className="mobile-card"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--ikan-component-spacing-default)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div 
                className="flex items-start gap-3"
              >
                <div 
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'var(--color-accent-default)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-accent-on)'
                  }}
                >
                  <Icon name={feature.icon as any} size={20} />
                </div>
                <div className="flex-1">
                  <h3 
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--ikan-component-spacing-small)'
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    style={{
                      fontSize: 'var(--text-sm)',
                      lineHeight: 'var(--line-height-md)',
                      color: 'var(--color-text-muted)',
                      margin: 0
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Assessment Cards Section */}
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
          Choose Your Assessment
        </h2>
        <div 
          className="space-y-4"
          style={{ gap: 'var(--ikan-component-spacing-default)' }}
        >
          {[
            {
              title: 'K10 Mental Health Assessment',
              subtitle: 'Anxiety & Depression Screening',
              description: 'A quick 10-question assessment to evaluate your current mental health status.',
              duration: '5 min',
              type: 'Free Assessment'
            },
            {
              title: 'Comprehensive Wellness Check',
              subtitle: 'Full Mental Health Evaluation',
              description: 'In-depth assessment covering multiple aspects of mental wellness.',
              duration: '15 min',
              type: 'Premium Assessment'
            }
          ].map((assessment, index) => (
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
              onClick={onStartAssessment}
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
                  {assessment.type}
                </span>
                <div 
                  className="flex items-center gap-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Icon name="clock" size={14} />
                  <span style={{ fontSize: 'var(--text-xs)' }}>
                    {assessment.duration}
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
                {assessment.title}
              </h3>
              
              <p 
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-primary-default)',
                  marginBottom: 'var(--ikan-component-spacing-small)'
                }}
              >
                {assessment.subtitle}
              </p>
              
              <p 
                style={{
                  fontSize: 'var(--text-sm)',
                  lineHeight: 'var(--line-height-md)',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--ikan-component-spacing-default)'
                }}
              >
                {assessment.description}
              </p>
              
              <Button
                className="w-full mobile-button"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'var(--color-primary-on)'
                }}
              >
                Take Assessment
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
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
                id="newsletter-mobile"
                checked={newsletterConsent}
                onCheckedChange={setNewsletterConsent}
              />
              <label 
                htmlFor="newsletter-mobile"
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
                id="tips-mobile"
                checked={tipsConsent}
                onCheckedChange={setTipsConsent}
              />
              <label 
                htmlFor="tips-mobile"
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