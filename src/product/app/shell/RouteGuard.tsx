import React, { lazy, Suspense } from 'react';
import { useAuth } from '../../../shared/state/AuthContext';
import { requiresAuth } from '../ui/route-config';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// Lazy-load LoginScreen to prevent it from being eagerly evaluated
const LoginScreen = lazy(() => import('./LoginScreen'));

interface RouteGuardProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

export function RouteGuard({ currentRoute, onNavigate, children }: RouteGuardProps) {
  const { user, isInitialized } = useAuth();

  // Show loading while auth state is being determined
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div 
            className="animate-spin w-8 h-8 border-2 border-solid rounded-full mx-auto"
            style={{
              borderColor: 'var(--color-border-default)',
              borderTopColor: 'var(--color-primary-default)'
            }}
          />
          <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Admin routes handle their own auth flow (AdminLoginScreen)
  if (currentRoute.startsWith('/admin')) {
    return <>{children}</>;
  }

  // Check if current route requires authentication
  const routeRequiresAuth = requiresAuth(currentRoute);

  // If user is not authenticated and trying to access a private route
  if (!user && routeRequiresAuth) {
    return (
      <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
        <LoginScreen 
          onSuccess={() => onNavigate(currentRoute)}
          onNavigate={onNavigate}
          reason="auth-required"
          redirectRoute={currentRoute}
        />
      </Suspense>
    );
  }

  // Route is accessible, render children
  return <>{children}</>;
}