import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "",
  server: {
    proxy: {
      "/configuration": {
        target: "http://localhost:3001",
      },
      "/op": {
        target: "http://localhost:3001",
      },
    },
    port: 3000,
  },
});
