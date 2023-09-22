import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/caravan/#",
  assetsInclude: ["**/*.wasm"],
  plugins: [
    wasm(),
    react(),
    nodePolyfills({
      protocolImports: true,
    }),
  ],
  build: {
    outDir: "build",
  },
  define: {
    VITE_GIT_SHA: JSON.stringify(process.env.VITE_GIT_SHA),
  },
  optimizeDeps: {
    // needed for local development to support proper handling of wasm
    exclude: ["caravan-descriptors"],
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ["../.."],
    },
  },
});
