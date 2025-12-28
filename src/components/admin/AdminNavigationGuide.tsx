import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ArrowRight, CornerDownRight } from 'lucide-react';

export function AdminNavigationGuide() {
  const flows = [
    {
      name: 'User Onboarding',
      steps: ['Landing Page', 'Sign Up', 'Profile Setup', 'Initial Assessment', 'Dashboard']
    },
    {
      name: 'Crisis Support',
      steps: ['Any Page', 'Crisis Button', 'Resource Selection', 'Call/Chat Initiation']
    },
    {
      name: 'Daily Check-in',
      steps: ['Dashboard', 'Mood Journal', 'Log Entry', 'Reflection', 'Summary']
    },
    {
      name: 'Consultant Booking',
      steps: ['Consultants List', 'Profile View', 'Select Slot', 'Payment', 'Confirmation']
    },
    {
      name: 'Equip Program',
      steps: ['Program Library', 'Course Detail', 'Enrollment', 'Daily Content', 'Completion']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
         <h2 className="text-2xl font-bold tracking-tight">Navigation Guide</h2>
         <p className="text-muted-foreground">Detailed user flows, navigation paths, and interaction patterns.</p>
      </div>

      <div className="space-y-6">
        {flows.map((flow) => (
          <Card key={flow.name}>
            <CardHeader>
              <CardTitle>{flow.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                {flow.steps.map((step, i) => (
                  <React.Fragment key={i}>
                    <div className="px-4 py-2 bg-secondary rounded-lg text-sm font-medium">
                      {step}
                    </div>
                    {i < flow.steps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
