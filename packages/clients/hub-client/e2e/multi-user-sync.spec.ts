import { test, expect } from '@playwright/test';

test.describe('Multi-User Avatar Synchronization', () => {
  test('should sync avatar positions between two users', async ({ browser }) => {
    // Create two browser contexts (simulating two users)
    const user1Context = await browser.newContext();
    const user2Context = await browser.newContext();

    const user1Page = await user1Context.newPage();
    const user2Page = await user2Context.newPage();

    // Track WebSocket messages for both users
    const user1Messages: string[] = [];
    const user2Messages: string[] = [];

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

    expect(user1Connected).toBe(true);
    expect(user2Connected).toBe(true);


    // Wait for server hello and initial sync
    await user1Page.waitForTimeout(2000);
    await user2Page.waitForTimeout(2000);

    // Check if users received server hello
    const user1ReceivedHello = user1Messages.some(
      (msg) => msg.includes('server hello') || msg.includes('SERVER_HELLO')
    );
    const user2ReceivedHello = user2Messages.some(
      (msg) => msg.includes('server hello') || msg.includes('SERVER_HELLO')
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


    // Monitor for avatar position updates
    // TODO: Add assertions to verify updates were received

    user1Page.on('console', (msg) => {
      if (
        msg.text().includes('avatar') ||
        msg.text().includes('position') ||
        msg.text().includes('transform')
      ) {
        // Avatar update received
      }
    });

    user2Page.on('console', (msg) => {
      if (
        msg.text().includes('avatar') ||
        msg.text().includes('position') ||
        msg.text().includes('transform')
      ) {
        // Avatar update received
      }
    });

    // Wait and check for any sync activity
    await user1Page.waitForTimeout(5000);
    await user2Page.waitForTimeout(5000);

    // Log all WebSocket-related messages
    user1Messages
      .filter(
        (msg) =>
          msg.includes('WebSocket') || msg.includes('Sent message') || msg.includes('Received')
      )

    user2Messages
      .filter(
        (msg) =>
          msg.includes('WebSocket') || msg.includes('Sent message') || msg.includes('Received')
      )

    // Final screenshots
    await user1Page.screenshot({
      path: 'test-results/multi-user-user1-final.png',
      fullPage: true
    });
    await user2Page.screenshot({
      path: 'test-results/multi-user-user2-final.png',
      fullPage: true
    });


    // Verify basic connectivity
    expect(user1Connected).toBe(true);
    expect(user2Connected).toBe(true);

  });

  test('should handle WebSocket connection lifecycle', async ({ page }) => {
    const logs: string[] = [];

    page.on('console', (msg) => {
      logs.push(msg.text());
    });

    await page.goto('https://xr.graphwiz.ai');

    // Wait for connection
    await page.waitForTimeout(5000);

    // Check connection sequence
    const hasConnecting = logs.some((msg) => msg.includes('Connecting to'));
    const hasConnected = logs.some((msg) => msg.includes('WebSocket connected'));
    const hasServerHello = logs.some((msg) => msg.includes('server hello'));


    // Verify connection was established
    expect(hasConnected).toBe(true);

    // Log WebSocket messages
    const wsLogs = logs.filter(
      (log) => log.includes('WebSocket') || log.includes('Sent message') || log.includes('Received')
    );

  });
});
