import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Play } from 'lucide-react';

export function AdminPrototypeDemo() {
  return (
    <div className="space-y-6">
      <div>
         <h2 className="text-2xl font-bold tracking-tight">Prototype Demo</h2>
         <p className="text-muted-foreground">Interactive prototypes and flow demonstrations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'Onboarding Flow', desc: 'New user registration and setup experience.' },
          { title: 'Assessment Module', desc: 'Mental health check-in and scoring logic.' },
          { title: 'Program Journey', desc: 'Day-by-day program progression tracking.' },
          { title: 'Crisis Support', desc: 'Emergency resource access flow.' },
          { title: 'Payment Gateway', desc: 'Subscription and checkout process.' },
          { title: 'Telehealth Video', desc: 'Real-time video consultation interface.' },
          { title: 'Mood Journal V2', desc: 'Enhanced emotion tracking with AI insights.' },
          { title: 'Group Support', desc: 'Anonymous peer support chat rooms.' },
          { title: 'Gamification Engine', desc: 'Rewards and achievements system.' },
        ].map((demo, i) => (
          <Card key={i} className="overflow-hidden group">
            <div className="h-32 bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
              <Play className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{demo.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{demo.desc}</p>
              <Button variant="outline" size="sm" className="w-full">Launch Demo</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
