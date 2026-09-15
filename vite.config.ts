import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 47321,
    strictPort: true,
    allowedHosts: true,
    hmr: {
      host: "127.0.0.1",
      protocol: "ws",
      clientPort: 47321,
    },
  },
  preview: {
    host: true,
    port: 47321,
  },
});
