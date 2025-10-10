import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 600, // Optional, Increases warning threshold
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('primereact')) return 'primereact';
            if (id.includes('primeicons')) return 'primeicons';
            if (id.includes('chart.js')) return 'chart.js';
            if (id.includes('xlsx')) return 'xlsx';
            return 'vendor';
          }
        }
      },
    },
  }
});
