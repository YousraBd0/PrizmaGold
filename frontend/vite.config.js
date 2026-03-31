import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      "/trends": "http://localhost:8000",
      "/images": "http://localhost:8000",
    },
  },
  optimizeDeps: {
    include: ["recharts", "framer-motion"],
  },
});
