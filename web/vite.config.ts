import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react-swc';
import generouted from '@generouted/react-router/plugin';
import unocss from '@unocss/vite';
import mdx from '@mdx-js/rollup';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    { enforce: 'pre', ...mdx() },
    react(),
    generouted(),
    unocss(),
    visualizer()
  ],
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
