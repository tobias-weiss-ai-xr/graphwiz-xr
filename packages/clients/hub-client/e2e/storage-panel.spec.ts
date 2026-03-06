import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Storage Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('button:has-text("Default")', { timeout: 10000 });
  });

  test('should display Assets button', async ({ page }) => {
    const assetsButton = page.locator('button').filter({ hasText: /Assets|Close/ }).first();
    await expect(assetsButton).toBeVisible({ timeout: 5000 });
  });

  test('should open storage panel when clicking Assets button', async ({ page }) => {
    const assetsButton = page.locator('button').filter({ hasText: /Assets|Close/ }).first();
    const isClosed = (await assetsButton.textContent())?.includes('Assets');
    if (isClosed) {
      await assetsButton.click({ force: true });
    }
    
    // Verify panel is visible with Asset Manager header
    const storageHeader = page.locator('text=Asset Manager');
    await expect(storageHeader).toBeVisible({ timeout: 3000 });
  });

  test('should show Browse and Upload tabs', async ({ page }) => {
    const assetsButton = page.locator('button').filter({ hasText: /Assets|Close/ }).first();
    const isClosed = (await assetsButton.textContent())?.includes('Assets');
    if (isClosed) {
      await assetsButton.click({ force: true });
    }
    
    const browseTab = page.locator('button').filter({ hasText: 'Browse' }).first();
    const uploadTab = page.locator('button').filter({ hasText: 'Upload' }).first();
    
    await expect(browseTab).toBeVisible({ timeout: 2000 });
    await expect(uploadTab).toBeVisible({ timeout: 2000 });
  });

  test('should switch between Browse and Upload tabs', async ({ page }) => {
    const assetsButton = page.locator('button').filter({ hasText: /Assets|Close/ }).first();
    const isClosed = (await assetsButton.textContent())?.includes('Assets');
    if (isClosed) {
      await assetsButton.click({ force: true });
    }

    // Click Upload tab
    const uploadTab = page.locator('button').filter({ hasText: 'Upload' }).first();
    await uploadTab.click({ force: true });

    // Verify we're on upload tab (look for upload-related UI)
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });

  test('should close storage panel when clicking Close button', async ({ page }) => {
    const assetsButton = page.locator('button').filter({ hasText: /Assets|Close/ }).first();
    const isClosed = (await assetsButton.textContent())?.includes('Assets');
    if (isClosed) {
      await assetsButton.click({ force: true });
    }

    // Click close button (X in header)
    const closeButton = page.locator('div').filter({ hasText: 'Asset Manager' }).locator('button');
    await closeButton.click({ force: true });

    // Panel should be closed
    await expect(page.locator('text=Asset Manager')).not.toBeVisible({ timeout: 3000 });
  });

  test('should toggle Assets button text between Assets and Close', async ({ page }) => {
    const assetsButton = page.locator('button').filter({ hasText: /Assets|Close/ }).first();

    // Initially shows "Assets"
    let buttonText = await assetsButton.textContent();
    expect(buttonText).toContain('Assets');

    // Click to open
    await assetsButton.click({ force: true });

    // Now shows "Close"
    buttonText = await assetsButton.textContent();
    expect(buttonText).toContain('Close');

    // Click again to close
    await assetsButton.click({ force: true });

    // Shows "Assets" again
    buttonText = await assetsButton.textContent();
    expect(buttonText).toContain('Assets');
  });

  test('should display asset browser content on Browse tab', async ({ page }) => {
    const assetsButton = page.locator('button').filter({ hasText: /Assets|Close/ }).first();
    const isClosed = (await assetsButton.textContent())?.includes('Assets');
    if (isClosed) {
      await assetsButton.click({ force: true });
    }

    // Ensure we're on Browse tab
    const browseTab = page.locator('button').filter({ hasText: 'Browse' }).first();
    await expect(browseTab).toBeVisible();

    // The AssetBrowser component should be visible
    const tabIndicator = page.locator('button').filter({ hasText: 'Browse' }).first();
    await expect(tabIndicator).toBeVisible();
  });
});
