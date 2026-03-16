import { test, expect } from '@playwright/test';

/**
 * Settings Panel UI Component Tests
 *
 * Tests for the Settings Panel component:
 * - Button visibility
 * - Panel opening/closing
 * - Settings display
 * - Close functionality
 */

const BASE_URL = 'http://localhost:5173';

/**
 * Helper to click button with force (handles overlays)
 */
async function clickWithForce(
  page: import('@playwright/test').Page,
  locator: import('@playwright/test').Locator
) {
  try {
    await locator.click({ force: true });
    await page.waitForTimeout(200);
  } catch {
    // Ignore if element is not visible or covered
  }
}

test.describe('Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('canvas', { timeout: 15000 });
  });

  test('Settings button visible in connection overlay', async ({ page }) => {
    // Wait for app to initialize
    await expect(page.locator('h1', { hasText: /GraphWiz/i })).toBeVisible();

    // Settings button should be visible - use text-based selector
    const settingsButton = page
      .getByRole('button', { name: /Settings/ })
      .or(page.locator('button').filter({ hasText: 'Settings' }));
    await expect(settingsButton.first()).toBeVisible();
  });

  test('Click opens settings panel', async ({ page }) => {
    const settingsButton = page.locator('button').filter({ hasText: 'Settings' });
    await settingsButton.first().click({ force: true });

    // Panel should contain 'Settings' title or    const settingsTitle = page.getByText('Settings');
    await expect(settingsTitle).toBeVisible({ timeout: 10000 });

    // Panel should contain tab buttons
    const audioTab = page.getByRole('button', { name: /Audio/ });
    const graphicsTab = page.getByRole('button', { name: /Graphics/ });
    await expect(audioTab).toBeVisible();
    await expect(graphicsTab).toBeVisible();
  });

  test('Settings displayed across categories', async ({ page }) => {
    const settingsButton = page.locator('button').filter({ hasText: 'Settings' });
    await settingsButton.first().click({ force: true });
    await page.waitForTimeout(300);

    // Verify tabs are visible
    const audioTab = page.getByRole('button', { name: /Audio/ });
    const graphicsTab = page.getByRole('button', { name: /Graphics/ });
    const networkTab = page.getByRole('button', { name: /Network/ });
    const accountTab = page.getByRole('button', { name: /Account/ });

    await expect(audioTab).toBeVisible();
    await expect(graphicsTab).toBeVisible();
    await expect(networkTab).toBeVisible();
    await expect(accountTab).toBeVisible();

    // Count controls in default tab
    const audioControls = await page.locator('input, select').count();
    expect(audioControls).toBeGreaterThan(0);

    // Switch to Graphics tab
    await graphicsTab.click({ force: true });
    await page.waitForTimeout(200);
    const graphicsControls = await page.locator('input, select').count();
    expect(graphicsControls).toBeGreaterThan(0);

    // Switch to Network tab
    await networkTab.click({ force: true });
    await page.waitForTimeout(200);
    const networkControls = await page.locator('input, select').count();
    expect(networkControls).toBeGreaterThan(0);

    // Switch to Account tab
    await accountTab.click({ force: true });
    await page.waitForTimeout(200);
    const accountControls = await page.locator('input, select').count();
    expect(accountControls).toBeGreaterThan(0);

    // Total controls should be more than 10
    const totalControls = audioControls + graphicsControls + networkControls + accountControls;
    expect(totalControls).toBeGreaterThan(10);
  });

  test('Close button hides panel', async ({ page }) => {
    const settingsButton = page.locator('button').filter({ hasText: 'Settings' });
    await settingsButton.first().click({ force: true });
    await page.waitForTimeout(300);

    // Panel should be visible
    const settingsTitle = page.getByText('Settings');
    await expect(settingsTitle).toBeVisible({ timeout: 5000 });

    // Close button is × in header
    const closeButton = page.locator('button').filter({ hasText: '×' });
    await expect(closeButton.first()).toBeVisible();

    // Click close button
    await closeButton.first().click({ force: true });
    await page.waitForTimeout(300);

    // Panel should be hidden
    await expect(settingsTitle).not.toBeVisible({ timeout: 3000 });
  });
});
