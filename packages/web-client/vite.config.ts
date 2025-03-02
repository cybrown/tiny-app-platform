import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const PORT = '3001'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "",
  server: {
    proxy: {
      "/configuration": {
        target: "http://localhost:" + PORT,
      },
      "/op": {
        target: "http://localhost:" + PORT,
      },
      "/ws": {
        target: "http://localhost:" + PORT,
        ws: true
      },
    },
    port: 3000,
  },
});
