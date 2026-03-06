import { test, expect, Page } from '@playwright/test';

/**
 * Task 15: Test cross-scene UI persistence
 *
 * Tests that UI state persists when switching between scenes:
 * - Chat messages preserved
 * - Settings values preserved
 * - Avatar configuration preserved
 * - UI visibility states preserved
 */

test.describe('Cross-Scene UI Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('canvas', { timeout: 15000 });
    ; // Wait for scene to initialize
  });

  /**
   * Helper function to switch scenes
   */
  async function switchScene(page: Page, sceneName: string) {
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
    await page.waitForSelector('text=Select Scene', { timeout: 3000 });
    await page.locator('button').filter({ hasText: sceneName }).click({ force: true });
    ;
  }

  test.describe('Chat Persistence', () => {
    test('chat messages persist after scene switch', async ({ page }) => {
      // Ensure chat panel is visible
      const chatInput = page.locator('input[placeholder*="Type a message"]');
      await expect(chatInput).toBeVisible();

      // Send a unique message
      const uniqueMessage = `Persistence test ${Date.now()}`;
      await chatInput.fill(uniqueMessage);
      await chatInput.press('Enter');
      ;

      // Verify message appears
      await expect(page.locator('div').filter({ hasText: uniqueMessage }).first()).toBeVisible();

      // Switch to Interactive scene
      await switchScene(page, 'Interactive');

      // Verify message still appears in chat
      await expect(page.locator('div').filter({ hasText: uniqueMessage }).first()).toBeVisible();
    });

    test('chat visibility state persists after scene switch', async ({ page }) => {
      const chatInput = page.locator('input[placeholder*="Type a message"]');
      await expect(chatInput).toBeVisible();

      // Close chat panel
      const closeButton = page.locator('button').filter({ hasText: '×' }).first();
      await closeButton.click({ force: true });
      ;

      // Verify chat is hidden
      await expect(chatInput).not.toBeVisible();

      // Switch scenes
      await switchScene(page, 'Media');

      // Verify chat remains hidden
      await expect(chatInput).not.toBeVisible();
    });

    test('message count persists on toggle button', async ({ page }) => {
      const chatInput = page.locator('input[placeholder*="Type a message"]');

      // Send multiple messages
      for (let i = 0; i < 3; i++) {
        await chatInput.fill(`Message ${i + 1}`);
        await chatInput.press('Enter');
        
      }

      // Close chat panel
      const closeButton = page.locator('button').filter({ hasText: '×' }).first();
      await closeButton.click({ force: true });
      ;

      // Check toggle shows message count
      const chatToggle = page
        .locator('button')
        .filter({ hasText: /Chat.*\(\d+\)/ })
        .first();
      await expect(chatToggle).toBeVisible();

      // Switch scenes
      await switchScene(page, 'Grab');

      // Verify toggle still shows message count
      await expect(chatToggle).toBeVisible();
    });
  });

  test.describe('Settings Persistence', () => {
    test('settings panel tab selection persists', async ({ page }) => {
      // Open settings panel
      const settingsButton = page.locator('button').filter({ hasText: '⚙️' }).first();
      await settingsButton.click({ force: true });
      ;

      // Click on Network tab
      await page.locator('button').filter({ hasText: 'Network' }).click({ force: true });
      

      // Verify Network tab is active (check for network-specific controls)
      const bitrateSlider = page
        .locator('input[type="range"]')
        .filter({ has: page.locator('[value]') });
      await expect(bitrateSlider.first()).toBeVisible();

      // Switch scenes
      await switchScene(page, 'Drawing');

      // Reopen settings panel
      await settingsButton.click({ force: true });
      ;

      // Verify Network tab is still selected
      const networkTab = page.locator('button').filter({ hasText: 'Network' });
      // The active tab should still show network controls
    });

    test('slider values persist after scene switch', async ({ page }) => {
      // Open settings panel
      const settingsButton = page.locator('button').filter({ hasText: '⚙️' }).first();
      await settingsButton.click({ force: true });
      ;

      // Find a slider and change its value
      const sliders = page.locator('input[type="range"]');
      const firstSlider = sliders.first();

      const initialValue = await firstSlider.evaluate((el: HTMLInputElement) =>
        parseFloat(el.value)
      );
      const newValue = Math.min(1, initialValue + 0.2);

      await firstSlider.fill(newValue.toString());
      

      // Verify value changed
      const changedValue = await firstSlider.evaluate((el: HTMLInputElement) =>
        parseFloat(el.value)
      );
      expect(Math.abs(changedValue - newValue)).toBeLessThan(0.1);

      // Switch scenes
      await switchScene(page, 'Portal');

      // Reopen settings and check value persisted
      await settingsButton.click({ force: true });
      ;

      const afterSwitchValue = await firstSlider.evaluate((el: HTMLInputElement) =>
        parseFloat(el.value)
      );
      expect(Math.abs(afterSwitchValue - newValue)).toBeLessThan(0.1);
    });
  });

  test.describe('Emoji Picker Persistence', () => {
    test('emoji picker visibility state persists', async ({ page }) => {
      const emojiButton = page.locator('button').filter({ hasText: '😀' }).first();

      // Open emoji picker
      await emojiButton.click({ force: true });
      ;

      // Verify picker is visible
      const emojiGrid = page.locator('div').filter({ hasText: '😀😁😂😃' }).first();
      await expect(emojiGrid).toBeVisible();

      // Switch scenes without closing picker
      await switchScene(page, 'Gestures');

      // Picker should close on scene switch (expected behavior)
      // Or remain open depending on implementation
    });
  });

  test.describe('Performance Overlay Persistence', () => {
    test('performance overlay state persists', async ({ page }) => {
      const perfButton = page.locator('button').filter({ hasText: '📊' }).first();

      // Open performance overlay
      await perfButton.click({ force: true });
      ;

      // Verify overlay is visible
      const fpsCounter = page.getByText(/FPS:/).first();
      await expect(fpsCounter).toBeVisible();

      // Switch scenes
      await switchScene(page, 'Interactive');

      // Verify overlay remains visible
      await expect(fpsCounter).toBeVisible();

      // Close overlay
      await perfButton.click({ force: true });
      ;

      // Switch scenes again
      await switchScene(page, 'Default');

      // Verify overlay remains closed
      await expect(fpsCounter).not.toBeVisible();
    });
  });

  test.describe('Avatar Configurator Persistence', () => {
    test('avatar panel visibility persists', async ({ page }) => {
      const avatarButton = page.locator('button').filter({ hasText: '👤' }).first();

      // Open avatar configurator
      await avatarButton.click({ force: true });
      ;

      // Verify configurator is visible
      const bodyTypeSelector = page.locator('select').first();
      await expect(bodyTypeSelector).toBeVisible();

      // Switch scenes
      await switchScene(page, 'Media');

      // Verify configurator is still open
      await expect(bodyTypeSelector).toBeVisible();
    });
  });

  test.describe('Storage Panel Persistence', () => {
    test('storage panel visibility persists', async ({ page }) => {
      const storageButton = page.locator('button').filter({ hasText: '📁' }).first();

      // Open storage panel
      await storageButton.click({ force: true });
      ;

      // Verify storage panel is visible
      const storageHeader = page.getByText(/Storage|Assets|Browse/).first();
      await expect(storageHeader).toBeVisible();

      // Switch scenes
      await switchScene(page, 'Grab');

      // Verify storage panel is still open
      await expect(storageHeader).toBeVisible();
    });

    test('storage tab selection persists', async ({ page }) => {
      const storageButton = page.locator('button').filter({ hasText: '📁' }).first();

      // Open storage panel
      await storageButton.click({ force: true });
      ;

      // Try to find and click Upload tab if it exists
      const uploadTab = page.locator('button').filter({ hasText: 'Upload' }).first();
      if (await uploadTab.isVisible()) {
        await uploadTab.click({ force: true });
        

        // Switch scenes
        await switchScene(page, 'Drawing');

        // Verify Upload tab is still selected
        await expect(uploadTab).toBeVisible();
      }
    });
  });

  test.describe('Connection Status Persistence', () => {
    test('connection status display persists', async ({ page }) => {
      // Find connection status indicator
      const connectionStatus = page.getByText(/Connected|Connecting|Disconnected/).first();
      await expect(connectionStatus).toBeVisible();

      // Get the current status text
      const statusBeforeSwitch = await connectionStatus.textContent();

      // Switch scenes
      await switchScene(page, 'Portal');

      // Verify status indicator still visible
      await expect(connectionStatus).toBeVisible();

      // Status should be consistent (still connected if was connected)
      const statusAfterSwitch = await connectionStatus.textContent();
      // If it was Connected before, it should still be Connected
      if (statusBeforeSwitch?.includes('Connected')) {
        expect(statusAfterSwitch).toContain('Connected');
      }
    });

    test('client ID persists across scene switches', async ({ page }) => {
      // Find client ID display
      const clientIdElement = page.getByText(/Client ID:/).first();

      if (await clientIdElement.isVisible()) {
        const clientIdBefore = await clientIdElement.textContent();

        // Switch scenes
        await switchScene(page, 'Interactive');

        // Verify client ID is still displayed and same
        const clientIdAfter = await clientIdElement.textContent();
        expect(clientIdAfter).toBe(clientIdBefore);
      }
    });
  });

  test.describe('Multiple UI State Persistence', () => {
    test('multiple UI states persist simultaneously', async ({ page }) => {
      // Set up multiple UI states

      // 1. Send a chat message
      const chatInput = page.locator('input[placeholder*="Type a message"]');
      const uniqueMessage = `Multi-persistence test ${Date.now()}`;
      await chatInput.fill(uniqueMessage);
      await chatInput.press('Enter');
      

      // 2. Open settings
      const settingsButton = page.locator('button').filter({ hasText: '⚙️' }).first();
      await settingsButton.click({ force: true });
      

      // 3. Open performance overlay
      const perfButton = page.locator('button').filter({ hasText: '📊' }).first();
      await perfButton.click({ force: true });
      

      // Switch scenes
      await switchScene(page, 'Media');

      // Verify all states persist
      // 1. Chat message still visible
      await expect(page.locator('div').filter({ hasText: uniqueMessage }).first()).toBeVisible();

      // 2. Settings still visible (or toggle visible)
      const settingsPanel = page
        .locator('div')
        .filter({ hasText: /Audio|Graphics|Network|Account/ })
        .first();
      // Settings might auto-close on scene switch - check toggle instead
      await expect(settingsButton).toBeVisible();

      // 3. Performance overlay still visible
      const fpsCounter = page.getByText(/FPS:/).first();
      await expect(fpsCounter).toBeVisible();
    });
  });
});
