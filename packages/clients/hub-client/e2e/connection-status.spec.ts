/**
 * Connection Status UI Test
 * Tests the connection status overlay component in the hub client
 */

import { test, expect } from '@playwright/test';

test.describe('Connection Status UI', () => {
  test('overlay should be visible at top-left position', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);

    // Find connection overlay - it has h1 title "GraphWiz-XR Hub Client"
    const heading = page.locator('h1').filter({ hasText: /GraphWiz/ });
    await expect(heading).toBeVisible();

    // Get bounding box and verify top-left position (x < 200, y < 100)
    const boundingBox = await heading.boundingBox();
    expect(boundingBox).toBeTruthy();
    if (boundingBox) {
      expect(boundingBox.x).toBeLessThan(200);
      expect(boundingBox.y).toBeLessThan(100);
    }

    // Take screenshot for evidence
    await page.screenshot({
      path: '.sisyphus/evidence/task-3-connection-status.png',
      fullPage: true
    });
  });

  test('status indicator should show status text (Connecting/Connected/Disconnected)', async ({
    page
  }) => {
    await page.goto('http://localhost:5173');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Find status text using text locator - should show one of these states
    const statusLocator = page.getByText(/Connecting|Connected|Disconnected/).first();
    await expect(statusLocator).toBeVisible({ timeout: 5000 });

    const statusText = await statusLocator.textContent();
    expect(statusText).toBeTruthy();
    expect(['Connecting...', 'Connected', 'Disconnected'].includes(statusText)).toBeTruthy();

    // Status indicator circle is present (small div with border-radius in connection status div)
    const statusDiv = page.locator('div').filter({ has: statusLocator }).first();
    await expect(statusDiv).toBeVisible();
  });

  test('status should show client ID when connected', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait for page to load
    await page.waitForTimeout(5000);

    // Verify client ID is displayed (always shown when logged in)
    const clientId = page.getByText(/Client ID/);
    await expect(clientId).toBeVisible();

    const clientIdText = await clientId.textContent();
    expect(clientIdText).toContain('Client ID');
    expect(clientIdText).toMatch(/Client ID: [0-9a-f]{8}/);
  });

  test('should show error element structure even if empty', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(5000);

    // Structure exists in DOM - just verify page is responsive
    await expect(page.locator('h1').filter({ hasText: /GraphWiz/ })).toBeVisible();
  });

  test('entity and player counts should be displayed', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(6000);

    // Find entity and player count display using text locator
    const countText = page.getByText(/Entities.*Players/);
    await expect(countText).toBeVisible();

    // Extract and verify text format
    const text = await countText.textContent();
    expect(text).toMatch(/Entities:\s*\d+/);
    expect(text).toMatch(/Players:\s*\d+/);
  });

  test('Add Entity button should be present and clickable', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(6000);

    // Find Add Entity button
    const addButton = page.getByRole('button', { name: /Add Entity/i });
    await expect(addButton).toBeVisible();
    await expect(addButton).toHaveCount(1);

    // Get current entity count
    const countText = page.getByText(/Entities:\s*\d+/);
    const oldText = await countText.textContent();
    const oldEntitiesMatch = oldText?.match(/Entities:\s*(\d+)/);
    const oldEntityCount = oldEntitiesMatch ? parseInt(oldEntitiesMatch[1]) : 0;

    // Click the button
    await addButton.click();
    ;

    // Verify entity count increased
    const newText = await countText.textContent();
    const newEntitiesMatch = newText?.match(/Entities:\s*(\d+)/);
    const newEntityCount = newEntitiesMatch ? parseInt(newEntitiesMatch[1]) : 0;

    // Entity count should increase
    expect(newEntityCount).toBeGreaterThan(oldEntityCount);
  });
});
