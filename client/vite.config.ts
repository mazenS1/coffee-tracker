import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@coffee-tracker/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  server: {
    host: '0.0.0.0', // Listen on all interfaces for LAN access
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split large, independently-cacheable vendor libraries.
        // Only split packages that are truly independent (no internal circular
        // refs with the rest of the bundle). React and its ecosystem are left
        // to Vite's automatic chunking — it resolves React's own internal
        // dependencies correctly and avoids circular-chunk initialization errors.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('@clerk')) return 'vendor-clerk';
          if (id.includes('react-router-dom') || id.includes('react-router/')) return 'vendor-router';
        },
      },
    },
  },
})
