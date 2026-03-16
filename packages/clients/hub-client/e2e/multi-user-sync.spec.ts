import { test, expect } from '@playwright/test';

/**
 * Task 3: Test avatar synchronization between multiple users
 */

test.describe('Multi-user-avatar-synchronization', () => {
  test('should sync avatar positions between two users', async ({ browser }) => {
    // Create two browser contexts (simulating two users)
    const user1Context = await browser.newContext();
    const user2Context = await browser.newContext();

    const user1Page = await user1Context.newPage();
    const user2Page = await user2Context.newPage();

    // Track WebSocket messages for both users
    user1Page.on('console', (msg) => {
      const text = msg.text();
      user1Messages.push(text);
    });

    user2Page.on('console', (msg) => {
      const text = msg.text();
      user2Messages.push(text);
    });

    // Navigate both users to the site
    await user1Page.goto('https://xr.graphwiz.ai');
    await user2Page.goto('https://xr.graphwiz.ai');

    // Wait for both to connect to WebSocket
    await user1Page.waitForTimeout(3000);
    await user2Page.waitForTimeout(3000);

    // Verify WebSocket connections
    const user1Connected = user1Messages.some(
      (msg) => msg.includes('WebSocket connected') || msg.includes('Connected to presence server')
    );
    const user2Connected = user2Messages.some(
      (msg) => msg.includes('WebSocket connected') || msg.includes('Connected to presence server')
    );

    // Check connection sequence
    const hasConnecting = logs.some((msg) => msg.includes('Connecting to'));
    const hasConnected = logs.some(
      (msg) => msg.includes('WebSocket connected') || msg.includes('Connected to presence server')
    );
    const hasServerHello = logs.some(
      (msg) =>
        msg.includes('server hello') || msg.includes('SERVER hello') || msg.includes('SERVER hello')
    );

    // Take screenshots of initial state
    await user1Page.screenshot({
      path: 'test-results/multi-user-user1-initial.png',
      fullPage: true
    });
    await user2Page.screenshot({
      path: 'test-results/multi-user-user2-initial.png',
      fullPage: true
    });
  });

  test('should handle WebSocket connection lifecycle', async ({ page }) => {
    const logs: string[] = [];
    let wsConnected = false;

    page.on('console', (msg) => {
      const text = msg.text();
      logs.push(text);
      if (text.includes('WebSocket connected') || text.includes('Connected to presence server')) {
        wsConnected = true;
      }
    });

    await page.goto('https://xr.graphwiz.ai');
    // wait for connection
    await page.waitForTimeout(5000);

    // check connection sequence
    const hasConnecting = logs.some((msg) => msg.includes('Connecting to'));
    const hasConnected = logs.some(
      (msg) => msg.includes('WebSocket connected') || msg.includes('Connected to presence server')
    );
    const hasServerHello = logs.some(
      (msg) =>
        msg.includes('server hello') || msg.includes('server hello') || msg.includes('server hello')
    );

    // Log WebSocket messages for debugging
    const wsLogs = logs.filter(
      (log) => log.includes('WebSocket') || log.includes('Sent message') || log.includes('Received')
    );

    expect(wsLogs.length).toBeGreaterThan(0, 'Should have WebSocket-related logs');
  });
});
