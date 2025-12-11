import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Button } from './ui/button';

// Navigation Components
import { TopNavBar } from './navigation/TopNavBar';
import { BottomNavBarMobile } from './navigation/BottomNavBarMobile';
import { SideNavAccount } from './navigation/SideNavAccount';
import { Breadcrumbs, generateBreadcrumbs, ikanRouteLabels } from './navigation/Breadcrumbs';
import { Pagination, PaginationInfo } from './navigation/Pagination';
import { SearchBar } from './navigation/SearchBar';

import { cn } from './ui/utils';

export function NavigationShowcase() {
  const [currentRoute, setCurrentRoute] = useState('/dashboard');
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setPagination] = useState(1);
  const [sideNavCollapsed, setSideNavCollapsed] = useState(false);

  // Sample data for demonstrations
  const totalPages = 12;
  const totalItems = 147;
  const itemsPerPage = 12;

  const breadcrumbItems = generateBreadcrumbs(
    '/account/settings/notifications',
    ikanRouteLabels,
    setCurrentRoute
  );

  return (
    <div className="min-h-screen p-4 space-y-8" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4 mb-8">
          <h1 
            style={{ 
              fontSize: 'var(--text-3xl)', 
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)'
            }}
          >
            iKan Navigation Showcase
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)' }}>
            Complete navigation system implementation with design tokens, states, interactions, and animations.
          </p>
          <Badge variant="secondary" className="w-fit">
            Navigation JSON Implementation
          </Badge>
        </div>

        <Tabs defaultValue="desktop" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="desktop">Desktop Nav</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Nav</TabsTrigger>
            <TabsTrigger value="sidebar">Sidebar Nav</TabsTrigger>
            <TabsTrigger value="utilities">Utilities</TabsTrigger>
          </TabsList>

          {/* Desktop Navigation */}
          <TabsContent value="desktop" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Desktop Top Navigation</CardTitle>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Responsive top navigation with scroll effects and user profile integration.
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                
                <div className="space-y-4">
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    TopNavBar
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <TopNavBar 
                      currentRoute={currentRoute}
                      onNavigate={setCurrentRoute}
                    />
                  </div>
                  <div className="text-sm space-y-2" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>States:</strong> default, scrolled with automatic detection</p>
                    <p><strong>Tokens:</strong> aliases.semantic.navbar.default, spacing.3, type.title, zIndex.overlay</p>
                    <p><strong>Features:</strong> Profile icon (account.roundedOutline), hover interactions, slideDown animation</p>
                    <p><strong>Constraints:</strong> navDesktop.min to navDesktop.max width</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile Navigation */}
          <TabsContent value="mobile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mobile Bottom Navigation</CardTitle>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Touch-optimized bottom navigation with active states and proper icons.
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                
                <div className="space-y-4">
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    BottomNavBarMobile
                  </h3>
                  <div className="relative bg-gray-100 rounded-lg p-4" style={{ minHeight: '120px' }}>
                    <div className="absolute bottom-0 left-0 right-0">
                      <BottomNavBarMobile 
                        currentRoute={currentRoute}
                        onNavigate={setCurrentRoute}
                        className="relative"
                      />
                    </div>
                  </div>
                  <div className="text-sm space-y-2" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>States:</strong> default, active with visual indicators</p>
                    <p><strong>Tokens:</strong> bg.canvas, primary.default, borders.radius.lg, zIndex.overlay</p>
                    <p><strong>Icons:</strong> home, tools, library, account with roundedOutline/roundedFilled variants</p>
                    <p><strong>Interactions:</strong> tap with touch feedback and scale animations</p>
                    <p><strong>Animations:</strong> slideUp, fadeIn, scaleIn for active states</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Sidebar Navigation */}
          <TabsContent value="sidebar" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Account Sidebar Navigation</CardTitle>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                      Collapsible sidebar for account management with multiple states.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSideNavCollapsed(!sideNavCollapsed)}
                  >
                    {sideNavCollapsed ? 'Expand' : 'Collapse'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                
                <div className="space-y-4">
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    SideNavAccount
                  </h3>
                  <div className="border rounded-lg overflow-hidden" style={{ height: '400px' }}>
                    <SideNavAccount 
                      currentRoute="/account/settings"
                      onNavigate={(route) => console.log('Navigate to:', route)}
                      collapsed={sideNavCollapsed}
                      onToggleCollapse={() => setSideNavCollapsed(!sideNavCollapsed)}
                    />
                  </div>
                  <div className="text-sm space-y-2" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>States:</strong> default, expanded, collapsed, active</p>
                    <p><strong>Tokens:</strong> bg.canvas, accent.default, type.body</p>
                    <p><strong>Icons:</strong> dashboard (outline/filled), settings (outline/filled)</p>
                    <p><strong>Interactions:</strong> hover, click with smooth transitions</p>
                    <p><strong>Animations:</strong> slideLeft, fadeIn for state changes</p>
                    <p><strong>Constraints:</strong> sidebar.min to sidebar.max width</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Utility Navigation Components */}
          <TabsContent value="utilities" className="space-y-6">
            
            {/* Breadcrumbs */}
            <Card>
              <CardHeader>
                <CardTitle>Breadcrumb Navigation</CardTitle>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Hierarchical navigation with automatic route generation.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Auto-generated from route: /account/settings/notifications
                  </h4>
                  <Breadcrumbs items={breadcrumbItems} />
                  
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Different separators
                  </h4>
                  <div className="space-y-2">
                    <Breadcrumbs items={breadcrumbItems} separator="chevron" />
                    <Breadcrumbs items={breadcrumbItems} separator="arrow" />
                    <Breadcrumbs items={breadcrumbItems} separator="slash" />
                  </div>
                  
                  <div className="text-sm space-y-2" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>Tokens:</strong> type.body, colors.muted.fg, spacing.1</p>
                    <p><strong>Features:</strong> Clickable items, current page indication, custom separators</p>
                    <p><strong>Constraints:</strong> component.min to content.max width</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Bar */}
            <Card>
              <CardHeader>
                <CardTitle>Search Bar</CardTitle>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Interactive search with focus states and animations.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Standard Search Bar
                  </h4>
                  <div className="max-w-md">
                    <SearchBar 
                      placeholder="Search mental health resources..."
                      value={searchValue}
                      onChange={setSearchValue}
                      onSearch={(value) => console.log('Searching:', value)}
                    />
                  </div>
                  
                  <div className="text-sm space-y-2" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>States:</strong> default, focus, empty with visual feedback</p>
                    <p><strong>Tokens:</strong> input.background, borders.radius.md, icons.sizes.md</p>
                    <p><strong>Icons:</strong> search (outline variant)</p>
                    <p><strong>Interactions:</strong> focus, type with scaleIn animation</p>
                    <p><strong>Constraints:</strong> input.min to input.max width</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            <Card>
              <CardHeader>
                <CardTitle>Pagination</CardTitle>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Page navigation with active states and accessibility features.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Full Pagination Controls
                  </h4>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPagination}
                    showPreviousNext={true}
                    showFirstLast={true}
                    maxVisiblePages={5}
                  />
                  
                  <PaginationInfo
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                  />
                  
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Minimal Pagination
                  </h4>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={7}
                    onPageChange={setPagination}
                    showPreviousNext={true}
                    showFirstLast={false}
                    maxVisiblePages={5}
                  />
                  
                  <div className="text-sm space-y-2" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>States:</strong> default, active, disabled with visual feedback</p>
                    <p><strong>Tokens:</strong> secondary.default, type.body, spacing.2</p>
                    <p><strong>Interactions:</strong> click with hover effects and page info</p>
                    <p><strong>Animations:</strong> fadeIn for state changes, scaleIn for active page</p>
                    <p><strong>Features:</strong> Ellipsis for large page counts, accessibility labels</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </TabsContent>
        </Tabs>

        {/* Implementation Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Navigation JSON Implementation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                  Design Tokens Integration
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                  <li>• Semantic navbar tokens</li>
                  <li>• Spacing scale (1-8)</li>
                  <li>• Typography scale (title, body)</li>
                  <li>• Z-index overlay system</li>
                  <li>• Border radius variants</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                  States & Interactions
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                  <li>• Default, scrolled, focus states</li>
                  <li>• Active, collapsed, expanded</li>
                  <li>• Hover, tap, click interactions</li>
                  <li>• Touch feedback for mobile</li>
                  <li>• Keyboard navigation support</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                  Animations & Motion
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                  <li>• slideDown for navbar scroll</li>
                  <li>• slideUp for mobile nav</li>
                  <li>• slideLeft for sidebar</li>
                  <li>• fadeIn for state changes</li>
                  <li>• scaleIn for focus/active states</li>
                </ul>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Complete JSON Compliance
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div>
                  <p><strong>Icons:</strong> Proper roundedOutline/roundedFilled variants</p>
                  <p><strong>Constraints:</strong> Responsive width constraints per component</p>
                </div>
                <div>
                  <p><strong>Accessibility:</strong> ARIA labels, keyboard navigation, focus management</p>
                  <p><strong>Performance:</strong> Optimized animations, proper event handling</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                All navigation components implement the JSON specifications exactly with proper tokens, 
                states, icons, interactions, constraints, and animations. Ready for production use in 
                the iKan mental health PWA.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}