import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { Plugin } from "vite";

const isReplit = process.env.REPL_ID !== undefined;
const isDev = process.env.NODE_ENV !== "production";

// Load Replit plugins conditionally
const replitPlugins: Plugin[] = [];
if (isDev && isReplit) {
  // These will be loaded dynamically at build time
  // For now, we skip them to avoid issues
}

export default defineConfig({
  // ... other configs
  resolve: {
    alias: {
      // CHANGE THIS: remove "frontend"
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  root: path.resolve(import.meta.dirname), 
  build: {
    // Keep this as is, it's already absolute
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // ...
  },
});
