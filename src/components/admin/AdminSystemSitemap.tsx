import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export function AdminSystemSitemap() {
  const sitemap = [
    {
      section: 'Public',
      pages: ['/', '/about', '/contact', '/faq', '/privacy', '/terms']
    },
    {
      section: 'Auth',
      pages: ['/login', '/signup', '/forgot-password']
    },
    {
      section: 'App',
      pages: ['/dashboard', '/mood-journal', '/assessment', '/equip', '/equip/:programId', '/consultation', '/resource', '/resource/:id']
    },
    {
      section: 'Settings',
      pages: ['/settings', '/settings/profile', '/settings/notifications', '/settings/privacy', '/settings/billing']
    },
    {
      section: 'Admin',
      pages: ['/admin', '/admin/dashboard', '/admin/resources', '/admin/users', '/admin/assessments', '/admin/equip', '/admin/analytics']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
         <h2 className="text-2xl font-bold tracking-tight">System Sitemap</h2>
         <p className="text-muted-foreground">Comprehensive map of all application routes, hierarchies, and access levels.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sitemap.map((section) => (
          <Card key={section.section}>
            <CardHeader>
              <CardTitle>{section.section}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.pages.map((page) => (
                  <li key={page} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{page}</code>
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
