import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface PageContent {
  title: string;
  content: string; // HTML content
  lastUpdated?: string;
}

export function usePageContent(pageId: string) {
  const [content, setContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/cms/pages/${pageId}`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch page content');
        }
        
        const data = await response.json();
        setContent(data);
      } catch (err: any) {
        console.error(`Error fetching content for ${pageId}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [pageId]);

  return { content, loading, error };
}
