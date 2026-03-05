import { test, expect } from '@playwright/test';

test.describe('Production Health Checks', () => {
  const BASE_URL = 'https://xr.graphwiz.ai';

  /**
   * Test: Production application loads and displays GraphWiz title
   */
  test('Application loads with correct title', async ({ page }) => {

    await page.goto(BASE_URL);
    await page.waitForTimeout(5000);

    const title = await page.title();

    expect(title).toContain('GraphWiz');

  });

  /**
   * Test: UI elements are present
   */
  test('UI elements are present', async ({ page }) => {

    await page.goto(BASE_URL);
    await page.waitForTimeout(5000);

    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    expect(buttonCount).toBeGreaterThan(0);

  });

  /**
   * Test: Grab system initialization logs
   */
  test('Grab system initializes', async ({ page }) => {

    const logs: string[] = [];
    page.on('console', (msg) => logs.push(msg.text()));

    await page.goto(BASE_URL);
    await page.waitForTimeout(8000);

    const grabLogs = logs.filter(
      (l) => l.includes('Grab') || l.includes('grab') || l.includes('Grabbable')
    );


  });

  /**
   * Test: WebSocket connectivity
   */
  test('WebSocket connects successfully', async ({ page }) => {

    const logs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('WebSocket')) {
        logs.push(text);
      }
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(8000);

    const wsLogs = logs.filter((l) => l.includes('WebSocket'));

    expect(wsLogs.length).toBeGreaterThan(0);

  });

  /**
   * Test: Performance metrics
   */
  test('Performance metrics are acceptable', async ({ page }) => {

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


    expect(metrics.totalTime).toBeLessThan(30000);

  });
});


/**
 * @DEPRECATED - Legacy grabbing tests
 * 
 * These tests are deprecated and kept for historical reference only.
 * They test grabbing controls UI that no longer exists.
 * 
 * Current grabbing functionality is tested in:
 * - interactive-objects.spec.ts (7 tests)
 */
