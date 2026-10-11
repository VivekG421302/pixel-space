import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In development the browser talks to the Vite server and these paths are proxied to the Spring Boot
// backend, so the refresh cookie is same-origin and no CORS setup is needed locally.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.DEV_API_PROXY || 'http://localhost:8080';
  const proxy = Object.fromEntries(['/api'].map((p) => [p, { target, changeOrigin: false }]));
  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
  };
});
