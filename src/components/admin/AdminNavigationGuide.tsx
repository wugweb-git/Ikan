import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PageHero } from '../ui/PageHero';
import { Compass, Smartphone, Monitor } from 'lucide-react';

export function AdminNavigationGuide() {
  return (
    <div className="space-y-8 pb-10">
      <PageHero 
        title="Navigation Guide" 
        subtitle="Overview of navigation patterns for mobile and desktop."
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--color-bg-muted)] rounded-lg">
                <Smartphone size={24} />
              </div>
              <CardTitle>Mobile Navigation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Bottom Navigation Bar</h4>
              <p className="text-sm text-muted-foreground">
                Primary navigation method for mobile devices.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>Fixed at bottom of screen</li>
                <li>Hides on immersive flows (Assessments, Player)</li>
                <li>5 Tabs: Home, Explore, Mood, Library, Account</li>
                <li>Height: 80px (approx)</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Header Navigation</h4>
              <p className="text-sm text-muted-foreground">
                Contextual navigation for deeper levels.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>Back button (ArrowLeft)</li>
                <li>Page Title (Truncated)</li>
                <li>Action button (Share/Menu) - Optional</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--color-bg-muted)] rounded-lg">
                <Monitor size={24} />
              </div>
              <CardTitle>Desktop Navigation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Top Navigation Bar</h4>
              <p className="text-sm text-muted-foreground">
                Primary navigation method for larger screens.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>Logo on left</li>
                <li>Navigation links in center</li>
                <li>User profile/actions on right</li>
                <li>Sticky positioning</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Routing Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Compass className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <span className="font-medium">Public Routes:</span>
                <p className="text-muted-foreground">/, /login, /about, /contact, /faq, /privacy-policy, /terms</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Compass className="w-5 h-5 text-primary shrink-0" />
              <div>
                <span className="font-medium">Private Routes (Auth Required):</span>
                <p className="text-muted-foreground">/dashboard, /assessment, /mood-journal, /equip, /account</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Compass className="w-5 h-5 text-destructive shrink-0" />
              <div>
                <span className="font-medium">Admin Routes:</span>
                <p className="text-muted-foreground">/admin/* (Requires admin role)</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
