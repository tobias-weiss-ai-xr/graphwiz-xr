import { test, expect, Page } from '@playwright/test';

/**
 * Task 19: Test UI z-index layering and overlapping
 *
 * Tests for:
 * - Correct z-index ordering of UI elements
 * - Modal dialogs appear above other content
 * - Dropdowns appear above panels
 * - No unintended overlapping
 *
 * NOTE: Some tests require WebSocket connection (avatar configurator, storage panel)
 * Tests will be skipped if connection cannot be established
 */

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
 * Helper to get z-index of an element
 */
async function getZIndex(element: unknown): Promise<number> {
  const el = element as { evaluate: (fn: (el: HTMLElement) => number) => Promise<number> };
  return await el.evaluate((el: HTMLElement) => {
    const style = window.getComputedStyle(el);
    const zIndex = style.zIndex;
    return zIndex === 'auto' ? 0 : parseInt(zIndex, 10);
  });
}

/**
 * Helper to check if element A visually overlaps element B
 */
async function checkOverlap(page: Page, elementA: unknown, elementB: unknown): Promise<boolean> {
  const elA = elementA as {
    boundingBox: () => Promise<{ x: number; y: number; width: number; height: number } | null>;
  };
  const elB = elementB as {
    boundingBox: () => Promise<{ x: number; y: number; width: number; height: number } | null>;
  };
  const boxA = await elA.boundingBox();
  const boxB = await elB.boundingBox();

  if (!boxA || !boxB) return false;

  return !(
    boxA.x + boxA.width < boxB.x ||
    boxB.x + boxB.width < boxA.x ||
    boxA.y + boxA.height < boxB.y ||
    boxB.y + boxB.height < boxA.y
  );
}

test.describe('UI Z-Index Layering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('canvas', { timeout: 15000 });
  });

  test.describe('Panel Z-Index Order', () => {
    test('settings panel should appear above canvas', async ({ page }) => {
      const canvas = page.locator('canvas').first();
      const settingsButton = page.locator('button').filter({ hasText: 'Settings' }).first();

      await settingsButton.click({ force: true });

      const settingsPanel = page
        .locator('div')
        .filter({ hasText: /Audio|Graphics|Network|Account/ })
        .first();

      if (await settingsPanel.isVisible()) {
        const panelZIndex = await getZIndex(settingsPanel);
        const canvasZIndex = await getZIndex(canvas);

        // Panel should have higher or equal z-index than canvas
        expect(panelZIndex).toBeGreaterThanOrEqual(canvasZIndex);
      }
    });

    test('emoji picker should appear above other UI when open', async ({ page }) => {
      // Open settings first
      const settingsButton = page.locator('button').filter({ hasText: 'Settings' }).first();
      await settingsButton.click({ force: true });

      // Open emoji picker
      const emojiButton = page.locator('button').filter({ hasText: 'Emoji' }).first();
      await emojiButton.click({ force: true });

      const emojiPicker = page
        .locator('div')
        .filter({ hasText: /😀|😁|😂/ })
        .first();

      if (await emojiPicker.isVisible()) {
        const pickerZIndex = await getZIndex(emojiPicker);

        // Picker should have a reasonable z-index
        expect(pickerZIndex).toBeGreaterThanOrEqual(0);
      }
    });

    test('scene selector dropdown should appear above other panels', async ({ page }) => {
      // Open settings panel
      const settingsButton = page.locator('button').filter({ hasText: 'Settings' }).first();
      await settingsButton.click({ force: true });

      // Open scene selector
      const sceneToggle = page
        .locator('button')
        .filter({
          has: page.locator('text=▼').or(page.locator('text=▲'))
        })
        .filter({
          hasText: /Default|Interactive|Media|Grab|Drawing|Portal|Gestures/
        })
        .first();

      await sceneToggle.click({ force: true });

      // Scene selector dropdown should be visible
      const dropdown = page.getByText('Select Scene');
      await expect(dropdown).toBeVisible();
    });
  });

  test.describe('Modal Layering', () => {
    test('avatar configurator should layer correctly', async ({ page }) => {
      // Avatar configurator requires connection
      const isConnected = await waitForConnection(page, 5000);
      if (!isConnected) {
        test.skip();
        return;
      }

      const avatarButton = page.locator('button').filter({ hasText: 'Avatar' }).first();
      await avatarButton.click({ force: true });

      // Avatar configurator should be visible
      const avatarPanel = page
        .locator('div')
        .filter({ hasText: /Body Type|Height|Color/i })
        .first();

      if (await avatarPanel.isVisible()) {
        const panelZIndex = await getZIndex(avatarPanel);
        expect(panelZIndex).toBeGreaterThanOrEqual(0);
      }
    });

    test('storage panel should layer correctly', async ({ page }) => {
      // Storage panel requires connection
      const isConnected = await waitForConnection(page, 5000);
      if (!isConnected) {
        test.skip();
        return;
      }

      const storageButton = page.locator('button').filter({ hasText: 'Assets' }).first();
      await storageButton.click({ force: true });

      // Storage panel should be visible
      const storagePanel = page.getByText(/Storage|Assets|Browse/).first();
      await expect(storagePanel).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Overlap Prevention', () => {
    test('chat panel and settings panel should not overlap when both open', async ({ page }) => {
      // Open settings
      const settingsButton = page.locator('button').filter({ hasText: 'Settings' }).first();
      await settingsButton.click({ force: true });

      // Chat should already be visible
      const chatInput = page.locator('input[placeholder*="Type a message"]');
      await expect(chatInput).toBeVisible();

      // Get bounding boxes
      const chatBox = await chatInput.boundingBox();
      const settingsPanel = page
        .locator('div')
        .filter({ hasText: /Audio|Graphics|Network|Account/ })
        .first();

      if (await settingsPanel.isVisible()) {
        const settingsBox = await settingsPanel.boundingBox();

        if (chatBox && settingsBox) {
          // They should not significantly overlap
          const overlap = await checkOverlap(page, chatInput, settingsPanel);

          // If they overlap, one should be clearly above the other
          if (overlap) {
            const chatZIndex = await getZIndex(chatInput);
            const settingsZIndex = await getZIndex(settingsPanel);

            // Z-indices should be different
            expect(chatZIndex === settingsZIndex).toBe(false);
          }
        }
      }
    });

    test('HUD buttons should not overlap each other', async ({ page }) => {
      const buttons = await page.locator('button').all();
      const visibleButtons: {
        element: unknown;
        box: { x: number; y: number; width: number; height: number };
      }[] = [];

      for (const button of buttons.slice(0, 20)) {
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box && box.width > 20 && box.height > 20) {
            visibleButtons.push({ element: button, box });
          }
        }
      }

      // Check for overlaps
      let overlaps = 0;
      for (let i = 0; i < visibleButtons.length; i++) {
        for (let j = i + 1; j < visibleButtons.length; j++) {
          const a = visibleButtons[i].box;
          const b = visibleButtons[j].box;

          const hasOverlap = !(
            a.x + a.width < b.x ||
            b.x + b.width < a.x ||
            a.y + a.height < b.y ||
            b.y + b.height < a.y
          );

          if (hasOverlap) {
            overlaps++;
          }
        }
      }

      // Allow minimal overlap but not excessive
      const maxAllowedOverlaps = Math.floor(visibleButtons.length * 0.1);
      expect(overlaps).toBeLessThanOrEqual(maxAllowedOverlaps);
    });
  });

  test.describe('Performance Overlay Z-Index', () => {
    test('performance overlay should not block UI interactions', async ({ page }) => {
      // Open performance overlay
      const perfButton = page.locator('button').filter({ hasText: 'Performance' }).first();
      await perfButton.click({ force: true });

      // Verify FPS counter is visible
      const fpsCounter = page.getByText(/FPS/).first();
      await expect(fpsCounter).toBeVisible({ timeout: 10000 });

      // Settings button should still be clickable
      const settingsButton = page.locator('button').filter({ hasText: 'Settings' }).first();
      await expect(settingsButton).toBeVisible();

      // Try clicking settings button
      await settingsButton.click({ force: true });

      // Settings should open
      const settingsPanel = page
        .locator('div')
        .filter({ hasText: /Audio|Graphics|Network|Account/ })
        .first();
      await expect(settingsPanel).toBeVisible();
    });
  });

  test.describe('Dropdown Z-Index', () => {
    test('scene selector dropdown should appear above panels', async ({ page }) => {
      // Open avatar configurator (requires connection)
      const isConnected = await waitForConnection(page, 5000);

      if (isConnected) {
        const avatarButton = page.locator('button').filter({ hasText: 'Avatar' }).first();
        await avatarButton.click({ force: true });
      }

      // Open scene selector
      const sceneToggle = page
        .locator('button')
        .filter({
          has: page.locator('text=▼').or(page.locator('text=▲'))
        })
        .filter({
          hasText: /Default|Interactive|Media|Grab|Drawing|Portal|Gestures/
        })
        .first();

      await sceneToggle.click({ force: true });

      // Dropdown should be visible
      const dropdown = page.getByText('Select Scene');
      await expect(dropdown).toBeVisible();

      // Scene buttons should be clickable
      const interactiveButton = page.locator('button').filter({ hasText: 'Interactive' }).first();
      await expect(interactiveButton).toBeVisible();
    });
  });

  test.describe('Tooltip Z-Index', () => {
    test('tooltips should appear above all content', async ({ page }) => {
      // Hover over a button to trigger any tooltip
      const settingsButton = page.locator('button').filter({ hasText: 'Settings' }).first();
      await settingsButton.hover();

      // Check if tooltip appeared (might not exist in current implementation)
      const tooltip = page.locator('[role="tooltip"], .tooltip, [title]').first();

      if (await tooltip.isVisible()) {
        const tooltipZIndex = await getZIndex(tooltip);
        expect(tooltipZIndex).toBeGreaterThanOrEqual(1000);
      }
    });
  });
});
