import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/auth": "http://localhost:3000",
      "/employees": "http://localhost:3000",
      "/attendance": "http://localhost:3000",
      "/payroll": "http://localhost:3000",
      "/documents": "http://localhost:3000",
      "/files": "http://localhost:3000",
      "/api": "http://localhost:3000", // For swagger or generic
    },
  },
  build: {
    outDir: "out",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("recharts")) return "recharts";
            if (id.includes("framer-motion")) return "framer-motion";
            if (id.includes("lucide-react")) return "lucide";
            return "vendor";
          }
        },
      },
    },
  },
});
