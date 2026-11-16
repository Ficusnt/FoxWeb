import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
    assetsInlineLimit: 0,
  },
  server: {
    port: 5173,
  },
});