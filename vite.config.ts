import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // Set base path for GitHub Pages deployment
  // Use '/Webfun/' for GitHub Pages, or '/' for custom domain
  base: process.env.NODE_ENV === 'production' ? '/Webfun/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});
