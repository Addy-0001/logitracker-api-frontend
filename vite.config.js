import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Use the package's main entry point instead of a specific file
      '@maptiler/sdk': '@maptiler/sdk',
      'leaflet': fileURLToPath(new URL('./node_modules/leaflet/dist/leaflet.js', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['@maptiler/sdk', 'leaflet'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    deps: {
      inline: ['@testing-library/vue'],
    },
  }
});