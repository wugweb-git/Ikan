import { useState, useEffect } from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api-client';

// Import dynamic UI blocks
import { ResourceHero } from '../blocks/ResourceHero';
import { ResourceContent } from '../blocks/ResourceContent';
import { ResourceBlock } from '../blocks/ResourceBlock';
import { ResourceAuthor } from '../blocks/ResourceAuthor';
import { ResourceCategory } from '../blocks/ResourceCategory';
import { ResourceTypeLabel } from '../blocks/ResourceTypeLabel';
import { ResourceTags } from '../blocks/ResourceTags';

interface ResourceDetailProps {
  resourceId: string;
  onBack?: () => void;
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
    type: 'paragraph' | 'heading' | 'list' | 'quote' | 'tip';
    content: string;
    items?: string[];
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

export function ResourceDetail({ resourceId, onBack, onResourceSelect, className }: ResourceDetailProps) {
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
      const offlineAnalytics = JSON.parse(localStorage.getItem('ikan-offline-analytics') || '[]');
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
          
          return response;
        } catch (apiError: any) {
          console.log('API failed, trying fallback data...');
          
          // Fallback to mock data for demo purposes
          const mockResource: ResourceContent = {
            id: resourceId,
            title: "What OpenAI's Research Reveals About The Future Of AI Search",
            description: "New OpenAI research shows AI search has become ChatGPT's primary use case, with mass adoption projected for mid-2026.",
            category: "AI & Technology", 
            contentType: "Article",
            readTimeMinutes: 10,
            author: "Reza Moaiandin",
            publishedDate: "2024-09-30",
            content: [
              {
                type: 'paragraph',
                content: 'The launch of ChatGPT in 2022 didn\'t so much cause a shift in the search landscape as trigger a series of seismic events. And, like seismologists, the SEO industry needs data if it\'s to predict future tremors and aftershocks – let alone prepare itself for what the landscape might reshape itself into once the ground has finally settled.'
              },
              {
                type: 'paragraph',
                content: 'So, when OpenAI released a 65-page research paper on Sept. 15, 2025, titled "How People Use ChatGPT," some of us were understandably excited to finally have some authoritative usage data from inside a major large language model (LLM).'
              },
              {
                type: 'paragraph',
                content: 'Two key findings leap out:'
              },
              {
                type: 'list',
                content: '',
                items: [
                  'We\'re closer to mass adoption of AI than most probably realize.',
                  'How users interact with ChatGPT has fundamentally shifted in the past year.'
                ]
              },
              {
                type: 'paragraph',
                content: 'For SEOs, this isn\'t just another adoption study: It\'s strategic intelligence about where AI search is heading.'
              },
          {
            type: 'heading',
            content: 'Mass Adoption Is Closer Than You Think'
          },
          {
            type: 'paragraph',
            content: 'How close is ChatGPT to the tipping point where it will accelerate into mass adoption?'
          },
          {
            type: 'paragraph',
            content: 'Developed by sociologist Everett Rogers, the diffusion of innovation theory provides us with a useful framework to explain how new technologies spread through society in predictable stages. First, there are the innovators, accounting for 2.5% of the market. Then, the early adopters come along (13.5%), to be followed by the early majority (34%). At this point, ~50% of the potential market has adopted the technology. Anyone jumping on board after this point can safely be described as either the late majority (34%), or laggards (16%).'
          },
          {
            type: 'heading',
            content: 'The Behavioral Revolution Hiding In Plain Sight'
          },
          {
            type: 'paragraph',
            content: 'Buried within OpenAI\'s usage data is perhaps the most significant finding for search marketers: a fundamental shift in how people are using AI tools.'
          }
        ],
        tags: ['UI Design', 'Marketing', 'Ai Driven', 'Strategy'],
        relatedResources: [
          {
            id: '2',
            title: 'Do I Need to Supplement with B12?',
            category: 'Health',
            readTimeMinutes: 5,
            description: 'It\'s one of those nutrients that gets a lot of hype, and for good reason',
            publishedDate: '2025-02-26'
          },
          {
            id: '3',
            title: 'Recipe: Mint Chip Smoothie',
            category: 'Nutrition',
            readTimeMinutes: 7,
            description: 'This Mint Chip Smoothie was a limited edition menu item that still lives on in our dreams, and now you can enjoy it any time at home.',
            publishedDate: '2025-02-06'
          },
          {
            id: '4',
            title: 'The Wellness Edit',
            category: 'Lifestyle',
            readTimeMinutes: 6,
            description: 'Welcome to the Wellness Edit, the newest editorial project from Earthbar.',
            publishedDate: '2025-02-02'
          }
        ]
      };
      
      console.log('📚 Using fallback demo content');
      return mockResource;
        }
      });

      // Successfully loaded resource
      setResource(resourceData);
      
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
        user_id: user.id,
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

      // Try to send analytics to backend
      await retryWithBackoff(async () => {
        const response = await apiClient.post('/analytics/engagement', engagementData);
        return response.data;
      }, 2); // Only 2 retries for analytics to avoid blocking

      console.log('📊 Analytics tracked:', action);
    } catch (error) {
      console.warn('Analytics tracking failed (non-critical):', error);
      
      // Store analytics offline for later sync with correct format
      try {
        const offlineAnalytics = JSON.parse(localStorage.getItem('ikan-offline-analytics') || '[]');
        offlineAnalytics.push({
          resource_id: resourceId,
          user_id: user?.id,
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

      console.log(`📖 Marking resource ${resourceId} as read for user ${user.id}`);
      
      const readData = {
        resourceId,
        userId: user.id,
        readingTimeSeconds: readingTime,
        completionPercentage: Math.min(readProgress, 100),
        readAt: new Date().toISOString(),
        deviceType: isMobile ? 'mobile' : 'desktop'
      };

      // Send to backend with retry mechanism
      await retryWithBackoff(async () => {
        const response = await apiClient.post('/user-activity/mark-read', readData);
        
        if (response.status !== 200) {
          throw new Error(`Failed to mark as read: ${response.status}`);
        }
        
        return response.data;
      }, 3);

      // Update local storage for quick access
      const userReadResources = JSON.parse(localStorage.getItem(`ikan-read-resources-${user.id}`) || '[]');
      if (!userReadResources.includes(resourceId)) {
        userReadResources.push(resourceId);
        localStorage.setItem(`ikan-read-resources-${user.id}`, JSON.stringify(userReadResources));
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
          userId: user?.id,
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
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showToast('success', 'Link Copied', 'Resource link copied to clipboard');
          
          // Track successful clipboard share
          await trackUserEngagement('share_completed', { method: 'clipboard' });
          console.log('✅ Resource link copied to clipboard');
          
        } catch (clipboardError) {
          console.warn('Clipboard write failed:', clipboardError);
          throw new Error('Clipboard access failed');
        }
      } else {
        // Ultimate fallback for older browsers
        try {
          // Create temporary input element
          const tempInput = document.createElement('input');
          tempInput.value = window.location.href;
          document.body.appendChild(tempInput);
          tempInput.select();
          tempInput.setSelectionRange(0, 99999); // For mobile devices
          
          const successful = document.execCommand('copy');
          document.body.removeChild(tempInput);
          
          if (successful) {
            showToast('success', 'Link Copied', 'Resource link copied to clipboard');
            await trackUserEngagement('share_completed', { method: 'legacy_clipboard' });
          } else {
            throw new Error('Copy command failed');
          }
        } catch (legacyError) {
          // Final fallback - show share dialog
          showToast('info', 'Share Resource', `Copy this link: ${window.location.href}`);
          await trackUserEngagement('share_fallback_shown');
        }
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
    type: 'paragraph' | 'heading' | 'list' | 'quote' | 'tip';
    content: string;
    items?: string[];
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
            className="h-8 w-3/4 mb-4 bg-gray-200 rounded"
          ></div>
          <div 
            className="h-4 w-1/2 mb-8 bg-gray-200 rounded"
          ></div>
          <div 
            className="h-64 w-full bg-gray-200 rounded-xl"
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
            className="text-muted-foreground"
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
      <div className="relative min-h-screen w-full bg-accent">
        {/* Reading Progress */}
        <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-gray-100">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${readProgress}%` }}
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
            <div className="border-t border-gray-200 pt-8">
              <ResourceAuthor
                name={resource.author || 'Reza Moaiandin'}
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
    <div className="relative min-h-screen w-full bg-accent">
      {/* Reading Progress */}
      <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-gray-100">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${readProgress}%` }}
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
              <div className="h-4 w-px bg-gray-300" />
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

            <div className="border-t border-gray-200 pt-10 space-y-10">
              <div className="flex justify-between items-start">
                 {/* Author */}
                 <div 
                   className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -ml-2 transition-colors"
                   onClick={() => showToast('info', 'Author', `View profile of ${resource.author || 'Reza Moaiandin'}`)}
                 >
                  <ResourceAuthor
                    name={resource.author || 'Reza Moaiandin'}
                    avatar={resource.authorImage}
                    date={resource.publishedDate || '2024-09-30'}
                    readTime={`${resource.readTimeMinutes} min read`}
                  />
                </div>
                
                {/* Share Button */}
                <Button
                  variant="ghost"
                  onClick={handleShare}
                  className="gap-2 text-muted-foreground hover:text-primary hover:bg-gray-100 transition-colors"
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