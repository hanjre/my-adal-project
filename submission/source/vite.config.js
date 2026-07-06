import { defineConfig } from "vite";

// Vite dev server: proxy /api/* calls to the Express backend so the
// frontend can use a same-origin fetch without CORS configuration.
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  }
});
