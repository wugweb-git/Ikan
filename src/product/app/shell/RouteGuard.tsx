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
  const { isInitialized } = useAuth();

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
   * A member route leaves this host — signed in or not.
   *
   * The earlier version only redirected when there was NO session, which
   * missed the case that actually happens: the only people with a session
   * here are admins, and for them `user` is set, so every member route
   * rendered normally. ikanhealth.in served a working member dashboard to
   * exactly the people most likely to open it.
   *
   * The edge 301s in `vercel.json` cannot cover this either — an in-app
   * navigation never makes a request — so the rule has to exist in both
   * places. Admin routes are the exception and are returned above.
   */
  if (routeRequiresAuth) {
    if (typeof window !== 'undefined') window.location.replace(`${APP_ORIGIN}/login`);
    return null;
  }

  // Route is accessible, render children
  return <>{children}</>;
}