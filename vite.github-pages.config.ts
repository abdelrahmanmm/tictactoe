import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * This config is specifically for GitHub Pages deployment
 * 
 * Key differences from the normal config:
 * 1. Static site with no backend - game logic runs in browser
 * 2. Uses relative paths for assets with base: './'
 * 3. Outputs to a separate directory to avoid mixing with server code
 * 4. Does not include server-side code or unnecessary build files
 */
export default defineConfig({
  plugins: [
    react(),
    themePlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  // Use your actual repository name here for GitHub Pages
  base: "/tictactoe/", 
  build: {
    outDir: path.resolve(__dirname, "github-pages-build"),
    emptyOutDir: true,
    // Ensure we generate a proper index.html at the root
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "client", "index.html"),
      },
    },
    // Ensure all assets use relative URLs
    assetsDir: "assets",
  },
});