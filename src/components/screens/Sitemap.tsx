import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';

interface SitemapProps {
  className?: string;
  onBack?: () => void;
}

interface SiteSection {
  title: string;
  icon: string;
  description: string;
  links: Array<{
    name: string;
    path: string;
    description: string;
    badge?: string;
  }>;
}

export function Sitemap({ className, onBack }: SitemapProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');

  const siteSections: SiteSection[] = [
    {
      title: 'Getting Started',
      icon: 'rocket',
      description: 'Begin your mental health journey with iKan',
      links: [
        { name: 'Home', path: '/', description: 'Landing page and platform overview' },
        { name: 'About Us', path: '/about', description: 'Learn about iKan\'s mission and approach' },
        { name: 'Sign In', path: '/login', description: 'Access your account and dashboard' },
        { name: 'Contact Us', path: '/contact', description: 'Get in touch with our support team' }
      ]
    },
    {
      title: 'Mental Health Tools',
      icon: 'brain',
      description: 'Evidence-based tools for your wellness journey',
      links: [
        { name: 'Assessments', path: '/assessments', description: 'Clinically validated mental health screenings', badge: 'Popular' },
        { name: 'Equip Programs', path: '/equip-programs', description: 'Structured therapeutic interventions', badge: 'Featured' },
        { name: 'Resource Library', path: '/library', description: 'Curated educational content and tools' },
        { name: 'Consultation Services', path: '/consultation', description: 'Connect with licensed professionals' }
      ]
    },
    {
      title: 'User Dashboard',
      icon: 'layout-dashboard',
      description: 'Personal tools and account management',
      links: [
        { name: 'Dashboard', path: '/dashboard', description: 'Overview of your progress and recommendations', badge: 'Premium' },
        { name: 'Mood Journal', path: '/mood-journal', description: 'Track your daily mood and thoughts' },
        { name: 'Account Settings', path: '/account', description: 'Manage your profile and preferences' },
        { name: 'Payment History', path: '/payment-history', description: 'View billing and subscription details' }
      ]
    },
    {
      title: 'Assessment Flows',
      icon: 'clipboard-list',
      description: 'Complete mental health evaluation pathways',
      links: [
        { name: 'Assessment Landing', path: '/assessment-landing', description: 'Learn about our assessment process' },
        { name: 'Assessment Flow', path: '/assessment-flow', description: 'Interactive assessment experience' },
        { name: 'Assessment Results', path: '/assessment-results', description: 'View and interpret your results' }
      ]
    },
    {
      title: 'Program Journeys',
      icon: 'map',
      description: 'Structured mental health program experiences',
      links: [
        { name: 'Programs Landing', path: '/equip-programs-landing', description: 'Explore available programs' },
        { name: 'Program Onboarding', path: '/equip-program-onboarding', description: 'Get started with your chosen program' },
        { name: 'Program Flow', path: '/equip-program-flow', description: 'Complete program modules and exercises' },
        { name: 'Program Completion', path: '/equip-program-completion', description: 'Celebrate your achievements' }
      ]
    },
    {
      title: 'Help & Support',
      icon: 'help-circle',
      description: 'Find answers and get assistance',
      links: [
        { name: 'FAQ', path: '/faq', description: 'Frequently asked questions and answers' },
        { name: 'Contact Support', path: '/contact', description: 'Reach our dedicated support team' },
        { name: 'Crisis Resources', path: '/crisis-support', description: 'Immediate help and emergency contacts', badge: 'Important' }
      ]
    },
    {
      title: 'Legal & Policies',
      icon: 'file-text',
      description: 'Important legal information and policies',
      links: [
        { name: 'Privacy Policy', path: '/privacy', description: 'How we protect and use your data' },
        { name: 'Terms of Service', path: '/terms', description: 'Legal terms governing platform use' },
        { name: 'Return Policy', path: '/return-policy', description: 'Refund and return information' },
        { name: 'Cancellation Policy', path: '/cancellation-policy', description: 'How to cancel subscriptions and accounts' }
      ]
    },
    {
      title: 'Mental Health Topics',
      icon: 'heart',
      description: 'Resources organized by mental health categories',
      links: [
        { name: 'Anxiety Management', path: '/library?topic=anxiety', description: 'Tools and strategies for anxiety relief' },
        { name: 'Depression Support', path: '/library?topic=depression', description: 'Resources for understanding and managing depression' },
        { name: 'Stress Relief', path: '/library?topic=stress', description: 'Techniques for stress reduction and management' },
        { name: 'Sleep Improvement', path: '/library?topic=sleep', description: 'Better sleep habits and solutions' },
        { name: 'Mindfulness & Meditation', path: '/library?topic=mindfulness', description: 'Mindfulness practices and guided meditations' },
        { name: 'Relationship Wellness', path: '/library?topic=relationships', description: 'Building healthy relationships and communication' }
      ]
    }
  ];

  const allLinks = siteSections.flatMap(section => 
    section.links.map(link => ({
      ...link,
      sectionTitle: section.title,
      sectionIcon: section.icon
    }))
  );

  const filteredSections = siteSections.map(section => ({
    ...section,
    links: section.links.filter(link => 
      searchQuery === '' ||
      link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.links.length > 0);

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Popular': return 'var(--color-status-success)';
      case 'Featured': return 'var(--color-status-info)';
      case 'Premium': return 'var(--color-status-warning)';
      case 'Important': return 'var(--color-status-danger)';
      default: return 'var(--color-primary-default)';
    }
  };

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
          padding: isMobile ? 'var(--spacing-8) var(--spacing-4)' : 'var(--spacing-12) var(--spacing-6)'
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
                marginBottom: 'var(--spacing-6)'
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
                  padding: 'var(--spacing-4)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Icon name="map" size={32} style={{ color: 'var(--color-text-inverse)' }} />
              </div>
            </div>
            
            <h1 
              style={{
                fontSize: isMobile ? 'var(--text-3xl)' : 'var(--text-4xl)',
                fontWeight: 'var(--font-weight-medium)',
                lineHeight: 'var(--line-height-sm)',
                margin: '0',
                marginBottom: 'var(--spacing-4)'
              }}
            >
              Site Navigation
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
              Explore all pages and resources available on the iKan mental health platform. Find exactly what you're looking for.
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile ? 'var(--spacing-6) var(--spacing-4)' : 'var(--spacing-8) var(--spacing-6)',
          marginTop: '-var(--spacing-6)',
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
          <CardContent style={{ padding: 'var(--spacing-6)' }}>
            <div className="space-y-4">
              <div className="text-center">
                <h3 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    margin: '0 0 var(--spacing-2) 0'
                  }}
                >
                  Find What You Need
                </h3>
                <p 
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--color-text-muted)',
                    margin: '0'
                  }}
                >
                  Search through all {allLinks.length} pages and resources
                </p>
              </div>

              <div className="relative">
                <Icon 
                  name="search" 
                  size={20} 
                  style={{
                    position: 'absolute',
                    left: 'var(--spacing-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    pointerEvents: 'none'
                  }}
                />
                <Input
                  placeholder="Search pages, tools, or topics..."
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

              {searchQuery && (
                <p 
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--color-text-muted)',
                    margin: '0',
                    textAlign: 'center'
                  }}
                >
                  Showing results for "{searchQuery}"
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sitemap Content */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--constraint-content-max)',
          padding: isMobile ? '0 var(--spacing-4) var(--spacing-8)' : '0 var(--spacing-6) var(--spacing-12)'
        }}
      >
        {filteredSections.length > 0 ? (
          <div className="space-y-8">
            {filteredSections.map((section, sectionIndex) => (
              <Card
                key={sectionIndex}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-light)',
                  overflow: 'hidden'
                }}
              >
                <CardContent style={{ padding: '0' }}>
                  {/* Section Header */}
                  <div 
                    style={{
                      backgroundColor: 'var(--color-bg-muted)',
                      padding: 'var(--spacing-6)',
                      borderBottom: '1px solid var(--color-border-light)'
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        style={{
                          backgroundColor: 'var(--color-primary-default)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--spacing-3)',
                          color: 'var(--color-text-inverse)'
                        }}
                      >
                        <Icon name={section.icon as any} size={24} />
                      </div>
                      
                      <div className="flex-1">
                        <h2 
                          style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--color-text-primary)',
                            margin: '0 0 var(--spacing-1) 0'
                          }}
                        >
                          {section.title}
                        </h2>
                        <p 
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-regular)',
                            color: 'var(--color-text-muted)',
                            margin: '0',
                            lineHeight: 'var(--line-height-md)'
                          }}
                        >
                          {section.description}
                        </p>
                      </div>
                      
                      <div
                        style={{
                          backgroundColor: 'var(--color-accent-default)',
                          color: 'var(--color-primary-default)',
                          padding: 'var(--spacing-1) var(--spacing-3)',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-weight-medium)'
                        }}
                      >
                        {section.links.length} {section.links.length === 1 ? 'page' : 'pages'}
                      </div>
                    </div>
                  </div>

                  {/* Section Links */}
                  <div style={{ padding: 'var(--spacing-6)' }}>
                    <div 
                      className="grid gap-4"
                      style={{
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))'
                      }}
                    >
                      {section.links.map((link, linkIndex) => (
                        <a
                          key={linkIndex}
                          href={link.path}
                          className="block p-4 rounded-lg border hover:shadow-sm hover:border-gray-300 transition-all duration-200 group"
                          style={{
                            backgroundColor: 'var(--color-bg-page)',
                            border: '1px solid var(--color-border-light)',
                            textDecoration: 'none',
                            borderRadius: 'var(--radius-md)'
                          }}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h3 
                                  className="group-hover:text-blue-600 transition-colors"
                                  style={{
                                    fontSize: 'var(--text-base)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    color: 'var(--color-text-primary)',
                                    margin: '0 0 var(--spacing-1) 0',
                                    lineHeight: 'var(--line-height-sm)'
                                  }}
                                >
                                  {link.name}
                                </h3>
                                
                                <p 
                                  style={{
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--font-weight-regular)',
                                    color: 'var(--color-text-muted)',
                                    margin: '0',
                                    lineHeight: 'var(--line-height-md)'
                                  }}
                                >
                                  {link.description}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {link.badge && (
                                  <span
                                    style={{
                                      backgroundColor: getBadgeColor(link.badge),
                                      color: 'var(--color-text-inverse)',
                                      padding: '2px 8px',
                                      borderRadius: 'var(--radius-sm)',
                                      fontSize: 'var(--text-xs)',
                                      fontWeight: 'var(--font-weight-medium)',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.05em'
                                    }}
                                  >
                                    {link.badge}
                                  </span>
                                )}
                                
                                <Icon 
                                  name="external-link" 
                                  size={16} 
                                  className="group-hover:translate-x-1 transition-transform"
                                  style={{ color: 'var(--color-text-muted)' }}
                                />
                              </div>
                            </div>
                            
                            <div 
                              style={{
                                fontSize: 'var(--text-xs)',
                                fontWeight: 'var(--font-weight-regular)',
                                color: 'var(--color-text-muted)',
                                fontFamily: 'var(--font-family-mono)',
                                backgroundColor: 'var(--color-bg-muted)',
                                padding: '2px 6px',
                                borderRadius: 'var(--radius-sm)',
                                display: 'inline-block'
                              }}
                            >
                              {link.path}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-light)',
              textAlign: 'center'
            }}
          >
            <CardContent style={{ padding: 'var(--spacing-8)' }}>
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
                  No pages found
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
                  Try adjusting your search terms or browse all categories above.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-6 py-3 rounded-lg border hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-default)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    cursor: 'pointer'
                  }}
                >
                  Clear Search
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        <Card 
          className="mt-12"
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            marginTop: 'var(--spacing-12)',
            textAlign: 'center'
          }}
        >
          <CardContent style={{ padding: 'var(--spacing-8)' }}>
            <div className="space-y-4">
              <h3 
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  margin: '0'
                }}
              >
                Mobile App Available
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
                Access all these features and more through our progressive web app (PWA). Install iKan on your mobile device for a seamless experience across all platforms.
              </p>
              
              <div className="flex justify-center items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Icon name="smartphone" size={20} style={{ color: 'var(--color-primary-default)' }} />
                  <span 
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    iOS & Android Compatible
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Icon name="wifi-off" size={20} style={{ color: 'var(--color-primary-default)' }} />
                  <span 
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    Works Offline
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}