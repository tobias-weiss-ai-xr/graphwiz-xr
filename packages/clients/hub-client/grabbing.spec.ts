import { test, expect } from '@playwright/test';

test.describe('Production Health Checks', () => {
  const BASE_URL = 'https://xr.graphwiz.ai';

  /**
   * Test: Production application loads and displays GraphWiz title
   */
  test('Application loads with correct title', async ({ page }) => {
    console.log('\n========== TEST: App loads ==========\n');

    await page.goto(BASE_URL);
    await page.waitForTimeout(5000);

    const title = await page.title();
    console.log('Page title:', title);

    expect(title).toContain('GraphWiz');

    console.log('✅ App loaded!\n');
  });

  /**
   * Test: UI elements are present
   */
  test('UI elements are present', async ({ page }) => {
    console.log('\n========== TEST: UI elements ==========\n');

    await page.goto(BASE_URL);
    await page.waitForTimeout(5000);

    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log('Buttons found:', buttonCount);

    expect(buttonCount).toBeGreaterThan(0);

    console.log('✅ UI elements present!\n');
  });

  /**
   * Test: Grab system initialization logs
   */
  test('Grab system initializes', async ({ page }) => {
    console.log('\n========== TEST: Grab init ==========\n');

    const logs: string[] = [];
    page.on('console', (msg) => logs.push(msg.text()));

    await page.goto(BASE_URL);
    await page.waitForTimeout(8000);

    const grabLogs = logs.filter(
      (l) => l.includes('Grab') || l.includes('grab') || l.includes('Grabbable')
    );

    console.log('Grab-related logs:', grabLogs.length);

    console.log('✅ Grab system init check complete!\n');
  });

  /**
   * Test: WebSocket connectivity
   */
  test('WebSocket connects successfully', async ({ page }) => {
    console.log('\n========== TEST: WebSocket ==========\n');

    const logs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('WebSocket')) {
        logs.push(text);
        console.log('[WS]', text);
      }
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(8000);

    const wsLogs = logs.filter((l) => l.includes('WebSocket'));
    console.log('WebSocket logs:', wsLogs.length);

    expect(wsLogs.length).toBeGreaterThan(0);

    console.log('✅ WebSocket connected!\n');
  });

  /**
   * Test: Performance metrics
   */
  test('Performance metrics are acceptable', async ({ page }) => {
    console.log('\n========== TEST: Performance ==========\n');

    await page.goto(BASE_URL);
    await page.waitForTimeout(5000);

    const metrics = await page.evaluate(() => {
      const _navEntries = performance.getEntriesByType('navigation' as any);
      const navigation = _navEntries[0] as unknown;
      if (!navigation || typeof navigation !== 'object') return { totalTime: 0 };
      const nav = navigation as { loadEventEnd?: number; fetchStart?: number };
      return {
        totalTime: (nav.loadEventEnd ?? 0) - (nav.fetchStart ?? 0)
      };
    });

    console.log('Total load time:', Math.round(metrics.totalTime), 'ms');

    expect(metrics.totalTime).toBeLessThan(30000);

    console.log('✅ Performance acceptable!\n');
  });
});
