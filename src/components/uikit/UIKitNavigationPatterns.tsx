import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Icon } from '../Icon';

export function UIKitNavigationPatterns() {
  const breadcrumbs = [
    { label: 'Admin', onClick: () => console.log('Admin clicked') },
    { label: 'Settings', onClick: () => console.log('Settings clicked') },
    { label: 'General' }
  ];

  return (
    <div className="space-y-8">
      {/* Admin Header Breadcrumb Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Breadcrumbs</CardTitle>
          <CardDescription>
            Custom navigation pattern used in `AdminHeader.tsx`. 
            Uses a simple `nav` element with text links, distinct from the ShadCN Breadcrumb.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-[var(--color-bg-page)]">
            <nav className="flex items-center text-sm text-muted-foreground mb-2">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <Icon name="chevron-right" size={14} className="mx-2" />}
                  {crumb.onClick ? (
                    <button 
                      onClick={crumb.onClick}
                      className="hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>
            <h1 className="text-2xl font-medium tracking-tight">General Settings</h1>
          </div>
        </CardContent>
      </Card>

      {/* Admin Tabs Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Tabs Grid</CardTitle>
          <CardDescription>
            Full-width grid layout used in Admin Managers (e.g., `AdminCategoryManager`).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="category" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="category">Categories</TabsTrigger>
              <TabsTrigger value="content">Content Types</TabsTrigger>
              <TabsTrigger value="filter">Filter Types</TabsTrigger>
            </TabsList>
            <TabsContent value="category" className="p-4 border rounded-lg bg-muted/20 text-center text-muted-foreground">
              Category Manager Content
            </TabsContent>
            <TabsContent value="content" className="p-4 border rounded-lg bg-muted/20 text-center text-muted-foreground">
              Content Types Manager Content
            </TabsContent>
            <TabsContent value="filter" className="p-4 border rounded-lg bg-muted/20 text-center text-muted-foreground">
              Filter Types Manager Content
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}