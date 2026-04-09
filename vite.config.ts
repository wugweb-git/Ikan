import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1700,
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  define: {
    global: 'globalThis',
  },
});
