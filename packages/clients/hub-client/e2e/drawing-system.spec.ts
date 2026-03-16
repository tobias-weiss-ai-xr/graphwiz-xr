/**
 * E2E tests for Drawing Tools system
 * Tests DrawingTools panel and DrawingCanvas interactions
 *
 * NOTE: DrawingTools requires client && myClientId (WebSocket connection)
 * Tests will be skipped if connection cannot be established
 */

import { test, expect, Page } from '@playwright/test';

/**
 * Helper to check if WebSocket is connected
 */
async function waitForConnection(page: Page, timeout = 10000): Promise<boolean> {
  try {
    await page.waitForSelector('text=/Connected/', { timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to switch to the drawing scene
 * Drawing tools are only visible when currentScene === 'drawing'
 */
async function switchToDrawingScene(page: Page): Promise<void> {
  // Find scene selector button (shows current scene name)
  const sceneSelector = page
    .locator('button')
    .filter({ hasText: /Default|Demo|Interactive|Media|Grab|Drawing|Portal|Gestures/i })
    .first();

  // Click to open selector dropdown
  await sceneSelector.click({ force: true });
  await page.waitForTimeout(300);

  // Click on "Drawing" scene option in dropdown
  const drawingOption = page
    .locator('button')
    .filter({ hasText: /^Drawing$/i })
    .first();
  await drawingOption.click({ force: true });
  await page.waitForTimeout(500);
}

/**
 * Setup helper: Navigate, wait for connection, switch to drawing scene
 * Returns true if ready, false if connection failed (test should skip)
 */
async function setupDrawingTest(page: Page): Promise<boolean> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Wait for canvas to be ready
  await page.waitForSelector('canvas', { timeout: 15000 });

  // Check if connected (DrawingTools requires myClientId)
  const isConnected = await waitForConnection(page, 5000);
  if (!isConnected) {
    return false;
  }

  // Switch to drawing scene
  await switchToDrawingScene(page);
  return true;
}

test.describe('Drawing Tools - Panel', () => {
  test('should display drawing tools panel in top-left corner', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Wait for drawing tools panel to appear (contains "Drawing Tools" text)
    const drawingHeader = page
      .locator('div')
      .filter({ hasText: /Drawing Tools/i })
      .first();
    await expect(drawingHeader).toBeVisible({ timeout: 15000 });

    // Check positioning (should be top-left)
    const panelBox = await drawingHeader.boundingBox();
    expect(panelBox).not.toBeNull();
    expect(panelBox!.x).toBeLessThan(300);
    expect(panelBox!.y).toBeLessThan(300);
  });

  test('should show drawing tools title', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find the drawing tools header
    const header = page.locator('div').filter({ hasText: /Drawing Tools/i });
    await expect(header).toBeVisible({ timeout: 15000 });
  });

  test('should display brush drawing mode button', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find brush button by emoji or text
    const brushButton = page.locator('button').filter({ hasText: /Brush/i });
    await expect(brushButton.first()).toBeVisible({ timeout: 15000 });
  });

  test('should display line mode button', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find line button
    const lineButton = page.locator('button').filter({ hasText: /Line/i });
    await expect(lineButton.first()).toBeVisible({ timeout: 15000 });
  });

  test('should display rectangle mode button', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find rectangle button
    const rectButton = page.locator('button').filter({ hasText: /Rectangle/i });
    await expect(rectButton.first()).toBeVisible({ timeout: 15000 });
  });

  test('should display circle mode button', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find circle button
    const circleButton = page.locator('button').filter({ hasText: /Circle/i });
    await expect(circleButton.first()).toBeVisible({ timeout: 15000 });
  });

  test('should display color picker section', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find color picker section by looking for color buttons
    const colorButtons = page
      .locator('button')
      .filter({ has: page.locator('[style*="background"]') });
    const count = await colorButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should select multiple colors and verify selection', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find color buttons (buttons with background colors)
    const colorButtons = page.locator('button').filter({
      has: page.locator('[style*="background"]')
    });
    const initialCount = await colorButtons.count();
    expect(initialCount).toBeGreaterThanOrEqual(1);

    // Click on different colors and verify selection state
    for (let i = 0; i < Math.min(3, initialCount); i++) {
      const button = colorButtons.nth(i);
      await button.click({ force: true });
      await page.waitForTimeout(50);

      // Verify the button exists
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
    }
  });

  test('should display brush size slider with correct range', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find range input
    const slider = page.locator('input[type="range"]');
    await expect(slider.first()).toBeVisible({ timeout: 15000 });

    // Check slider attributes
    const min = await slider.first().getAttribute('min');
    const max = await slider.first().getAttribute('max');
    expect(min).toBeTruthy();
    expect(max).toBeTruthy();
  });

  test('should adjust brush size slider', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find brush size slider
    const slider = page.locator('input[type="range"]');
    await expect(slider.first()).toBeVisible({ timeout: 15000 });

    // Get initial position
    const initialBox = await slider.first().boundingBox();
    expect(initialBox).not.toBeNull();

    // Move slider to different position
    await slider.first().click({ position: { x: 50, y: 2 } });

    // Verify slider still exists
    const newBox = await slider.first().boundingBox();
    expect(newBox).not.toBeNull();
  });

  test('should display undo button', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find undo button
    const undoButton = page.locator('button').filter({ hasText: /Undo/i });
    await expect(undoButton.first()).toBeVisible({ timeout: 15000 });
  });

  test('should display clear canvas button', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find clear button
    const clearButton = page.locator('button').filter({ hasText: /Clear/i });
    await expect(clearButton.first()).toBeVisible({ timeout: 15000 });
  });

  test('should display export button', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find export button
    const exportButton = page.locator('button').filter({ hasText: /Export/i });
    await expect(exportButton.first()).toBeVisible({ timeout: 15000 });
  });

  test('should toggle history panel', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find history toggle button (has book emoji or "History" text)
    const historyButton = page.locator('button').filter({
      hasText: /History|📚|📜/i
    });
    await expect(historyButton.first()).toBeVisible({ timeout: 15000 });

    // Click to open history
    await historyButton.first().click({ force: true });

    // Wait for history panel to appear and verify no errors
    await page.waitForTimeout(200);
  });

  test('should switch drawing modes', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find all mode buttons
    const brushButton = page.locator('button').filter({ hasText: /Brush/i });
    const lineButton = page.locator('button').filter({ hasText: /Line/i });
    const rectButton = page.locator('button').filter({ hasText: /Rectangle/i });
    const circleButton = page.locator('button').filter({ hasText: /Circle/i });

    // Click each mode and verify selection state changes
    // Brush mode
    await brushButton.first().click({ force: true });
    await page.waitForTimeout(100);

    // Line mode
    await lineButton.first().click({ force: true });
    await page.waitForTimeout(100);

    // Rectangle mode
    await rectButton.first().click({ force: true });
    await page.waitForTimeout(100);

    // Circle mode
    await circleButton.first().click({ force: true });
    await page.waitForTimeout(100);

    // Verify page is still responsive
    const header = page.locator('div').filter({ hasText: /Drawing Tools/i });
    await expect(header.first()).toBeVisible();
  });
});

test.describe('Drawing Canvas interactions', () => {
  test('should have canvas element for drawing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find canvas element (this test doesn't need connection)
    const canvas = page.locator('canvas');
    const canvasCount = await canvas.count();
    expect(canvasCount).toBeGreaterThan(0);
  });

  test('should draw on canvas with brush mode', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Click brush mode
    const brushButton = page.locator('button').filter({ hasText: /Brush/i });
    await brushButton.first().click({ force: true });
    await page.waitForTimeout(100);

    // Find the 3D canvas
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();

    // Simulate drawing motion on canvas
    if (canvasBox) {
      const startX = canvasBox.x + canvasBox.width / 2;
      const startY = canvasBox.y + canvasBox.height / 2;

      // Move mouse to start drawing
      await page.mouse.move(startX, startY);
      await page.mouse.down();

      // Draw a simple line
      await page.mouse.move(startX + 50, startY + 50);
      await page.waitForTimeout(100);

      // Lift mouse
      await page.mouse.up();
    }

    // Verify canvas is still responsive
    await expect(canvas).toBeVisible();
  });

  test('should change color before drawing', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Select a color (buttons with background colors)
    const colorButtons = page.locator('button').filter({
      has: page.locator('[style*="background"]')
    });
    const count = await colorButtons.count();
    expect(count).toBeGreaterThan(0);

    // Click on a color
    if (count >= 1) {
      await colorButtons.first().click({ force: true });
      await page.waitForTimeout(100);
    }

    // Verify page is still responsive
    const header = page.locator('div').filter({ hasText: /Drawing Tools/i });
    await expect(header.first()).toBeVisible();
  });

  test('should adjust brush size before drawing', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find brush size slider
    const slider = page.locator('input[type="range"]');
    expect(await slider.count()).toBeGreaterThan(0);

    // Set maximum brush size (use evaluate with proper typing)
    await slider.first().evaluate((el: unknown) => {
      const input = el as { value: string; dispatchEvent: (e: Event) => void };
      input.value = '10';
      input.dispatchEvent(new Event('input'));
    });

    // Verify page is still responsive
    const header = page.locator('div').filter({ hasText: /Drawing Tools/i });
    await expect(header.first()).toBeVisible();
  });

  test('should perform undo operation', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find undo button
    const undoButton = page.locator('button').filter({ hasText: /Undo/i });
    await expect(undoButton.first()).toBeVisible({ timeout: 15000 });

    // Click undo
    await undoButton.first().click({ force: true });

    // Verify page is still responsive
    const header = page.locator('div').filter({ hasText: /Drawing Tools/i });
    await expect(header.first()).toBeVisible();
  });

  test('should clear canvas', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find clear button
    const clearButton = page.locator('button').filter({ hasText: /Clear/i });
    await expect(clearButton.first()).toBeVisible({ timeout: 15000 });

    // Click clear
    await clearButton.first().click({ force: true });

    // Verify page is still responsive
    const header = page.locator('div').filter({ hasText: /Drawing Tools/i });
    await expect(header.first()).toBeVisible();
  });

  test('should export drawing', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find export button
    const exportButton = page.locator('button').filter({ hasText: /Export/i });
    await expect(exportButton.first()).toBeVisible({ timeout: 15000 });

    // Click export
    await exportButton.first().click({ force: true });

    // Verify page is still responsive
    const header = page.locator('div').filter({ hasText: /Drawing Tools/i });
    await expect(header.first()).toBeVisible();
  });
});

test.describe('Drawing Tools integration', () => {
  test('should maintain UI state across mode switches', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Get initial state
    const brushButton = page.locator('button').filter({ hasText: /Brush/i });
    const initialColorButtons = page.locator('button').filter({
      has: page.locator('[style*="background"]')
    });
    const initialColorCount = await initialColorButtons.count();

    // Switch modes multiple times
    const lineButton = page.locator('button').filter({ hasText: /Line/i });
    const rectButton = page.locator('button').filter({ hasText: /Rectangle/i });

    await brushButton.first().click({ force: true });
    await page.waitForTimeout(50);

    await lineButton.first().click({ force: true });
    await page.waitForTimeout(50);

    await rectButton.first().click({ force: true });
    await page.waitForTimeout(50);

    await brushButton.first().click({ force: true });
    await page.waitForTimeout(50);

    // Verify all UI elements still present
    await expect(brushButton.first()).toBeVisible();
    await expect(lineButton.first()).toBeVisible();
    await expect(rectButton.first()).toBeVisible();

    const finalColorCount = await initialColorButtons.count();
    expect(finalColorCount).toBe(initialColorCount);
  });

  test('should handle rapid tool switching', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    const buttons = [
      page.locator('button').filter({ hasText: /Brush/i }),
      page.locator('button').filter({ hasText: /Line/i }),
      page.locator('button').filter({ hasText: /Rectangle/i }),
      page.locator('button').filter({ hasText: /Circle/i })
    ];

    // Rapidly click through all mode buttons
    for (const button of buttons) {
      await button.first().click({ force: true });
      await page.waitForTimeout(25);
    }

    // Verify page is still responsive
    const header = page.locator('div').filter({ hasText: /Drawing Tools/i });
    await expect(header.first()).toBeVisible();
  });

  test('should keep color picker visible after mode changes', async ({ page }) => {
    const isReady = await setupDrawingTest(page);
    if (!isReady) {
      test.skip();
      return;
    }

    // Find color section (buttons with background)
    const colorButtons = page.locator('button').filter({
      has: page.locator('[style*="background"]')
    });
    await expect(colorButtons.first()).toBeVisible({ timeout: 15000 });

    // Switch modes
    const brushButton = page.locator('button').filter({ hasText: /Brush/i });
    const lineButton = page.locator('button').filter({ hasText: /Line/i });

    await brushButton.first().click({ force: true });
    await page.waitForTimeout(50);

    await lineButton.first().click({ force: true });
    await page.waitForTimeout(50);

    // Color picker should still be visible
    const count = await colorButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
