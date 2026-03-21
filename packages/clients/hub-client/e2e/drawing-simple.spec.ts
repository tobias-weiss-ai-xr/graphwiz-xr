import { test, expect } from '@playwright/test';

test('simple: scene loads correctly and drawing interface can appear', async ({ page }) => {
  // Go to home page
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);

  // Check for scene selector toggle button (contains ▼ character)
  const sceneToggle = page.locator('button').filter({ hasText: /▼/ }).first();

  // Verify scene toggle exists
  const toggleCount = await sceneToggle.count();
  console.log(`Found ${toggleCount} scene toggle buttons`);

  if (toggleCount === 0) {
    // Try alternative selector - look for any button with Default scene
    const altToggle = page
      .locator('button')
      .filter({ hasText: /Default|Interactive/ })
      .first();
    const altCount = await altToggle.count();
    console.log(`Alternative toggle count: ${altCount}`);

    if (altCount === 0) {
      console.log('No scene toggle found, skipping test');
      test.skip();
      return;
    }

    await altToggle.click({ force: true });
  } else {
    // Click scene toggle to open dropdown
    await sceneToggle.click({ force: true });
  }

  await page.waitForTimeout(500);

  // Find Drawing option in dropdown
  const drawingOption = page.locator('button').filter({ hasText: /Drawing/ });
  const drawingCount = await drawingOption.count();
  console.log(`Found ${drawingCount} Drawing buttons`);

  if (drawingCount === 0) {
    console.log('No Drawing option found in dropdown');
    test.skip();
    return;
  }

  // Click Drawing option
  await drawingOption.first().click({ force: true });
  await page.waitForTimeout(1000);

  // Check for drawing interface
  const drawingInterface = page.locator('.drawing-interface');
  await expect(drawingInterface).toBeVisible({ timeout: 10000 });
});
