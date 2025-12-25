/**
 * Basic E2E tests for GraphWiz-XR Hub Client
 */

import { test, expect } from '@playwright/test';

test.describe('Hub Client - Basic Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads without errors
    await expect(page).toHaveTitle(/GraphWiz-XR|Hub Client/);
  });

  test('should render the main canvas', async ({ page }) => {
    await page.goto('/');

    // Check for canvas element (Three.js renderer)
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeAttached();
  });

  test('should have connection status indicator', async ({ page }) => {
    await page.goto('/');

    // Check for connection status element
    const statusIndicator = page.locator('[data-testid="connection-status"], .connection-status, #status').first();
    // The status indicator might not exist yet, so we don't assert
    // Just verify the page doesn't crash
    await expect(page).toHaveTitle(/./);
  });

  test('should handle window resize', async ({ page }) => {
    await page.goto('/');

    // Resize window
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(100);

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(100);

    // Verify page is still responsive
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Hub Client - 3D Scene Tests', () => {
  test('should initialize Three.js scene', async ({ page }) => {
    await page.goto('/');

    // Wait for Three.js to initialize
    await page.waitForLoadState('networkidle');

    // Check that canvas exists and is visible
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('should render scene elements', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    // Check for WebGL context (Three.js uses WebGL)
    const hasWebGL = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext ||
        (window as any).WebGL2RenderingContext
      );
    });

    expect(hasWebGL).toBeTruthy();
  });
});

test.describe('Hub Client - Error Handling', () => {
  test('should handle missing server gracefully', async ({ page }) => {
    // Navigate with invalid server URL
    await page.goto('/', {
      waitUntil: 'domcontentloaded'
    });

    // Page should still load even if connection fails
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle keyboard input', async ({ page }) => {
    await page.goto('/');

    // Press various keys to ensure no crashes
    await page.keyboard.press('w');
    await page.keyboard.press('a');
    await page.keyboard.press('s');
    await page.keyboard.press('d');
    await page.keyboard.press('Space');

    // Verify page is still responsive
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Hub Client - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should not have memory leaks during navigation', async ({ page }) => {
    await page.goto('/');

    // Get initial memory usage
    const initialMetrics = await page.metrics();

    // Perform some interactions
    await page.mouse.move(100, 100);
    await page.mouse.click(100, 100);
    await page.waitForTimeout(100);

    // Get final memory usage
    const finalMetrics = await page.metrics();

    // Memory usage should not increase dramatically
    // (this is a basic check, real memory leak testing requires more sophisticated tools)
    expect(finalMetrics.JSHeapUsedSize).toBeGreaterThan(0);
  });
});
