import React, { useState } from 'react';
import { EquipOnboarding } from '../equip/EquipOnboarding';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function EquipOnboardingDemo() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [completedData, setCompletedData] = useState<any>(null);

  const handleComplete = (data: any) => {
    console.log('Onboarding completed with data:', data);
    setCompletedData(data);
    setShowOnboarding(false);
  };

  const handleSkip = () => {
    console.log('Onboarding skipped');
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <EquipOnboarding
        programId="sleep-program-1"
        programTitle="Sleep CBT Program"
        userEmail="user@example.com"
        userPhone="+91 9876543210"
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    );
  }

  return (
    <div 
      className="min-h-screen p-4 md:p-8"
      style={{
        backgroundColor: 'var(--color-bg-page)',
        fontFamily: 'var(--font-family-base)'
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            CBT Onboarding Demo
          </h1>
          <p 
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            Sleep Equip Program — Therapeutic onboarding experience
          </p>
        </div>

        {/* Features Card */}
        <Card>
          <CardHeader>
            <CardTitle>✨ Features Implemented</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FeatureItem
                icon="🎯"
                title="One Question Per Screen"
                description="No cognitive overload, gentle progression"
              />
              <FeatureItem
                icon="⏭️"
                title="Always Skippable"
                description="Skip button on every screen"
              />
              <FeatureItem
                icon="🤝"
                title="Prefer Not to Answer"
                description="First-class privacy option"
              />
              <FeatureItem
                icon="🏥"
                title="No Clinical Labels"
                description="Human-first, supportive language"
              />
              <FeatureItem
                icon="📱"
                title="Progressive Disclosure"
                description="Conditional questions based on answers"
              />
              <FeatureItem
                icon="✅"
                title="No Scrolling Forms"
                description="Full-screen, focused experience"
              />
              <FeatureItem
                icon="🎨"
                title="iKan Design System"
                description="Ubuntu font, proper tokens, accessible"
              />
              <FeatureItem
                icon="🌊"
                title="Smooth Animations"
                description="Motion/React slide transitions"
              />
            </div>
          </CardContent>
        </Card>

        {/* Screens Included */}
        <Card>
          <CardHeader>
            <CardTitle>📋 10 Screens Included</CardTitle>
          </CardHeader>
          <CardContent>
            <ol 
              className="space-y-2"
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-regular)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-base)',
                paddingLeft: 'var(--spacing-5)'
              }}
            >
              <li>Gentle Entry — "Let's get to know you"</li>
              <li>Name — Optional, nickname supported</li>
              <li>Gender — Non-assumptive, inclusive options</li>
              <li>Date of Birth — Soft framing, no age display</li>
              <li>Contact Info — Pre-filled, read-only</li>
              <li>Occupation — Neutral language ("Between jobs")</li>
              <li>Prior Therapy — Conditional follow-up chips</li>
              <li>Pre-existing Conditions — Optional textarea</li>
              <li>Review & Edit — Agency & control</li>
              <li>Consent — Non-legal tone</li>
              <li>Complete — Affirmation & next steps</li>
            </ol>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Button
            onClick={() => setShowOnboarding(true)}
            className="px-8"
            style={{
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-text-inverse)',
              fontWeight: 'var(--font-weight-medium)',
              height: '56px',
              fontSize: 'var(--text-lg)'
            }}
          >
            Start Onboarding Experience
          </Button>
          
          <p 
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-weight-regular)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            Click to experience the therapeutic onboarding flow
          </p>
        </div>

        {/* Completed Data Display */}
        {completedData && (
          <Card 
            style={{
              borderColor: 'var(--color-status-success)',
              borderWidth: '2px'
            }}
          >
            <CardHeader>
              <CardTitle>✅ Onboarding Complete!</CardTitle>
            </CardHeader>
            <CardContent>
              <pre 
                className="p-4 rounded overflow-auto"
                style={{
                  backgroundColor: 'var(--color-bg-muted)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'monospace',
                  maxHeight: '400px'
                }}
              >
                {JSON.stringify(completedData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Design Principles */}
        <Card>
          <CardHeader>
            <CardTitle>🎨 Design Principles Applied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Principle
              title="Supportive Tone"
              description="Encouraging, non-judgmental language throughout"
            />
            <Principle
              title="User Agency"
              description="Review screen lets users edit any answer"
            />
            <Principle
              title="Reduced Anxiety"
              description="No forced questions, skip always available"
            />
            <Principle
              title="Accessibility"
              description="ARIA labels, keyboard navigation, high contrast"
            />
            <Principle
              title="Mobile-First"
              description="Designed for 360px+, scales beautifully"
            />
            <Principle
              title="Trust Building"
              description="Transparent about data use, non-legal consent"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <span style={{ fontSize: '24px', flexShrink: 0 }}>{icon}</span>
      <div>
        <p 
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-base)',
            marginBottom: 'var(--spacing-1)'
          }}
        >
          {title}
        </p>
        <p 
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-regular)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function Principle({ title, description }: { title: string; description: string }) {
  return (
    <div 
      className="p-3 rounded"
      style={{ backgroundColor: 'var(--color-bg-muted)' }}
    >
      <p 
        style={{
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-base)',
          marginBottom: 'var(--spacing-1)'
        }}
      >
        {title}
      </p>
      <p 
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-regular)',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-family-base)'
        }}
      >
        {description}
      </p>
    </div>
  );
}
