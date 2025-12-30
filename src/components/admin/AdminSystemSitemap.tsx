import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArrowUpRight } from 'lucide-react';

interface AdminSystemSitemapProps {
  onNavigate: (route: string) => void;
}

export function AdminSystemSitemap({ onNavigate }: AdminSystemSitemapProps) {
  const sitemap = [
    {
      section: 'Public',
      color: 'bg-green-100 text-green-800',
      pages: [
        { path: '/', label: 'Home / Landing' },
        { path: '/about', label: 'About Us' },
        { path: '/contact', label: 'Contact Support' },
        { path: '/faq', label: 'FAQ' },
        { path: '/privacy', label: 'Privacy Policy' },
        { path: '/terms', label: 'Terms of Use' }
      ]
    },
    {
      section: 'Authentication',
      color: 'bg-yellow-100 text-yellow-800',
      pages: [
        { path: '/login', label: 'Login / Sign Up' },
        // { path: '/forgot-password', label: 'Forgot Password' }
      ]
    },
    {
      section: 'Core App (Protected)',
      color: 'bg-blue-100 text-blue-800',
      pages: [
        { path: '/dashboard', label: 'User Dashboard' },
        { path: '/mood-journal', label: 'Mood Journal' },
        { path: '/assessment-landing', label: 'Assessments Hub' },
        { path: '/equip-programs-landing', label: 'Equip Programs' },
        { path: '/consultation', label: 'Consultant Booking' },
        { path: '/resource', label: 'Resource Library' },
        { path: '/account', label: 'Account Settings' }
      ]
    },
    {
      section: 'Flows & Sub-pages',
      color: 'bg-purple-100 text-purple-800',
      pages: [
        { path: '/assessment-flow', label: 'Assessment Questionaire' },
        { path: '/assessment-results', label: 'Assessment Results' },
        { path: '/equip-detail', label: 'Program Details' },
        { path: '/equip-program-onboarding', label: 'Program Onboarding' },
        { path: '/equip-program-flow', label: 'Daily Session Flow' },
        { path: '/consultation-detail', label: 'Consultant Profile' },
        { path: '/resource-detail', label: 'Resource Viewer' }
      ]
    },
    {
      section: 'Admin Console',
      color: 'bg-gray-100 text-gray-800',
      pages: [
        { path: '/admin', label: 'Admin Dashboard' },
        { path: '/admin/resources', label: 'Resource Manager' },
        { path: '/admin/users', label: 'User Manager' },
        { path: '/admin/assessments', label: 'Assessment Builder' },
        { path: '/admin/equip', label: 'Program Builder' },
        { path: '/admin/analytics', label: 'System Analytics' }
      ]
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
          <Card key={section.section} className="h-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{section.section}</CardTitle>
                <Badge variant="outline" className={section.color}>{section.pages.length} Pages</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.pages.map((page) => (
                  <li 
                    key={page.path} 
                    className="flex items-center gap-2 text-sm group cursor-pointer hover:bg-muted p-1.5 rounded-md -mx-1.5 transition-colors"
                    onClick={() => onNavigate(page.path)}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">{page.label}</span>
                    <span className="text-xs text-muted-foreground/60 ml-auto font-mono hidden group-hover:inline-block">{page.path}</span>
                    <ArrowUpRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-all" />
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
