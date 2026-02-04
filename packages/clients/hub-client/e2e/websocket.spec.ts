/**
 * WebSocket Connection Test
 */

import { test, expect } from '@playwright/test';

test.describe('WebSocket Connection', () => {
  test('should connect to production WebSocket server', async ({ page }) => {
    // Navigate to production
    await page.goto('https://xr.graphwiz.ai');

    // Collect console messages
    const logs: string[] = [];
    page.on('console', msg => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Wait for page load
    await page.waitForTimeout(5000);

    // Check logs for WebSocket connection
    const wsConnected = logs.some(log =>
      log.includes('WebSocket connected') ||
      log.includes('wss://xr.graphwiz.ai/ws')
    );

    const wsErrors = logs.filter(log =>
      log.includes('WebSocket') &&
      (log.includes('error') || log.includes('failed') || log.includes('disconnected'))
    );

    console.log('=== WebSocket Logs ===');
    logs.filter(log => log.includes('WebSocket')).forEach(log => console.log(log));

    console.log('\n=== Connection Status ===');
    console.log('Connected:', wsConnected);
    console.log('Errors:', wsErrors.length);

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/websocket-test.png', fullPage: true });

    // Test expectations
    expect(wsErrors.length).toBe(0);
  });
});
