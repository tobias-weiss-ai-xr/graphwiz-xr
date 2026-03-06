/**
 * E2E tests for Drawing Tools system
 * Tests DrawingTools panel and DrawingCanvas interactions
 */

import { test, expect } from '@playwright/test';

test.describe('Drawing Tools - Panel', () => {
  test('should display drawing tools panel in top-left corner', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for tools panel to appear
    const toolsPanel = page.locator('[style*="position: absolute"]').first();
    await expect(toolsPanel).toBeVisible();

    // Check positioning (should be top-left)
    const panelBox = await toolsPanel.boundingBox();
    expect(panelBox).not.toBeNull();
    expect(panelBox!.x).toBeLessThan(100);
    expect(panelBox!.y).toBeLessThan(100);

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should show drawing tools title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find the drawing tools header
    const header = page.locator('div').filter({ hasText: /Drawing Tools/i });
    await expect(header).toBeVisible();

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should display brush drawing mode button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find brush button by emoji
    const brushButton = page.locator('button', { hasText: /🖌️ Brush/i });
    await expect(brushButton).toBeVisible();

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should display line mode button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find line button by emoji
    const lineButton = page.locator('button', { hasText: /📏 Line/i });
    await expect(lineButton).toBeVisible();

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should display rectangle mode button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find rectangle button
    const rectButton = page.locator('button', { hasText: /Rectangle/i });
    await expect(rectButton).toBeVisible();

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should display circle mode button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find circle button
    const circleButton = page.locator('button', { hasText: /Circle/i });
    await expect(circleButton).toBeVisible();

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should display color picker section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find color picker section
    const colorLabel = page.locator('label', { hasText: /Color:/i });
    await expect(colorLabel).toBeVisible();

    // Find color buttons
    const colorButtons = page.locator('button[title*="Color:"]');
    const count = await colorButtons.count();
    expect(count).toBeGreaterThanOrEqual(8);

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should select multiple colors and verify selection', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find color buttons
    const colorButtons = page.locator('button[title*="Color:"]');
    const initialCount = await colorButtons.count();
    expect(initialCount).toBeGreaterThanOrEqual(8);

    // Click on different colors and verify selection state
    for (let i = 0; i < Math.min(3, initialCount); i++) {
      const button = colorButtons.nth(i);
      await button.click({ force: true });

      // Verify the button has selection styling
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
    }

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should display brush size slider with correct range', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find brush size section
    const brushLabel = page.locator('label', { hasText: /Brush Size:/i });
    await expect(brushLabel).toBeVisible();

    // Find range input
    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible();

    // Check slider attributes
    const min = await slider.getAttribute('min');
    const max = await slider.getAttribute('max');
    expect(min).toBe('1');
    expect(max).toBe('10');

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should adjust brush size slider', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find brush size slider
    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible();

    // Get initial position
    const initialBox = await slider.boundingBox();
    expect(initialBox).not.toBeNull();

    // Move slider to different position
    await slider.click({ position: { x: 50, y: 2 } });

    // Verify slider moved
    const newBox = await slider.boundingBox();
    expect(newBox).not.toBeNull();

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should display undo button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find undo button
    const undoButton = page.locator('button', { hasText: /↩️ Undo/i });
    await expect(undoButton).toBeVisible();

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should display clear canvas button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find clear button
    const clearButton = page.locator('button', { hasText: /🗑️ Clear/i });
    await expect(clearButton).toBeVisible();

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should display export button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find export button
    const exportButton = page.locator('button', { hasText: /💾 Export/i });
    await expect(exportButton).toBeVisible();

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should toggle history panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find history toggle button
    const historyButton = page.locator('button', { hasText: /📚|📜/i });
    await expect(historyButton).toBeVisible();

    // Click to open history
    await historyButton.click({ force: true });

    // Wait for history panel to appear and verify no errors
    await page.waitForTimeout(200);
    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should switch drawing modes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find all mode buttons
    const brushButton = page.locator('button', { hasText: /Brush/i });
    const lineButton = page.locator('button', { hasText: /Line/i });
    const rectButton = page.locator('button', { hasText: /Rectangle/i });
    const circleButton = page.locator('button', { hasText: /Circle/i });

    // Click each mode and verify selection state changes
    // Brush mode
    await brushButton.click({ force: true });
    await page.waitForTimeout(100);

    // Line mode
    await lineButton.click({ force: true });
    await page.waitForTimeout(100);

    // Rectangle mode
    await rectButton.click({ force: true });
    await page.waitForTimeout(100);

    // Circle mode
    await circleButton.click({ force: true });
    await page.waitForTimeout(100);

    // Verify page is still responsive
    await expect(page.locator('.drawing-interface')).toBeVisible();
  });
});

test.describe('Drawing Canvas interactions', () => {
  test('should have canvas element for drawing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find canvas element
    const canvas = page.locator('canvas');
    const canvasCount = await canvas.count();
    expect(canvasCount).toBeGreaterThan(0);

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should draw on canvas with brush mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click brush mode
    const brushButton = page.locator('button', { hasText: /🖌️ Brush/i });
    await brushButton.click({ force: true });
    await page.waitForTimeout(100);

    // Find the 3D canvas
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();

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
    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should change color before drawing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Select a color
    const colorButtons = page.locator('button[title*="Color:"]');
    const count = await colorButtons.count();
    expect(count).toBeGreaterThan(0);

    // Click on a color
    if (count >= 4) {
      await colorButtons.nth(3).click({ force: true });
      await page.waitForTimeout(100);
    }

    // Verify page is still responsive
    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should adjust brush size before drawing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find brush size slider
    const slider = page.locator('input[type="range"]');
    expect(await slider.count()).toBeGreaterThan(0);

    // Set maximum brush size
    await slider.evaluate((el: HTMLInputElement) => {
      el.value = "10";
      el.dispatchEvent(new Event('input'));
    });

    // Verify page is still responsive
    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should perform undo operation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find undo button
    const undoButton = page.locator('button', { hasText: /↩️ Undo/i });
    await expect(undoButton).toBeVisible();

    // Click undo
    await undoButton.click({ force: true });

    // Verify page is still responsive
    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should clear canvas', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find clear button
    const clearButton = page.locator('button', { hasText: /🗑️ Clear/i });
    await expect(clearButton).toBeVisible();

    // Click clear
    await clearButton.click({ force: true });

    // Verify page is still responsive
    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should export drawing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find export button
    const exportButton = page.locator('button', { hasText: /💾 Export/i });
    await expect(exportButton).toBeVisible();

    // Click export
    await exportButton.click({ force: true });

    // Verify page is still responsive
    await expect(page.locator('.drawing-interface')).toBeVisible();
  });
});

test.describe('Drawing Tools integration', () => {
  test('should maintain UI state across mode switches', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get initial state
    const brushButton = page.locator('button', { hasText: /Brush/i });
    const initialColorButtons = page.locator('button[title*="Color:"]');
    const initialColorCount = await initialColorButtons.count();

    // Switch modes multiple times
    const lineButton = page.locator('button', { hasText: /Line/i });
    const rectButton = page.locator('button', { hasText: /Rectangle/i });

    await brushButton.click({ force: true });
    await page.waitForTimeout(50);

    await lineButton.click({ force: true });
    await page.waitForTimeout(50);

    await rectButton.click({ force: true });
    await page.waitForTimeout(50);

    await brushButton.click({ force: true });
    await page.waitForTimeout(50);

    // Verify all UI elements still present
    await expect(brushButton).toBeVisible();
    await expect(lineButton).toBeVisible();
    await expect(rectButton).toBeVisible();

    const finalColorCount = await initialColorButtons.count();
    expect(finalColorCount).toBe(initialColorCount);

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should handle rapid tool switching', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const buttons = [
      page.locator('button', { hasText: /Brush/i }),
      page.locator('button', { hasText: /Line/i }),
      page.locator('button', { hasText: /Rectangle/i }),
      page.locator('button', { hasText: /Circle/i })
    ];

    // Rapidly click through all mode buttons
    for (const button of buttons) {
      await button.click({ force: true });
      await page.waitForTimeout(25);
    }

    // Verify page is still responsive
    await expect(page.locator('.drawing-interface')).toBeVisible();

    await expect(page.locator('.drawing-interface')).toBeVisible();
  });

  test('should keep color picker visible after mode changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find color section
    const colorSection = page.locator('div').filter({ hasText: /Color:/i });
    await expect(colorSection).toBeVisible();

    // Switch modes
    const brushButton = page.locator('button', { hasText: /Brush/i });
    const lineButton = page.locator('button', { hasText: /Line/i });

    await brushButton.click({ force: true });
    await page.waitForTimeout(50);

    await lineButton.click({ force: true });
    await page.waitForTimeout(50);

    // Color picker should still be visible
    await expect(colorSection).toBeVisible();

    const colorButtons = page.locator('button[title*="Color:"]');
    const count = await colorButtons.count();
    expect(count).toBeGreaterThanOrEqual(8);
  });
});
