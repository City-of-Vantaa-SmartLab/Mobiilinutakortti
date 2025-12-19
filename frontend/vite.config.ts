import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    port: Number(process.env.PORT) || 3000,
    strictPort: false, // allow fallback (e.g., 3001) if 3000 is taken
    host: true
  },
  build: {
    outDir: 'build'
  }
});
