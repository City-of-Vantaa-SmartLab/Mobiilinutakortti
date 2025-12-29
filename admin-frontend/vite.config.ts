import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const hmrClientPort = env.VITE_DEV_SERVER_PORT ? Number(env.VITE_DEV_SERVER_PORT) : undefined;
  return {
    plugins: [react()],
    publicDir: 'public',
    server: {
      port: Number(process.env.PORT) || 3000,
      strictPort: false,
      host: true,
      hmr: {
        clientPort: hmrClientPort,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000', // Note: this would be the container's localhost if running inside Docker.
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'build',
      chunkSizeWarningLimit: 2048 // Note: due to react-admin, it is very difficult to split code reasonably so that it would still work (e.g. no circular dependencies). Therefore to keep things simple, we just accept the bundle will be quite big.
    }
  }
});
