import { test, expect, Page } from '@playwright/test';

/**
 * Task 11: Test HUD positioning across scenes
 * 
 * Tests that UI overlay elements maintain consistent positioning
 * when switching between different scenes.
 */

test.describe('HUD Positioning Across Scenes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('canvas', { timeout: 15000 });
    ; // Wait for scene to initialize
  });

  test('chat panel maintains position after scene switch', async ({ page }) => {
    // Ensure chat panel is visible (it's visible by default)
    const chatInput = page.locator('input[placeholder*="Type a message"]');
    await expect(chatInput).toBeVisible();

    // Get initial position of chat panel
    const chatPanel = page.locator('div').filter({ hasText: /^Chat$/ }).first();
    const initialBox = await chatPanel.boundingBox();
    expect(initialBox).not.toBeNull();

    // Open scene selector and switch to Interactive scene
    const sceneToggle = page.locator('button').filter({
      has: page.locator('text=▼').or(page.locator('text=▲'))
    }).filter({
      hasText: /Default|Interactive|Media|Grab|Drawing|Portal|Gestures/
    }).first();
    await sceneToggle.click({ force: true });
    await page.waitForSelector('text=Select Scene', { timeout: 3000 });

    // Click Interactive scene
    await page.locator('button').filter({ hasText: 'Interactive' }).click({ force: true });
    ;

    // Check chat panel still visible and in same position
    await expect(chatInput).toBeVisible();
    const afterSwitchBox = await chatPanel.boundingBox();
    expect(afterSwitchBox).not.toBeNull();

    // Position should be the same (bottom-left)
    expect(Math.abs(afterSwitchBox!.x - initialBox!.x)).toBeLessThan(10);
    expect(Math.abs(afterSwitchBox!.y - initialBox!.y)).toBeLessThan(10);
  });

  test('settings button maintains position after scene switch', async ({ page }) => {
    // Find settings button (gear icon)
    const settingsButton = page.locator('button').filter({ hasText: '⚙️' }).first();
    await expect(settingsButton).toBeVisible();

    const initialBox = await settingsButton.boundingBox();
    expect(initialBox).not.toBeNull();

    // Switch scenes
    const sceneToggle = page.locator('button').filter({
      has: page.locator('text=▼').or(page.locator('text=▲'))
    }).filter({
      hasText: /Default|Interactive|Media|Grab|Drawing|Portal|Gestures/
    }).first();
    await sceneToggle.click({ force: true });
    await page.waitForSelector('text=Select Scene', { timeout: 3000 });
    await page.locator('button').filter({ hasText: 'Media' }).click({ force: true });
    ;

    // Check settings button still in same position
    await expect(settingsButton).toBeVisible();
    const afterSwitchBox = await settingsButton.boundingBox();
    expect(afterSwitchBox).not.toBeNull();

    // Position should be consistent
    expect(Math.abs(afterSwitchBox!.x - initialBox!.x)).toBeLessThan(10);
    expect(Math.abs(afterSwitchBox!.y - initialBox!.y)).toBeLessThan(10);
  });

  test('emoji picker button maintains position after scene switch', async ({ page }) => {
    // Find emoji picker button
    const emojiButton = page.locator('button').filter({ hasText: '😀' }).first();
    await expect(emojiButton).toBeVisible();

    const initialBox = await emojiButton.boundingBox();
    expect(initialBox).not.toBeNull();

    // Switch scenes
    const sceneToggle = page.locator('button').filter({
      has: page.locator('text=▼').or(page.locator('text=▲'))
    }).filter({
      hasText: /Default|Interactive|Media|Grab|Drawing|Portal|Gestures/
    }).first();
    await sceneToggle.click({ force: true });
    await page.waitForSelector('text=Select Scene', { timeout: 3000 });
    await page.locator('button').filter({ hasText: 'Grab' }).click({ force: true });
    ;

    // Check emoji button still in same position
    await expect(emojiButton).toBeVisible();
    const afterSwitchBox = await emojiButton.boundingBox();
    expect(afterSwitchBox).not.toBeNull();

    // Position should be consistent
    expect(Math.abs(afterSwitchBox!.x - initialBox!.x)).toBeLessThan(10);
    expect(Math.abs(afterSwitchBox!.y - initialBox!.y)).toBeLessThan(10);
  });

  test('performance button maintains position after scene switch', async ({ page }) => {
    // Find performance button
    const perfButton = page.locator('button').filter({ hasText: /Performance|⚡/ }).first();
    await expect(perfButton).toBeVisible();

    const initialBox = await perfButton.boundingBox();
    expect(initialBox).not.toBeNull();

    // Switch scenes
    const sceneToggle = page.locator('button').filter({
      has: page.locator('text=▼').or(page.locator('text=▲'))
    }).filter({
      hasText: /Default|Interactive|Media|Grab|Drawing|Portal|Gestures/
    }).first();
    await sceneToggle.click({ force: true });
    await page.waitForSelector('text=Select Scene', { timeout: 3000 });
    await page.locator('button').filter({ hasText: 'Portal' }).click({ force: true });
    ;

    // Check performance button still in same position
    await expect(perfButton).toBeVisible();
    const afterSwitchBox = await perfButton.boundingBox();
    expect(afterSwitchBox).not.toBeNull();

    // Position should be consistent
    expect(Math.abs(afterSwitchBox!.x - initialBox!.x)).toBeLessThan(10);
    expect(Math.abs(afterSwitchBox!.y - initialBox!.y)).toBeLessThan(10);
  });

  test('avatar button maintains position after scene switch', async ({ page }) => {
    // Find avatar button
    const avatarButton = page.locator('button').filter({ hasText: '🎭' }).first();
    await expect(avatarButton).toBeVisible();

    const initialBox = await avatarButton.boundingBox();
    expect(initialBox).not.toBeNull();

    // Switch scenes
    const sceneToggle = page.locator('button').filter({
      has: page.locator('text=▼').or(page.locator('text=▲'))
    }).filter({
      hasText: /Default|Interactive|Media|Grab|Drawing|Portal|Gestures/
    }).first();
    await sceneToggle.click({ force: true });
    await page.waitForSelector('text=Select Scene', { timeout: 3000 });
    await page.locator('button').filter({ hasText: 'Drawing' }).click({ force: true });
    ;

    // Check avatar button still in same position
    await expect(avatarButton).toBeVisible();
    const afterSwitchBox = await avatarButton.boundingBox();
    expect(afterSwitchBox).not.toBeNull();

    // Position should be consistent
    expect(Math.abs(afterSwitchBox!.x - initialBox!.x)).toBeLessThan(10);
    expect(Math.abs(afterSwitchBox!.y - initialBox!.y)).toBeLessThan(10);
  });

  test('scene selector maintains position after scene switch', async ({ page }) => {
    // Find scene selector toggle
    const sceneToggle = page.locator('button').filter({
      has: page.locator('text=▼').or(page.locator('text=▲'))
    }).filter({
      hasText: /Default|Interactive|Media|Grab|Drawing|Portal|Gestures/
    }).first();
    await expect(sceneToggle).toBeVisible();

    const initialBox = await sceneToggle.boundingBox();
    expect(initialBox).not.toBeNull();

    // Open and switch scenes multiple times
    await sceneToggle.click({ force: true });
    await page.waitForSelector('text=Select Scene', { timeout: 3000 });
    await page.locator('button').filter({ hasText: 'Interactive' }).click({ force: true });
    ;

    // Re-find the toggle (text changed)
    const sceneToggle2 = page.locator('button').filter({
      has: page.locator('text=▼').or(page.locator('text=▲'))
    }).filter({
      hasText: /Default|Interactive|Media|Grab|Drawing|Portal|Gestures/
    }).first();

    const afterSwitchBox = await sceneToggle2.boundingBox();
    expect(afterSwitchBox).not.toBeNull();

    // Position should be consistent (top-right area)
    expect(Math.abs(afterSwitchBox!.x - initialBox!.x)).toBeLessThan(10);
    expect(Math.abs(afterSwitchBox!.y - initialBox!.y)).toBeLessThan(10);
  });

  test('storage button maintains position after scene switch', async ({ page }) => {
    // Find storage/assets button
    const storageButton = page.locator('button').filter({ hasText: '📦 Assets' }).first();
    await expect(storageButton).toBeVisible();

    const initialBox = await storageButton.boundingBox();
    expect(initialBox).not.toBeNull();

    // Switch scenes
    const sceneToggle = page.locator('button').filter({
      has: page.locator('text=▼').or(page.locator('text=▲'))
    }).filter({
      hasText: /Default|Interactive|Media|Grab|Drawing|Portal|Gestures/
    }).first();
    await sceneToggle.click({ force: true });
    await page.waitForSelector('text=Select Scene', { timeout: 3000 });
    await page.locator('button').filter({ hasText: 'Gestures' }).click({ force: true });
    ;

    // Check storage button still in same position
    await expect(storageButton).toBeVisible();
    const afterSwitchBox = await storageButton.boundingBox();
    expect(afterSwitchBox).not.toBeNull();

    // Position should be consistent
    expect(Math.abs(afterSwitchBox!.x - initialBox!.x)).toBeLessThan(10);
    expect(Math.abs(afterSwitchBox!.y - initialBox!.y)).toBeLessThan(10);
  });

  test('all HUD elements visible simultaneously', async ({ page }) => {
    // Check that all major HUD elements are visible at the same time
    const chatInput = page.locator('input[placeholder*="Type a message"]');
    const settingsButton = page.locator('button').filter({ hasText: '⚙️' }).first();
    const emojiButton = page.locator('button').filter({ hasText: '😀' }).first();
    const perfButton = page.locator('button').filter({ hasText: /Performance|⚡/ }).first();
    const avatarButton = page.locator('button').filter({ hasText: '🎭' }).first();
    const storageButton = page.locator('button').filter({ hasText: '📦 Assets' }).first();

    // All should be visible
    await expect(chatInput).toBeVisible();
    await expect(settingsButton).toBeVisible();
    await expect(emojiButton).toBeVisible();
    await expect(perfButton).toBeVisible();
    await expect(avatarButton).toBeVisible();
    await expect(storageButton).toBeVisible();
  });
});
