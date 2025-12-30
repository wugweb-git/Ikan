import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { DEFAULT_CMS_CONTENT } from '../utils/cms-defaults';

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
          throw new Error(`Failed to fetch page content: ${response.status}`);
        }
        
        const data = await response.json();
        setContent(data.page || data);
      } catch (err: any) {
        console.warn(`Error fetching content for ${pageId}, falling back to default:`, err);
        
        // Fallback to default content if available
        if (DEFAULT_CMS_CONTENT[pageId]) {
          setContent(DEFAULT_CMS_CONTENT[pageId]);
          // We don't set error here because we successfully fell back
          setError(null);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [pageId]);

  return { content, loading, error };
}
