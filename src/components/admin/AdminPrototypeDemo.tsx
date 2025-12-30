import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Play, ExternalLink } from 'lucide-react';

interface AdminPrototypeDemoProps {
  onNavigate: (route: string) => void;
}

export function AdminPrototypeDemo({ onNavigate }: AdminPrototypeDemoProps) {
  const demos = [
    { 
      title: 'User Onboarding', 
      desc: 'New user registration and setup experience.',
      route: '/login'
    },
    { 
      title: 'Assessment Flow', 
      desc: 'Complete mental health check-in flow with scoring.',
      route: '/assessment-landing' 
    },
    { 
      title: 'Equip Programs', 
      desc: 'Browse and access 18-day mental health programs.',
      route: '/equip-programs-landing' 
    },
    { 
      title: 'Program Detail', 
      desc: 'Detailed view of a specific program (Sleep Tight).',
      route: '/equip-detail?id=sleep-tight' 
    },
    { 
      title: 'Mood Journal', 
      desc: 'Daily mood tracking and reflection interface.',
      route: '/mood-journal' 
    },
    { 
      title: 'Resource Library', 
      desc: 'Curated articles and exercises.',
      route: '/resource' 
    },
    { 
      title: 'Consultant Booking', 
      desc: 'Find and book professional consultants.',
      route: '/consultation' 
    },
    { 
      title: 'Admin Dashboard', 
      desc: 'Backend management interface.',
      route: '/admin' 
    },
    { 
      title: 'UI Kit Showcase', 
      desc: 'Interactive component library.',
      route: '/ui-kit' 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
         <h2 className="text-2xl font-bold tracking-tight">Prototype Demo</h2>
         <p className="text-muted-foreground">Interactive prototypes and live flow demonstrations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {demos.map((demo, i) => (
          <Card key={i} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="h-32 bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Play className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{demo.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{demo.desc}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2 group-hover:border-primary group-hover:text-primary transition-colors"
                onClick={() => onNavigate(demo.route)}
              >
                <ExternalLink size={14} />
                Launch Demo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
