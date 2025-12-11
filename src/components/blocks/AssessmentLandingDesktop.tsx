import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Card } from '../ui/card';
import { Icon } from '../Icon';
import { useIsMobile } from '../../hooks/useIsMobile';

interface AssessmentLandingDesktopProps {
  onStartAssessment?: () => void;
  onNewsletterSubmit?: (data: { email: string; firstName: string; newsletters: boolean; tips: boolean }) => void;
  className?: string;
}

export function AssessmentLandingDesktop({ 
  onStartAssessment, 
  onNewsletterSubmit,
  className 
}: AssessmentLandingDesktopProps) {
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
      className={`w-full min-h-screen ${className || ''}`}
      style={{ backgroundColor: 'var(--color-bg-page)' }}
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
              Anxiety and Depression Test (K10)
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
              We're glad you're taking the time to check-in on your mental health. Whatever you're going through, you're not alone – support is available. Completing the K10 test will help you understand what kind of support you might need right now.
            </p>
            <Button
              onClick={onStartAssessment}
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
              Take Assessment
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
                          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect width="800" height="400" fill="%23e5e5e5"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="24">Mental Health Interview</text></svg>')`
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
                    Learn about mental health assessment
                  </div>
                </div>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section 
        style={{
          padding: '100px',
          backgroundColor: 'var(--color-bg-page)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--ikan-component-spacing-large)'
            }}
          >
            About
          </h2>
          <p 
            style={{
              fontSize: 'var(--text-base)',
              lineHeight: 'var(--line-height-md)',
              color: 'var(--color-text-muted)',
              maxWidth: '800px'
            }}
          >
            Professor Ronald C Kessler of the Department of Health Care Policy, Harvard Medical School is thanked for the use of research on the K10 funded by US Public Health Service Grants RO1 MH46376, R01 MH52861, RO1 MH49098, and K05 MH00507 and by the John D and Catherine T MacArthur Foundation Network on Successful Midlife Development (Gilbert Brim, Director). There may be a wait before a counsellor is available.
          </p>
        </div>
      </section>

      {/* Features Grid Section */}
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
            What's Included
          </h2>
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            style={{ gap: 'var(--ikan-component-spacing-large)' }}
          >
            {[
              {
                icon: 'heart',
                title: 'Mental Health Screening',
                description: 'Comprehensive assessment of your current mental wellness state'
              },
              {
                icon: 'brain',
                title: 'Personalized Insights',
                description: 'Get tailored recommendations based on your responses'
              },
              {
                icon: 'users',
                title: 'Professional Support',
                description: 'Connect with qualified mental health professionals'
              },
              {
                icon: 'shield',
                title: 'Privacy Protected',
                description: 'Your responses are confidential and securely stored'
              },
              {
                icon: 'clock',
                title: '5 Minute Assessment',
                description: 'Quick and easy to complete at your own pace'
              },
              {
                icon: 'check-circle',
                title: 'Evidence-Based',
                description: 'Built on validated clinical assessment tools'
              }
            ].map((feature, index) => (
              <Card 
                key={index}
                className="p-6 h-full"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--ikan-component-spacing-large)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div 
                  className="flex items-center gap-3"
                  style={{ marginBottom: 'var(--ikan-component-spacing-default)' }}
                >
                  <div 
                    className="flex items-center justify-center"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: 'var(--color-accent-default)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-accent-on)'
                    }}
                  >
                    <Icon name={feature.icon as any} size={24} />
                  </div>
                  <h3 
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      margin: 0
                    }}
                  >
                    {feature.title}
                  </h3>
                </div>
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
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Cards Section */}
      <section 
        style={{
          padding: '100px',
          backgroundColor: 'var(--color-bg-page)'
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
            Choose Your Assessment
          </h2>
          <div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            style={{ gap: 'var(--spacing-8)' }}
          >
            {[
              {
                title: 'K10 Mental Health Assessment',
                subtitle: 'Anxiety & Depression Screening',
                description: 'A quick 10-question assessment to evaluate your current mental health status and identify areas where you might need support.',
                duration: '5 min',
                type: 'Free Assessment'
              },
              {
                title: 'Comprehensive Wellness Check',
                subtitle: 'Full Mental Health Evaluation',
                description: 'An in-depth assessment covering multiple aspects of mental wellness including stress, anxiety, depression, and overall life satisfaction.',
                duration: '15 min',
                type: 'Premium Assessment'
              }
            ].map((assessment, index) => (
              <Card 
                key={index}
                className="p-8 h-full hover:shadow-md transition-shadow"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--spacing-8)',
                  border: '1px solid var(--color-border-light)',
                  cursor: 'pointer'
                }}
                onClick={onStartAssessment}
              >
                <div 
                  className="flex items-center justify-between"
                  style={{ marginBottom: 'var(--ikan-component-spacing-default)' }}
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
                    {assessment.type}
                  </span>
                  <div 
                    className="flex items-center gap-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Icon name="clock" size={16} />
                    <span style={{ fontSize: 'var(--text-sm)' }}>
                      {assessment.duration}
                    </span>
                  </div>
                </div>
                
                <h3 
                  style={{
                    fontSize: 'var(--text-xl)',
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
                    marginBottom: 'var(--ikan-component-spacing-default)'
                  }}
                >
                  {assessment.subtitle}
                </p>
                
                <p 
                  style={{
                    fontSize: 'var(--text-sm)',
                    lineHeight: 'var(--line-height-md)',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--ikan-component-spacing-large)'
                  }}
                >
                  {assessment.description}
                </p>
                
                <Button
                  className="w-full ikan-button"
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
        </div>
      </section>

      {/* Newsletter Section */}
      <section 
        style={{
          padding: '100px',
          backgroundColor: 'var(--color-bg-card)'
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
                      id="newsletter"
                      checked={newsletterConsent}
                      onCheckedChange={setNewsletterConsent}
                    />
                    <label 
                      htmlFor="newsletter"
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
                      id="tips"
                      checked={tipsConsent}
                      onCheckedChange={setTipsConsent}
                    />
                    <label 
                      htmlFor="tips"
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
                backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="18">Newsletter Illustration</text></svg>')`,
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