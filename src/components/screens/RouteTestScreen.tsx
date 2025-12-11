import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Icon } from '../Icon';

interface RouteTest {
  path: string;
  name: string;
  description: string;
  requiresAuth: boolean;
  isPublic: boolean;
  category: 'Public' | 'Private' | 'Auth Flow' | 'Special';
  tested?: boolean;
  working?: boolean;
  error?: string;
}

interface RouteTestScreenProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
  isAuthenticated: boolean;
}

const routes: RouteTest[] = [
  // Public Routes
  { path: '/', name: 'Homepage', description: 'Main landing page', requiresAuth: false, isPublic: true, category: 'Public' },
  { path: '/assessments', name: 'Assessments Browse', description: 'Browse all assessments', requiresAuth: false, isPublic: true, category: 'Public' },
  { path: '/assessment-landing', name: 'Assessment Landing', description: 'Individual assessment landing page', requiresAuth: false, isPublic: true, category: 'Public' },
  { path: '/equip-programs', name: 'Programs Browse', description: 'Browse all programs', requiresAuth: false, isPublic: true, category: 'Public' },
  { path: '/equip-programs-landing', name: 'Program Landing', description: 'Individual program landing page', requiresAuth: false, isPublic: true, category: 'Public' },
  { path: '/library', name: 'Library', description: 'Resources and articles', requiresAuth: false, isPublic: true, category: 'Public' },
  { path: '/consultation', name: 'Consultation', description: 'Book consultations', requiresAuth: false, isPublic: true, category: 'Public' },
  { path: '/about', name: 'About Us', description: 'About the platform', requiresAuth: false, isPublic: true, category: 'Public' },
  { path: '/contact', name: 'Contact Us', description: 'Contact information', requiresAuth: false, isPublic: true, category: 'Public' },
  { path: '/privacy', name: 'Privacy Policy', description: 'Privacy policy', requiresAuth: false, isPublic: true, category: 'Public' },
  { path: '/terms', name: 'Terms of Use', description: 'Terms and conditions', requiresAuth: false, isPublic: true, category: 'Public' },
  { path: '/faq', name: 'FAQ', description: 'Frequently asked questions', requiresAuth: false, isPublic: true, category: 'Public' },
  
  // Auth Flow Routes
  { path: '/login', name: 'Login Screen', description: 'Sign in/up page', requiresAuth: false, isPublic: true, category: 'Auth Flow' },
  
  // Private Routes
  { path: '/dashboard', name: 'Dashboard', description: 'User dashboard', requiresAuth: true, isPublic: false, category: 'Private' },
  { path: '/mood-journal', name: 'Mood Journal', description: 'Daily mood tracking', requiresAuth: true, isPublic: false, category: 'Private' },
  { path: '/assessment-flow', name: 'Assessment Flow', description: 'Taking an assessment', requiresAuth: true, isPublic: false, category: 'Private' },
  { path: '/assessment-results', name: 'Assessment Results', description: 'Assessment results page', requiresAuth: true, isPublic: false, category: 'Private' },
  { path: '/equip-program-onboarding', name: 'Program Onboarding', description: 'Program introduction', requiresAuth: true, isPublic: false, category: 'Private' },
  { path: '/equip-program-flow', name: 'Program Flow', description: 'Active program session', requiresAuth: true, isPublic: false, category: 'Private' },
  { path: '/equip-program-completion', name: 'Program Completion', description: 'Program completion page', requiresAuth: true, isPublic: false, category: 'Private' },
  { path: '/account', name: 'Account Settings', description: 'User account management', requiresAuth: true, isPublic: false, category: 'Private' },
  
  // Special Routes
  { path: '/resource-detail', name: 'Resource Detail', description: 'Individual resource page (requires ID)', requiresAuth: false, isPublic: true, category: 'Special' },
];

export function RouteTestScreen({ onNavigate, currentRoute, isAuthenticated }: RouteTestScreenProps) {
  const [testedRoutes, setTestedRoutes] = useState<Set<string>>(new Set());
  const [routeResults, setRouteResults] = useState<Map<string, { working: boolean; error?: string }>>(new Map());

  const testRoute = (route: RouteTest) => {
    console.log(`Testing route: ${route.path}`);
    setTestedRoutes(prev => new Set([...prev, route.path]));
    
    try {
      // Special handling for resource-detail which needs an ID
      if (route.path === '/resource-detail') {
        onNavigate('/resource-detail', 'test-resource-id');
      } else {
        onNavigate(route.path);
      }
      
      // Mark as working (this will be updated if there are errors)
      setRouteResults(prev => new Map([...prev, [route.path, { working: true }]]));
    } catch (error) {
      console.error(`Error testing route ${route.path}:`, error);
      setRouteResults(prev => new Map([...prev, [route.path, { 
        working: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }]]));
    }
  };

  const testAllRoutes = () => {
    console.log('Testing all routes...');
    routes.forEach((route, index) => {
      setTimeout(() => {
        testRoute(route);
      }, index * 500); // Stagger tests to avoid overwhelming the system
    });
  };

  const getRouteStatus = (route: RouteTest) => {
    const tested = testedRoutes.has(route.path);
    const result = routeResults.get(route.path);
    const isCurrent = currentRoute === route.path;
    
    if (isCurrent) return { status: 'current', color: 'var(--color-primary-default)' };
    if (!tested) return { status: 'untested', color: 'var(--color-text-muted)' };
    if (result?.working) return { status: 'working', color: 'var(--color-status-success)' };
    return { status: 'error', color: 'var(--color-status-danger)' };
  };

  const groupedRoutes = routes.reduce((acc, route) => {
    if (!acc[route.category]) acc[route.category] = [];
    acc[route.category].push(route);
    return acc;
  }, {} as Record<string, RouteTest[]>);

  return (
    <div 
      className="min-h-screen p-6"
      style={{
        backgroundColor: 'var(--color-bg-page)',
        paddingTop: 'calc(88px + 40px + var(--spacing-6))'
      }}
    >
      <div 
        className="mx-auto space-y-8"
        style={{ maxWidth: 'var(--constraint-content-max)' }}
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)'
            }}
          >
            Route Testing Dashboard
          </h1>
          <p 
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-muted)'
            }}
          >
            Test all application routes to ensure they're working correctly
          </p>
          
          {/* Status Summary */}
          <div className="flex justify-center gap-4 mt-6">
            <Badge variant="outline" className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--color-primary-default)' }}
              />
              Current Route
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--color-status-success)' }}
              />
              Working ({Array.from(routeResults.values()).filter(r => r.working).length})
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--color-status-danger)' }}
              />
              Errors ({Array.from(routeResults.values()).filter(r => !r.working).length})
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--color-text-muted)' }}
              />
              Untested ({routes.length - testedRoutes.size})
            </Badge>
          </div>

          {/* Test All Button */}
          <div className="mt-6">
            <Button 
              onClick={testAllRoutes}
              className="gap-2"
              style={{
                backgroundColor: 'var(--color-primary-default)',
                color: 'var(--color-primary-on)',
                height: '48px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <Icon name="play" size={16} />
              Test All Routes
            </Button>
          </div>

          {/* Auth Status */}
          <div className="mt-4">
            <Badge 
              variant={isAuthenticated ? "default" : "secondary"}
              className="text-sm py-1 px-3"
            >
              {isAuthenticated ? '🔒 Authenticated' : '🔓 Not Authenticated'}
            </Badge>
          </div>
        </div>

        {/* Route Categories */}
        {Object.entries(groupedRoutes).map(([category, categoryRoutes]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle 
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}
              >
                {category} Routes ({categoryRoutes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {categoryRoutes.map((route) => {
                  const { status, color } = getRouteStatus(route);
                  const result = routeResults.get(route.path);
                  
                  return (
                    <div
                      key={route.path}
                      className="p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: color,
                        borderWidth: currentRoute === route.path ? '2px' : '1px'
                      }}
                      onClick={() => testRoute(route)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span 
                            className="font-medium text-sm"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {route.name}
                          </span>
                        </div>
                        {route.requiresAuth && (
                          <Icon name="lock" size={12} style={{ color: 'var(--color-text-muted)' }} />
                        )}
                      </div>
                      
                      <p 
                        className="text-xs mb-2"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {route.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <code 
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'var(--color-bg-muted)',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          {route.path}
                        </code>
                        
                        {status === 'current' && (
                          <Badge variant="outline" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      
                      {result?.error && (
                        <div 
                          className="mt-2 text-xs p-2 rounded"
                          style={{
                            backgroundColor: 'var(--color-status-danger-light)',
                            color: 'var(--color-status-danger)'
                          }}
                        >
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Current Route Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current Route Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Path:</strong> {currentRoute}</p>
              <p><strong>Auth Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
              <p><strong>Total Routes:</strong> {routes.length}</p>
              <p><strong>Tested:</strong> {testedRoutes.size}</p>
              <p><strong>Working:</strong> {Array.from(routeResults.values()).filter(r => r.working).length}</p>
              <p><strong>Errors:</strong> {Array.from(routeResults.values()).filter(r => !r.working).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}