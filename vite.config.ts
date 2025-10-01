import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1024, // Optional, Increases warning threshold
    rollupOptions: {
      output: {
        // Manual Chunking
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('primereact')) return 'primereact'; // All PrimeReact components
            if (id.includes('primeicons')) return 'primeicons'; // All PrimeIcons
            if (id.includes('xlsx')) return 'xlsx'; // XLSX library
            return 'vendor';  // Other node_modules
          }
        },
      },
    },
  }
});
