import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../shared/api/supabase-info';

/**
 * The portal's own session, deliberately separate from the member app's.
 *
 * Both surfaces are served from ikanhealth.in and the shared client stores its
 * session under one key, `sb-<project>-auth-token`. So signing in at /org also
 * signed you into /dashboard: an HR administrator who logged in to read
 * aggregate reports was, from that moment, a signed-in member of the product
 * they administer.
 *
 * That is wrong in both directions. An administrator should not acquire a
 * member session as a side effect of doing their job, and a member who happens
 * to administer their employer's account should have to sign in deliberately
 * before seeing anything about their colleagues. The whole premise of this
 * portal is that the two roles see different things; one session for both
 * makes that a UI convention rather than a boundary.
 *
 * The separation is a distinct `storageKey`. Same project, same anon key, two
 * clients that cannot see each other's session, because localStorage keys do
 * not overlap. Signing out of one leaves the other exactly as it was.
 *
 * `detectSessionInUrl` is OFF here: the member app's client already claims any
 * auth fragment in the URL, and two clients racing for the same one is how you
 * get a session landing in whichever happened to initialise first.
 */

const STORAGE_KEY = 'ikan-org-auth-token';

let client: SupabaseClient | null = null;

export function getOrgSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(`https://${projectId}.supabase.co`, publicAnonKey, {
      auth: {
        storageKey: STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

interface OrgAuthValue {
  user: User | null;
  isInitialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const OrgAuthContext = createContext<OrgAuthValue | undefined>(undefined);

export function useOrgAuth(): OrgAuthValue {
  const ctx = useContext(OrgAuthContext);
  if (!ctx) throw new Error('useOrgAuth must be used inside OrgAuthProvider');
  return ctx;
}

export function OrgAuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getOrgSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let live = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!live) return;
      setUser(data.session?.user ?? null);
      setIsInitialized(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsInitialized(true);
    });

    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<OrgAuthValue>(() => ({
    user,
    isInitialized,
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
    },
    /*
     * Local scope, always. A global sign-out would revoke this person's
     * sessions everywhere — including the member app on their phone, which
     * has nothing to do with closing an admin console on a laptop.
     */
    signOut: async () => {
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      setUser(null);
    },
  }), [supabase, user, isInitialized]);

  return <OrgAuthContext.Provider value={value}>{children}</OrgAuthContext.Provider>;
}
