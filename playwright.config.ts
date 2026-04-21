import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './E2E',
  fullyParallel: true,
  reporter: 'html',
  use: {
    // This is the URL of your Vite dev server
    baseURL: 'http://localhost:5173', 
    trace: 'on-first-retry',
  },
  // START YOUR SERVER AUTOMATICALLY
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // You can uncomment these for cross-browser testing
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
