import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { Icon } from '../Icon';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface PrivateRouteTestProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

export function PrivateRouteTest({ className, onNavigate }: PrivateRouteTestProps) {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});

  // Private routes to test
  const privateRoutes = [
    { path: '/dashboard', name: 'Dashboard', description: 'Main user dashboard with mood tracker and quick actions', icon: 'home' },
    { path: '/mood-journal', name: 'Mood Journal', description: 'Daily mood tracking with calendar and entry forms', icon: 'heart' },
    { path: '/assessments', name: 'Assessments', description: 'Mental health assessments with PHQ-9, GAD-7, etc.', icon: 'clipboard' },
    { path: '/equip-programs', name: 'Equip Programs', description: 'Therapeutic programs with payment integration', icon: 'play' },
    { path: '/consultation', name: 'Consultation', description: 'Professional mental health consultations', icon: 'message' },
    { path: '/library', name: 'Library', description: 'Resource library with articles, videos, and tools', icon: 'article' },
    { path: '/account', name: 'Account', description: 'User profile and account management', icon: 'user' }
  ];

  // Assessment and program flow routes
  const flowRoutes = [
    { path: '/assessment-landing', name: 'Assessment Landing', description: 'Assessment preparation and information', icon: 'info' },
    { path: '/assessment-flow', name: 'Assessment Flow', description: 'Interactive assessment questions', icon: 'assignment' },
    { path: '/assessment-results', name: 'Assessment Results', description: 'Assessment results and recommendations', icon: 'checkCircle' },
    { path: '/equip-programs-landing', name: 'Program Landing', description: 'Program details and enrollment', icon: 'play' },
    { path: '/equip-program-onboarding', name: 'Program Onboarding', description: 'Program setup and preparation', icon: 'star' },
    { path: '/equip-program-flow', name: 'Program Flow', description: 'Interactive program content', icon: 'playCircle' },
    { path: '/equip-program-completion', name: 'Program Completion', description: 'Program completion and next steps', icon: 'medal' }
  ];

  const testRoute = async (route: string) => {
    if (!onNavigate) {
      showToast('error', 'Navigation Error', 'Navigation function not available');
      return;
    }

    setTestResults(prev => ({ ...prev, [route]: 'pending' }));

    try {
      // Simulate navigation test
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to the route
      onNavigate(route);
      
      setTestResults(prev => ({ ...prev, [route]: 'success' }));
      showToast('success', 'Navigation Test', `Successfully navigated to ${route}`);
    } catch (error) {
      setTestResults(prev => ({ ...prev, [route]: 'error' }));
      showToast('error', 'Navigation Failed', `Failed to navigate to ${route}`);
    }
  };

  const testAllRoutes = async () => {
    showToast('info', 'Starting Tests', 'Testing all private routes...');
    
    for (const route of [...privateRoutes, ...flowRoutes]) {
      await testRoute(route.path);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    showToast('success', 'Tests Complete', 'All route tests completed');
  };

  const getStatusBadge = (status: 'pending' | 'success' | 'error' | undefined) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Icon name="loader" size={12} className="animate-spin" />Testing</Badge>;
      case 'success':  
        return <Badge variant="secondary" className="gap-1" style={{ backgroundColor: 'var(--color-status-success-light)', color: 'var(--color-status-success)' }}><Icon name="check" size={12} />Success</Badge>;
      case 'error':
        return <Badge variant="destructive" className="gap-1"><Icon name="x" size={12} />Failed</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  return (
    <div className={cn("w-full space-y-6", className)} style={{ maxWidth: 'var(--constraint-content-max)', margin: '0 auto', padding: 'var(--spacing-4)' }}>
      {/* Header */}
      <div className="space-y-2">
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
          Private Route Navigation Test
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Test all private route screens and user journey flows
        </p>
      </div>

      {/* User Status */}
      <Card style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-card)' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="user" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Badge variant="secondary" style={{ backgroundColor: 'var(--color-status-success-light)', color: 'var(--color-status-success)' }}>
                  Authenticated
                </Badge>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Logged in as {user.name || user.email}
                </span>
              </>
            ) : (
              <>
                <Badge variant="destructive">Not Authenticated</Badge>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Please log in to access private routes
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-card)' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="play" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Test Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testAllRoutes}
            disabled={!user || !onNavigate}
            className="w-full gap-2"
            style={{ 
              backgroundColor: 'var(--color-primary-default)', 
              color: 'var(--color-primary-on)',
              borderRadius: 'var(--radius-md)',
              minHeight: '48px'
            }}
          >
            <Icon name="zap" size={16} />
            Test All Routes
          </Button>
        </CardContent>
      </Card>

      {/* Main Private Routes */}
      <Card style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-card)' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="home" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Main Private Routes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {privateRoutes.map((route) => (
            <div key={route.path} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--color-border-default)' }}>
              <div className="flex items-center gap-3 flex-1">
                <Icon name={route.icon as any} size={20} style={{ color: 'var(--color-text-muted)' }} />
                <div className="flex-1">
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                    {route.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {route.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(testResults[route.path])}
                <Button
                  onClick={() => testRoute(route.path)}
                  disabled={!user || !onNavigate || testResults[route.path] === 'pending'}
                  size="sm"
                  variant="outline"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  Test
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Flow Routes */}
      <Card style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-card)' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="playCircle" size={20} style={{ color: 'var(--color-primary-default)' }} />
            User Journey Flows
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {flowRoutes.map((route) => (
            <div key={route.path} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--color-border-default)' }}>
              <div className="flex items-center gap-3 flex-1">
                <Icon name={route.icon as any} size={20} style={{ color: 'var(--color-text-muted)' }} />
                <div className="flex-1">
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                    {route.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {route.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(testResults[route.path])}
                <Button
                  onClick={() => testRoute(route.path)}
                  disabled={!user || !onNavigate || testResults[route.path] === 'pending'}
                  size="sm"
                  variant="outline"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  Test
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}