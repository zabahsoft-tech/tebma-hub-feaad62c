// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Static output only — no server runtime is deployed.
  nitro: false,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts.
    server: { entry: "server" },
    // Full client-side rendering: the app ships as a static SPA shell.
    // This keeps the build deployable on plain static hosting (cPanel).
    spa: { enabled: true },
    prerender: {
      enabled: true,
      // Only the SPA shell is emitted; no route is rendered ahead of time.
      crawlLinks: false,
    },
  },
});
