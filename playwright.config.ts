import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 1,
  reporter: "html",

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  webServer: {
    command: "npm run dev:test",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120000, 
  },

  projects: [
    {
      name: "chromium",
    },
  ],
});