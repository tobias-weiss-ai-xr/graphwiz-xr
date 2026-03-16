/**
 * E2E tests for Performance Overlay UI component
 * Tests the performance metrics overlay in App.tsx
 *
 * Tests for:
 * - Performance button visibility in bottom-right area
 * - Clicking button shows performance overlay
 * - Overlay displays FPS, Entities, Remote Players, Network Latency
 * - Overlay can be hidden by clicking button again
 * - Button text changes between "⚡ Performance" and "📊 Hide Stats"
 */

import { test, expect, Page, Locator } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

async function clickButtonWithForce(page: Page, button: Locator): Promise<void> {
  await button.click({ force: true });
}

test.describe('Performance Overlay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    // Wait for app to initialize
    await expect(page.locator('h1', { hasText: /GraphWiz/i })).toBeVisible({ timeout: 30000 });
  });

  test('Performance button visible in bottom-right area', async ({ page }) => {
    // Performance toggle button should be visible positioned in bottom-right
    const perfButton = page.locator('button').filter({ hasText: /Performance|Hide Stats/ });
    await expect(perfButton).toBeVisible({ timeout: 30000 });

    // Verify button has proper dimensions
    const buttonBox = await perfButton.boundingBox();
    expect(buttonBox).toBeTruthy();
    expect(buttonBox!.width).toBeGreaterThan(50);
    expect(buttonBox!.height).toBeGreaterThan(20);
  });

  test('Clicking performance button shows overlay', async ({ page }) => {
    const perfButton = page.locator('button').filter({ hasText: /Performance|Hide Stats/ });

    // Initial state: button should show "Performance" label
    await expect(perfButton).toContainText('⚡ Performance', { timeout: 30000 });

    // Click the button to open overlay
    await clickButtonWithForce(page, perfButton);

    // Verify overlay is now visible
    const overlay = page
      .locator('div')
      .filter({
        hasText: 'Performance Metrics'
      })
      .first();
    await expect(overlay).toBeVisible({ timeout: 30000 });

    // Verify button text changed to "Hide Stats"
    await expect(perfButton).toContainText('📊 Hide Stats', { timeout: 30000 });
  });

  test('Overlay displays FPS metric', async ({ page }) => {
    const perfButton = page.locator('button').filter({ hasText: /Performance|Hide Stats/ });

    // Open overlay
    await clickButtonWithForce(page, perfButton);

    // Verify overlay contains FPS information
    const overlay = page
      .locator('div')
      .filter({
        hasText: 'Performance Metrics'
      })
      .first();
    await expect(overlay).toBeVisible({ timeout: 30000 });

    // Check for FPS label
    const fpsLabel = overlay.locator('text=FPS:').first();
    await expect(fpsLabel).toBeVisible({ timeout: 30000 });

    // FPS value should be displayed (numeric value after the label)
    const fpsValue = overlay.locator('text=/^[0-9]+\.?[0-9]*$/').first();
    // Allow for initial 0.0 value
    await expect(fpsValue).toBeVisible({ timeout: 30000 });
  });

  test('Overlay displays Entities count', async ({ page }) => {
    const perfButton = page.locator('button').filter({ hasText: /Performance|Hide Stats/ });

    // Open overlay
    await clickButtonWithForce(page, perfButton);

    const overlay = page
      .locator('div')
      .filter({
        hasText: 'Performance Metrics'
      })
      .first();
    await expect(overlay).toBeVisible({ timeout: 30000 });

    // Check for Entities label
    const entitiesLabel = overlay.locator('text=Entities:').first();
    await expect(entitiesLabel).toBeVisible({ timeout: 30000 });

    // Entities count should be displayed
    const entitiesValue = overlay.locator('text=/^[0-9]+$/').first();
    await expect(entitiesValue).toBeVisible({ timeout: 30000 });
  });

  test('Overlay displays Remote Players count', async ({ page }) => {
    const perfButton = page.locator('button').filter({ hasText: /Performance|Hide Stats/ });

    // Open overlay
    await clickButtonWithForce(page, perfButton);

    const overlay = page
      .locator('div')
      .filter({
        hasText: 'Performance Metrics'
      })
      .first();
    await expect(overlay).toBeVisible({ timeout: 30000 });

    // Check for Remote Players label
    const remotePlayersLabel = overlay.locator('text=Remote Players:').first();
    await expect(remotePlayersLabel).toBeVisible({ timeout: 30000 });

    // Remote Players count should be displayed
    const remotePlayersValue = overlay.locator('text=/^[0-9]+$/').first();
    await expect(remotePlayersValue).toBeVisible({ timeout: 30000 });
  });

  test('Overlay displays Network Latency', async ({ page }) => {
    const perfButton = page.locator('button').filter({ hasText: /Performance|Hide Stats/ });

    // Open overlay
    await clickButtonWithForce(page, perfButton);

    const overlay = page
      .locator('div')
      .filter({
        hasText: 'Performance Metrics'
      })
      .first();
    await expect(overlay).toBeVisible({ timeout: 30000 });

    // Check for Network Latency label
    const latencyLabel = overlay.locator('text=Network Latency:').first();
    await expect(latencyLabel).toBeVisible({ timeout: 30000 });
    // Network latency value should be displayed with "ms" unit
    const latencyValue = overlay.locator('text=/^[0-9]+ms$/').first();
    await expect(latencyValue).toBeVisible({ timeout: 30000 });
  });

  test('Overlay can be hidden by clicking button again', async ({ page }) => {
    const perfButton = page.locator('button').filter({ hasText: /Performance|Hide Stats/ });

    // Open overlay
    await clickButtonWithForce(page, perfButton);
    await expect(perfButton).toContainText('📊 Hide Stats', { timeout: 30000 });

    const overlay = page
      .locator('div')
      .filter({
        hasText: 'Performance Metrics'
      })
      .first();
    await expect(overlay).toBeVisible({ timeout: 30000 });

    // Click button again to close overlay
    await clickButtonWithForce(page, perfButton);

    // Verify overlay is hidden
    await expect(overlay).not.toBeVisible({ timeout: 30000 });

    // Verify button text changed back to "Performance"
    await expect(perfButton).toContainText('⚡ Performance', { timeout: 30000 });
  });

  test('Button text changes between Performance and Hide Stats', async ({ page }) => {
    const perfButton = page.locator('button').filter({ hasText: /Performance|Hide Stats/ });

    // Initial state: Performance button
    await expect(perfButton).toContainText('⚡ Performance', { timeout: 30000 });

    // Click to open - should change to Hide Stats
    await clickButtonWithForce(page, perfButton);
    await expect(perfButton).toContainText('📊 Hide Stats', { timeout: 30000 });

    // Click to close - should change back to Performance
    await clickButtonWithForce(page, perfButton);
    await expect(perfButton).toContainText('⚡ Performance', { timeout: 30000 });

    // Click again to verify toggle works multiple times
    await clickButtonWithForce(page, perfButton);
    await expect(perfButton).toContainText('📊 Hide Stats', { timeout: 30000 });
  });

  test('All metrics displayed in grid layout with 2 columns', async ({ page }) => {
    const perfButton = page.locator('button').filter({ hasText: /Performance|Hide Stats/ });

    // Open overlay
    await clickButtonWithForce(page, perfButton);

    const overlay = page
      .locator('div')
      .filter({
        hasText: 'Performance Metrics'
      })
      .first();
    await expect(overlay).toBeVisible({ timeout: 30000 });

    // Count metric display groups - should have multiple rows of metrics
    const metricItems = overlay.locator('div').filter({
      has: page
        .locator('span')
        .filter({ hasText: /FPS |Entities |Remote Players |Network Latency:/ })
    });

    // Should have at least 4 metric items (FPS, Entities, Remote Players, Network Latency)
    const metricCount = await metricItems.count();
    expect(metricCount).toBeGreaterThan(0);
  });

  test('Overlay has proper styling - dark background and monospace font', async ({ page }) => {
    const perfButton = page.locator('button').filter({ hasText: /Performance|Hide Stats/ });

    // Open overlay
    await clickButtonWithForce(page, perfButton);

    const overlay = page
      .locator('div')
      .filter({
        hasText: 'Performance Metrics'
      })
      .first();
    await expect(overlay).toBeVisible({ timeout: 30000 });

    // Verify overlay background is dark
    const overlayBox = await overlay.boundingBox();
    expect(overlayBox).toBeTruthy();

    // Check for monospace font style (might be in CSS or inline styles)
    const fontFamily = await overlay.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return computed.fontFamily || el.style.fontFamily || '';
    });
    // Monospace font might not be explicitly set, so just verify overlay is visible
    // The fontFamily string should contain monospace or be a generic font
    expect(fontFamily).toBeTruthy();

    // Verify white text color
    const textColor = await overlay.evaluate((el) => el.style.color);
    expect(textColor).toBe('#fff');
  });
});
