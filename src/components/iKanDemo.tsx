import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { EmojiWidget } from './atoms/EmojiWidget';
import { ProgramCard } from './atoms/ProgramCard';
import { FormRow } from './atoms/FormRow';
import { TrackerJournalTile } from './organisms/TrackerJournalTile';
import { AssessmentQuestion } from './organisms/AssessmentQuestion';
import { EquipDayTile } from './organisms/EquipDayTile';
import { MoodTracker } from './MoodTracker';
import { AssessmentFlow } from './AssessmentFlow';
import { EquipFlow } from './EquipFlow';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Heart, Sparkles, Play, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface IKanDemoProps {
  className?: string;
}

export function IKanDemo({ className }: IKanDemoProps) {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [currentMood, setCurrentMood] = useState<number>(4);
  const [demoStep, setDemoStep] = useState(1);

  const handleDemoFlow = () => {
    setDemoStep(1);
    toast.info('Starting iKan Demo Flow', {
      description: 'Experience the complete mental health journey'
    });
  };

  const nextStep = () => {
    setDemoStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setDemoStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Demo Header */}
      <Card 
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-default), var(--color-accent-default))',
          border: 'none',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart size={32} style={{ color: 'var(--color-primary-on)' }} />
            <h1 
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-primary-on)'
              }}
            >
              iKan Mental Health PWA
            </h1>
            <Sparkles size={32} style={{ color: 'var(--color-primary-on)' }} />
          </div>
          <p 
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-primary-on)',
              opacity: 0.9,
              marginBottom: '24px'
            }}
          >
            Complete MVP Prototype with Supabase Integration
          </p>
          <Button
            onClick={handleDemoFlow}
            size="lg"
            className="gap-2"
            style={{
              backgroundColor: 'var(--color-primary-on)',
              color: 'var(--color-primary-default)',
              fontWeight: 'var(--font-weight-semibold)',
              border: 'none'
            }}
          >
            <Play size={20} />
            Start Demo Flow
          </Button>
        </CardContent>
      </Card>

      {/* Component Showcase */}
      <Tabs defaultValue="atoms" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="atoms">Atoms</TabsTrigger>
          <TabsTrigger value="organisms">Organisms</TabsTrigger>
          <TabsTrigger value="flows">Flows</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        {/* Atoms Tab */}
        <TabsContent value="atoms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>iKan Design System Atoms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* EmojiWidget */}
              <div className="space-y-4">
                <h3 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  EmojiWidget (Mood Selector)
                </h3>
                <div className="flex justify-center">
                  <EmojiWidget
                    moodValue={currentMood}
                    onMoodChange={setCurrentMood}
                    animation="bounce"
                    size="lg"
                  />
                </div>
                <div className="text-center">
                  <Badge variant="secondary">
                    Current Mood: {currentMood}/5
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* ProgramCard */}
              <div className="space-y-4">
                <h3 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  ProgramCard
                </h3>
                <div className="max-w-md mx-auto">
                  <ProgramCard
                    title="Anxiety Management Toolkit"
                    description="Learn evidence-based techniques to manage anxiety including breathing exercises, cognitive restructuring, and mindfulness practices."
                    category="Mental Health"
                    difficulty="Beginner"
                    progress={75}
                    totalSessions={8}
                    completedSessions={6}
                    duration="8 days"
                    price={499}
                    isPurchased={true}
                    onContinue={() => showToast('info', 'Program Continued', 'Opening your next session...')}
                  />
                </div>
              </div>

              <Separator />

              {/* FormRow */}
              <div className="space-y-4">
                <h3 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  FormRow Component
                </h3>
                <div className="max-w-lg mx-auto space-y-4">
                  <FormRow
                    label="Full Name"
                    required
                    direction="vertical"
                  >
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full p-3 rounded-md border"
                      style={{
                        backgroundColor: 'var(--color-bg-input)',
                        borderColor: 'var(--color-border-default)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    />
                  </FormRow>
                  
                  <FormRow
                    label="Email Address"
                    required
                    direction="horizontal"
                    labelWidth="120px"
                  >
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full p-3 rounded-md border"
                      style={{
                        backgroundColor: 'var(--color-bg-input)',
                        borderColor: 'var(--color-border-default)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    />
                  </FormRow>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organisms Tab */}
        <TabsContent value="organisms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>iKan Organism Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* TrackerJournalTile */}
              <div className="space-y-4">
                <h3 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  TrackerJournalTile
                </h3>
                <TrackerJournalTile
                  date={new Date()}
                  initialMood={currentMood}
                  onSave={(data) => {
                    showToast('success', 'Journal Entry Saved', 
                      `Mood: ${data.mood}/5, Entry saved for ${data.date.toDateString()}`);
                  }}
                />
              </div>

              <Separator />

              {/* AssessmentQuestion */}
              <div className="space-y-4">
                <h3 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  AssessmentQuestion
                </h3>
                <AssessmentQuestion
                  question={{
                    id: 'demo-q1',
                    text: 'How often have you been feeling nervous, anxious, or on edge?',
                    type: 'single-choice',
                    options: [
                      { id: 'never', text: 'Not at all', value: 0 },
                      { id: 'several', text: 'Several days', value: 1 },
                      { id: 'more-half', text: 'More than half the days', value: 2 },
                      { id: 'nearly-every', text: 'Nearly every day', value: 3 }
                    ],
                    required: true
                  }}
                  onAnswer={(id, answer) => console.log('Answer:', id, answer)}
                  questionNumber={1}
                  totalQuestions={7}
                  onNext={() => showToast('info', 'Next Question', 'Moving to question 2 of 7')}
                />
              </div>

              <Separator />

              {/* EquipDayTile */}
              <div className="space-y-4">
                <h3 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  EquipDayTile States
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <EquipDayTile
                    day={1}
                    title="Introduction"
                    description="Welcome to your journey"
                    duration="15 min"
                    status="completed"
                    onContinue={() => showToast('info', 'Day 1', 'Reviewing completed session')}
                  />
                  <EquipDayTile
                    day={2}
                    title="Breathing Basics"
                    description="Learn foundational techniques"
                    duration="20 min"
                    status="unlocked"
                    isToday={true}
                    onStart={() => showToast('info', 'Day 2', 'Starting today\'s session')}
                  />
                  <EquipDayTile
                    day={3}
                    title="Advanced Practice"
                    description="Build on your skills"
                    duration="25 min"
                    status="locked"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flows Tab */}
        <TabsContent value="flows" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mood Tracking Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <MoodTracker 
                  onEntryCreated={(entry) => {
                    showToast('success', 'Mood Tracked', 
                      `Your mood (${entry.mood_rating}/5) has been saved`);
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assessment Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <AssessmentFlow />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Equip Programs Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <EquipFlow />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Full System Integration Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  Demo Step {demoStep} of 6
                </div>
                
                <div className="w-full max-w-md mx-auto">
                  <div 
                    className="h-2 rounded-full"
                    style={{ backgroundColor: 'var(--color-bg-muted)' }}
                  >
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(demoStep / 6) * 100}%`,
                        backgroundColor: 'var(--color-primary-default)'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {demoStep === 1 && (
                  <div className="text-center space-y-4">
                    <h3>1. Authentication & User Setup</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                      User: {user?.name || 'Guest'} ({user ? 'Authenticated' : 'Demo Mode'})
                    </p>
                    <Badge variant="secondary">
                      <CheckCircle size={12} className="mr-1" />
                      Auth Context Active
                    </Badge>
                  </div>
                )}

                {demoStep === 2 && (
                  <div className="text-center space-y-4">
                    <h3>2. Mood Tracking</h3>
                    <EmojiWidget
                      moodValue={currentMood}
                      onMoodChange={(mood) => {
                        setCurrentMood(mood);
                        showToast('success', 'Mood Updated', `Set to ${mood}/5`);
                      }}
                      size="lg"
                    />
                  </div>
                )}

                {demoStep === 3 && (
                  <div className="text-center space-y-4">
                    <h3>3. Assessment System</h3>
                    <Badge variant="secondary">Supabase Integration ✓</Badge>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                      Assessment responses stored in database
                    </p>
                  </div>
                )}

                {demoStep === 4 && (
                  <div className="text-center space-y-4">
                    <h3>4. Program Purchase (Razorpay)</h3>
                    <Badge variant="secondary">Payment Gateway Integration ✓</Badge>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                      Equip programs with payment processing
                    </p>
                  </div>
                )}

                {demoStep === 5 && (
                  <div className="text-center space-y-4">
                    <h3>5. Notifications System</h3>
                    <Button
                      onClick={() => {
                        showToast('success', 'Test Notification', 'iKan notification system working!');
                      }}
                    >
                      Test Notification
                    </Button>
                  </div>
                )}

                {demoStep === 6 && (
                  <div className="text-center space-y-4">
                    <h3>6. Complete Integration ✓</h3>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <Badge variant="secondary">Design Tokens ✓</Badge>
                      <Badge variant="secondary">Accessibility ✓</Badge>
                      <Badge variant="secondary">Motion Support ✓</Badge>
                      <Badge variant="secondary">Offline Mode ✓</Badge>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={demoStep === 1}
                >
                  Previous
                </Button>
                <Button 
                  onClick={nextStep}
                  disabled={demoStep === 6}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}