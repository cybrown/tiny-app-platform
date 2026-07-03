import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { isAbsolute } from "node:path";

// Everything that is not a relative or absolute path is a bare import
// (react, other tal-web-* packages, tal-eval, xterm, ...) and must be
// externalized so it is not bundled into the library output.
const isExternal = (id: string) => !id.startsWith(".") && !isAbsolute(id);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dts({ include: ["src"] })],
  build: {
    lib: {
      entry: "src/index.tsx",
      formats: ["es"],
      fileName: () => "index.js",
      cssFileName: "style",
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: isExternal,
    },
  },
});
