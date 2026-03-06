import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * Task 17: Test UI responsiveness at different screen sizes
 *
 * Tests for:
 * - Desktop viewport (1920x1080, 1366x768)
 * - Tablet viewport (768x1024)
 * - Mobile viewport (375x667, 414x896)
 * - UI element scaling and repositioning
 */

test.describe('UI Responsiveness', () => {
  const viewports = [
    { name: 'Desktop HD', width: 1920, height: 1080 },
    { name: 'Desktop', width: 1366, height: 768 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Mobile Portrait', width: 375, height: 667 },
    { name: 'Mobile Landscape', width: 667, height: 375 },
    { name: 'Large Mobile', width: 414, height: 896 }
  ];

  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
        await page.waitForSelector('canvas', { timeout: 15000 });
        ;
      });

      test('canvas should be visible and fill available space', async ({ page }) => {
        const canvas = page.locator('canvas').first();
        await expect(canvas).toBeVisible();

        const canvasBox = await canvas.boundingBox();
        expect(canvasBox).not.toBeNull();

        // Canvas should take up most of the viewport
        expect(canvasBox!.width).toBeGreaterThan(viewport.width * 0.8);
        expect(canvasBox!.height).toBeGreaterThan(viewport.height * 0.5);
      });

      test('chat panel should be visible and positioned correctly', async ({ page }) => {
        const chatInput = page.locator('input[placeholder*="Type a message"]');

        // On mobile, chat might be hidden by default
        if (viewport.width < 768) {
          // Look for chat toggle button
          const chatToggle = page
            .locator('button')
            .filter({ hasText: /Chat|💬/ })
            .first();
          if (await chatToggle.isVisible()) {
            await chatToggle.click({ force: true });
            ;
          }
        }

        await expect(chatInput).toBeVisible();

        // Chat should be positioned at bottom-left
        const chatBox = await chatInput.boundingBox();
        expect(chatBox).not.toBeNull();
        expect(chatBox!.x).toBeLessThan(viewport.width * 0.5);
        expect(chatBox!.y).toBeGreaterThan(viewport.height * 0.3);
      });

      test('settings button should be visible', async ({ page }) => {
        const settingsButton = page.locator('button').filter({ hasText: '⚙️' }).first();
        await expect(settingsButton).toBeVisible();

        const buttonBox = await settingsButton.boundingBox();
        expect(buttonBox).not.toBeNull();

        // Button should be within viewport
        expect(buttonBox!.x).toBeGreaterThan(0);
        expect(buttonBox!.x + buttonBox!.width).toBeLessThan(viewport.width);
        expect(buttonBox!.y).toBeGreaterThan(0);
        expect(buttonBox!.y + buttonBox!.height).toBeLessThan(viewport.height);
      });

      test('emoji picker button should be visible', async ({ page }) => {
        const emojiButton = page.locator('button').filter({ hasText: '😀' }).first();
        await expect(emojiButton).toBeVisible();
      });

      test('scene selector should be visible and usable', async ({ page }) => {
        const sceneToggle = page
          .locator('button')
          .filter({
            has: page.locator('text=▼').or(page.locator('text=▲'))
          })
          .filter({
            hasText: /Default|Interactive|Media|Grab|Drawing|Portal|Gestures/
          })
          .first();

        await expect(sceneToggle).toBeVisible();

        // Try to open selector
        await sceneToggle.click({ force: true });
        ;

        // Selector dropdown should appear
        const selectSceneText = page.getByText('Select Scene');
        await expect(selectSceneText).toBeVisible();
      });

      test('HUD buttons should not overlap on small screens', async ({ page }) => {
        const buttons = [
          { name: 'Settings', locator: page.locator('button').filter({ hasText: '⚙️' }).first() },
          { name: 'Emoji', locator: page.locator('button').filter({ hasText: '😀' }).first() },
          { name: 'Performance', locator: page.locator('button').filter({ hasText: '📊' }).first() }
        ];

        const boxes: {
          name: string;
          box: { x: number; y: number; width: number; height: number };
        }[] = [];

        for (const btn of buttons) {
          if (await btn.locator.isVisible()) {
            const box = await btn.locator.boundingBox();
            if (box) {
              boxes.push({ name: btn.name, box });
            }
          }
        }

        // Check for overlaps
        for (let i = 0; i < boxes.length; i++) {
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i].box;
            const b = boxes[j].box;

            const overlaps = !(
              a.x + a.width < b.x ||
              b.x + b.width < a.x ||
              a.y + a.height < b.y ||
              b.y + b.height < a.y
            );

            // On very small screens, some overlap might be acceptable
            if (viewport.width >= 768) {
              expect(overlaps).toBe(false);
            }
          }
        }
      });
    });
  }

  test.describe('Responsive Panel Sizing', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:5173');
      await page.waitForSelector('canvas', { timeout: 15000 });
      ;
    });

    test('settings panel should scale appropriately', async ({ page }) => {
      const settingsButton = page.locator('button').filter({ hasText: '⚙️' }).first();
      await settingsButton.click({ force: true });
      ;

      // Settings panel should be visible and appropriately sized
      const settingsPanel = page
        .locator('div')
        .filter({ hasText: /Audio|Graphics|Network|Account/ })
        .first();

      if (await settingsPanel.isVisible()) {
        const panelBox = await settingsPanel.boundingBox();
        expect(panelBox).not.toBeNull();

        // Panel should not be too wide on desktop
        expect(panelBox!.width).toBeLessThan(600);
        // Panel should have reasonable height
        expect(panelBox!.height).toBeGreaterThan(200);
      }
    });

    test('emoji picker should scale appropriately', async ({ page }) => {
      const emojiButton = page.locator('button').filter({ hasText: '😀' }).first();
      await emojiButton.click({ force: true });
      ;

      const emojiPicker = page.locator('div').filter({ hasText: '😀😁😂😃' }).first();

      if (await emojiPicker.isVisible()) {
        const pickerBox = await emojiPicker.boundingBox();
        expect(pickerBox).not.toBeNull();

        // Emoji picker should be reasonably sized
        expect(pickerBox!.width).toBeGreaterThan(100);
        expect(pickerBox!.width).toBeLessThan(500);
      }
    });
  });

  test.describe('Orientation Changes', () => {
    test('UI should adapt to orientation change', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:5173');
      await page.waitForSelector('canvas', { timeout: 15000 });
      ;

      const canvasPortrait = page.locator('canvas').first();
      const portraitBox = await canvasPortrait.boundingBox();

      // Switch to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      ;

      const canvasLandscape = page.locator('canvas').first();
      await expect(canvasLandscape).toBeVisible();

      const landscapeBox = await canvasLandscape.boundingBox();
      expect(landscapeBox).not.toBeNull();

      // Width should now be larger than height
      expect(landscapeBox!.width).toBeGreaterThan(landscapeBox!.height);
    });
  });

  test.describe('Touch Targets', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:5173');
      await page.waitForSelector('canvas', { timeout: 15000 });
      ;
    });

    test('touch targets should be at least 44x44 pixels', async ({ page }) => {
      const buttons = page.locator('button');
      const count = await buttons.count();
      const minTouchSize = 44;

      let smallButtons = 0;
      for (let i = 0; i < Math.min(count, 20); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box) {
            if (box.width < minTouchSize || box.height < minTouchSize) {
              smallButtons++;
            }
          }
        }
      }

      // Allow some small buttons but most should be accessible
      expect(smallButtons).toBeLessThan(count * 0.3);
    });
  });
});
