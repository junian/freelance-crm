import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig(({ command, mode, isPreview }) => {
  // Keep `vite build --mode development` in development mode.
  const isDevBuild = command === "build" && mode === "development";
  const useNitro = command === "build" || isPreview;

  return {
    ...(isDevBuild ? { define: { "process.env.NODE_ENV": JSON.stringify("development") } } : {}),
    resolve: {
      alias: { "@": srcDir },
      tsconfigPaths: true,
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      ignoreOutdatedRequests: true,
    },
    plugins: [
      tailwindcss(),
      ...tanstackStart({
        // Redirect TanStack Start's bundled server entry to src/server.ts
        // (our SSR error wrapper). Nitro builds from this.
        server: { entry: "server" },
        importProtection: {
          behavior: "error",
          client: {
            files: ["**/server/**"],
            specifiers: ["server-only"],
          },
        },
      }),
      ...(useNitro ? [nitro({ defaultPreset: "cloudflare-module" })] : []),
      viteReact(),
    ],
  };
});
