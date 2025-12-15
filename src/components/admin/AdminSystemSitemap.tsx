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
      pages: ['/dashboard', '/mood-journal', '/assessment', '/equip', '/consultation', '/resource']
    },
    {
      section: 'Admin',
      pages: ['/admin', '/admin/resources', '/admin/users', '/admin/assessments']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
         <h2 className="text-2xl font-bold tracking-tight">System Sitemap</h2>
         <p className="text-muted-foreground">Overview of all application routes and hierarchy.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
