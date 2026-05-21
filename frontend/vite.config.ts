import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const hmrClientPort = env.VITE_DEV_SERVER_PORT ? Number(env.VITE_DEV_SERVER_PORT) : undefined;
  // Note: localhost would be this container's localhost if running inside Docker, so define correctly in docker-container.yml.
  const apiTargetHost = process.env.VITE_API_TARGET_HOST || "localhost"
  return {
    plugins: [react()],
    publicDir: 'public',
    server: {
      port: 3000,
      strictPort: false,
      host: true,
      hmr: {
        clientPort: hmrClientPort,
      },
      proxy: {
        '/api': {
          target: `http://${apiTargetHost}:3000`,
          changeOrigin: true,
        },
      }
    },
    build: {
      chunkSizeWarningLimit: 1000,
      outDir: 'build',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/src/components/ParentRegistration/')) {
              return 'parent-registration';
            }
          }
        }
      },
      target: "es2020"
    }
  }
});
