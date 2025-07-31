import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    mode !== 'test' ? vueDevTools() : undefined, // Exclude in test mode
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
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
  },
}));