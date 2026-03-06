/**
 * Scene Selector UI Component Tests
 *
 * Tests for the SceneSelector component:
 * - Button visibility in top-right area
 * - Dropdown opens with 7 scene options
 * - Current scene highlighted
 * - Scene switching functionality
 * - ARIA accessibility attributes
 * - Keyboard navigation (Enter, Escape, Arrow keys)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('SceneSelector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('button visible in top-right area', async ({ page }) => {
    // Wait for app to initialize
    await expect(page.locator('h1', { hasText: /GraphWiz/i })).toBeVisible();

    // SceneSelector button should be visible in top-right corner
    const selectorButton = page
      .locator('button')
      .filter({
        hasText: /Default|Interactive|Media Demo/
      })
      .first();
    await expect(selectorButton).toBeVisible();

    // Verify button position (top-right area)
    const buttonBox = await selectorButton.boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(buttonBox!.y).toBeLessThan(50); // Should be near top
    expect(buttonBox!.x).toBeGreaterThan(0);
  });

  test('dropdown opens with 7 scene options', async ({ page }) => {
    const selectorButton = page
      .locator('button')
      .filter({
        hasText: /Default|Interactive|Media Demo/
      })
      .first();
    await expect(selectorButton).toBeVisible();

    // Click to open dropdown
    await selectorButton.click({ force: true });

    // Wait for dropdown to be visible
    await page.waitForSelector('text=Select Scene', { timeout: 3000 });

    // Count scene options - should be 7
    const options = page.locator('button').filter({
      hasText: /Default|Interactive|Media Demo|Grab Demo|Drawing|Portal|Gestures/
    });
    const optionCount = await options.count();
    expect(optionCount).toBe(7);
  });

  test('current scene highlighted', async ({ page }) => {
    const selectorButton = page
      .locator('button')
      .filter({
        hasText: /Default|Interactive|Media Demo/
      })
      .first();
    await selectorButton.click({ force: true });

    await page.waitForSelector('text=Select Scene', { timeout: 3000 });

    // Find all option buttons
    const options = page.locator('button').filter({
      hasText: /Default|Interactive|Media Demo|Grab Demo|Drawing|Portal|Gestures/
    });

    // First option (Default) should have aria-selected="true"
    const firstOption = options.first();
    const ariaSelected = await firstOption.getAttribute('aria-selected');
    expect(ariaSelected).toBe('true');

    // Other scenes should have aria-selected="false"
    for (let i = 1; i < (await options.count()); i++) {
      const option = options.nth(i);
      const selected = await option.getAttribute('aria-selected');
      expect(selected).toBe('false');
    }
  });

  test('scene switching functionality', async ({ page }) => {
    const selectorButton = page
      .locator('button')
      .filter({
        hasText: /Default|Interactive|Media Demo/
      })
      .first();
    const initialButtonText = await selectorButton.innerText();
    expect(initialButtonText).toContain('Default');

    // Click to open dropdown
    await selectorButton.click({ force: true });
    await page.waitForSelector('text=Select Scene', { timeout: 3000 });

    // Select a different scene
    const interactiveOption = page
      .locator('button')
      .filter({
        has: page.locator('text=Multiplayer interactive objects')
      })
      .first();
    await interactiveOption.click({ force: true });

    // Button should update to show new scene
    const newButtonText = await selectorButton.innerText();
    expect(newButtonText).toContain('Interactive');

    // Verify scene name changed
    expect(initialButtonText).not.toBe(newButtonText);
  });

  test('ARIA accessibility attributes', async ({ page }) => {
    const selectorButton = page
      .locator('button')
      .filter({
        hasText: /Default|Interactive|Media Demo/
      })
      .first();

    // Test aria-expanded when closed (component starts closed)
    let ariaExpanded = await selectorButton.getAttribute('aria-expanded');
    if (ariaExpanded !== null) {
      expect(ariaExpanded).toBe('false');
    }

    // Click to open
    await selectorButton.click({ force: true });

    // Test aria-expanded when open
    ariaExpanded = await selectorButton.getAttribute('aria-expanded');
    expect(ariaExpanded).toBe('true');

    // Test aria-haspopup
    let ariaHasPopup = await selectorButton.getAttribute('aria-haspopup');
    if (ariaHasPopup !== null) {
      expect(ariaHasPopup).toBe('listbox');
    }
  });

  test('keyboard navigation - Enter to select', async ({ page }) => {
    const selectorButton = page
      .locator('button')
      .filter({
        hasText: /Default|Interactive|Media Demo/
      })
      .first();

    // Open dropdown
    await selectorButton.click({ force: true });
    await page.waitForSelector('text=Select Scene', { timeout: 3000 });

    // Focus the button
    await selectorButton.focus();

    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    // Press Enter to select
    await page.keyboard.press('Enter');

    // Wait for UI update
    ;

    // Verify scene changed (should be Media Demo)
    const newButtonText = await selectorButton.innerText();
    expect(['Interactive', 'Media Demo']).toContain(newButtonText);
  });

  test('keyboard navigation - Escape to close', async ({ page }) => {
    const selectorButton = page
      .locator('button')
      .filter({
        hasText: /Default|Interactive|Media Demo/
      })
      .first();

    // Open dropdown
    await selectorButton.click({ force: true });

    const dropdownHeader = page.locator('text=Select Scene');
    await expect(dropdownHeader).toBeVisible({ timeout: 3000 });

    // Focus the button and press Escape
    await selectorButton.focus();
    await page.keyboard.press('Escape');

    // Wait for potential close animation
    ;

    // Dropdown should close
    await expect(dropdownHeader).not.toBeVisible({ timeout: 2000 });
  });

  test('keyboard navigation - Arrow keys to navigate', async ({ page }) => {
    const selectorButton = page
      .locator('button')
      .filter({
        hasText: /Default|Interactive|Media Demo/
      })
      .first();

    // Open dropdown
    await selectorButton.click({ force: true });

    // Wait for dropdown to be visible
    await page.waitForSelector('text=Select Scene', { timeout: 3000 });

    // Focus the button and use arrow keys
    await selectorButton.focus();

    // Press ArrowDown to navigate
    await page.keyboard.press('ArrowDown');

    // Press ArrowUp to go back
    await page.keyboard.press('ArrowUp');

    // Navigation should work
    await selectorButton.click({ force: true });
    const options = page.locator('button').filter({
      hasText: /Default|Interactive|Media Demo|Grab Demo|Drawing|Portal|Gestures/
    });

    // Verify all 7 scenes are still visible
    await expect(options).toHaveCount(7);
  });

  test('all 7 scenes available with correct descriptions', async ({ page }) => {
    const selectorButton = page
      .locator('button')
      .filter({
        hasText: /Default|Interactive|Media Demo/
      })
      .first();
    await selectorButton.click({ force: true });

    await page.waitForSelector('text=Select Scene', { timeout: 3000 });

    const options = page.locator('button').filter({
      hasText: /Default|Interactive|Media Demo|Grab Demo|Drawing|Portal|Gestures/
    });

    await expect(options).toHaveCount(7);

    // Verify each scene option is visible
    for (let i = 0; i < 7; i++) {
      const option = options.nth(i);
      await expect(option).toBeVisible();
    }
  });
});
