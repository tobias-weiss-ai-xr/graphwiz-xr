import { defineConfig, devices } from '@playwright/test';

/**
 * Unified Playwright configuration for GraphWiz-XR
 *
 * Supports multiple test environments via environment variables:
 * - LOCAL: Local development (localhost:5173)
 * - PRODUCTION: Production tests (https://xr.graphwiz.ai)
 * - WS_TEST: WebSocket testing (production URLs, custom timeouts)
 */

const isCI = !!process.env.CI;
const isProduction = process.env.TEST_ENV === 'production';
const isWSTest = process.env.TEST_ENV === 'ws-test';

const baseURL = isProduction || isWSTest ? 'https://xr.graphwiz.ai' : 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',

  // Environment-specific settings
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Parallel execution based on environment
    launchOptions: {
      args: isProduction
        ? [
            '--disable-web-security', // Allow CORS in production
            '--no-sandbox' // Bypass sandbox
          ]
        : [],

      // Slower headless mode in CI
      headless: isCI
    },

    // Action timeouts based on environment
    actionTimeout: isWSTest ? 10000 : 60000,
    navigationTimeout: isWSTest ? 30000 : 100000

    // Reduce retries in CI to fail fast
  },

  // Test execution strategy
  fullyParallel: !isProduction && !isWSTest, // Sequential in production/WS tests
  forbidOnly: !isCI,
  retries: isCI ? 0 : 2,

  // Output configuration
  reporter: isProduction
    ? [
        ['html', { outputFolder: 'playwright-report/prod' }],
        ['list'],
        ['junit', { outputFile: 'test-results/junit-prod.xml' }]
      ]
    : isWSTest
      ? ['list']
      : [['html'], ['list'], ['junit', { outputFile: 'test-results/junit.xml' }]],

  // Browser configurations
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit-safari',
      use: { ...devices['Desktop Safari'] }
    }
  ],

  // Dev server (only for local testing)
  webServer: isProduction
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !isCI,
        timeout: 120000
      },

  // Workers configuration
  workers: isProduction ? 1 : process.env.CI ? 1 : undefined
});
