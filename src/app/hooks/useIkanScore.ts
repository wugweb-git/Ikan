// useIkanScore — fetches the composite iKAN wellness score from the server
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../shared/api-client';

export interface IkanScoreBreakdown {
  assessments: { score: number; weight: number; count: number; details: Array<{ id: string; name: string; wellness: number }> };
  mood:        { score: number; weight: number; entries: number; avgRating: number; consistency: number };
  programs:    { score: number; weight: number; active: number; completed: number; avgProgress: number };
  engagement:  { score: number; weight: number; recentDays: number };
}

export interface IkanScoreData {
  score: number;
  breakdown: IkanScoreBreakdown;
  trend: number;
  trendLabel: string;
  hasData: boolean;
  computedAt: string;
}

export function useIkanScore(enabled: boolean = true) {
  const [data, setData] = useState<IkanScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.getIkanScore();
      setData(result as IkanScoreData);
    } catch (err: any) {
      // Suppress network errors (server unreachable) — they're transient and noisy
      const msg = err?.message?.toLowerCase() || '';
      const isNetworkError = err?.name === 'TypeError' && msg.includes('failed to fetch');
      if (!isNetworkError) {
        console.error('Failed to fetch iKAN Score:', err);
      }
      setError(err.message || 'Failed to load score');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  return { data, loading, error, refetch: fetchScore };
}