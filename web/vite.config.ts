import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react-swc';
import generouted from '@generouted/react-router/plugin';
import unocss from '@unocss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), generouted(), unocss()],
  server: {
    proxy: {
      '/r': { target: 'http://localhost:3000' }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
