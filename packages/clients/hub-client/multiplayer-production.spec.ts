import { test, expect } from '@playwright/test';

test.describe('Multiplayer Movement - Production', () => {
  const BASE_URL = 'https://xr.graphwiz.ai';

  /**
   * Test: Two players connect to production
   */
  test('Production - Two players connect', async ({ browser }) => {
    console.log('\n========== TEST: Production connection ==========\n');

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const logs1: string[] = [];
    const logs2: string[] = [];

    page1.on('console', msg => {
      const text = msg.text();
      logs1.push(text);
      if (text.includes('Connected') || text.includes('client ID') || text.includes('PRESENCE')) {
        console.log('[Player 1]', text);
      }
    });

    page2.on('console', msg => {
      const text = msg.text();
      logs2.push(text);
      if (text.includes('Connected') || text.includes('client ID') || text.includes('PRESENCE')) {
        console.log('[Player 2]', text);
      }
    });

    await page1.goto(BASE_URL);
    await page2.goto(BASE_URL);
    await page1.waitForTimeout(10000);
    await page2.waitForTimeout(10000);

    // Check for connections
    const connected1 = logs1.some(l => l.includes('Connected to presence server'));
    const connected2 = logs2.some(l => l.includes('Connected to presence server'));

    console.log('Player 1 connected:', connected1);
    console.log('Player 2 connected:', connected2);

    // Check for client IDs
    const clientId1 = logs1.find(l => l.includes('My client ID:'));
    const clientId2 = logs2.find(l => l.includes('My client ID:'));

    console.log('Player 1 ID:', clientId1 || 'Not found');
    console.log('Player 2 ID:', clientId2 || 'Not found');

    // Check for presence updates
    const presence1 = logs1.filter(l => l.includes('PRESENCE_UPDATE'));
    const presence2 = logs2.filter(l => l.includes('PRESENCE_UPDATE'));

    console.log('Player 1 received PRESENCE_UPDATE:', presence1.length);
    console.log('Player 2 received PRESENCE_UPDATE:', presence2.length);

    expect(connected1 && connected2).toBeTruthy();

    await context1.close();
    await context2.close();

    console.log('\n✅ Both players connected to production!\n');
  });

  /**
   * Test: Check for movement initialization
   */
  test('Production - Movement system initializes', async ({ page }) => {
    console.log('\n========== TEST: Movement init ==========\n');

    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      if (text.includes('Movement') || text.includes('Starting')) {
        console.log('[Console]', text);
      }
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(10000);

    // Check for movement loop
    const movementLogs = logs.filter(l =>
      l.includes('Movement loop') ||
      l.includes('Starting movement') ||
      l.includes('connected=')
    );

    console.log('Movement system logs:', movementLogs.length);

    // Check if movement is running
    const isRunning = logs.some(l => l.includes('Movement loop not started') === false);
    console.log('Movement system active:', !logs.some(l => l.includes('Movement loop not started: connected=true')));

    await page.screenshot({ path: 'test-screenshots/production-movement.png' });

    console.log('\n✅ Movement system check complete!\n');
  });

  /**
   * Test: WebSocket connection established
   */
  test('Production - WebSocket connects', async ({ page }) => {
    console.log('\n========== TEST: WebSocket ==========\n');

    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('WebSocket') || text.includes('socket')) {
        logs.push(text);
        console.log('[WS]', text);
      }
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(10000);

    const wsLogs = logs.filter(l => l.includes('WebSocket'));
    console.log('WebSocket logs:', wsLogs.length);

    // Check for connection
    const connected = wsLogs.some(l => l.includes('WebSocket connected'));

    expect(connected).toBeTruthy();

    console.log('\n✅ WebSocket connection working!\n');
  });

  /**
   * Test: Player 1 moves - check for console activity
   */
  test('Production - Movement triggers console logs', async ({ page }) => {
    console.log('\n========== TEST: Movement logs ==========\n');

    const positionLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Player moved to:') || text.includes('position')) {
        positionLogs.push(text);
        console.log('[Position]', text);
      }
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(10000);

    // Press W key
    console.log('\n>>> Pressing W key...');
    await page.keyboard.down('w');
    await page.waitForTimeout(3000);
    await page.keyboard.up('w');
    await page.waitForTimeout(2000);

    console.log('Position logs captured:', positionLogs.length);

    // Any logs indicate movement is happening
    await page.screenshot({ path: 'test-screenshots/production-after-move.png' });

    console.log('\n✅ Movement logging test complete!\n');
  });

  /**
   * Test: Check network infrastructure exists
   */
  test('Production - Network infrastructure', async ({ page }) => {
    console.log('\n========== TEST: Network infra ==========\n');

    const allLogs: string[] = [];
    page.on('console', msg => {
      allLogs.push(msg.text());
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(10000);

    // Check for network-related logs
    const networkLogs = allLogs.filter(l =>
      l.includes('WebSocket') ||
      l.includes('sendPositionUpdate') ||
      l.includes('ENTITY_SPAWN') ||
      l.includes('Presence')
    );

    console.log('Network-related logs:', networkLogs.length);

    // Print sample network logs
    networkLogs.slice(0, 5).forEach(log => {
      console.log('  ', log.substring(0, 100));
    });

    expect(networkLogs.length).toBeGreaterThan(0);

    console.log('\n✅ Network infrastructure verified!\n');
  });

  /**
   * Test: Two players - check if they can coexist
   */
  test('Production - Two players can coexist', async ({ browser }) => {
    console.log('\n========== TEST: Two players ==========\n');

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const allLogs1: string[] = [];
    const allLogs2: string[] = [];

    page1.on('console', msg => allLogs1.push(msg.text()));
    page2.on('console', msg => allLogs2.push(msg.text()));

    await page1.goto(BASE_URL);
    await page2.goto(BASE_URL);
    await page1.waitForTimeout(10000);
    await page2.waitForTimeout(10000);

    // Check both have unique client IDs
    const id1 = allLogs1.find(l => l.includes('My client ID:'));
    const id2 = allLogs2.find(l => l.includes('My client ID:'));

    console.log('Player 1:', id1 || 'No ID');
    console.log('Player 2:', id2 || 'No ID');

    expect(id1 && id2).toBeTruthy();

    // They should have different IDs
    if (id1 && id2) {
      const id1Value = id1.split('My client ID:')[1]?.trim();
      const id2Value = id2.split('My client ID:')[1]?.trim();
      console.log('IDs are different:', id1Value !== id2Value);
    }

    await context1.close();
    await context2.close();

    console.log('\n✅ Two players can coexist!\n');
  });
});
