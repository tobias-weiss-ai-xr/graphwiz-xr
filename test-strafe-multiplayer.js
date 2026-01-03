#!/usr/bin/env node

/**
 * Live Test: Strafe Movement + Multiplayer
 * Tests strafe controls and two-player multiplayer on production
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🎮 Starting Strafe + Multiplayer Live Test\n');
  console.log('📍 Target: https://xr.graphwiz.ai\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-infobars']
  });

  // Create two browser contexts (two players)
  const context1 = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const context2 = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  // Collect logs from both pages
  const logs1 = [];
  const logs2 = [];
  const positionUpdates1 = [];
  const positionUpdates2 = [];

  page1.on('console', msg => {
    const text = msg.text();
    logs1.push({ type: msg.type(), text, time: Date.now() });

    // Track position updates
    if (text.includes('Player moved to:')) {
      const match = text.match(/Player moved to:\s*\[([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\]/);
      if (match) {
        positionUpdates1.push({
          x: parseFloat(match[1]),
          y: parseFloat(match[2]),
          z: parseFloat(match[3]),
          time: Date.now()
        });
      }
    }

    // Print important logs
    if (text.includes('Position') || text.includes('Client ID') || text.includes('ENTITY') || text.includes('moved')) {
      console.log(`[Tab 1] ${text}`);
    }
  });

  page2.on('console', msg => {
    const text = msg.text();
    logs2.push({ type: msg.type(), text, time: Date.now() });

    // Track position updates
    if (text.includes('Player moved to:')) {
      const match = text.match(/Player moved to:\s*\[([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\]/);
      if (match) {
        positionUpdates2.push({
          x: parseFloat(match[1]),
          y: parseFloat(match[2]),
          z: parseFloat(match[3]),
          time: Date.now()
        });
      }
    }

    // Print important logs
    if (text.includes('Position') || text.includes('Client ID') || text.includes('ENTITY') || text.includes('moved')) {
      console.log(`[Tab 2] ${text}`);
    }
  });

  try {
    console.log('========== STEP 1: LOAD BOTH TABS ==========');
    await Promise.all([
      page1.goto('https://xr.graphwiz.ai', { waitUntil: 'domcontentloaded' }),
      page2.goto('https://xr.graphwiz.ai', { waitUntil: 'domcontentloaded' })
    ]);

    console.log('⏳ Waiting for WebSocket connections...');
    await new Promise(resolve => setTimeout(resolve, 6000));

    // Check connections
    const connected1 = logs1.some(l => l.text.includes('Connected to presence server'));
    const connected2 = logs2.some(l => l.text.includes('Connected to presence server'));

    console.log(`\nTab 1 Connected: ${connected1 ? '✅' : '❌'}`);
    console.log(`Tab 2 Connected: ${connected2 ? '✅' : '❌'}`);

    // Extract client IDs
    const clientId1 = logs1.find(l => l.text.includes('My client ID:'))?.text?.split('My client ID:')[1]?.trim();
    const clientId2 = logs2.find(l => l.text.includes('My client ID:'))?.text?.split('My client ID:')[1]?.trim();

    console.log(`\nTab 1 Client ID: ${clientId1 || 'NOT FOUND'}`);
    console.log(`Tab 2 Client ID: ${clientId2 || 'NOT FOUND'}`);

    if (!clientId1 || !clientId2) {
      console.log('❌ Client IDs not found - connection may have failed');
    }

    await page1.screenshot({ path: '/tmp/test-01-both-loaded.png' });
    console.log('📸 Screenshot: /tmp/test-01-both-loaded.png');

    console.log('\n========== STEP 2: CHECK MULTIPLAYER VISIBILITY ==========');

    const entitySpawn1 = logs1.filter(l => l.text.includes('ENTITY_SPAWN RECEIVED'));
    const entitySpawn2 = logs2.filter(l => l.text.includes('ENTITY_SPAWN RECEIVED'));

    console.log(`\nTab 1 received ${entitySpawn1.length} ENTITY_SPAWN messages`);
    console.log(`Tab 2 received ${entitySpawn2.length} ENTITY_SPAWN messages`);

    const remoteSpawn1 = entitySpawn1.filter(l =>
      l.text.includes('Spawning remote player entity')
    );
    const remoteSpawn2 = entitySpawn2.filter(l =>
      l.text.includes('Spawning remote player entity')
    );

    console.log(`\nTab 1 spawned ${remoteSpawn1.length} remote players`);
    console.log(`Tab 2 spawned ${remoteSpawn2.length} remote players`);

    if (remoteSpawn1.length > 0 && remoteSpawn2.length > 0) {
      console.log('✅ MULTIPLAYER VISIBILITY WORKING');
    } else {
      console.log('❌ MULTIPLAYER VISIBILITY FAILED');
      console.log('Tab 1 spawn logs:', entitySpawn1.slice(0, 3).map(l => l.text));
      console.log('Tab 2 spawn logs:', entitySpawn2.slice(0, 3).map(l => l.text));
    }

    console.log('\n========== STEP 3: TEST TAB 1 STRAFE (A KEY) ==========');
    console.log('Tab 1: Pressing A (strafe left) for 2 seconds...');

    const beforeA1 = positionUpdates1.length;
    await page1.keyboard.down('a');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page1.keyboard.up('a');
    await new Promise(resolve => setTimeout(resolve, 500));

    const afterA1 = positionUpdates1.length;
    console.log(`Tab 1 position updates: ${beforeA1} → ${afterA1} (${afterA1 - beforeA1} new)`);

    if (positionUpdates1.length >= 2) {
      const first = positionUpdates1[Math.max(0, beforeA1 - 1)];
      const last = positionUpdates1[positionUpdates1.length - 1];
      const deltaX = last.x - first.x;
      const deltaZ = last.z - first.z;
      const distance = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);

      console.log(`Tab 1 moved: ΔX=${deltaX.toFixed(3)}, ΔZ=${deltaZ.toFixed(3)}, Distance=${distance.toFixed(3)}`);

      if (distance > 0.5) {
        console.log('✅ TAB 1 STRAFE LEFT (A) WORKING');
      } else {
        console.log('❌ TAB 1 STRAFE LEFT NOT WORKING');
      }
    }

    await page1.screenshot({ path: '/tmp/test-02-tab1-strafe-left.png' });
    console.log('📸 Screenshot: /tmp/test-02-tab1-strafe-left.png');

    console.log('\n========== STEP 4: TEST TAB 1 STRAFE (D KEY) ==========');
    console.log('Tab 1: Pressing D (strafe right) for 2 seconds...');

    const beforeD1 = positionUpdates1.length;
    await page1.keyboard.down('d');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page1.keyboard.up('d');
    await new Promise(resolve => setTimeout(resolve, 500));

    const afterD1 = positionUpdates1.length;
    console.log(`Tab 1 position updates: ${beforeD1} → ${afterD1} (${afterD1 - beforeD1} new)`);

    if (positionUpdates1.length >= 2) {
      const first = positionUpdates1[Math.max(0, beforeD1 - 1)];
      const last = positionUpdates1[positionUpdates1.length - 1];
      const deltaX = last.x - first.x;
      const deltaZ = last.z - first.z;
      const distance = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);

      console.log(`Tab 1 moved: ΔX=${deltaX.toFixed(3)}, ΔZ=${deltaZ.toFixed(3)}, Distance=${distance.toFixed(3)}`);

      // Check if strafe direction is opposite of A key
      const aStrafes = positionUpdates1.slice(beforeA1, afterA1);
      const dStrafes = positionUpdates1.slice(beforeD1, afterD1);

      if (aStrafes.length > 0 && dStrafes.length > 0) {
        const aFirst = aStrafes[0];
        const dFirst = dStrafes[0];
        const aDirX = aStrafes[aStrafes.length - 1].x - aFirst.x;
        const dDirX = dStrafes[dStrafes.length - 1].x - dFirst.x;

        // A and D should move in opposite X directions
        if ((aDirX < 0 && dDirX > 0) || (aDirX > 0 && dDirX < 0)) {
          console.log('✅ TAB 1 STRAFE RIGHT (D) WORKING - Opposite to A');
        } else {
          console.log('⚠️  TAB 1 STRAFE DIRECTION MAY BE INVERTED');
          console.log(`   A direction X: ${aDirX.toFixed(3)}`);
          console.log(`   D direction X: ${dDirX.toFixed(3)}`);
        }
      }
    }

    await page1.screenshot({ path: '/tmp/test-03-tab1-strafe-right.png' });
    console.log('📸 Screenshot: /tmp/test-03-tab1-strafe-right.png');

    console.log('\n========== STEP 5: TEST TAB 2 MOVEMENT (W KEY) ==========');
    console.log('Tab 2: Pressing W (forward) for 2 seconds...');

    const beforeW2 = positionUpdates2.length;
    await page2.keyboard.down('w');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page2.keyboard.up('w');
    await new Promise(resolve => setTimeout(resolve, 500));

    const afterW2 = positionUpdates2.length;
    console.log(`Tab 2 position updates: ${beforeW2} → ${afterW2} (${afterW2 - beforeW2} new)`);

    if (positionUpdates2.length >= 2) {
      const first = positionUpdates2[Math.max(0, beforeW2 - 1)];
      const last = positionUpdates2[positionUpdates2.length - 1];
      const distance = Math.sqrt(
        Math.pow(last.x - first.x, 2) +
        Math.pow(last.z - first.z, 2)
      );

      console.log(`Tab 2 moved ${distance.toFixed(3)} units`);

      if (distance > 0.5) {
        console.log('✅ TAB 2 FORWARD (W) WORKING');
      } else {
        console.log('❌ TAB 2 FORWARD NOT WORKING');
      }
    }

    console.log('\n========== STEP 6: CHECK TAB 1 SEES TAB 2 MOVEMENT ==========');

    const posUpdate1 = logs1.filter(l => l.text.includes('POSITION_UPDATE RECEIVED'));
    const posUpdate2 = logs2.filter(l => l.text.includes('POSITION_UPDATE RECEIVED'));

    console.log(`\nAfter Tab 2 moved:`);
    console.log(`  Tab 1 POSITION_UPDATE messages: ${posUpdate1.length}`);
    console.log(`  Tab 2 POSITION_UPDATE messages: ${posUpdate2.length}`);

    if (posUpdate1.length > 0) {
      console.log('✅ TAB 1 RECEIVED POSITION UPDATES FROM TAB 2');
      console.log('Last 3 updates:');
      posUpdate1.slice(-3).forEach(l => console.log(`  ${l.text}`));
    } else {
      console.log('❌ TAB 1 DID NOT RECEIVE TAB 2 POSITION UPDATES');
    }

    await page1.screenshot({ path: '/tmp/test-04-tab2-moved.png' });
    console.log('📸 Screenshot: /tmp/test-04-tab2-moved.png');

    console.log('\n========== STEP 7: COMBINED MOVEMENT TEST ==========');
    console.log('Tab 1: W+A (forward-left diagonal)');
    console.log('Tab 2: S+D (backward-right diagonal)');

    await page1.keyboard.down('w');
    await page1.keyboard.down('a');
    await page2.keyboard.down('s');
    await page2.keyboard.down('d');

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page1.keyboard.up('w');
    await page1.keyboard.up('a');
    await page2.keyboard.up('s');
    await page2.keyboard.up('d');

    await new Promise(resolve => setTimeout(resolve, 500));

    await page1.screenshot({ path: '/tmp/test-05-combined-movement.png' });
    console.log('📸 Screenshot: /tmp/test-05-combined-movement.png');

    console.log('\n========== TEST SUMMARY ==========');

    const errors1 = logs1.filter(l => l.type === 'error');
    const errors2 = logs2.filter(l => l.type === 'error');

    console.log('\n📊 CONNECTION STATUS:');
    console.log(`  Tab 1: ${connected1 ? '✅ Connected' : '❌ Failed'}`);
    console.log(`  Tab 2: ${connected2 ? '✅ Connected' : '❌ Failed'}`);
    console.log(`  Tab 1 ID: ${clientId1 || 'NOT FOUND'}`);
    console.log(`  Tab 2 ID: ${clientId2 || 'NOT FOUND'}`);

    console.log('\n📊 MULTIPLAYER:');
    console.log(`  Tab 1 spawned remotes: ${remoteSpawn1.length}`);
    console.log(`  Tab 2 spawned remotes: ${remoteSpawn2.length}`);
    console.log(`  Status: ${remoteSpawn1.length > 0 && remoteSpawn2.length > 0 ? '✅ WORKING' : '❌ FAILED'}`);

    console.log('\n📊 STRAFE MOVEMENT:');
    console.log(`  Tab 1 A key (left): ${afterA1 - beforeA1 > 0 ? '✅' : '❌'}`);
    console.log(`  Tab 1 D key (right): ${afterD1 - beforeD1 > 0 ? '✅' : '❌'}`);
    console.log(`  Tab 2 W key (forward): ${afterW2 - beforeW2 > 0 ? '✅' : '❌'}`);

    console.log('\n📊 POSITION SYNC:');
    console.log(`  Tab 1 received updates: ${posUpdate1.length}`);
    console.log(`  Tab 2 received updates: ${posUpdate2.length}`);
    console.log(`  Status: ${posUpdate1.length > 0 ? '✅ WORKING' : '❌ FAILED'}`);

    console.log('\n📊 ERRORS:');
    console.log(`  Tab 1 errors: ${errors1.length}`);
    console.log(`  Tab 2 errors: ${errors2.length}`);

    if (errors1.length > 0 || errors2.length > 0) {
      console.log('\nError details:');
      errors1.slice(0, 3).forEach(e => console.log(`  Tab 1: ${e.text}`));
      errors2.slice(0, 3).forEach(e => console.log(`  Tab 2: ${e.text}`));
    }

    console.log('\n📁 SCREENSHOTS:');
    console.log('  /tmp/test-01-both-loaded.png');
    console.log('  /tmp/test-02-tab1-strafe-left.png');
    console.log('  /tmp/test-03-tab1-strafe-right.png');
    console.log('  /tmp/test-04-tab2-moved.png');
    console.log('  /tmp/test-05-combined-movement.png');

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.error(error.stack);
  } finally {
    await context1.close();
    await context2.close();
    await browser.close();
  }

  console.log('\n✅ Test complete - Check /tmp/ for screenshots');
})();
