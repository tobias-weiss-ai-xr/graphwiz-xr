#!/usr/bin/env node

/**
 * Live Camera Controls Test
 * Tests camera and movement on production site
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🎮 Starting Live Camera Controls Test\n');
  console.log('📍 Target: https://xr.graphwiz.ai\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-infobars']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Collect console logs
  const logs = [];
  const positionUpdates = [];

  page.on('console', msg => {
    const text = msg.text();
    logs.push({ type: msg.type(), text, time: Date.now() });

    // Track position updates
    if (text.includes('Position:')) {
      const match = text.match(/Position:\s*\[([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\]/);
      if (match) {
        positionUpdates.push({
          x: parseFloat(match[1]),
          y: parseFloat(match[2]),
          z: parseFloat(match[3]),
          time: Date.now()
        });
      }
    }

    // Print important logs
    if (text.includes('Position') || text.includes('Rotation') || text.includes('Camera')) {
      console.log(`[Browser] ${text}`);
    }
  });

  try {
    console.log('========== STEP 1: LOAD APPLICATION ==========');
    await page.goto('https://xr.graphwiz.ai', { waitUntil: 'networkidle' });
    console.log('✓ Page loaded');

    // Wait for connection and initialization
    console.log('⏳ Waiting for WebSocket connection...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const connectedLogs = logs.filter(l => l.text.includes('Connected to presence server'));
    console.log(`✓ Connection status: ${connectedLogs.length > 0 ? 'CONNECTED' : 'NOT CONNECTED'}`);

    // Take initial screenshot
    await page.screenshot({ path: '/tmp/camera-test-00-initial.png' });
    console.log('📸 Screenshot: /tmp/camera-test-00-initial.png');

    console.log('\n========== STEP 2: TEST MOVEMENT (W - FORWARD) ==========');
    console.log('Pressing W for 2 seconds...');

    const beforeW = positionUpdates.length;
    await page.keyboard.down('w');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.keyboard.up('w');
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for movement to settle

    const afterW = positionUpdates.length;
    console.log(`Position updates: ${beforeW} → ${afterW} (${afterW - beforeW} new)`);

    if (positionUpdates.length >= 2) {
      const first = positionUpdates[Math.max(0, beforeW - 1)];
      const last = positionUpdates[positionUpdates.length - 1];
      const distance = Math.sqrt(
        Math.pow(last.x - first.x, 2) +
        Math.pow(last.y - first.y, 2) +
        Math.pow(last.z - first.z, 2)
      );
      console.log(`Distance moved: ${distance.toFixed(3)} units`);
      console.log(`From: (${first.x.toFixed(2)}, ${first.y.toFixed(2)}, ${first.z.toFixed(2)})`);
      console.log(`To: (${last.x.toFixed(2)}, ${last.y.toFixed(2)}, ${last.z.toFixed(2)})`);

      if (distance > 0.5) {
        console.log('✅ FORWARD MOVEMENT WORKING');
      } else {
        console.log('❌ MOVEMENT TOO SLOW OR NOT WORKING');
      }
    }

    await page.screenshot({ path: '/tmp/camera-test-01-after-w.png' });
    console.log('📸 Screenshot: /tmp/camera-test-01-after-w.png');

    console.log('\n========== STEP 3: TEST ROTATION (Q - LEFT) ==========');
    console.log('Pressing Q for 1.5 seconds (rotate left)...');

    const beforeQ = positionUpdates.length;
    await page.keyboard.down('q');
    await new Promise(resolve => setTimeout(resolve, 1500));
    await page.keyboard.up('q');
    await new Promise(resolve => setTimeout(resolve, 500));

    const afterQ = positionUpdates.length;
    console.log(`Position updates: ${beforeQ} → ${afterQ}`);

    if (positionUpdates.length >= 2) {
      const beforePos = positionUpdates[Math.max(0, beforeQ - 1)];
      const afterPos = positionUpdates[positionUpdates.length - 1];
      console.log(`Position changed from (${beforePos.x.toFixed(2)}, ${beforePos.z.toFixed(2)}) to (${afterPos.x.toFixed(2)}, ${afterPos.z.toFixed(2)})`);
      console.log('✅ ROTATION TEST COMPLETE');
    }

    await page.screenshot({ path: '/tmp/camera-test-02-after-q.png' });
    console.log('📸 Screenshot: /tmp/camera-test-02-after-q.png');

    console.log('\n========== STEP 4: TEST DIAGONAL MOVEMENT (W+A+E) ==========');
    console.log('Pressing W+A+E for 2 seconds (forward-left + rotate right)...');

    const startDiag = positionUpdates.length;
    await page.keyboard.down('w');
    await page.keyboard.down('a');
    await page.keyboard.down('e');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.keyboard.up('e');
    await page.keyboard.up('a');
    await page.keyboard.up('w');
    await new Promise(resolve => setTimeout(resolve, 500));

    const endDiag = positionUpdates.length;
    const firstDiag = positionUpdates[Math.max(0, startDiag - 1)];
    const lastDiag = positionUpdates[positionUpdates.length - 1];
    const diagDistance = Math.sqrt(
      Math.pow(lastDiag.x - firstDiag.x, 2) +
      Math.pow(lastDiag.y - firstDiag.y, 2) +
      Math.pow(lastDiag.z - firstDiag.z, 2)
    );

    console.log(`Diagonal distance: ${diagDistance.toFixed(3)} units`);
    console.log(`Updates during diagonal: ${endDiag - startDiag}`);

    await page.screenshot({ path: '/tmp/camera-test-03-diagonal.png' });
    console.log('📸 Screenshot: /tmp/camera-test-03-diagonal.png');

    console.log('\n========== STEP 5: TEST MOUSE ORBIT CONTROLS ==========');
    console.log('Testing mouse orbit (drag right and down)...');

    const viewport = page.viewportSize();
    const centerX = Math.floor(viewport.width / 2);
    const centerY = Math.floor(viewport.height / 2);

    // Move to center
    await page.mouse.move(centerX, centerY);
    await new Promise(resolve => setTimeout(resolve, 200));

    // Click and drag
    await page.mouse.down();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Drag right and down
    await page.mouse.move(centerX + 200, centerY + 100, { steps: 20 });
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.mouse.up();
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('✅ MOUSE DRAG COMPLETE');
    await page.screenshot({ path: '/tmp/camera-test-04-after-mouse.png' });
    console.log('📸 Screenshot: /tmp/camera-test-04-after-mouse.png');

    console.log('\n========== STEP 6: TEST ZOOM (SCROLL) ==========');
    console.log('Testing scroll wheel zoom...');

    // Scroll up (zoom in)
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, -500);
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.keyboard.up('Control');
    await new Promise(resolve => setTimeout(resolve, 500));

    await page.screenshot({ path: '/tmp/camera-test-05-zoomed-in.png' });
    console.log('📸 Screenshot: /tmp/camera-test-05-zoomed-in.png');

    // Scroll down (zoom out)
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, 500);
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.keyboard.up('Control');
    await new Promise(resolve => setTimeout(resolve, 500));

    await page.screenshot({ path: '/tmp/camera-test-06-zoomed-out.png' });
    console.log('📸 Screenshot: /tmp/camera-test-06-zoomed-out.png');

    console.log('\n========== STEP 7: TEST FULL CIRCLE ROTATION ==========');
    console.log('Pressing Q for 5 seconds (should do ~360 degree rotation)...');

    await page.keyboard.down('q');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.keyboard.up('q');
    await new Promise(resolve => setTimeout(resolve, 500));

    await page.screenshot({ path: '/tmp/camera-test-07-full-rotation.png' });
    console.log('📸 Screenshot: /tmp/camera-test-07-full-rotation.png');

    console.log('\n========== STEP 8: CHECK FOR ERRORS ==========');
    const errors = logs.filter(l => l.type === 'error');
    const warnings = logs.filter(l => l.type === 'warning');

    console.log(`Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('Last 5 errors:');
      errors.slice(-5).forEach(e => console.log(`  ${e.text}`));
    }

    console.log(`Warnings: ${warnings.length}`);
    if (warnings.length > 0 && warnings.length <= 20) {
      console.log('Warnings:');
      warnings.forEach(w => console.log(`  ${w.text}`));
    }

    console.log('\n========== TEST SUMMARY ==========');
    console.log(`✓ Total position updates: ${positionUpdates.length}`);
    console.log(`✓ Total console logs: ${logs.length}`);
    console.log(`✓ Errors: ${errors.length}`);
    console.log(`✓ Screenshots captured: 8`);
    console.log('\n📁 Screenshot locations:');
    console.log('  /tmp/camera-test-00-initial.png');
    console.log('  /tmp/camera-test-01-after-w.png (W key)');
    console.log('  /tmp/camera-test-02-after-q.png (Q key)');
    console.log('  /tmp/camera-test-03-diagonal.png (W+A+E)');
    console.log('  /tmp/camera-test-04-after-mouse.png (mouse drag)');
    console.log('  /tmp/camera-test-05-zoomed-in.png (scroll up)');
    console.log('  /tmp/camera-test-06-zoomed-out.png (scroll down)');
    console.log('  /tmp/camera-test-07-full-rotation.png (5s Q)');

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.error(error.stack);
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('\n✅ Test complete - Check /tmp/ for screenshots');
})();
