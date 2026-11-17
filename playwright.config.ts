import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests/crm",
  testMatch: "browser.spec.ts",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4180",
    headless: true,
    launchOptions: {
      executablePath: process.env.CRM_CHROMIUM_PATH || undefined,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
    trace: "retain-on-failure",
  },
  // Android emulator runs first. These projects do not claim physical-device acceptance.
  projects: [
    {
      name: "Android Chrome emulation",
      use: { ...devices["Pixel 7"], browserName: "chromium" },
    },
    {
      name: "iPhone viewport emulation (Chromium)",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
    },
    {
      name: "Desktop Chromium",
      use: { ...devices["Desktop Chrome"], browserName: "chromium" },
    },
  ],
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4180 --strictPort",
    url: "http://127.0.0.1:4180/admin",
    reuseExistingServer: false,
  },
});
