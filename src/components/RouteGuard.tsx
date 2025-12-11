import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isPublicRoute, requiresAuth, DEFAULT_PUBLIC_ROUTE } from '../lib/route-config';
import LoginScreen from './LoginScreen';

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

  // Check if current route requires authentication
  const routeRequiresAuth = requiresAuth(currentRoute);
  const routeIsPublic = isPublicRoute(currentRoute);

  // If user is not authenticated and trying to access a private route
  if (!user && routeRequiresAuth) {
    return (
      <LoginScreen 
        onSuccess={() => onNavigate('/dashboard')}
        reason="auth-required"
        redirectRoute={currentRoute}
      />
    );
  }

  // If user is authenticated but on invalid route, redirect to dashboard
  if (user && !routeIsPublic && !routeRequiresAuth) {
    // This shouldn't happen with our route config, but just in case
    setTimeout(() => onNavigate('/dashboard'), 0);
    return null;
  }

  // If no user and trying to access invalid public route, redirect to default public route
  if (!user && !routeIsPublic && !routeRequiresAuth) {
    setTimeout(() => onNavigate(DEFAULT_PUBLIC_ROUTE), 0);
    return null;
  }

  // Route is accessible, render children
  return <>{children}</>;
}