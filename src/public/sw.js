// Service Worker for iKan Mental Health PWA
const CACHE_NAME = 'ikan-v1.0.0';
const STATIC_CACHE_NAME = 'ikan-static-v1.0.0';
const API_CACHE_NAME = 'ikan-api-v1.0.0';

// Global error handling to prevent service worker crashes
self.addEventListener('error', (event) => {
  console.log('📱 SW: Error handled gracefully:', event.error?.message || event.error);
  event.preventDefault();
});

self.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || String(event.reason) || 'Unknown error';
  const errorString = errorMessage.toLowerCase();
  
  // Suppress timeout and page-related errors
  if (errorString.includes('timeout') || 
      errorString.includes('getpage') || 
      errorString.includes('timed out') ||
      errorString.includes('response timed out')) {
    console.log('📱 SW: Timeout error suppressed:', errorMessage);
    event.preventDefault();
    return;
  }
  
  console.log('📱 SW: Unhandled rejection handled gracefully:', errorMessage);
  event.preventDefault();
});

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/App.tsx',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png'
];

// API endpoints to cache with network-first strategy
const API_ENDPOINTS = [
  'https://jpfvoevxegnknxoqmwye.supabase.co/functions/v1/make-server-cc205da9'
];

// Crisis resources - always keep available offline
const CRISIS_RESOURCES = {
  us: {
    hotline: '988',
    text: 'Text HOME to 741741',
    url: 'https://suicidepreventionlifeline.org'
  },
  international: {
    url: 'https://findahelpline.com'
  }
};

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('📱 iKan SW: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('📱 iKan SW: Caching static resources');
        return cache.addAll(STATIC_RESOURCES).catch((error) => {
          console.warn('📱 iKan SW: Failed to cache some static resources:', error);
          // Continue installation even if some resources fail to cache
        });
      }),
      
      // Store crisis resources in IndexedDB for offline access
      storeCrisisResources()
    ])
  );
  
  // Immediately activate new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('📱 iKan SW: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('📱 iKan SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle API requests with network-first strategy
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static resources with cache-first strategy
  if (isStaticResource(url)) {
    event.respondWith(handleStaticResource(request));
    return;
  }
  
  // Handle HTML pages with network-first strategy
  if (isHtmlRequest(request)) {
    event.respondWith(handleHtmlRequest(request));
    return;
  }
  
  // Default: network-first for everything else
  event.respondWith(handleDefaultRequest(request));
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('📱 iKan SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-mood-data') {
    event.waitUntil(syncMoodData());
  } else if (event.tag === 'sync-journal-data') {
    event.waitUntil(syncJournalData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📱 iKan SW: Push notification received');
  
  const options = {
    body: 'Time for your daily check-in',
    icon: '/pwa-192x192.png',
    badge: '/pwa-64x64.png',
    tag: 'mood-reminder',
    requireInteraction: false,
    actions: [
      {
        action: 'checkin',
        title: 'Check In Now',
        icon: '/pwa-64x64.png'
      },
      {
        action: 'dismiss',
        title: 'Later',
        icon: '/pwa-64x64.png'
      }
    ],
    data: {
      url: '/dashboard?tab=mood'
    }
  };
  
  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.data = { ...options.data, ...payload.data };
  }
  
  event.waitUntil(
    self.registration.showNotification('iKan Mental Health', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('📱 iKan SW: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'checkin') {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url || '/dashboard')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default click - open the app
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Message handling for client-service worker communication
self.addEventListener('message', (event) => {
  try {
    if (event.data && event.data.type) {
      switch (event.data.type) {
        case 'SKIP_WAITING':
          self.skipWaiting();
          break;
        case 'GET_VERSION':
          event.ports[0]?.postMessage({ version: CACHE_NAME });
          break;
        case 'CLEAR_CACHE':
          clearAllCaches().then(() => {
            event.ports[0]?.postMessage({ success: true });
          }).catch(() => {
            event.ports[0]?.postMessage({ success: false });
          });
          break;
        default:
          console.log('📱 SW: Unknown message type:', event.data.type);
      }
    }
  } catch (error) {
    console.log('📱 SW: Message handling error (non-critical):', error.message);
    // Don't propagate message errors
  }
});

async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('📱 SW: All caches cleared');
  } catch (error) {
    console.log('📱 SW: Cache clearing failed (non-critical):', error.message);
  }
}

// Helper functions
function isApiRequest(url) {
  return API_ENDPOINTS.some(endpoint => url.href.startsWith(endpoint));
}

function isStaticResource(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ico)$/);
}

function isHtmlRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const networkResponse = await fetch(request.clone(), {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone()).catch(err => {
        console.log('📱 SW: Cache put failed (non-critical):', err.message);
      });
      return networkResponse;
    }
    
    throw new Error(`Network request failed: ${networkResponse.status}`);
  } catch (error) {
    // Handle AbortError (timeout) gracefully
    if (error.name === 'AbortError') {
      console.log('📱 SW: Request timeout for:', request.url);
    } else {
      console.log('📱 SW: Network failed, trying cache for:', request.url);
    }
    
    // Try cache as fallback
    try {
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        // Add offline indicator to response
        const modifiedResponse = new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: {
            ...cachedResponse.headers,
            'X-Offline-Response': 'true'
          }
        });
        return modifiedResponse;
      }
    } catch (cacheError) {
      console.log('📱 SW: Cache access failed (non-critical):', cacheError.message);
    }
    
    // Return offline fallback for API requests
    return new Response(
      JSON.stringify({
        error: 'Offline - Please check your connection',
        offline: true,
        crisis_resources: CRISIS_RESOURCES
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'X-Offline-Response': 'true'
        }
      }
    );
  }
}

async function handleStaticResource(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Try network and cache
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('📱 iKan SW: Failed to load static resource:', request.url);
    
    // Return a minimal fallback for critical resources
    if (request.url.includes('App.tsx') || request.url.includes('index.html')) {
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>iKan - Offline</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: Ubuntu, system-ui, sans-serif; 
                text-align: center; 
                padding: 20px; 
                background: #F5F5F5;
                color: #151515;
              }
            </style>
          </head>
          <body>
            <h1>iKan Mental Health</h1>
            <p>You're currently offline. Please check your connection and try again.</p>
            <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px;">
              <h3>Crisis Resources</h3>
              <p><strong>US:</strong> Call or text 988</p>
              <p><strong>International:</strong> Visit findahelpline.com</p>
            </div>
          </body>
        </html>`,
        {
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }
    
    throw error;
  }
}

async function handleHtmlRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Return cached index.html as fallback for SPA routing
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedIndex = await cache.match('/index.html') || await cache.match('/');
    
    if (cachedIndex) {
      return cachedIndex;
    }
    
    // Last resort offline page
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>iKan - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: Ubuntu, system-ui, sans-serif; 
              text-align: center; 
              padding: 20px; 
              background: #F5F5F5;
              color: #151515;
            }
            .container { max-width: 400px; margin: 0 auto; }
            .crisis-box { margin-top: 20px; padding: 15px; background: white; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="color: #2A2A2A;">iKan Mental Health</h1>
            <p>You're currently offline. The app will work again when your connection is restored.</p>
            <div class="crisis-box">
              <h3 style="color: #2A2A2A;">Crisis Resources</h3>
              <p><strong>US:</strong> Call or text 988 for immediate help</p>
              <p><strong>Text:</strong> HOME to 741741</p>
              <p><strong>International:</strong> Visit findahelpline.com</p>
            </div>
            <button onclick="window.location.reload()" style="
              margin-top: 20px; 
              padding: 10px 20px; 
              background: #2A2A2A; 
              color: white; 
              border: none; 
              border-radius: 6px; 
              cursor: pointer;
            ">
              Try Again
            </button>
          </div>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

async function handleDefaultRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Try cache as last resort
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

async function storeCrisisResources() {
  try {
    // Store crisis resources in cache for offline access
    const cache = await caches.open(STATIC_CACHE_NAME);
    const crisisResponse = new Response(JSON.stringify(CRISIS_RESOURCES), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put('/crisis-resources.json', crisisResponse);
  } catch (error) {
    console.warn('📱 iKan SW: Failed to store crisis resources:', error);
  }
}

async function syncMoodData() {
  // TODO: Implement background sync for mood data
  console.log('📱 iKan SW: Syncing mood data...');
}

async function syncJournalData() {
  // TODO: Implement background sync for journal data  
  console.log('📱 iKan SW: Syncing journal data...');
}