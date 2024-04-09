import generouted from "@generouted/react-router/plugin";
import mdx from "@mdx-js/rollup";
import unocss from "@unocss/vite";
import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    { enforce: "pre", ...mdx() },
    react(),
    generouted(),
    unocss(),
    visualizer(),
    legacy(),
  ],
  server: {
    proxy: {
      "/r": { target: "http://localhost:3000" },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
