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
    // Track position updates between users
    const user1PositionUpdates: number[] = [];
    const user2PositionUpdates: number[] = [];
    
    user1Page.on('console', (msg) => {
      const text = msg.text();
      const match = text.match(/position.*?:\s*([\d.]+)/);
      if (match) {
        user1PositionUpdates.push(parseFloat(match[1]));
      }
    });
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
      const text = msg.text();
      const match = text.match(/position.*?:\s*([\d.]+)/);
      if (match) {
        user2PositionUpdates.push(parseFloat(match[1]));
      }
    });

    // Move user1 avatar and verify sync to user2
    await user1Page.keyboard.press('Forward');
    await user1Page.waitForTimeout(2000);
    await user1Page.keyboard.release('Forward');
    await user1Page.waitForTimeout(3000);
    
    // Assert that both users received position updates
    expect(user1PositionUpdates.length).toBeGreaterThan(0, 'User1 should receive position updates');
    expect(user2PositionUpdates.length).toBeGreaterThan(0, 'User2 should receive position updates');
    
    // Verify position updates contain valid values
    expect(user1PositionUpdates.some(pos => pos > 0)).toBe(true, 'User1 should have valid position values');
    expect(user2PositionUpdates.some(pos => pos > 0)).toBe(true, 'User2 should have valid position values');
    // Wait and check for any sync activity
    await user1Page.waitForTimeout(2000);
    await user2Page.waitForTimeout(2000);

    // Verify both users maintain stable connection
    expect(user1Messages.length).toBeGreaterThan(5, 'User1 should have multiple messages');
    expect(user2Messages.length).toBeGreaterThan(5, 'User2 should have multiple messages');

    // Final screenshots
    await user1Page.screenshot({
      path: 'test-results/multi-user-user1-final.png',
      fullPage: true
    });
    await user2Page.screenshot({
      path: 'test-results/multi-user-user2-final.png',
      fullPage: true
    });
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
    let wsConnected = false;

    page.on('console', (msg) => {
      const text = msg.text();
      logs.push(text);
      if (text.includes('WebSocket connected') || text.includes('Connected to presence server')) {
        wsConnected = true;
      }
    });

    await page.goto('https://xr.graphwiz.ai');

    // Wait for connection
    await page.waitForTimeout(5000);

    // Check connection sequence
    const hasConnecting = logs.some((msg) => msg.includes('Connecting to'));
    const hasConnected = logs.some((msg) => msg.includes('WebSocket connected') || msg.includes('Connected to presence server'));
    const hasServerHello = logs.some((msg) => msg.includes('server hello') || msg.includes('SERVER_HELLO'));

    // Verify connection was established
    expect(hasConnected).toBe(true, 'WebSocket should be connected');
    expect(wsConnected).toBe(true, 'Connection flag should be set');

    // Log WebSocket messages for debugging
    const wsLogs = logs.filter(
      (log) => log.includes('WebSocket') || log.includes('Sent message') || log.includes('Received')
    );
    
    expect(wsLogs.length).toBeGreaterThan(0, 'Should have WebSocket-related logs');
});
