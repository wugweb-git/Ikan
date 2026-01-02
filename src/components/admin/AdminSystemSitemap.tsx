import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PageHero } from '../ui/PageHero';
import { Button } from '../ui/button';
import { ExternalLink } from 'lucide-react';

interface AdminSystemSitemapProps {
  onNavigate?: (route: string) => void;
}

export function AdminSystemSitemap({ onNavigate }: AdminSystemSitemapProps) {
  const sections = [
    {
      title: 'Public Pages',
      routes: [
        { path: '/', label: 'Homepage' },
        { path: '/login', label: 'Login / Sign Up' },
        { path: '/about', label: 'About Us' },
        { path: '/contact', label: 'Contact Us' },
        { path: '/faq', label: 'FAQ' },
        { path: '/privacy-policy', label: 'Privacy Policy' },
        { path: '/terms', label: 'Terms of Use' },
        { path: '/sitemap', label: 'Sitemap' }
      ]
    },
    {
      title: 'User Portal (Private)',
      routes: [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/mood-journal', label: 'Mood Journal' },
        { path: '/assessment', label: 'Assessments' },
        { path: '/equip', label: 'Equip Programs' },
        { path: '/resource', label: 'Resource Library' },
        { path: '/account', label: 'Account Settings' },
        { path: '/consultation', label: 'Consultations' }
      ]
    },
    {
      title: 'Admin Console',
      routes: [
        { path: '/admin', label: 'Admin Dashboard' },
        { path: '/admin/users', label: 'User Management' },
        { path: '/admin/resources', label: 'Resource Manager' },
        { path: '/admin/equip', label: 'Program Manager' },
        { path: '/admin/analytics', label: 'Analytics' }
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <PageHero 
        title="System Sitemap" 
        subtitle="Complete map of all accessible routes in the application."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card key={section.title} className="h-full">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.routes.map((route) => (
                  <li key={route.path}>
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-base font-normal text-foreground hover:text-primary hover:no-underline flex items-center gap-2 justify-start w-full text-left"
                      onClick={() => onNavigate?.(route.path)}
                    >
                      <span className="flex-1 truncate">{route.label}</span>
                      <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">{route.path}</span>
                      <ExternalLink size={14} className="text-muted-foreground" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
