import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const localModule = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // The DS is consumed as source from the sibling `fd-apps-design-system/`
    // submodule, whose location can't walk up to THIS package's node_modules.
    // Alias its imports (+ React, deduped to one copy) to our node_modules so
    // they resolve from the DS source. Without the React pin, motion throws
    // "Invalid hook call"; without the others, the DS source fails to resolve.
    dedupe: ["react", "react-dom"],
    alias: {
      react: localModule("./node_modules/react"),
      "react-dom": localModule("./node_modules/react-dom"),
      clsx: localModule("./node_modules/clsx"),
      "tailwind-merge": localModule("./node_modules/tailwind-merge"),
      "class-variance-authority": localModule(
        "./node_modules/class-variance-authority",
      ),
      "@phosphor-icons/react": localModule("./node_modules/@phosphor-icons/react"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
