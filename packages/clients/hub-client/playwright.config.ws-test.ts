import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for WebSocket testing
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,

  reporter: [
    ['list'],
  ],

  use: {
    baseURL: 'https://xr.graphwiz.ai',
    actionTimeout: 10000,
    navigationTimeout: 30000,
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'production-chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // Don't start a dev server
  webServer: undefined,
});
