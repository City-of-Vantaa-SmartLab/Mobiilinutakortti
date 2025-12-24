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
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      }
    },
    build: {
      outDir: 'build',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor chunks for large libraries
            if (id.includes('node_modules/react-admin')) {
              return 'vendor-react-admin';
            }
            if (id.includes('node_modules/@mui')) {
              return 'vendor-mui';
            }
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }

            // Check-in related features
            if (id.includes('/components/checkIn/') ||
                id.includes('/components/checkInLog') ||
                id.includes('/components/checkInStatistics') ||
                id.includes('/checkInStyledComponents')) {
              return 'check-in';
            }
            // Extra entries feature
            if (id.includes('/components/extraEntry/')) {
              return 'extra-entries';
            }
            // Admin-only features
            if (id.includes('/components/newSeason') ||
                id.includes('/components/newSeasonModal') ||
                id.includes('/components/miscFunctions') ||
                id.includes('/components/deleteExpiredJuniors')) {
              return 'admin-features';
            }
          }
        }
      }
    }
  }
});
