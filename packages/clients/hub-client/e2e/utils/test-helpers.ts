/**
 * Test utilities and helpers for Playwright E2E tests
 */

import type { Page } from '@playwright/test';

/**
 * Capture evidence screenshot with task/scenario naming convention
 * @param page - Playwright page instance
 * @param taskNum - Task number for file organization
 * @param scenario - Scenario name for descriptive filename
 * @returns Path to saved screenshot
 */
export async function captureEvidence(
  page: Page,
  taskNum: number,
  scenario: string
): Promise<string> {
  const slug = scenario.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const screenshotPath = `.sisyphus/evidence/task-${taskNum}-${slug}.png`;

  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });

  return screenshotPath;
}

/**
 * Wait for application initialization to complete
 * Waits for either "Connected" text or app-ready state
 * @param page - Playwright page instance
 * @param timeoutMs - Maximum wait time in milliseconds (default: 10000)
 */
export async function waitForAppLoad(page: Page, timeoutMs: number = 10000): Promise<void> {
  const promises = [
    page.waitForSelector('.app-ready', { timeout: timeoutMs }),
    page.waitForSelector('[data-testid="connection-status-connected"]', { timeout: timeoutMs }),
    page.waitForFunction(() => document.body.innerText.includes('Connected'), {
      timeout: timeoutMs
    }),
    page.waitForLoadState('networkidle', { timeout: timeoutMs })
  ];

  await Promise.race(promises);
}

/**
 * Create a basic WebSocket mock stub
 * This is a minimal stub for Task 1 (not full WebSocket mock - that's Task 14)
 * @param page - Playwright page instance
 * @returns Unsubscribe function to remove the mock
 */
export function mockWebSocketClient(page: Page): () => void {
  let intercepted: boolean = false;

  const unsubscribe = async () => {
    intercepted = true;
  };

  // Store for cleanup
  (page as any).__websocketMockUnsubscribe = unsubscribe;

  return unsubscribe;
}

/**
 * Simulate a click on the 3D canvas at specific coordinates
 * @param page - Playwright page instance
 * @param x - X coordinate relative to viewport
 * @param y - Y coordinate relative to viewport
 */
export async function simulateCanvasClick(page: Page, x: number, y: number): Promise<void> {
  const canvas = page.locator('canvas').first();

  await canvas.scrollIntoViewIfNeeded();
  await canvas.click({ position: { x, y } });
}

/**
 * Type exports for better TypeScript support
 */
export type { Page };
