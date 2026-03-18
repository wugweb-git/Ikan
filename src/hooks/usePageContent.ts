import { useState, useEffect, useRef } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { DEFAULT_CMS_CONTENT } from '../utils/cms-defaults';

export interface PageContent {
  title: string;
  content: string; // HTML content
  lastUpdated?: string;
  // Hero fields from page manager
  heroEnabled?: boolean;
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  heroOverlayOpacity?: number;
}

/**
 * Simple in-memory cache so repeated navigations / re-mounts don't
 * re-fetch the same CMS page within a single session.
 */
const contentCache: Record<string, { data: PageContent; ts: number }> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Stale-while-revalidate page content hook.
 *
 * 1. If a default exists in DEFAULT_CMS_CONTENT, it is returned **immediately**
 *    (no loading flash, no network dependency).
 * 2. A background fetch updates the content from the server if available.
 * 3. Network errors are silently swallowed — the user always sees content.
 */
export function usePageContent(pageId: string) {
  const hasDefault = pageId in DEFAULT_CMS_CONTENT;

  // Start with the cached server response or the baked-in default — never null when a default exists
  const initialContent = (): PageContent | null => {
    const cached = contentCache[pageId];
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.data;
    if (hasDefault) return DEFAULT_CMS_CONTENT[pageId];
    return null;
  };

  const [content, setContent] = useState<PageContent | null>(initialContent);
  // If we already have content (default or cached), don't show loading
  const [loading, setLoading] = useState(!content);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();

    // Skip fetch if cache is still fresh
    const cached = contentCache[pageId];
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      if (mountedRef.current) {
        setContent(cached.data);
        setLoading(false);
      }
      return () => { mountedRef.current = false; controller.abort(); };
    }

    const fetchContent = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/cms/pages/${pageId}`,
          {
            signal: controller.signal,
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!mountedRef.current) return;

        const page: PageContent = data.page || data;
        contentCache[pageId] = { data: page, ts: Date.now() };
        setContent(page);
        setError(null);
      } catch (err: any) {
        if (err?.name === 'AbortError') return;

        // If we already have content (default or previous cache), stay silent.
        // Only surface an error when there is NO fallback and NO cache.
        if (!mountedRef.current) return;

        if (!content && !hasDefault) {
          console.error(`usePageContent: failed to load "${pageId}" with no fallback:`, err);
          setError(err.message);
        }
        // else: silently keep showing existing content
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchContent();

    return () => {
      mountedRef.current = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  return { content, loading, error };
}