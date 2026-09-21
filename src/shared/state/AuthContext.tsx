import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { apiClient, User } from '../api/api';
import { supabase, signOutLocal } from '../api/supabase'; // Use singleton client
import { clearUserScopedStorage } from '../api/user-storage';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signInWithProvider: (provider: 'google' | 'linkedin_oidc' | 'apple') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  recoverSession: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  /**
   * The signed-in user's admin status as reported by the SERVER profile
   * (`GET /users/profile`). `null` means not yet verified for the current
   * user — e.g. only the cached `ikan_is_admin_{uid}` hint is known, which
   * must never be used to decide whether admin UI renders.
   */
  verifiedIsAdmin: boolean | null;
  /** Fetch the profile now (if not already verified) and resolve to the server's is_admin. Throws if the profile cannot be loaded. */
  verifyAdmin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  // Admin status taken only from a server-loaded profile, keyed by user id so a
  // stale value can never apply to a different account.
  const [verifiedAdmin, setVerifiedAdminState] = useState<{ userId: string; isAdmin: boolean } | null>(null);
  // Mirror for verifyAdmin(), which may run from a closure captured before the
  // latest render (e.g. straight after signIn() in the admin login screen).
  const verifiedAdminRef = useRef<{ userId: string; isAdmin: boolean } | null>(null);
  const setVerifiedAdmin = useCallback((v: { userId: string; isAdmin: boolean } | null) => {
    verifiedAdminRef.current = v;
    setVerifiedAdminState(v);
  }, []);

  /** Record a profile that came back from the server. */
  const applyServerProfile = useCallback((profile: User) => {
    setUser(profile);
    setVerifiedAdmin({ userId: profile.user_id, isAdmin: profile.is_admin === true });
    // Cache is_admin for instant (non-authoritative) hints on next load
    try { localStorage.setItem(`ikan_is_admin_${profile.user_id}`, profile.is_admin ? 'true' : 'false'); } catch {}
  }, [setVerifiedAdmin]);
  
  // Computed value for authentication status
  const isAuthenticated = !!(session && user);

  useEffect(() => {
    // Ultra-fast initialization to prevent hanging
    const initialize = async () => {
      console.log('🚀 Initializing authentication...');
      
      // Try immediate initialization first
      try {
        // Set initialized immediately to prevent blocking
        setLoading(false);
        setIsInitialized(true);
        console.log('✅ Auth immediately initialized');
        
        // Continue with session check in background
        try {
          // Background session check (non-blocking) with longer timeout
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout')), 10000) // Increased to 10 seconds
          );
          
          const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
          
          if (error) {
            // specific handling for invalid refresh token
            if (error.message && (
              error.message.includes('Invalid Refresh Token') || 
              error.message.includes('Refresh Token Not Found') ||
              error.message.includes('not found')
            )) {
              console.log('🔄 Detected invalid refresh token, clearing session...');
              await signOutLocal().catch(() => {});
              setSession(null);
              setUser(null);
              return;
            }
            
            console.warn('Session error during background check:', error);
            return; // Don't block, just skip session setup
          }
          
          // Validate session before using it
          if (session?.access_token && session?.expires_at) {
            const now = Math.floor(Date.now() / 1000);
            const expiresAt = session.expires_at;
            
            // If token is expired, clear it
            if (expiresAt <= now) {
              console.log('🔄 Session expired during background check, clearing...');
              await signOutLocal();
              return;
            }
            
            // Session is valid
            setSession(session);
            
            // Set user immediately with auth data
            const quickUser = {
              user_id: session.user.id,
              email: session.user.email || 'User',
              name: session.user.user_metadata?.name || 'User',
              phone: session.user.user_metadata?.phone,
              corporate_user: false,
              is_admin: (() => { try { return localStorage.getItem(`ikan_is_admin_${session.user.id}`) === 'true'; } catch { return false; } })()
            };
            setUser(quickUser);
            console.log('✅ Valid session found, user set:', quickUser.name);
            
            // Fetch full profile in background (single attempt)
            setTimeout(async () => {
              try {
                const profile = await apiClient.getProfile();
                if (profile && profile.user_id === quickUser.user_id) {
                  applyServerProfile(profile);
                  console.log('✅ Full profile loaded successfully');
                }
              } catch (error) {
                console.log('📦 Profile fetch failed during initialization - keeping quick user data');
              }
            }, 1000);
          } else {
            // No valid session during background check
            console.log('🔐 No valid session found during background check');
          }
        } catch (innerError) {
          // Silent handling - only log if it's not a timeout
          const errorMessage = innerError instanceof Error ? innerError.message : String(innerError);
          if (!errorMessage.includes('Session check timeout')) {
            console.warn('Background session check error (non-blocking):', innerError);
          }
          // Timeout errors are completely ignored - this is expected on slow networks
        }
      } catch (outerError) {
        const errorMessage = outerError instanceof Error ? outerError.message : String(outerError);
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Session check timeout')) {
          console.log('🌐 Session check failed due to network issues (non-blocking):', errorMessage);
        } else {
          console.log('Background session setup failed (non-blocking):', outerError);
        }
      }
    };

    initialize();

    // Set up auth listener for ongoing auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log('Auth state changed:', event, session ? 'with session' : 'no session');
        
        // Handle different auth events
        if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
          console.log('Auth: User signed out or session invalid');
          // Covers every way a session ends — the button, a defensive
          // signOutLocal, or a sign-out in another tab — not just signOut().
          clearUserScopedStorage();
          setSession(null);
          setUser(null);
          setVerifiedAdmin(null);
          return;
        }
        
        setSession(session);

        if (session?.user) {
          // Log login activity if this is a fresh sign in
          if (event === 'SIGNED_IN') {
            apiClient.logActivity('login').catch(e => console.log('Login logging failed', e));
          }

          // Validate session before using it
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at && session.expires_at <= now) {
            console.log('🔄 Session expired in auth listener');
            setSession(null);
            setUser(null);
            return;
          }
          
          // Quick user setup
          const quickUser = {
            user_id: session.user.id,
            email: session.user.email || 'User',
            name: session.user.user_metadata?.name || 'User',
            phone: session.user.user_metadata?.phone,
            corporate_user: false,
            is_admin: (() => { try { return localStorage.getItem(`ikan_is_admin_${session.user.id}`) === 'true'; } catch { return false; } })()
          };
          setUser(quickUser);
          console.log('🔄 Auth state: User signed in', quickUser.name);
          
          // Background profile fetch with simpler retry logic
          setTimeout(async () => {
            try {
              const profile = await apiClient.getProfile();
              if (profile && profile.user_id === quickUser.user_id) {
                applyServerProfile(profile);
                console.log('✅ Profile loaded via auth listener');
              }
            } catch (error) {
              console.log('📦 Profile fetch via auth listener failed - keeping quick user data');
            }
          }, 500);
        } else {
          console.log('🔄 Auth state: User signed out');
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
      }
    });

    return () => subscription.unsubscribe();
    // Both are stable (useCallback with stable deps), so this still runs once.
  }, [applyServerProfile, setVerifiedAdmin]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Fast sign-in with optimized flow
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Production behaviour: a failed login returns the real error.
        // (Removed the prototype "auto-create account on any failed login" path.)
        throw new Error(error.message || 'Invalid email or password');
      }
      
      // Fast success path - set session immediately
      if (data.session && data.user) {
        setSession(data.session);
        
        // Set user immediately with auth data, fetch profile in background
        const immediateUser = {
          user_id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || 'User',
          phone: data.user.user_metadata?.phone,
          corporate_user: false,
          is_admin: (() => { try { return localStorage.getItem(`ikan_is_admin_${data.user.id}`) === 'true'; } catch { return false; } })()
        };
        setUser(immediateUser);
        
        // Fetch full profile in background (non-blocking)
        setTimeout(async () => {
          try {
            const profile = await apiClient.getProfile();
            if (profile && profile.user_id === immediateUser.user_id) {
              applyServerProfile(profile);
              console.log('✅ Full profile loaded after sign-in');
            }
          } catch (error) {
            console.log('Background profile fetch failed:', error);
            // Keep using the immediate user data
          }
        }, 100);
        
      } else {
        throw new Error('Authentication failed - no session returned');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    try {
      setLoading(true);

      // Edge endpoint creates the auth user (unconfirmed) + the KV profile.
      await apiClient.signUp(email, password, name, phone);

      // Try to sign in. If the project requires email confirmation, this fails
      // with "Email not confirmed" — in that case send the verification email
      // and surface a needs-confirmation signal instead of logging in.
      try {
        await signIn(email, password);
      } catch (e: any) {
        if (/not confirmed|confirm your email|email not confirmed/i.test(e?.message || '')) {
          await supabase.auth.resend({
            type: 'signup',
            email,
            options: { emailRedirectTo: `${window.location.origin}/login` },
          }).catch(() => {});
          const err: any = new Error('Almost there! Check your email to verify your account, then sign in.');
          err.needsConfirmation = true;
          throw err;
        }
        throw e;
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: 'google' | 'linkedin_oidc' | 'apple') => {
    try {
      setLoading(true);

      // Detect if we're in an iframe (e.g. Figma Make preview) — use popup flow
      const isInIframe = window.self !== window.top;

      if (isInIframe) {
        // Popup-based OAuth: get the URL without redirecting, then open in a popup
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/`,
            skipBrowserRedirect: true,
          },
        });

        if (error || !data?.url) {
          console.error(`${provider} sign-in error (popup):`, error);
          throw new Error(error?.message || `Failed to start ${provider} sign-in.`);
        }

        // Open OAuth in a popup window
        const width = 500;
        const height = 700;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;
        const popup = window.open(
          data.url,
          `${provider}-oauth`,
          `width=${width},height=${height},left=${left},top=${top},popup=yes,toolbar=no,menubar=no`
        );

        if (!popup) {
          // Popup blocked — fall back to new tab
          window.open(data.url, '_blank');
          console.warn('Popup was blocked — opened OAuth in new tab. Close the tab after signing in.');
        }

        // Poll for session completion (the popup will store tokens in localStorage via Supabase)
        const pollInterval = setInterval(async () => {
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session) {
              clearInterval(pollInterval);
              setSession(sessionData.session);
              const quickUser = {
                user_id: sessionData.session.user.id,
                email: sessionData.session.user.email || 'User',
                name: sessionData.session.user.user_metadata?.name || 'User',
                phone: sessionData.session.user.user_metadata?.phone,
                corporate_user: false,
                is_admin: (() => { try { return localStorage.getItem(`ikan_is_admin_${sessionData.session.user.id}`) === 'true'; } catch { return false; } })()
              };
              setUser(quickUser);
              setLoading(false);
              console.log(`✅ ${provider} OAuth completed via popup`);

              // Close popup if still open
              if (popup && !popup.closed) popup.close();

              // Fetch full profile in background
              setTimeout(async () => {
                try {
                  const profile = await apiClient.getProfile();
                  if (profile && profile.user_id === quickUser.user_id) {
                    applyServerProfile(profile);
                  }
                } catch (_e) { /* silent */ }
              }, 1000);
            }
          } catch (_e) { /* silent */ }
        }, 1500);

        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          setLoading(false);
        }, 300000);

        return; // Don't fall through to loading(false)
      }

      // Standard redirect-based OAuth (works on deployed sites)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error(`${provider} sign-in error:`, error);
        throw new Error(`Failed to sign in with ${provider}. Please try again or contact support.`);
      }

      // The actual sign-in completion is handled by onAuthStateChange
      // since OAuth redirects the user away and back
      console.log(`${provider} OAuth redirect initiated`, data?.url ? '→ redirecting' : '');

    } catch (error) {
      console.error(`${provider} sign-in error:`, error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Clear cached is_admin before signing out
      if (user?.user_id) {
        try { localStorage.removeItem(`ikan_is_admin_${user.user_id}`); } catch {}
      }
      clearUserScopedStorage();
      await apiClient.signOut();
      setUser(null);
      setSession(null);
      setVerifiedAdmin(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const profile = await apiClient.updateProfile(updates);
      if (profile && profile.user_id) {
        applyServerProfile(profile);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await apiClient.getProfile();
      if (profile && profile.user_id) {
        applyServerProfile(profile);
      }
    } catch (error) {
      console.error('Refresh profile error:', error);
      throw error;
    }
  };

  const recoverSession = async (): Promise<boolean> => {
    try {
      console.log('🔧 Attempting session recovery...');
      
      // First check if we have any session at all
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        // Handle invalid refresh token explicitly
        if (sessionError.message && (
          sessionError.message.includes('Invalid Refresh Token') || 
          sessionError.message.includes('Refresh Token Not Found')
        )) {
          console.log('🔄 Invalid refresh token during recovery, forcing signout');
          await signOutLocal().catch(() => {});
          setSession(null);
          setUser(null);
          return false;
        }

        console.log('❌ Session check error during recovery:', sessionError);
        await signOutLocal();
        setSession(null);
        setUser(null);
        return false;
      }
      
      // If no session exists, can't recover
      if (!currentSession) {
        console.log('🔐 No session to recover');
        setSession(null);
        setUser(null);
        return false;
      }
      
      // Check if current session is expired
      const now = Math.floor(Date.now() / 1000);
      if (currentSession.expires_at && currentSession.expires_at <= now) {
        console.log('⏰ Current session is expired, attempting refresh...');
        
        try {
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !refreshedSession) {
            console.log('❌ Session refresh failed during recovery:', refreshError);
            await signOutLocal();
            setSession(null);
            setUser(null);
            return false;
          }
          
          // Use refreshed session
          setSession(refreshedSession);
          
          if (refreshedSession.user) {
            const recoveredUser = {
              user_id: refreshedSession.user.id,
              email: refreshedSession.user.email || 'User',
              name: refreshedSession.user.user_metadata?.name || 'User',
              phone: refreshedSession.user.user_metadata?.phone,
              corporate_user: false,
              is_admin: (() => { try { return localStorage.getItem(`ikan_is_admin_${refreshedSession.user.id}`) === 'true'; } catch { return false; } })()
            };
            setUser(recoveredUser);
            console.log('✅ Session recovered with refresh');
            return true;
          }
        } catch (refreshError) {
          console.log('❌ Session refresh error during recovery:', refreshError);
          await signOutLocal();
          setSession(null);
          setUser(null);
          return false;
        }
      } else {
        // Current session is still valid
        setSession(currentSession);
        
        if (currentSession.user) {
          const recoveredUser = {
            user_id: currentSession.user.id,
            email: currentSession.user.email || 'User',
            name: currentSession.user.user_metadata?.name || 'User',
            phone: currentSession.user.user_metadata?.phone,
            corporate_user: false,
            is_admin: (() => { try { return localStorage.getItem(`ikan_is_admin_${currentSession.user.id}`) === 'true'; } catch { return false; } })()
          };
          setUser(recoveredUser);
          console.log('✅ Session recovered (was still valid)');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.log('❌ Session recovery error:', error);
      // Clear everything on error
      try {
        await signOutLocal();
      } catch (signOutError) {
        console.warn('Error during cleanup signout:', signOutError);
      }
      setSession(null);
      setUser(null);
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        throw new Error('Failed to send password reset email. Please check your email address and try again.');
      }
      
      console.log('✅ Password reset email sent successfully');
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifiedIsAdmin =
    user && verifiedAdmin && verifiedAdmin.userId === user.user_id ? verifiedAdmin.isAdmin : null;

  const verifyAdmin = async (): Promise<boolean> => {
    // Resolve against the CURRENT session, not this render's `user`, so a
    // result cached for a previous account can never be reused.
    const { data } = await supabase.auth.getSession();
    const uid = data?.session?.user?.id;
    if (!uid) return false;
    const cached = verifiedAdminRef.current;
    if (cached && cached.userId === uid) return cached.isAdmin;
    const profile = await apiClient.getProfile();
    if (!profile || profile.user_id !== uid) throw new Error('Could not load your profile.');
    applyServerProfile(profile);
    return profile.is_admin === true;
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    isInitialized,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    updateProfile,
    refreshProfile,
    recoverSession,
    resetPassword,
    verifiedIsAdmin,
    verifyAdmin,
  };

  // Periodic session validation (every 5 minutes)
  useEffect(() => {
    const validateSession = async () => {
      if (session && session.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        if (now >= session.expires_at) {
          console.log('🧹 Session expired during validation, clearing state');
          setSession(null);
          setUser(null);
        }
      }
    };

    const interval = setInterval(validateSession, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}