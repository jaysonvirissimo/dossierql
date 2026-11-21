import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { yamlContent } from "./build/yaml-plugin.ts";

export default defineConfig({
  // Relative asset URLs let one build run from any path, including a
  // GitHub Pages project site, without knowing the repository name.
  base: "./",
  plugins: [react(), yamlContent()],
  worker: { format: "es" },
  build: { target: "es2022", chunkSizeWarningLimit: 700 },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
  },
});
