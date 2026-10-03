import { useState, useEffect } from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useIsMobile } from '../ui/hooks/useIsMobile';
import { useNotifications } from '../../../shared/state/NotificationContext';
import { useAuth } from '../../../shared/state/AuthContext';
import { hasAnalyticsConsent } from '../shell/analytics-consent';
import { apiClient } from '../../../shared/api/api';
import { resolveImageUrl } from '../ui/lib/image-utils';
import { copyToClipboard } from '../ui/lib/clipboard';

// Import dynamic UI blocks
import { ResourceHero } from '../ui/blocks/ResourceHero';
import { ResourceContent } from '../ui/blocks/ResourceContent';
import { ResourceBlock } from '../ui/blocks/ResourceBlock';
import { ResourceAuthor } from '../ui/blocks/ResourceAuthor';
import { ResourceCategory } from '../ui/blocks/ResourceCategory';
import { ResourceTypeLabel } from '../ui/blocks/ResourceTypeLabel';
import { ResourceTags } from '../ui/blocks/ResourceTags';
import { sanitizeHtml } from '../ui/lib/sanitize';

interface ResourceDetailProps {
  resourceId: string;
  onBack?: () => void;
  onNavigate?: (route: string) => void;
  onResourceSelect?: (id: string) => void;
  className?: string;
}

interface ResourceContent {
  id: string;
  title: string;
  description: string;
  category: string;
  contentType: string;
  readTimeMinutes: number;
  author?: string;
  publishedDate?: string;
  content: Array<{
    type: 'paragraph' | 'heading' | 'list' | 'quote' | 'tip' | 'html';
    content: string;
    items?: string[];
    html?: string;
  }>;
  tags: string[];
  relatedResources: Array<{
    id: string;
    title: string;
    category: string;
    readTimeMinutes: number;
    image?: string;
    description?: string;
    publishedDate?: string;
  }>;
  heroImage?: string;
  authorImage?: string;
}

export function ResourceDetail({ resourceId, onBack, onNavigate, onResourceSelect, className }: ResourceDetailProps) {
  const isMobile = useIsMobile();
  const { showToast } = useNotifications();
  const { user } = useAuth();
  
  const [resource, setResource] = useState<ResourceContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [readProgress, setReadProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [readingTime, setReadingTime] = useState(0);

  // Transform API data to match ResourceContent interface
  const transformResourceData = (apiData: any): ResourceContent => {
    console.log('🔄 Transforming resource data:', apiData);
    
    // Map thumbnail to heroImage
    const heroImageUrl = resolveImageUrl(apiData.thumbnail || apiData.heroImage || apiData.image || apiData.image_url);
    console.log('🖼️ Hero image URL:', heroImageUrl);
    
    return {
      id: apiData.id,
      title: apiData.title || 'Untitled Resource',
      description: apiData.description || '',
      category: apiData.category || 'General',
      // contentType is the format badge (Video/Audio/Podcast/Article) — it must
      // win over category here, or every resource's badge silently shows its
      // topic category instead of its format (category is near-always populated,
      // so the old `category || contentType` order meant contentType never won).
      contentType: apiData.contentType || apiData.category || 'Article',
      readTimeMinutes: apiData.readTime || apiData.read_time_minutes || 5,
      author: apiData.author || 'iKan Team',
      publishedDate: apiData.created_at 
        ? new Date(apiData.created_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      
      // Convert HTML content string to blocks array
      content: parseContentToBlocks(apiData.content || ''),
      
      tags: apiData.tags || [],
      relatedResources: apiData.relatedResources || [],
      heroImage: heroImageUrl,
      authorImage: apiData.authorImage
    };
  };

  // Parse HTML content to structured blocks - now preserves rich formatting
  const parseContentToBlocks = (htmlContent: string): Array<{
    type: 'paragraph' | 'heading' | 'list' | 'quote' | 'tip' | 'html';
    content: string;
    items?: string[];
    html?: string;
  }> => {
    if (!htmlContent) return [];
    
    console.log('📝 Parsing content, length:', htmlContent.length);
    
    const blocks: any[] = [];
    const tempDiv = document.createElement('div');
    // Sanitise BEFORE parsing: even a detached element fetches <img src> and
    // fires onerror, so raw assignment would already execute injected script.
    tempDiv.innerHTML = sanitizeHtml(htmlContent);
    
    // Check if we have structured HTML (with headers, lists, etc.)
    const hasStructure = htmlContent.includes('<h') || htmlContent.includes('<ul') || htmlContent.includes('<ol');
    
    if (hasStructure) {
      // Parse structured content
      tempDiv.childNodes.forEach((node: any) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName.toLowerCase();
          
          if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
            blocks.push({ 
              type: 'heading', 
              content: node.textContent?.trim() || '',
              html: node.innerHTML
            });
          } else if (tagName === 'p') {
            if (node.innerHTML.trim()) {
              blocks.push({ 
                type: 'html', 
                content: node.textContent?.trim() || '',
                html: node.innerHTML // Preserve formatting like <strong>, <em>, <a>
              });
            }
          } else if (tagName === 'ul' || tagName === 'ol') {
            const items = Array.from(node.querySelectorAll('li')).map((li: any) => li.textContent?.trim() || '');
            if (items.length > 0) {
              blocks.push({ type: 'list', content: '', items });
            }
          } else if (tagName === 'blockquote') {
            if (node.textContent?.trim()) {
              blocks.push({ 
                type: 'quote', 
                content: node.textContent.trim(),
                html: node.innerHTML
              });
            }
          } else if (tagName === 'div' && node.classList.contains('tip')) {
            blocks.push({
              type: 'tip',
              content: node.textContent?.trim() || '',
              html: node.innerHTML
            });
          }
        }
      });
    }
    
    // Fallback: if no blocks parsed or no structure, treat content as HTML paragraphs
    if (blocks.length === 0 && htmlContent) {
      // Split by paragraph tags or double newlines
      const paragraphs = htmlContent
        .split(/<\/p>|<br\s*\/?>\s*<br\s*\/?>|\n\n+/)
        .map(p => p.replace(/<\/?p>/g, '').trim())
        .filter(p => p && p.length > 0);
      
      if (paragraphs.length > 0) {
        paragraphs.forEach(para => {
          blocks.push({ 
            type: 'html', 
            content: para.replace(/<[^>]*>/g, ''),
            html: para // Keep rich formatting
          });
        });
      } else {
        // Last resort: single HTML block
        blocks.push({ 
          type: 'html', 
          content: htmlContent.replace(/<[^>]*>/g, '').trim(),
          html: htmlContent
        });
      }
    }
    
    console.log('✅ Parsed content into blocks:', blocks.length);
    return blocks;
  };

  // Offline data synchronization
  const syncOfflineData = async () => {
    if (!navigator.onLine || !user || syncInProgress) return;
    
    try {
      setSyncInProgress(true);
      console.log('🔄 Syncing offline data...');

      // Sync offline read statuses
      const offlineReads = JSON.parse(localStorage.getItem('ikan-offline-reads') || '[]');
      if (offlineReads.length > 0) {
        for (const readData of offlineReads) {
          try {
            await apiClient.post('/user-activity/mark-read', readData);
          } catch (error) {
            console.warn('Failed to sync read status:', error);
          }
        }
        localStorage.removeItem('ikan-offline-reads');
        console.log(`✅ Synced ${offlineReads.length} offline read statuses`);
      }

      // Sync offline analytics
      // Queued events are also gated: consent can be withdrawn between capture
      // and sync, and withdrawing it must stop the backlog going out too.
      const offlineAnalytics = hasAnalyticsConsent(user)
        ? JSON.parse(localStorage.getItem('ikan-offline-analytics') || '[]')
        : [];
      if (!hasAnalyticsConsent(user)) {
        try { localStorage.removeItem('ikan-offline-analytics'); } catch { /* ignore */ }
      }
      if (offlineAnalytics.length > 0) {
        for (const analyticsData of offlineAnalytics) {
          try {
            await apiClient.post('/analytics/engagement', analyticsData);
          } catch (error) {
            console.warn('Failed to sync analytics:', error);
          }
        }
        localStorage.removeItem('ikan-offline-analytics');
        console.log(`✅ Synced ${offlineAnalytics.length} offline analytics events`);
      }

    } catch (error) {
      console.warn('Offline data sync failed:', error);
    } finally {
      setSyncInProgress(false);
    }
  };

  // Network status detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('success', 'Back Online', 'Connection restored');
      // Sync offline data when coming back online
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOffline(true);
      showToast('warning', 'Offline Mode', 'You\'re now offline. Cached content will be available.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Auto-sync every 5 minutes when online
  useEffect(() => {
    if (!user) return;
    
    const syncInterval = setInterval(() => {
      if (navigator.onLine && !syncInProgress) {
        syncOfflineData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(syncInterval);
  }, [user, syncInProgress]);

  // Enhanced main resource loading effect with comprehensive cleanup
  useEffect(() => {
    if (!resourceId) {
      console.error('❌ No resource ID provided');
      setLoading(false);
      return;
    }

    let timerCleanup: (() => void) | null = null;
    let isComponentMounted = true;
    
    const initResource = async () => {
      try {
        // Track resource view start
        await trackUserEngagement('resource_view_started', {
          resourceId,
          timestamp: new Date().toISOString()
        });
        
        // Log simple activity for admin dashboard
        apiClient.logActivity('resource_view', {
          resourceId,
          title: resource?.title || 'Unknown Resource'
        }).catch(err => console.log('Simple activity log failed', err));

        // Load the resource
        await loadResource();
        
        // Only start timer if component is still mounted
        if (isComponentMounted) {
          timerCleanup = startReadingTimer();
        }
      } catch (error) {
        console.error(' Failed to initialize resource:', error);
        if (isComponentMounted) {
          showToast('error', 'Initialization Failed', 'Please refresh the page');
        }
      }
    };
    
    initResource();
    
    return () => {
      isComponentMounted = false;
      
      // Clean up timer
      if (timerCleanup) {
        timerCleanup();
      }
      
      // Mark as read on unmount if spent enough time
      if (readingTime > 30) {
        markAsRead().catch(error => {
          console.warn('Failed to mark as read on unmount:', error);
        });
      }
      
      // Track resource view end
      trackUserEngagement('resource_view_ended', {
        resourceId,
        totalReadingTime: readingTime,
        completionPercentage: readProgress,
        timestamp: new Date().toISOString()
      }).catch(error => {
        console.warn('Failed to track view end:', error);
      });
    };
  }, [resourceId]);

  // Enhanced scroll tracking with debouncing and analytics
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollProgress = 0;
    
    const handleScroll = () => {
      try {
        // Debounce scroll events for performance
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(() => {
          const scrolled = window.scrollY;
          const maxScroll = Math.max(
            document.documentElement.scrollHeight - window.innerHeight,
            1 // Prevent division by zero
          );
          
          const progress = Math.min(Math.max((scrolled / maxScroll) * 100, 0), 100);
          setReadProgress(progress);
          
          // Track reading progress milestones
          const progressRounded = Math.floor(progress / 25) * 25; // 0, 25, 50, 75, 100
          const lastProgressRounded = Math.floor(lastScrollProgress / 25) * 25;
          
          if (progressRounded > lastProgressRounded && progressRounded >= 25) {
            trackUserEngagement('reading_progress_milestone', {
              percentage: progressRounded,
              timestamp: new Date().toISOString()
            }).catch(error => {
              console.warn('Failed to track progress milestone:', error);
            });
          }
          
          lastScrollProgress = progress;
        }, 100); // 100ms debounce
        
      } catch (error) {
        console.warn('Scroll tracking error:', error);
      }
    };

    // Initial scroll position check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Offline content cache utility
  const cacheResourceOffline = async (resourceData: ResourceContent) => {
    try {
      if ('caches' in window) {
        const cache = await caches.open('ikan-resources-v1');
        const cacheKey = `/api/resources/${resourceId}`;
        await cache.put(cacheKey, new Response(JSON.stringify(resourceData), {
          headers: { 'Content-Type': 'application/json' }
        }));
        console.log('✅ Resource cached for offline access');
      }
      
      // Also store in localStorage as backup
      localStorage.setItem(`ikan-resource-${resourceId}`, JSON.stringify({
        data: resourceData,
        timestamp: Date.now(),
        version: '1.0'
      }));
    } catch (error) {
      console.warn('Failed to cache resource offline:', error);
    }
  };

  // Load resource from cache
  const loadResourceFromCache = async (): Promise<ResourceContent | null> => {
    try {
      // Try service worker cache first
      if ('caches' in window) {
        const cache = await caches.open('ikan-resources-v1');
        const cacheKey = `/api/resources/${resourceId}`;
        const cachedResponse = await cache.match(cacheKey);
        
        if (cachedResponse) {
          const cachedData = await cachedResponse.json();
          console.log('📱 Loaded resource from service worker cache');
          return cachedData;
        }
      }
      
      // Fallback to localStorage
      const cachedItem = localStorage.getItem(`ikan-resource-${resourceId}`);
      if (cachedItem) {
        const parsed = JSON.parse(cachedItem);
        // Check if cache is less than 24 hours old
        const isStale = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
        
        if (!isStale) {
          console.log('📱 Loaded resource from localStorage cache');
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('Failed to load from cache:', error);
    }
    
    return null;
  };

  // Retry mechanism with exponential backoff
  const retryWithBackoff = async (fn: () => Promise<any>, maxRetries: number = 3): Promise<any> => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        if (attempt > 0) {
          setRetryCount(0); // Reset retry count on success
        }
        return result;
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        
        if (isLastAttempt) {
          throw error;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`🔄 Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        setRetryCount(attempt + 1);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const loadResource = async () => {
    try {
      setLoading(true);
      console.log('📚 Loading resource:', resourceId);
      
      // Check if we're offline
      if (!navigator.onLine) {
        console.log('📱 Offline mode - loading from cache');
        const cachedResource = await loadResourceFromCache();
        
        if (cachedResource) {
          setResource(cachedResource);
          setLoading(false);
          showToast('info', 'Offline Mode', 'Showing cached content');
          return;
        } else {
          throw new Error('No cached content available offline');
        }
      }

      // Try to load from API with retry mechanism
      const resourceData = await retryWithBackoff(async () => {
        try {
          // Real API call using proper method
          const response = await apiClient.getResource(resourceId);
          
          if (!response) {
            throw new Error('Resource not found');
          }
          
          // Transform API data to match expected format
          console.log('📦 Raw API response:', response);
          const transformed = transformResourceData(response);
          console.log('✅ Transformed resource data:', transformed);
          
          return transformed;
        } catch (apiError: any) {
          console.error('API failed:', apiError);
          throw apiError;
        }
      });

      // Successfully loaded resource
      setResource(resourceData);
      console.log('✅ Resource set, relatedResources count:', resourceData.relatedResources?.length || 0);
      
      // Auto-fetch related resources if none exist
      if (!resourceData.relatedResources || resourceData.relatedResources.length === 0) {
        console.log('📚 Auto-fetching related resources from same category:', resourceData.category);
        try {
          const allResources = await apiClient.getResources();
          console.log('📦 All resources fetched:', allResources.length);
          
          const related = allResources
            .filter((r: any) => {
              const isNotSelf = r.id !== resourceId;
              const isSameCategory = r.category === resourceData.category;
              const isPublished = r.published !== false;
              
              console.log(`Checking resource ${r.id}:`, {
                title: r.title,
                isNotSelf,
                isSameCategory,
                isPublished,
                category: r.category,
                targetCategory: resourceData.category
              });
              
              return isNotSelf && isSameCategory && isPublished;
            })
            .slice(0, 3)
            .map((r: any) => ({
              id: r.id,
              title: r.title,
              category: r.category,
              readTimeMinutes: r.readTime || r.read_time_minutes || 5,
              image: r.thumbnail || r.image,
              description: r.description,
              publishedDate: r.created_at
            }));
          
          console.log(`✅ Filtered ${related.length} related resources:`, related);
          
          if (related.length > 0) {
            resourceData.relatedResources = related;
            setResource({ ...resourceData });
            console.log('✅ Updated resource with related resources');
          } else {
            // Silently fallback to any published resources (expected behavior)
            
            // Fallback: if no resources in same category, just get any 3 published resources
            const fallbackRelated = allResources
              .filter((r: any) => r.id !== resourceId && r.published !== false)
              .slice(0, 3)
              .map((r: any) => ({
                id: r.id,
                title: r.title,
                category: r.category,
                readTimeMinutes: r.readTime || r.read_time_minutes || 5,
                image: r.thumbnail || r.image,
                description: r.description,
                publishedDate: r.created_at
              }));
            
            if (fallbackRelated.length > 0) {
              resourceData.relatedResources = fallbackRelated;
              setResource({ ...resourceData });
            }
          }
        } catch (error) {
          console.error('❌ Failed to auto-load related resources:', error);
        }
      } else {
        console.log('✅ Resource already has related resources:', resourceData.relatedResources.length);
      }
      
      // Cache the resource for offline access
      await cacheResourceOffline(resourceData);
      
      // Track successful load
      await trackUserEngagement('resource_loaded', {
        resourceId,
        loadTime: Date.now(),
        source: 'api'
      });
      
      console.log('✅ Resource loaded successfully');
      
    } catch (error: any) {
      console.error('❌ Failed to load resource:', error);
      
      // Try to load from cache as fallback
      const cachedResource = await loadResourceFromCache();
      if (cachedResource) {
        setResource(cachedResource);
        showToast('warning', 'Connection Issues', 'Showing cached content');
        console.log('📱 Loaded cached resource as fallback');
      } else {
        // Complete failure - show error state  
        showToast('error', 'Failed to Load', 'Please check your connection and try again');
        
        // Track the error
        await trackUserEngagement('resource_load_failed', {
          resourceId,
          error: error.message,
          retryCount,
          isOffline: !navigator.onLine
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // User engagement analytics tracking
  const trackUserEngagement = async (action: string, data?: any) => {
    try {
      if (!user) return; // Only track for authenticated users
      
      // Format data with snake_case for backend compatibility
      const engagementData = {
        user_id: user.user_id,
        resource_id: resourceId,
        action,
        timestamp: new Date().toISOString(),
        session_data: {
          user_agent: navigator.userAgent,
          is_mobile: isMobile,
          connection_type: (navigator as any).connection?.effectiveType || 'unknown',
          ...data
        }
      };

      // DPDP §6: only send if the user actually consented. The Privacy screen's
      // "Usage Analytics" toggle was previously written and never read, so these
      // events fired whatever the user chose.
      if (!hasAnalyticsConsent(user)) {
        return;
      }

      // Try to send analytics to backend
      await retryWithBackoff(async () => {
        await apiClient.post('/analytics/engagement', engagementData);
      }, 2); // Only 2 retries for analytics to avoid blocking

      console.log('📊 Analytics tracked:', action);
    } catch (error) {
      console.warn('Analytics tracking failed (non-critical):', error);
      
      // Store analytics offline for later sync with correct format
      try {
        const offlineAnalytics = JSON.parse(localStorage.getItem('ikan-offline-analytics') || '[]');
        offlineAnalytics.push({
          resource_id: resourceId,
          user_id: user?.user_id,
          action,
          timestamp: new Date().toISOString(),
          session_data: data
        });
        
        // Keep only last 50 analytics events
        const recentAnalytics = offlineAnalytics.slice(-50);
        localStorage.setItem('ikan-offline-analytics', JSON.stringify(recentAnalytics));
      } catch (storageError) {
        console.warn('Failed to store offline analytics:', storageError);
      }
    }
  };

  // Improved reading timer with pause/resume functionality
  const startReadingTimer = () => {
    let isActive = true;
    
    const timer = setInterval(() => {
      // Only count time when tab is active and visible
      if (isActive && !document.hidden) {
        setReadingTime(prev => {
          const newTime = prev + 1;
          
          // Track reading milestones
          if (newTime === 30) {
            trackUserEngagement('reading_milestone_30s');
          } else if (newTime === 120) {
            trackUserEngagement('reading_milestone_2min');
          } else if (newTime === 300) {
            trackUserEngagement('reading_milestone_5min');
          }
          
          return newTime;
        });
      }
    }, 1000);

    // Handle visibility changes (tab switching)
    const handleVisibilityChange = () => {
      isActive = !document.hidden;
      if (document.hidden) {
        trackUserEngagement('reading_paused');
      } else {
        trackUserEngagement('reading_resumed');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Return cleanup function
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  };

  // Complete markAsRead functionality with backend calls
  const markAsRead = async () => {
    try {
      if (!user) {
        console.log('User not authenticated - skipping read tracking');
        return;
      }

      console.log(`📖 Marking resource ${resourceId} as read for user ${user.user_id}`);
      
      const readData = {
        resourceId,
        userId: user.user_id,
        readingTimeSeconds: readingTime,
        completionPercentage: Math.min(readProgress, 100),
        readAt: new Date().toISOString(),
        deviceType: isMobile ? 'mobile' : 'desktop'
      };

      // Send to backend with retry mechanism
      await retryWithBackoff(async () => {
        await apiClient.post('/user-activity/mark-read', readData);
      }, 3);

      // Update local storage for quick access
      const userReadResources = JSON.parse(localStorage.getItem(`ikan-read-resources-${user.user_id}`) || '[]');
      if (!userReadResources.includes(resourceId)) {
        userReadResources.push(resourceId);
        localStorage.setItem(`ikan-read-resources-${user.user_id}`, JSON.stringify(userReadResources));
      }

      // Track successful read completion
      await trackUserEngagement('marked_as_read', {
        readingTimeSeconds: readingTime,
        completionPercentage: readProgress
      });

      console.log('✅ Resource successfully marked as read');
      showToast('success', 'Progress Saved', 'Your reading progress has been saved');
      
    } catch (error: any) {
      console.error('❌ Failed to mark resource as read:', error);
      
      // Store read status offline for later sync
      try {
        const offlineReads = JSON.parse(localStorage.getItem('ikan-offline-reads') || '[]');
        offlineReads.push({
          resourceId,
          userId: user?.user_id,
          readingTimeSeconds: readingTime,
          completionPercentage: readProgress,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('ikan-offline-reads', JSON.stringify(offlineReads));
        
        showToast('warning', 'Saved Locally', 'Progress saved offline and will sync when connected');
      } catch (storageError) {
        console.error('Failed to save read status offline:', storageError);
        showToast('error', 'Save Failed', 'Unable to save reading progress');
      }
    }
  };

  // Enhanced share function with comprehensive error handling
  const handleShare = async () => {
    try {
      if (!resource) {
        showToast('error', 'Share Failed', 'Resource not available for sharing');
        return;
      }

      // Track share attempt
      await trackUserEngagement('share_attempted', {
        method: navigator.share ? 'native_share' : 'clipboard',
        resourceTitle: resource.title
      });

      // Try native sharing first (mobile browsers)
      if (navigator.share) {
        try {
          await navigator.share({
            title: resource.title,
            text: resource.description,
            url: window.location.href
          });
          
          // Track successful native share
          await trackUserEngagement('share_completed', { method: 'native_share' });
          console.log('✅ Resource shared via native share');
          return;
          
        } catch (shareError: any) {
          // User cancelled or share failed
          if (shareError.name === 'AbortError') {
            console.log('Share cancelled by user');
            return;
          }
          
          console.warn('Native share failed, trying clipboard fallback:', shareError);
        }
      }

      // Fallback to clipboard
      try {
        const copied = await copyToClipboard(window.location.href);
        if (copied) {
          showToast('success', 'Link Copied', 'Resource link copied to clipboard');
          
          // Track successful clipboard share
          await trackUserEngagement('share_completed', { method: 'clipboard' });
          console.log('✅ Resource link copied to clipboard');
        } else {
          throw new Error('Clipboard access failed');
        }
      } catch (clipboardError) {
        console.warn('Clipboard write failed:', clipboardError);
        throw new Error('Clipboard access failed');
      }
      
    } catch (error: any) {
      console.error('❌ Share function failed:', error);
      showToast('error', 'Share Failed', 'Unable to share at this time. Please try again.');
      
      // Track share failure
      await trackUserEngagement('share_failed', {
        error: error.message,
        userAgent: navigator.userAgent
      });
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    }
  };

  // Helper function to render content blocks as React nodes
  const renderContentBlocks = (blocks: Array<{
    type: 'paragraph' | 'heading' | 'list' | 'quote' | 'tip' | 'html';
    content: string;
    items?: string[];
    html?: string;
  }> | undefined) => {
    // Safety check - return empty fragment if no blocks
    if (!blocks || !Array.isArray(blocks)) {
      return <></>;
    }

    return (
      <>
        {blocks.map((block, index) => {
          switch (block.type) {
            case 'heading':
              return (
                <h2 
                  key={index}
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginTop: 'var(--spacing-6)',
                    marginBottom: 'var(--spacing-4)'
                  }}
                >
                  {block.content}
                </h2>
              );
            case 'paragraph':
              return (
                <p 
                  key={index}
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-regular)',
                    lineHeight: 'var(--line-height-md)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-4)'
                  }}
                >
                  {block.content}
                </p>
              );
            case 'list':
              return (
                <ul 
                  key={index}
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-regular)',
                    lineHeight: 'var(--line-height-md)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-4)',
                    paddingLeft: 'var(--spacing-6)',
                    listStyle: 'disc'
                  }}
                >
                  {block.items?.map((item, i) => (
                    <li key={i} style={{ marginBottom: 'var(--spacing-2)' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              );
            case 'quote':
              return (
                <blockquote 
                  key={index}
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-regular)',
                    fontStyle: 'italic',
                    lineHeight: 'var(--line-height-md)',
                    color: 'var(--color-text-muted)',
                    borderLeft: `4px solid var(--color-primary-default)`,
                    paddingLeft: 'var(--spacing-4)',
                    marginBottom: 'var(--spacing-4)'
                  }}
                >
                  {block.content}
                </blockquote>
              );
            case 'tip':
              return (
                <div 
                  key={index}
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-regular)',
                    lineHeight: 'var(--line-height-md)',
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-accent-default)',
                    padding: 'var(--spacing-4)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-4)'
                  }}
                >
                  <strong style={{ fontWeight: 'var(--font-weight-medium)' }}>Tip:</strong> {block.content}
                </div>
              );
            case 'html':
              return (
                <div 
                  key={index}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.html || block.content) }}
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-regular)',
                    lineHeight: 'var(--line-height-md)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-4)'
                  }}
                />
              );
            default:
              return null;
          }
        })}
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div 
          className="animate-pulse w-full max-w-4xl mx-auto p-8"
        >
          <div 
            className="h-8 w-3/4 mb-4 rounded"
            style={{ backgroundColor: 'var(--color-bg-muted)' }}
          ></div>
          <div 
            className="h-4 w-1/2 mb-8 rounded"
            style={{ backgroundColor: 'var(--color-bg-muted)' }}
          ></div>
          <div 
            className="h-64 w-full rounded-xl"
            style={{ backgroundColor: 'var(--color-bg-muted)' }}
          ></div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="text-center space-y-4">
          <h2 
            className="font-medium text-xl text-primary"
          >
            Resource not found
          </h2>
          <p 
            style={{ color: 'var(--color-text-muted)' }}
          >
            The resource you're looking for doesn't exist or has been moved.
          </p>
          <Button 
            onClick={handleBackClick} 
            variant="default"
            className="mt-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="relative min-h-screen w-full" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        {/* Reading Progress */}
        <div className="fixed top-0 left-0 right-0 z-40 h-1" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          <div 
            className="h-full transition-all duration-300 ease-out"
            style={{ width: `${readProgress}%`, backgroundColor: 'var(--color-primary-default)' }}
          />
        </div>

        {/* Mobile responsive layout */}
        <div className="w-full">
          {/* Hero Section - Full Width */}
          <ResourceHero
            title={resource.title}
            description={resource.description}
            image={resource.heroImage || 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800&q=80'}
            imageAlt={resource.title}
          />

          <div className="px-4 mt-6 max-w-3xl mx-auto space-y-8">
            {/* Meta Info */}
            <div className="flex items-center gap-4 flex-wrap">
              <ResourceCategory category={resource.category} />
              <ResourceTypeLabel type={resource.contentType} />
            </div>

            {/* Resource Content */}
            <ResourceContent
              content={renderContentBlocks(resource.content)}
            />

            {/* Author Info */}
            <div className="border-t pt-8" style={{ borderColor: 'var(--color-border-default)' }}>
              <ResourceAuthor
                name={resource.author || 'iKan Team'}
                avatar={resource.authorImage}
                date={resource.publishedDate || '2024-09-30'}
                readTime={`${resource.readTimeMinutes} min read`}
              />
            </div>

            {/* Tags */}
            <ResourceTags tags={resource.tags} />
            
            {/* Share Button (Optional but useful) */}
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={handleShare}
                className="w-full gap-2"
              >
                <Share2 size={16} />
                Share Resource
              </Button>
            </div>
          </div>

          {/* Related Resources */}
          {resource.relatedResources && resource.relatedResources.length > 0 && (
            <div className="my-8">
              <ResourceBlock
                title="You might also like:"
                posts={resource.relatedResources.map(r => ({
                  id: r.id,
                  title: r.title,
                  description: r.description || '',
                  image: r.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
                  category: r.category,
                  readTime: `${r.readTimeMinutes} min read`,
                  date: r.publishedDate || '',
                  slug: r.id
                }))}
                onPostClick={(post) => {
                  // Navigate to the related resource
                  window.scrollTo(0, 0);
                  if (onResourceSelect) {
                     onResourceSelect(post.id);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full" style={{ backgroundColor: 'var(--color-bg-card)' }}>
      {/* Reading Progress */}
      <div className="fixed top-0 left-0 right-0 z-40 h-1" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
        <div 
          className="h-full transition-all duration-300 ease-out"
          style={{ width: `${readProgress}%`, backgroundColor: 'var(--color-primary-default)' }}
        />
      </div>

      {/* Responsive layout container */}
      <div className="w-full pb-10">
        {/* Hero Section - Full Width */}
        <ResourceHero
          title={resource.title}
          description={resource.description}
          image={resource.heroImage || 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800&q=80'}
          imageAlt={resource.title}
          className="w-full shadow-xl"
        />
        
        <div className="w-full max-w-[1200px] mx-auto px-8">
          <div className="max-w-3xl mx-auto mt-12 space-y-10">
            {/* Meta Info */}
            <div className="flex items-center gap-4">
              <div 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => showToast('info', 'Category', `Browse ${resource.category}`)}
              >
                <ResourceCategory category={resource.category} />
              </div>
              <div className="h-4 w-px" style={{ backgroundColor: 'var(--grey-3)' }} />
              <div 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => showToast('info', 'Type', `View all ${resource.contentType}s`)}
              >
                <ResourceTypeLabel type={resource.contentType} />
              </div>
            </div>

            {/* Content */}
            <ResourceContent
              content={renderContentBlocks(resource.content)}
            />

            <div className="border-t pt-10 space-y-10" style={{ borderColor: 'var(--color-border-default)' }}>
              <div className="flex justify-between items-start">
                 {/* Author */}
                 <div 
                   className="cursor-pointer hover:bg-[var(--color-bg-muted)] rounded-lg p-2 -ml-2 transition-colors"
                   onClick={() => showToast('info', 'Author', `View profile of ${resource.author || 'iKan Team'}`)}
                 >
                  <ResourceAuthor
                    name={resource.author || 'iKan Team'}
                    avatar={resource.authorImage}
                    date={resource.publishedDate || '2024-09-30'}
                    readTime={`${resource.readTimeMinutes} min read`}
                  />
                </div>
                
                {/* Share Button */}
                <Button
                  variant="ghost"
                  onClick={handleShare}
                  className="gap-2 hover:bg-black/5 transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Share2 size={18} />
                  Share
                </Button>
              </div>

              {/* Tags */}
              <div 
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => showToast('info', 'Tags', 'Tag filtering active')}
              >
                <ResourceTags tags={resource.tags} />
              </div>
            </div>
          </div>
        </div>

        {/* Related Resources */}
        {resource.relatedResources && resource.relatedResources.length > 0 && (
          <div className="w-full max-w-[1200px] mx-auto px-8 mt-16 mb-10">
            <ResourceBlock
              title="You might also like:"
              posts={resource.relatedResources.map(r => ({
                id: r.id,
                title: r.title,
                description: r.description || '',
                image: r.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
                category: r.category,
                readTime: `${r.readTimeMinutes} min read`,
                date: r.publishedDate || '',
                slug: r.id
              }))}
              onPostClick={(post) => {
                // Navigate to the related resource
                window.scrollTo(0, 0);
                if (onResourceSelect) {
                   onResourceSelect(post.id);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}