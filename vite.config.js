import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/caravan/",
  plugins: [
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
});
