import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifestFilename: "manifest.json",
      includeManifestIcons: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,webmanifest}"]
      },
      devOptions: {
        enabled: true
      },
      manifest: {
        name: "Neps Prode",
        short_name: "Prode",
        description: "App de Prode Neps",
        theme_color: "#1976d2",
        background_color: "#ffffff",
        display: "standalone",
       icons: [
          {
            src: "/neps-logo.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/neps-logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        scope: "/",
        start_url: "/"
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // <- define que @ apunta a src
    },
  },
});