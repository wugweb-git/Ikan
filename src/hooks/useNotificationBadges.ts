/**
 * useNotificationBadges — polls /badge-counts for real notification badges.
 * Returns a Record<string, number> mapping routes to badge counts.
 */
import { useState, useEffect, useRef } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;
const POLL_INTERVAL_MS = 60_000; // 1 minute

export function useNotificationBadges(): Record<string, number> {
  const { session, isAuthenticated } = useAuth();
  const [badges, setBadges] = useState<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !session?.access_token) {
      setBadges({});
      return;
    }

    const fetchBadges = async () => {
      try {
        const res = await fetch(`${API_BASE}/badge-counts`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setBadges(data || {});
        }
      } catch {
        // Silent — badges are non-critical
      }
    };

    // Fetch immediately, then poll
    fetchBadges();
    intervalRef.current = setInterval(fetchBadges, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, session?.access_token]);

  return badges;
}
