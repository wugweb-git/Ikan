import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { PageHero } from '../ui/PageHero';
import { Button } from '../ui/button';
import { Play, ClipboardList, BookOpen, Activity } from 'lucide-react';

interface AdminPrototypeDemoProps {
  onNavigate?: (route: string) => void;
}

export function AdminPrototypeDemo({ onNavigate }: AdminPrototypeDemoProps) {
  const demos = [
    {
      title: 'Equip Program Onboarding',
      description: 'Demo the onboarding flow for a new Equip program.',
      icon: BookOpen,
      action: 'Start Demo',
      route: '/equip-program-onboarding?id=demo'
    },
    {
      title: 'Assessment Flow',
      description: 'Walk through a standard PHQ-9 assessment.',
      icon: ClipboardList,
      action: 'Start Assessment',
      route: '/assessment-flow?id=phq9'
    },
    {
      title: 'Daily Check-in',
      description: 'Simulate the daily mood and sleep tracker experience.',
      icon: Activity,
      action: 'Open Tracker',
      route: '/mood-journal'
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <PageHero 
        title="Prototype Demos" 
        subtitle="Interactive demos of key user flows for testing and validation."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demos.map((demo) => (
          <Card key={demo.title} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[var(--color-primary-light)] text-[var(--color-primary-default)] rounded-lg">
                  <demo.icon size={24} />
                </div>
                <CardTitle className="text-xl">{demo.title}</CardTitle>
              </div>
              <CardDescription>
                {demo.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => onNavigate?.(demo.route)}
              >
                <Play size={16} className="mr-2" />
                {demo.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
