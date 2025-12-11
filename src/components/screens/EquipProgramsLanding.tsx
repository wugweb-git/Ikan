import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { cn } from '../ui/utils';

import { 
  ArrowRight, 
  Shield, 
  Clock, 
  Users, 
  Heart, 
  CheckCircle, 
  Play,
  Star,
  Target,
  Brain,
  Lightbulb,
  Calendar,
  Award,
  BookOpen
} from 'lucide-react';

interface EquipProgramsLandingProps {
  onStartProgram?: (programId: string) => void;
  onBack?: () => void;
}

export function EquipProgramsLanding({ onStartProgram, onBack }: EquipProgramsLandingProps) {
  const isMobile = useIsMobile();
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  const handleStartProgram = (programId: string) => {
    setSelectedProgram(programId);
    onStartProgram?.(programId);
  };

  const programs = [
    {
      id: 'anxiety-relief',
      title: 'Anxiety Relief Program',
      duration: '8 weeks',
      sessions: 16,
      description: 'Evidence-based techniques to manage and reduce anxiety symptoms',
      modules: [
        'Understanding Anxiety Triggers',
        'Breathing & Relaxation Techniques',
        'Cognitive Behavioral Strategies',
        'Exposure Therapy Fundamentals',
        'Mindfulness & Present-Moment Awareness',
        'Sleep & Anxiety Management',
        'Social Anxiety Tools',
        'Relapse Prevention Planning'
      ]
    },
    {
      id: 'depression-recovery',
      title: 'Depression Recovery Journey',
      duration: '12 weeks',
      sessions: 24,
      description: 'Comprehensive approach to overcoming depression and building resilience',
      modules: [
        'Understanding Depression Patterns',
        'Behavioral Activation Techniques',
        'Thought Pattern Recognition',
        'Mood Tracking & Awareness',
        'Building Support Networks',
        'Lifestyle & Wellness Integration',
        'Goal Setting & Achievement',
        'Self-Compassion Practices',
        'Relationship Skills',
        'Crisis Management Tools',
        'Motivation & Energy Building',
        'Long-term Recovery Planning'
      ]
    },
    {
      id: 'stress-management',
      title: 'Stress Management Mastery',
      duration: '6 weeks',
      sessions: 12,
      description: 'Practical tools for managing daily stress and building resilience',
      modules: [
        'Stress Assessment & Awareness',
        'Time Management Strategies',
        'Relaxation Techniques',
        'Workplace Stress Solutions',
        'Healthy Boundary Setting',
        'Resilience Building Practices'
      ]
    },
    {
      id: 'mindfulness-foundation',
      title: 'Mindfulness Foundation',
      duration: '4 weeks',
      sessions: 8,
      description: 'Introduction to mindfulness practices for mental clarity and peace',
      modules: [
        'Mindfulness Basics',
        'Meditation Techniques',
        'Present-Moment Awareness',
        'Mindful Daily Living'
      ]
    }
  ];

  return (
    <div className="space-y-0 -mt-4 sm:-mt-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className={cn(
            "relative",
            "min-h-[450px] sm:min-h-[550px]",
            "flex items-center justify-center",
            "bg-gradient-to-br from-blue-50 to-purple-50"
          )}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1620148222862-b95cf7405a7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBwcm9ncmFtJTIwdGhlcmFweSUyMGdyb3VwfGVufDF8fHx8MTc1OTI5NzI4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Mental health program therapy group"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
            <div className="space-y-6">
              <h1 
                className="leading-tight"
                style={{
                  fontSize: isMobile ? 'var(--text-2xl)' : 'var(--text-4xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-inverse)',
                  lineHeight: 'var(--line-height-sm)'
                }}
              >
                Mental Health Equip Programs
              </h1>
              <p 
                className="max-w-3xl mx-auto leading-relaxed"
                style={{
                  fontSize: isMobile ? 'var(--text-base)' : 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-normal)',
                  color: 'var(--color-text-inverse)',
                  opacity: 0.9
                }}
              >
                Transform your mental wellbeing with our evidence-based programs. 
                Structured, guided journeys designed by mental health professionals to help you build lasting skills and resilience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button
                  onClick={() => document.getElementById('programs-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="gap-2 min-w-[200px] h-12"
                  style={{
                    backgroundColor: 'var(--color-primary-default)',
                    color: 'var(--color-primary-on)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  Explore Programs
                  <ArrowRight size={16} />
                </Button>
                <p 
                  className="text-sm opacity-80"
                  style={{ color: 'var(--color-text-inverse)' }}
                >
                  4-12 week programs • Expert-guided • Self-paced
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Benefits */}
      <section 
        className="py-8 sm:py-12"
        style={{ backgroundColor: 'var(--color-bg-page)' }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 
              style={{
                fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)'
              }}
            >
              Why Choose Our Equip Programs?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="text-center p-6">
              <CardContent className="space-y-3 p-0">
                <div 
                  className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-status-info-light)' }}
                >
                  <Brain 
                    size={24} 
                    style={{ color: 'var(--color-status-info)' }} 
                  />
                </div>
                <h3 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  Evidence-Based
                </h3>
                <p 
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  Programs built on proven therapeutic approaches and research
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="space-y-3 p-0">
                <div 
                  className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-status-success-light)' }}
                >
                  <Users 
                    size={24} 
                    style={{ color: 'var(--color-status-success)' }} 
                  />
                </div>
                <h3 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  Expert-Guided
                </h3>
                <p 
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  Designed by licensed mental health professionals
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="space-y-3 p-0">
                <div 
                  className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-accent-default)' }}
                >
                  <Clock 
                    size={24} 
                    style={{ color: 'var(--color-accent-on)' }} 
                  />
                </div>
                <h3 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  Self-Paced
                </h3>
                <p 
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  Progress at your own speed with flexible scheduling
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="space-y-3 p-0">
                <div 
                  className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-status-warning-light)' }}
                >
                  <Award 
                    size={24} 
                    style={{ color: 'var(--color-status-warning)' }} 
                  />
                </div>
                <h3 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  Proven Results
                </h3>
                <p 
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  95% of participants report improved wellbeing
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <h2 
                style={{
                  fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)'
                }}
              >
                How Our Programs Work
              </h2>
              <p 
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--line-height-md)'
                }}
              >
                Our structured programs combine proven therapeutic techniques with modern technology 
                to deliver personalized mental health support that fits your lifestyle.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                      Choose Your Program
                    </h4>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      Select from our range of evidence-based programs
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-green-600">2</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                      Complete Daily Sessions
                    </h4>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      Engage with interactive content and exercises
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-purple-600">3</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                      Track Your Progress
                    </h4>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      Monitor improvements and build lasting habits
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:order-first">
              <Card className="overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1642005799051-a43dfbe7dc2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWxmJTIwY2FyZSUyMHdlbGxuZXNzJTIwcm91dGluZXxlbnwxfHx8fDE3NTkyOTcyODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Self care wellness routine"
                  className="w-full h-64 sm:h-80 object-cover"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Available Programs */}
      <section 
        id="programs-section"
        className="py-8 sm:py-12"
        style={{ backgroundColor: 'var(--color-bg-muted)' }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 
              style={{
                fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)'
              }}
            >
              Available Programs
            </h2>
            <p 
              className="mt-4 max-w-2xl mx-auto"
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}
            >
              Structured, evidence-based programs to support your mental health journey
            </p>
          </div>

          <div className="space-y-6">
            {programs.map((program) => (
              <Card key={program.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Program Overview */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <h3 
                          style={{
                            fontSize: 'var(--text-lg)',
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          {program.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span 
                            className="flex items-center gap-1"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            <Clock size={14} />
                            {program.duration}
                          </span>
                          <span 
                            className="flex items-center gap-1"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            <BookOpen size={14} />
                            {program.sessions} sessions
                          </span>
                        </div>
                      </div>
                      
                      <p 
                        style={{
                          fontSize: 'var(--text-base)',
                          color: 'var(--color-text-primary)',
                          lineHeight: 'var(--line-height-md)'
                        }}
                      >
                        {program.description}
                      </p>

                      {/* Program Modules Accordion */}
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value={`modules-${program.id}`}>
                          <AccordionTrigger 
                            className="text-left hover:no-underline"
                            style={{
                              fontSize: 'var(--text-sm)',
                              fontWeight: 'var(--font-weight-medium)',
                              color: 'var(--color-text-primary)'
                            }}
                          >
                            Program Structure ({program.modules.length} modules)
                          </AccordionTrigger>
                          <AccordionContent className="pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {program.modules.map((module, index) => (
                                <div 
                                  key={index}
                                  className="flex items-start gap-2 p-2 rounded-md"
                                  style={{ backgroundColor: 'var(--color-bg-page)' }}
                                >
                                  <CheckCircle 
                                    size={16} 
                                    className="mt-0.5 flex-shrink-0"
                                    style={{ color: 'var(--color-status-success)' }}
                                  />
                                  <span 
                                    style={{
                                      fontSize: 'var(--text-sm)',
                                      color: 'var(--color-text-primary)'
                                    }}
                                  >
                                    {module}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    {/* Program Action */}
                    <div className="lg:col-span-1">
                      <Card className="p-4 text-center space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i}
                                size={16}
                                className="fill-current"
                                style={{ color: 'var(--color-status-warning)' }}
                              />
                            ))}
                          </div>
                          <p 
                            style={{
                              fontSize: 'var(--text-xs)',
                              color: 'var(--color-text-muted)'
                            }}
                          >
                            4.9/5 rating from 1,200+ participants
                          </p>
                        </div>
                        
                        <Button
                          onClick={() => handleStartProgram(program.id)}
                          className="w-full gap-2"
                          style={{
                            backgroundColor: 'var(--color-primary-default)',
                            color: 'var(--color-primary-on)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-medium)'
                          }}
                        >
                          <Play size={14} />
                          Start Program
                        </Button>
                        
                        <p 
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-muted)'
                          }}
                        >
                          Begin your journey today
                        </p>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <Card className="overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1758272422634-e8ed8e252a14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5kZnVsbmVzcyUyMG1lZGl0YXRpb24lMjBwcmFjdGljZXxlbnwxfHx8fDE3NTkyOTcyODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Mindfulness meditation practice"
                  className="w-full h-64 sm:h-80 object-cover"
                />
              </Card>
            </div>
            <div className="space-y-6">
              <h2 
                style={{
                  fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)'
                }}
              >
                Real Results from Real People
              </h2>
              <div className="space-y-6">
                <blockquote className="border-l-4 pl-4" style={{ borderColor: 'var(--color-primary-default)' }}>
                  <p 
                    style={{
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      lineHeight: 'var(--line-height-md)',
                      fontStyle: 'italic'
                    }}
                  >
                    "The Anxiety Relief Program gave me practical tools I use every day. 
                    I finally feel in control of my anxiety instead of it controlling me."
                  </p>
                  <cite 
                    className="block mt-2"
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      fontStyle: 'normal'
                    }}
                  >
                    — Sarah M., Program Graduate
                  </cite>
                </blockquote>

                <blockquote className="border-l-4 pl-4" style={{ borderColor: 'var(--color-primary-default)' }}>
                  <p 
                    style={{
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      lineHeight: 'var(--line-height-md)',
                      fontStyle: 'italic'
                    }}
                  >
                    "The structure and daily guidance helped me build habits that transformed my depression. 
                    I couldn't have done it without this program."
                  </p>
                  <cite 
                    className="block mt-2"
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      fontStyle: 'normal'
                    }}
                  >
                    — Michael R., Program Graduate
                  </cite>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started CTA */}
      <section 
        className="py-12 sm:py-16"
        style={{ backgroundColor: 'var(--color-primary-default)' }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="space-y-6">
            <h2 
              style={{
                fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary-on)'
              }}
            >
              Ready to Transform Your Mental Health?
            </h2>
            <p 
              className="max-w-2xl mx-auto"
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-primary-on)',
                opacity: 0.9,
                lineHeight: 'var(--line-height-md)'
              }}
            >
              Join thousands of people who have improved their mental wellbeing through our evidence-based programs. 
              Your journey to better mental health starts with a single step.
            </p>
            <div className="pt-4">
              <Button
                onClick={() => document.getElementById('programs-section')?.scrollIntoView({ behavior: 'smooth' })}
                variant="secondary"
                className="gap-2 min-w-[240px] h-12"
                style={{
                  backgroundColor: 'var(--color-primary-on)',
                  color: 'var(--color-primary-default)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                Choose Your Program
                <Target size={16} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Support & Guidance Footer */}
      <section 
        className="py-8 sm:py-12"
        style={{ backgroundColor: 'var(--color-bg-muted)' }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <h2 
                style={{
                  fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)'
                }}
              >
                Expert Support Every Step
              </h2>
              <p 
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--line-height-md)'
                }}
              >
                Our programs are designed by licensed mental health professionals and backed by years of research. 
                You're not alone in this journey – we provide ongoing support and guidance throughout your program.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield 
                    size={20} 
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: 'var(--color-status-success)' }}
                  />
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Programs developed by licensed therapists and psychologists
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Heart 
                    size={20} 
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: 'var(--color-status-success)' }}
                  />
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    24/7 crisis support and emergency resources available
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Lightbulb 
                    size={20} 
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: 'var(--color-status-success)' }}
                  />
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Progress tracking and personalized recommendations
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:order-first">
              <Card className="overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758273240631-59d44c8f5b66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBjb2FjaGluZyUyMHNlc3Npb258ZW58MXx8fHwxNzU5Mjk3Mjg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Mental health coaching session"
                  className="w-full h-64 sm:h-80 object-cover"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}