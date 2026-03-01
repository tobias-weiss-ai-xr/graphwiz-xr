import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const isProduction = process.env.TEST_ENV === 'production';
const isWSTest = process.env.TEST_ENV === 'ws-test';
const baseURL = isProduction || isWSTest ? 'https://xr.graphwiz.ai' : 'http://localhost:5173';
export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    // Launch options - always headless for efficiency
    launchOptions: {
      args: isProduction
        ? ['--disable-web-security', '--no-sandbox']
        : ['--disable-extensions', '--disable-gpu'],
      headless: true
    },
    // Reuse browser context for efficiency
    storageState: undefined,
    ignoreHTTPSErrors: true
  },
  // Test execution strategy
  fullyParallel: false,
  forbidOnly: !isCI,
  retries: isCI ? 0 : 1,
  // Output configuration
  reporter: [['list'], ['html', { open: 'never' }]],
  // Single browser configuration for efficiency
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      }
    }
  ],
  // Dev server (only for local testing)
  webServer: isProduction
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 120000
      },
  // Workers for parallel test execution
  workers: 8, // 8 workers for faster parallel execution
});
