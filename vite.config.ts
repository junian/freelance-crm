import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

function normalizeBase(value: string): string {
  if (!value || value === "/") return "/";
  return `/${value.replace(/^\/+|\/+$/g, "")}/`;
}

export default defineConfig(({ command, mode, isPreview }) => {
  // Keep `vite build --mode development` in development mode.
  const isDevBuild = command === "build" && mode === "development";
  // GitHub Pages can only serve static files. Build an SPA shell instead of an
  // SSR/Nitro bundle and prefix assets for project pages (/<repo>/).
  const isGitHubPages = mode === "github-pages";
  const useNitro = command === "build" || isPreview;
  const basePath = normalizeBase(process.env.BASE_PATH ?? "/");

  return {
    base: basePath,
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
        ...(isGitHubPages
          ? {
              prerender: {
                enabled: true,
                autoSubfolderIndex: true,
                crawlLinks: false,
              },
            }
          : {}),
        importProtection: {
          behavior: "error",
          client: {
            files: ["**/server/**"],
            specifiers: ["server-only"],
          },
        },
      }),
      ...(useNitro
        ? [
            nitro(
              isGitHubPages ? { preset: "node-server" } : { defaultPreset: "cloudflare-module" },
            ),
          ]
        : []),
      viteReact(),
    ],
  };
});
