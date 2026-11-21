import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const LOCAL_BASE_URL = `http://127.0.0.1:${String(PORT)}/whereql/`;

// Set WHEREQL_BASE_URL to run the same suite against the deployed site.
const deployed = process.env.WHEREQL_BASE_URL;
const isCi = process.env.CI !== undefined;

export default defineConfig({
  testDir: "e2e",
  outputDir: "test-results",
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  reporter: isCi
    ? [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"]],
  use: {
    baseURL: deployed ?? LOCAL_BASE_URL,
    trace: "retain-on-failure",
    // The working layout must stay usable at this width (SDD 8.1).
    viewport: { width: 1024, height: 768 },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1024, height: 768 },
      },
    },
  ],
  ...(deployed === undefined
    ? {
        webServer: {
          command:
            "node --disable-warning=ExperimentalWarning e2e/serve-subpath.ts",
          url: LOCAL_BASE_URL,
          env: { PORT: String(PORT) },
          reuseExistingServer: !isCi,
        },
      }
    : {}),
});
