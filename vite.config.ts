import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // <- define que @ apunta a src
    },
  },
});