#!/usr/bin/env node

/**
 * Simple Console Log Dump
 * Captures all console logs to debug issues
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Console Log Dump Test\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-infobars']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const allLogs = [];

  page.on('console', msg => {
    const text = msg.text();
    allLogs.push({
      type: msg.type(),
      text,
      time: Date.now()
    });
    console.log(`[${msg.type()}] ${text}`);
  });

  try {
    console.log('Loading page...\n');
    await page.goto('https://xr.graphwiz.ai', { waitUntil: 'domcontentloaded' });

    console.log('\n⏳ Waiting 8 seconds for connection and initialization...\n');
    await new Promise(resolve => setTimeout(resolve, 8000));

    console.log('\n========== ALL CONSOLE LOGS ==========');
    console.log(`Total logs captured: ${allLogs.length}\n`);

    // Group by type
    const errors = allLogs.filter(l => l.type === 'error');
    const warnings = allLogs.filter(l => l.type === 'warning');
    const infos = allLogs.filter(l => l.type === 'log' || l.type === 'info');

    console.log(`📊 ERRORS (${errors.length}):`);
    errors.forEach(l => console.log(`  ${l.text}`));

    console.log(`\n📊 WARNINGS (${warnings.length}):`);
    warnings.forEach(l => console.log(`  ${l.text}`));

    console.log(`\n📊 KEY LOGS (Client ID, Movement, Spawning):`);
    infos
      .filter(l =>
        l.text.includes('Client ID') ||
        l.text.includes('Starting movement') ||
        l.text.includes('Player moved') ||
        l.text.includes('ENTITY_SPAWN') ||
        l.text.includes('Spawning') ||
        l.text.includes('Skipping')
      )
      .forEach(l => console.log(`  ${l.text}`));

    console.log('\n========== TESTING MOVEMENT ==========');
    console.log('Pressing W for 2 seconds...\n');

    const beforeCount = allLogs.length;
    await page.keyboard.down('w');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.keyboard.up('w');
    await new Promise(resolve => setTimeout(resolve, 500));

    const movementLogs = allLogs.slice(beforeCount);
    const playerMovedLogs = movementLogs.filter(l => l.text.includes('Player moved'));

    console.log(`Movement logs captured: ${playerMovedLogs.length}`);
    playerMovedLogs.forEach(l => console.log(`  ${l.text}`));

    console.log('\n✅ Test complete');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await context.close();
    await browser.close();
  }
})();
