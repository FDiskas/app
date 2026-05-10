import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      // Proxy everything that is not root, not /api, and doesn't look like a file/vite internal
      "^/(?!api|@vite|@react-refresh|@fs|@id|node_modules|src|index\\.html|$|.*\\.).*": "http://localhost:3000",
    },
  },
  root: "src/client",
  build: {
    outDir: "../../dist/client",
    emptyOutDir: true,
  },
});
