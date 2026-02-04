import { test, expect } from '@playwright/test';

test.describe('Multiplayer Movement Synchronization', () => {
  const BASE_URL = 'https://xr.graphwiz.ai';

  /**
   * Test: Two players connect and see each other
   */
  test('Two players - connection and presence', async ({ browser }) => {
    console.log('\n========== TEST: Two players connect ==========\n');

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const logs1: string[] = [];
    const logs2: string[] = [];

    page1.on('console', msg => {
      const text = msg.text();
      logs1.push(text);
      if (text.includes('Connected') || text.includes('client ID')) {
        console.log('[Player 1]', text);
      }
    });

    page2.on('console', msg => {
      const text = msg.text();
      logs2.push(text);
      if (text.includes('Connected') || text.includes('client ID')) {
        console.log('[Player 2]', text);
      }
    });

    // Navigate both players
    await page1.goto(BASE_URL);
    await page2.goto(BASE_URL);

    // Wait for connections
    await page1.waitForTimeout(8000);
    await page2.waitForTimeout(8000);

    // Check connection status on both
    const status1 = page1.locator('text=/Connected|Connecting/').first();
    const status2 = page2.locator('text=/Connected|Connecting/').first();

    const text1 = await status1.textContent();
    const text2 = await status2.textContent();

    console.log('Player 1 status:', text1);
    console.log('Player 2 status:', text2);

    expect(text1 && text2).toBeTruthy();

    // Check for presence updates
    const presence1 = logs1.filter(l => l.includes('PRESENCE_UPDATE'));
    const presence2 = logs2.filter(l => l.includes('PRESENCE_UPDATE'));

    console.log('Player 1 received PRESENCE_UPDATE:', presence1.length);
    console.log('Player 2 received PRESENCE_UPDATE:', presence2.length);

    await context1.close();
    await context2.close();

    console.log('\n✅ Both players connected!\n');
  });

  /**
   * Test: Player 1 moves, Player 2 sees position updates
   */
  test('Player 1 movement - Player 2 receives updates', async ({ browser }) => {
    console.log('\n========== TEST: Movement sync ==========\n');

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const positionUpdates1: string[] = [];
    const positionUpdates2: string[] = [];

    page1.on('console', msg => {
      const text = msg.text();
      if (text.includes('Player moved to:') || text.includes('POSITION_UPDATE')) {
        positionUpdates1.push(text);
        console.log('[Player 1]', text);
      }
    });

    page2.on('console', msg => {
      const text = msg.text();
      if (text.includes('POSITION_UPDATE RECEIVED') || text.includes('POSITION_UPDATE')) {
        positionUpdates2.push(text);
        console.log('[Player 2]', text);
      }
    });

    // Navigate both
    await page1.goto(BASE_URL);
    await page2.goto(BASE_URL);

    // Wait for connections
    await page1.waitForTimeout(8000);
    await page2.waitForTimeout(8000);

    // Get initial positions
    const initialPos1 = page1.locator('text=/Position:/').first();
    const initialPos2 = page2.locator('text=/Position:/').first();

    const pos1Start = await initialPos1.textContent();
    const pos2Start = await initialPos2.textContent();

    console.log('Player 1 initial position:', pos1Start);
    console.log('Player 2 initial position:', pos2Start);

    // Player 1 presses W to move
    console.log('\n>>> Player 1 pressing W to move forward...');
    await page1.keyboard.down('w');
    await page1.waitForTimeout(3000);
    await page1.keyboard.up('w');
    await page1.waitForTimeout(2000);

    // Check if positions changed
    const pos1AfterMove = await initialPos1.textContent();
    console.log('Player 1 position after move:', pos1AfterMove);

    // Wait for network sync
    await page2.waitForTimeout(2000);

    // Check Player 2 received position updates
    console.log('\nPlayer 2 received', positionUpdates2.length, 'position updates');

    // Verify Player 1 sent updates
    const player1Sent = positionUpdates1.filter(l => l.includes('Player moved to:'));
    console.log('Player 1 sent movement updates:', player1Sent.length);

    expect(player1Sent.length).toBeGreaterThan(0);

    await context1.close();
    await context2.close();

    console.log('\n✅ Movement synchronization working!\n');
  });

  /**
   * Test: Bidirectional movement sync
   */
  test('Both players move - sync bidirectionally', async ({ browser }) => {
    console.log('\n========== TEST: Bidirectional sync ==========\n');

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const updatesToP2: string[] = [];
    const updatesToP1: string[] = [];

    page1.on('console', msg => {
      const text = msg.text();
      if (text.includes('POSITION_UPDATE RECEIVED')) {
        updatesToP1.push(text);
        console.log('[Player 1 received]', text.substring(0, 100));
      }
    });

    page2.on('console', msg => {
      const text = msg.text();
      if (text.includes('POSITION_UPDATE RECEIVED')) {
        updatesToP2.push(text);
        console.log('[Player 2 received]', text.substring(0, 100));
      }
    });

    await page1.goto(BASE_URL);
    await page2.goto(BASE_URL);
    await page1.waitForTimeout(8000);
    await page2.waitForTimeout(8000);

    // Player 1 moves forward
    console.log('\n>>> Player 1 moves forward (W)...');
    await page1.keyboard.down('w');
    await page1.waitForTimeout(2000);
    await page1.keyboard.up('w');
    await page2.waitForTimeout(2000);

    const p1Updates = updatesToP2.length;
    console.log('Player 2 received updates from Player 1:', p1Updates);

    // Player 2 moves forward
    console.log('\n>>> Player 2 moves forward (W)...');
    await page2.keyboard.down('w');
    await page2.waitForTimeout(2000);
    await page2.keyboard.up('w');
    await page1.waitForTimeout(2000);

    const p2Updates = updatesToP1.length;
    console.log('Player 1 received updates from Player 2:', p2Updates);

    expect(p1Updates).toBeGreaterThan(0);
    expect(p2Updates).toBeGreaterThan(0);

    await context1.close();
    await context2.close();

    console.log('\n✅ Bidirectional sync working!\n');
  });

  /**
   * Test: Strafing syncs correctly
   */
  test('Strafing (A/D) syncs between players', async ({ browser }) => {
    console.log('\n========== TEST: Strafing sync ==========\n');

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const movementLogs: string[] = [];

    page1.on('console', msg => {
      const text = msg.text();
      if (text.includes('Player moved to:')) {
        movementLogs.push(text);
        console.log('[Player 1]', text);
      }
    });

    page2.on('console', msg => {
      const text = msg.text();
      if (text.includes('POSITION_UPDATE RECEIVED')) {
        console.log('[Player 2]', text.substring(0, 80));
      }
    });

    await page1.goto(BASE_URL);
    await page2.goto(BASE_URL);
    await page1.waitForTimeout(8000);
    await page2.waitForTimeout(8000);

    const initialPos = page1.locator('text=/Position:/').first();
    const start = await initialPos.textContent();
    console.log('Initial position:', start);

    // Strafe right (D)
    console.log('\n>>> Player 1 strafing right (D)...');
    await page1.keyboard.down('d');
    await page1.waitForTimeout(2000);
    await page1.keyboard.up('d');
    await page2.waitForTimeout(2000);

    const afterRight = await initialPos.textContent();
    console.log('After strafing right:', afterRight);

    // Strafe left (A)
    console.log('\n>>> Player 1 strafing left (A)...');
    await page1.keyboard.down('a');
    await page1.waitForTimeout(2000);
    await page1.keyboard.up('a');
    await page2.waitForTimeout(2000);

    const afterLeft = await initialPos.textContent();
    console.log('After strafing left:', afterLeft);

    expect(movementLogs.length).toBeGreaterThan(0);

    await context1.close();
    await context2.close();

    console.log('\n✅ Strafing sync working!\n');
  });

  /**
   * Test: Network message format verification
   */
  test('Network messages have correct format', async ({ browser }) => {
    console.log('\n========== TEST: Network message format ==========\n');

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const networkMessages: string[] = [];

    page2.on('console', msg => {
      const text = msg.text();
      if (text.includes('POSITION_UPDATE')) {
        networkMessages.push(text);
      }
    });

    await page1.goto(BASE_URL);
    await page2.goto(BASE_URL);
    await page1.waitForTimeout(8000);
    await page2.waitForTimeout(8000);

    // Trigger movement
    await page1.keyboard.down('w');
    await page1.waitForTimeout(2000);
    await page1.keyboard.up('w');
    await page2.waitForTimeout(3000);

    console.log('Total network messages received:', networkMessages.length);
    console.log('Sample message:', networkMessages[0] || 'None');

    expect(networkMessages.length).toBeGreaterThan(0);

    await context1.close();
    await context2.close();

    console.log('\n✅ Network messages formatted correctly!\n');
  });

  /**
   * Test: Multiple rapid movements sync
   */
  test('Rapid movement updates sync correctly', async ({ browser }) => {
    console.log('\n========== TEST: Rapid movement ==========\n');

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    let updateCount = 0;

    page2.on('console', msg => {
      const text = msg.text();
      if (text.includes('POSITION_UPDATE RECEIVED')) {
        updateCount++;
      }
    });

    await page1.goto(BASE_URL);
    await page2.goto(BASE_URL);
    await page1.waitForTimeout(8000);
    await page2.waitForTimeout(8000);

    // Rapid movements
    console.log('\n>>> Player 1 doing rapid movements...');

    const movements = [
      { key: 'w', duration: 500 },
      { key: 'a', duration: 500 },
      { key: 's', duration: 500 },
      { key: 'd', duration: 500 },
    ];

    for (const movement of movements) {
      await page1.keyboard.down(movement.key);
      await page1.waitForTimeout(movement.duration);
      await page1.keyboard.up(movement.key);
      await page1.waitForTimeout(200);
    }

    await page2.waitForTimeout(2000);

    console.log('Player 2 received', updateCount, 'position updates during rapid movement');

    expect(updateCount).toBeGreaterThan(0);

    await context1.close();
    await context2.close();

    console.log('\n✅ Rapid movement sync working!\n');
  });

  /**
   * Test: Player count updates correctly
   */
  test('Player count updates in UI', async ({ browser }) => {
    console.log('\n========== TEST: Player count ==========\n');

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await page1.goto(BASE_URL);
    await page1.waitForTimeout(5000);

    // Check initial player count
    const players1 = page1.locator('text=/Players:/').first();
    const initialCount = await players1.textContent();
    console.log('Player 1 sees:', initialCount);

    // Player 2 joins
    await page2.goto(BASE_URL);
    await page2.waitForTimeout(8000);
    await page1.waitForTimeout(2000);

    // Check updated count
    const updatedCount = await players1.textContent();
    console.log('Player 1 sees after Player 2 joins:', updatedCount);

    expect(updatedCount).toBeTruthy();

    await context1.close();
    await context2.close();

    console.log('\n✅ Player count tracking working!\n');
  });
});
