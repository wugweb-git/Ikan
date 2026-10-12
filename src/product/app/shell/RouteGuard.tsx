import React from 'react';
import { useAuth } from '../../../shared/state/AuthContext';
import { requiresAuth } from '../ui/route-config';
import { APP_ORIGIN } from './app-host';

interface RouteGuardProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

export function RouteGuard({ currentRoute, onNavigate: _onNavigate, children }: RouteGuardProps) {
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

  /*
   * A member route reached without a session goes to the member app, not to a
   * login screen on this host.
   *
   * There is no member login here any more — ikanhealth.in serves marketing,
   * the admin console and the organisation portal, and every member route
   * 301s to app.ikanhealth.in at the edge. This branch only catches an
   * in-app navigation, which never touches the edge rule, so it has to do the
   * same thing itself.
   */
  if (!user && routeRequiresAuth) {
    if (typeof window !== 'undefined') window.location.replace(`${APP_ORIGIN}/login`);
    return null;
  }

  // Route is accessible, render children
  return <>{children}</>;
}