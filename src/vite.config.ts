import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'maskable-icon-512x512.png'],
      manifest: {
        name: 'iKan Mental Health',
        short_name: 'iKan',
        description: 'Your comprehensive mental wellness companion',
        theme_color: '#2A2A2A',
        background_color: '#F5F5F5',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['health', 'medical', 'wellness', 'lifestyle'],
        shortcuts: [
          {
            name: 'Daily Check-in',
            short_name: 'Check-in',
            description: 'Track your daily mood',
            url: '/dashboard?tab=mood',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Assessment',
            short_name: 'Assessment',
            description: 'Take a mental health assessment',
            url: '/assessments',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Programs',
            short_name: 'Programs',
            description: 'Browse wellness programs',
            url: '/equip-programs',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Dynamic API URL pattern based on environment
            urlPattern: ({ url }) => {
              return url.origin.includes('.supabase.co') && 
                     url.pathname.includes('/functions/v1/make-server-cc205da9/');
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}_${request.method}`
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@components": path.resolve(__dirname, "./components"),
      "@lib": path.resolve(__dirname, "./lib"),
      "@utils": path.resolve(__dirname, "./utils"),
      "@contexts": path.resolve(__dirname, "./contexts"),
      "@hooks": path.resolve(__dirname, "./hooks")
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-tabs'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react'],
          motion: ['motion']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: false
    }
  },
  preview: {
    port: 3000,
    host: true
  },
  define: {
    global: 'globalThis'
  }
})