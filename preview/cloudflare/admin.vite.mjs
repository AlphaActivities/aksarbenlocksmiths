import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const path = (relative) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  root: path('../..'),
  publicDir: false,
  plugins: [react()],
  build: {
    outDir: path('./baseline/admin-build'),
    emptyOutDir: true,
    rollupOptions: {input: path('../../admin/index.html')},
  },
});
