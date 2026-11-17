import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: 'private-admin-entry',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (/^\/admin(?:\/[^.?]*)?(?:\?.*)?$/.test(req.url || '')) req.url = '/admin/index.html';
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (/^\/admin(?:\/[^.?]*)?(?:\?.*)?$/.test(req.url || '')) req.url = '/admin/index.html';
        next();
      });
    },
  }],
  build: { rollupOptions: { input: { public: resolve('index.html'), admin: resolve('admin/index.html') } } },
  server: { headers: { 'Service-Worker-Allowed': '/admin' } },
  preview: { headers: { 'Service-Worker-Allowed': '/admin' } },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
