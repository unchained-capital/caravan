import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/caravan/#",
  resolve: {
    alias: {
      utils: path.resolve(__dirname, "./src/utils"),
    },
  },
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
    __GIT_SHA__: JSON.stringify(process.env.__GIT_SHA__),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  optimizeDeps: {
    include: [
      /*
        Add packages you want to develop locally with caravan here
        for example, uncomment the ones below if working on either package
      */
      // "unchained-bitcoin",
      // "unchained-wallets",
    ],
  },
});
