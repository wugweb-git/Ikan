import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ArrowRight, Circle, GitCommit } from 'lucide-react';

export function AdminNavigationGuide() {
  const flows = [
    {
      name: 'New User Onboarding',
      description: 'First-time user experience from landing to dashboard',
      steps: [
        { name: 'Landing Page', route: '/' },
        { name: 'Sign Up / Login', route: '/login' },
        { name: 'Dashboard (Empty State)', route: '/dashboard' },
        { name: 'Initial Assessment', route: '/assessment-landing' }
      ]
    },
    {
      name: 'Assessment & Scoring',
      description: 'Taking an assessment and viewing results',
      steps: [
        { name: 'Assessment Hub', route: '/assessment-landing' },
        { name: 'Assessment Detail', route: '/assessment-detail' },
        { name: 'Questionnaire Flow', route: '/assessment-flow' },
        { name: 'Scoring & Results', route: '/assessment-results' },
        { name: 'Program Recommendation', route: '/equip-detail' }
      ]
    },
    {
      name: 'Equip Program Participation',
      description: 'Enrolling and completing a daily program session',
      steps: [
        { name: 'Programs Library', route: '/equip-programs-landing' },
        { name: 'Program Overview', route: '/equip-detail' },
        { name: 'Program Onboarding', route: '/equip-program-onboarding' },
        { name: 'Daily Session', route: '/equip-program-flow' },
        { name: 'Session Completion', route: '/equip-program-completion' }
      ]
    },
    {
      name: 'Consultation Booking',
      description: 'Finding and booking a professional',
      steps: [
        { name: 'Consultants List', route: '/consultation' },
        { name: 'Consultant Profile', route: '/consultation-detail' },
        { name: 'Booking Modal', route: '(Modal)' },
        { name: 'Payment Gateway', route: '(External)' },
        { name: 'Booking Confirmation', route: '/consultation' }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div>
         <h2 className="text-2xl font-bold tracking-tight">Navigation Guide</h2>
         <p className="text-muted-foreground">Detailed user flows, navigation paths, and interaction patterns.</p>
      </div>

      <div className="space-y-8">
        {flows.map((flow) => (
          <div key={flow.name} className="relative">
             <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-primary" />
                {flow.name}
             </h3>
             <p className="text-sm text-muted-foreground mb-4 ml-7">{flow.description}</p>
             
             <div className="ml-2 pl-5 border-l-2 border-muted space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  {flow.steps.map((step, i) => (
                    <React.Fragment key={i}>
                      <div className="flex flex-col items-center">
                        <div className="px-4 py-3 bg-card border rounded-lg shadow-sm text-sm font-medium min-w-[140px] text-center hover:border-primary transition-colors">
                          {step.name}
                          <span className="block text-[10px] text-muted-foreground mt-1 font-mono bg-muted/50 rounded px-1">
                            {step.route}
                          </span>
                        </div>
                      </div>
                      {i < flow.steps.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
