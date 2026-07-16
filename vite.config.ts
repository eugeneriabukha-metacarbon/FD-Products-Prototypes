import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const localModule = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // The DS packages are `file:` links into the `fd-apps-design-system`
    // submodule, which carries its own React types → without this, React can
    // resolve to two copies and any hook-using lib (motion) throws "Invalid
    // hook call". Force a single React/React-DOM instance.
    dedupe: ["react", "react-dom"],
    alias: {
      react: localModule("./node_modules/react"),
      "react-dom": localModule("./node_modules/react-dom"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
