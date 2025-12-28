import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, User } from '../lib/api-client';
import { supabase } from '../lib/supabase-client'; // Use singleton client
import { isOfflineMode, offlineDemoUser } from '../lib/offline-fallbacks';
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
  recoverSession: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
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
              await supabase.auth.signOut().catch(() => {});
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
              await supabase.auth.signOut();
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
              corporate_user: false
            };
            setUser(quickUser);
            console.log('✅ Valid session found, user set:', quickUser.name);
            
            // Fetch full profile in background (single attempt)
            setTimeout(async () => {
              try {
                const { profile } = await apiClient.getProfile();
                if (profile && profile.user_id === quickUser.user_id) {
                  setUser(profile);
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
      console.log('Auth state changed:', event, session ? 'with session' : 'no session');
      
      // Handle different auth events
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
        console.log('🔄 User signed out or session invalid');
        setSession(null);
        setUser(null);
        return;
      }
      
      setSession(session);

      if (session?.user) {
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
          corporate_user: false
        };
        setUser(quickUser);
        console.log('🔄 Auth state: User signed in', quickUser.name);
        
        // Background profile fetch with simpler retry logic
        setTimeout(async () => {
          try {
            const { profile } = await apiClient.getProfile();
            if (profile && profile.user_id === quickUser.user_id) {
              setUser(profile);
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
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Fast sign-in with optimized flow
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Handle demo user creation separately to avoid blocking regular users
        if (error.message?.includes('Invalid login credentials') && 
            (email.includes('demo') || email === 'test@ikan.com') && 
            password === 'demo123') {
          
          // Try to create demo user quickly
          try {
            const userName = email === 'demo1@ikan.com' ? 'Alex Johnson' : 
                            email === 'demo2@ikan.com' ? 'Sam Rivera' : 
                            email === 'demo3@ikan.com' ? 'Jordan Chen' : 
                            email === 'test@ikan.com' ? 'Test User' : 'Demo User';
            
            console.log(`Creating demo user: ${userName} (${email})`);
            await apiClient.signUp(email, password, userName);
            
            // Reduced wait time for better UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Retry sign-in
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (retryError) {
              throw new Error('Demo user creation failed - please try again');
            }
            
            // Set session and user immediately for demo
            if (retryData.session && retryData.user) {
              setSession(retryData.session);
              setUser({
                user_id: retryData.user.id,
                email: retryData.user.email || email,
                name: retryData.user.user_metadata?.name || userName,
                phone: retryData.user.user_metadata?.phone,
                corporate_user: false
              });
              console.log('✅ Demo user created and signed in successfully');
              return;
            }
          } catch (demoError) {
            console.error('Demo user creation failed:', demoError);
            throw new Error('Demo user setup failed. Please try again.');
          }
        }
        
        // Improve error message for demo users
        if (email === 'demo@ikan.com' && password !== 'demo123') {
          throw new Error('Demo password is "demo123". Please use the correct demo credentials.');
        }
        
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
          corporate_user: false
        };
        setUser(immediateUser);
        
        // Fetch full profile in background (non-blocking)
        setTimeout(async () => {
          try {
            const { profile } = await apiClient.getProfile();
            setUser(profile); // Update with full profile when available
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
      
      await apiClient.signUp(email, password, name, phone);
      // After signup, automatically sign in
      await signIn(email, password);
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
      
      // Use Supabase social auth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error(`${provider} sign-in error:`, error);
        throw new Error(`Failed to sign in with ${provider}. Please try again or contact support.`);
      }
      
      // Note: The actual sign-in completion will be handled by the auth state change listener
      // since OAuth redirects the user away and back
      
    } catch (error) {
      console.error(`${provider} sign-in error:`, error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await apiClient.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const { profile } = await apiClient.updateProfile(updates);
      setUser(profile);
    } catch (error) {
      console.error('Update profile error:', error);
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
          await supabase.auth.signOut().catch(() => {});
          setSession(null);
          setUser(null);
          return false;
        }

        console.log('❌ Session check error during recovery:', sessionError);
        await supabase.auth.signOut();
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
            await supabase.auth.signOut();
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
              corporate_user: false
            };
            setUser(recoveredUser);
            console.log('✅ Session recovered with refresh');
            return true;
          }
        } catch (refreshError) {
          console.log('❌ Session refresh error during recovery:', refreshError);
          await supabase.auth.signOut();
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
            corporate_user: false
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
        await supabase.auth.signOut();
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
    recoverSession,
    resetPassword,
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