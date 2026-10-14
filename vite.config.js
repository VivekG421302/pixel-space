import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// In development the browser talks to the Vite server and these paths are proxied to the Spring Boot
// backend, so the refresh cookie is same-origin and no CORS setup is needed locally.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.DEV_API_PROXY || 'http://localhost:8080';
  const proxy = Object.fromEntries(['/api'].map((p) => [p, { target, changeOrigin: false }]));
  return {
    plugins: [
      react(),
      // Installable app + offline support. The service worker precaches the build (HTML, JS, CSS, sprites, icons) and the
      // Google Fonts files; the backend API is never cached. `registerType: 'prompt'` lets the app ask before reloading
      // into a new version (src/pwa.js).
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'Focus Quest',
          short_name: 'Focus Quest',
          description: 'A pixel-art focus timer with a roaming buddy, tasks, a garden builder and a pixel creator.',
          lang: 'en',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'any',
          background_color: '#78c850',
          theme_color: '#78c850',
          categories: ['productivity', 'games'],
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
          cleanupOutdatedCaches: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            { urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com', handler: 'StaleWhileRevalidate', options: { cacheName: 'google-fonts-css' } },
            {
              urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
              handler: 'CacheFirst',
              options: { cacheName: 'google-fonts-files', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
            },
          ],
        },
      }),
    ],
    server: { proxy },
    preview: { proxy },
  };
});
