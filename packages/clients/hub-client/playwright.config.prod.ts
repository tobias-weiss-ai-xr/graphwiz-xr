import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for production E2E tests
 * Tests against live production environment
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run sequentially to avoid resource conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1, // Single worker for production tests

  reporter: [
    ['html', { outputFolder: 'playwright-report/prod' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit-prod.xml' }],
  ],

  use: {
    baseURL: 'https://xr.graphwiz.ai',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'production-chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use built-in Chromium
      },
    },
  ],

  // Don't start a dev server for production tests
  webServer: undefined,
});
