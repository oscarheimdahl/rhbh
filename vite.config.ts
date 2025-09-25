import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// import Terminal from 'vite-plugin-terminal';

// https://vite.dev/config/
export default defineConfig({
  base: '/rhbh/',
  plugins: [
    react(),
    tailwindcss(),
    // Terminal({
    //   console: 'terminal',
    //   output: ['terminal', 'console'],
    // }),
  ],
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg'],
  },
});
