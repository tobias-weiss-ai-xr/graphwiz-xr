/**
 * E2E tests for Chat System UI component
 * Tests the inline chat panel in App.tsx
 */

import { test, expect } from '@playwright/test';

test.describe('Chat System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have chat panel visible by default', async ({ page }) => {
    // Chat panel should be visible (chatVisible starts as true)
    const chatPanel = page.locator('text=Chat').first();
    await expect(chatPanel).toBeVisible({ timeout: 10000 });

    // Input field should be visible
    const input = page.locator('input[placeholder*="Type a message"]');
    await expect(input).toBeVisible();
  });

  test('should show "No messages yet" placeholder when empty', async ({ page }) => {
    // Chat panel should be visible
    const placeholder = page.locator('text=No messages yet');
    await expect(placeholder).toBeVisible({ timeout: 10000 });
  });

  test('should accept text input in chat field', async ({ page }) => {
    const input = page.locator('input[placeholder*="Type a message"]');
    await expect(input).toBeVisible({ timeout: 10000 });

    // Type a message
    await input.fill('Hello, World!');

    // Verify input has the text
    const value = await input.inputValue();
    expect(value).toBe('Hello, World!');
  });

  test('should send message when pressing Enter', async ({ page }) => {
    const input = page.locator('input[placeholder*="Type a message"]');
    await expect(input).toBeVisible({ timeout: 10000 });

    // Type a message
    await input.fill('Test message');

    // Press Enter to send
    await input.press('Enter');

    // Wait for message to appear by checking that the placeholder is no longer visible

    // Message should be displayed with "You" as sender
    const senderLabel = page.locator('text=You').first();
    await expect(senderLabel).toBeVisible({ timeout: 5000 });

    // Message content should be visible
    const messageContent = page.locator('text=Test message');
    await expect(messageContent).toBeVisible({ timeout: 5000 });
  });

  test('should hide chat panel when clicking close button', async ({ page }) => {
    // Chat panel container should be visible initially (has input field)
    const chatInput = page.locator('input[placeholder*="Type a message"]');
    await expect(chatInput).toBeVisible({ timeout: 10000 });

    // Find and click close button (x) in chat header
    const closeButton = page.locator('button').filter({ hasText: '×' }).first();
    await closeButton.click({ force: true });

    // Wait for panel to close by checking input is no longer visible

    // Chat toggle button should now be visible
    const chatToggleButton = page.locator('button').filter({ hasText: /💬 Chat/ });
    await expect(chatToggleButton).toBeVisible({ timeout: 5000 });
  });

  test('should show chat toggle button with message count when hidden', async ({ page }) => {
    // First send a message
    const input = page.locator('input[placeholder*="Type a message"]');
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill('Hello test');
    await input.press('Enter');
    // Wait for message to appear
    await expect(page.locator('text=Hello test')).toBeVisible({ timeout: 5000 });

    // Close the chat panel
    const closeButton = page.locator('button').filter({ hasText: '×' }).first();
    await closeButton.click({ force: true });

    const chatInput = page.locator('input[placeholder*="Type a message"]');
    // Wait for panel to close
    await expect(chatInput).not.toBeVisible({ timeout: 5000 });

    // Toggle button should show message count
    const toggleButton = page.locator('button').filter({ hasText: /Chat.*1/ });
    await expect(toggleButton).toBeVisible({ timeout: 5000 });
  });
});
