import { createLogger, defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Suppress a false flag warning during building.
const logger = createLogger();
const suppressableWarning = '"/env.js"> in "/index.html" can\'t be bundled without type="module" attribute';
const loggerWarn = logger.warn;
logger.warn = (msg, options) => {
  if (typeof msg === 'string' && msg.includes(suppressableWarning)) {
    return;
  }
  loggerWarn(msg, options);
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const hmrClientPort = env.VITE_DEV_SERVER_PORT ? Number(env.VITE_DEV_SERVER_PORT) : undefined;
  // Note: localhost would be this container's localhost if running inside Docker, so define correctly in docker-container.yml.
  const apiTargetHost = process.env.VITE_API_TARGET_HOST || "localhost"
  return {
    customLogger: logger,
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
