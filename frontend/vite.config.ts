import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const hmrClientPort = env.VITE_HMR_CLIENT_PORT ? Number(env.VITE_HMR_CLIENT_PORT) : undefined;
  return {
    plugins: [react()],
    publicDir: 'public',
    server: {
      port: Number(process.env.PORT) || 3000,
      strictPort: false,
      host: true,
      hmr: {
        clientPort: hmrClientPort,
      }
    },
    build: {
      outDir: 'build',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/src/components/ParentRegistration/')) {
              return 'parent-registration';
            }
          }
        }
      }
    }
  }
});
