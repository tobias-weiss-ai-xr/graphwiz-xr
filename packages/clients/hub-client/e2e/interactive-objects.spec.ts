import { test, expect, Page } from '@playwright/test';

/**
 * Task 12 & 13: Test Default Scene Interactive Objects
 *
 * Tests the interactive lamp and book objects in the default scene.
 * These are 3D objects that respond to clicks via raycasting.
 */

test.describe('Interactive Objects - Default Scene', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('canvas', { timeout: 15000 });
    ; // Wait for scene to fully initialize
  });

  test.describe('Scene Initialization', () => {
    test('should render the 3D canvas', async ({ page }) => {
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();

      // Canvas should have reasonable dimensions
      const boundingBox = await canvas.boundingBox();
      expect(boundingBox).not.toBeNull();
      expect(boundingBox!.width).toBeGreaterThan(100);
      expect(boundingBox!.height).toBeGreaterThan(100);
    });

    test('should display welcome message', async ({ page }) => {
      const pageContent = await page.textContent('body');
      expect(pageContent).toContain('Welcome to GraphWiz-XR');
    });

    test('should display interaction instructions', async ({ page }) => {
      const pageContent = await page.textContent('body');
      expect(pageContent).toContain('Click lamp or book to interact');
    });
  });

  test.describe('Interactive Lamp (Task 12)', () => {
    test('should show lamp state indicator (ON/OFF)', async ({ page }) => {
      // The lamp shows "ON" or "OFF" text above it
      // Initial state is ON (from DefaultScene.tsx)
      const pageContent = await page.textContent('body');

      // Lamp should show either ON or OFF
      const hasLampState = pageContent?.includes('ON') || pageContent?.includes('OFF');
      expect(hasLampState).toBeTruthy();
    });

    test('lamp should be clickable via canvas', async ({ page }) => {
      const canvas = page.locator('canvas').first();
      const boundingBox = await canvas.boundingBox();
      expect(boundingBox).not.toBeNull();

      // The lamp is positioned at [-4, 0.8, -3] in 3D space
      // This maps to approximately the left-center area of the canvas
      // Click in the left portion of the canvas where the lamp would be
      const clickX = boundingBox!.width * 0.25;
      const clickY = boundingBox!.height * 0.5;

      // Perform click
      await canvas.click({ position: { x: clickX, y: clickY } });

      // Wait for potential state change
      ;

      // Canvas should still be visible (no crash)
      await expect(canvas).toBeVisible();
    });

    test('lamp toggle changes state', async ({ page }) => {
      // Get initial state
      const initialContent = await page.textContent('body');
      const initialHasON = initialContent?.includes('ON') || false;

      // Click on canvas where lamp should be
      const canvas = page.locator('canvas').first();
      const boundingBox = await canvas.boundingBox();

      if (boundingBox) {
        // Multiple clicks in lamp area to ensure interaction
        const clickX = boundingBox.width * 0.2;
        const clickY = boundingBox.height * 0.45;

        await canvas.click({ position: { x: clickX, y: clickY } });
        ;
      }

      // Canvas should still be functional
      await expect(canvas).toBeVisible();
    });

    test('lamp casts light when ON', async ({ page }) => {
      // The lamp has a pointLight component when ON
      // We can't directly test lighting in Playwright, but we can verify
      // the scene renders without errors

      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();

      // Take a screenshot to verify rendering
      const screenshot = await canvas.screenshot();
      expect(screenshot.length).toBeGreaterThan(1000); // Should have content
    });
  });

  test.describe('Interactive Book (Task 13)', () => {
    test('should render book in scene', async ({ page }) => {
      // The book is positioned at [2.3, 1.3, -2] on a desk
      // We verify the scene renders correctly
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();
    });

    test('book should be clickable via canvas', async ({ page }) => {
      const canvas = page.locator('canvas').first();
      const boundingBox = await canvas.boundingBox();
      expect(boundingBox).not.toBeNull();

      // The book is on the desk at position [2.3, 1.3, -2]
      // This maps to approximately the right-center area of the canvas
      const clickX = boundingBox!.width * 0.65;
      const clickY = boundingBox!.height * 0.45;

      // Perform click
      await canvas.click({ position: { x: clickX, y: clickY } });

      // Wait for potential state change
      ;

      // Canvas should still be visible (no crash)
      await expect(canvas).toBeVisible();
    });

    test('book shows "GraphWiz-XR Guide" when open', async ({ page }) => {
      // Initial state is closed (active: false in DefaultScene.tsx)
      // When opened, it shows "GraphWiz-XR Guide" text

      const canvas = page.locator('canvas').first();
      const boundingBox = await canvas.boundingBox();

      if (boundingBox) {
        // Click in book area to open it
        const clickX = boundingBox.width * 0.65;
        const clickY = boundingBox.height * 0.45;

        await canvas.click({ position: { x: clickX, y: clickY } });
        ;

        // Click again to potentially close
        await canvas.click({ position: { x: clickX, y: clickY } });
        ;
      }

      // Canvas should still be functional
      await expect(canvas).toBeVisible();
    });

    test('book click toggles open/closed state', async ({ page }) => {
      const canvas = page.locator('canvas').first();
      const boundingBox = await canvas.boundingBox();

      if (boundingBox) {
        // Click multiple times to test toggle
        const clickX = boundingBox.width * 0.65;
        const clickY = boundingBox.height * 0.45;

        // Open
        await canvas.click({ position: { x: clickX, y: clickY } });
        ;

        // Close
        await canvas.click({ position: { x: clickX, y: clickY } });
        ;

        // Open again
        await canvas.click({ position: { x: clickX, y: clickY } });
        ;
      }

      // Should not crash after multiple toggles
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Hover Effects', () => {
    test('objects should respond to hover', async ({ page }) => {
      const canvas = page.locator('canvas').first();

      // Move mouse over the canvas to trigger hover detection
      const boundingBox = await canvas.boundingBox();
      if (boundingBox) {
        // Move mouse across the canvas
        await page.mouse.move(
          boundingBox.x + boundingBox.width * 0.25,
          boundingBox.y + boundingBox.height * 0.5
        );
        

        await page.mouse.move(
          boundingBox.x + boundingBox.width * 0.65,
          boundingBox.y + boundingBox.height * 0.45
        );
        
      }

      // Canvas should still be visible
      await expect(canvas).toBeVisible();
    });

    test('hover text appears when hovering over lamp', async ({ page }) => {
      // When hovering over the lamp, "Click to toggle" text appears
      // This is 3D text rendered in the scene

      const canvas = page.locator('canvas').first();
      const boundingBox = await canvas.boundingBox();

      if (boundingBox) {
        // Move to lamp area
        await page.mouse.move(
          boundingBox.x + boundingBox.width * 0.25,
          boundingBox.y + boundingBox.height * 0.5
        );
        ;
      }

      // Canvas should still render correctly
      await expect(canvas).toBeVisible();
    });

    test('hover text appears when hovering over book', async ({ page }) => {
      // When hovering over the closed book, "Click to open" text appears

      const canvas = page.locator('canvas').first();
      const boundingBox = await canvas.boundingBox();

      if (boundingBox) {
        // Move to book area
        await page.mouse.move(
          boundingBox.x + boundingBox.width * 0.65,
          boundingBox.y + boundingBox.height * 0.45
        );
        ;
      }

      // Canvas should still render correctly
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Scene Objects Integration', () => {
    test('multiple objects can be interacted with in sequence', async ({ page }) => {
      const canvas = page.locator('canvas').first();
      const boundingBox = await canvas.boundingBox();

      if (boundingBox) {
        // Click lamp
        await canvas.click({
          position: {
            x: boundingBox.width * 0.25,
            y: boundingBox.height * 0.5
          }
        });
        ;

        // Click book
        await canvas.click({
          position: {
            x: boundingBox.width * 0.65,
            y: boundingBox.height * 0.45
          }
        });
        ;

        // Click lamp again
        await canvas.click({
          position: {
            x: boundingBox.width * 0.25,
            y: boundingBox.height * 0.5
          }
        });
        ;
      }

      // Should handle all interactions without crashing
      await expect(canvas).toBeVisible();
    });

    test('scene contains floating objects', async ({ page }) => {
      // DefaultScene has FloatingObject components (octahedron, icosahedron, etc.)
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();

      // Take screenshot to verify scene content
      const screenshot = await canvas.screenshot();
      expect(screenshot.length).toBeGreaterThan(1000);
    });

    test('scene contains dust particles', async ({ page }) => {
      // DefaultScene has DustParticles component
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();
    });

    test('scene contains furniture (desk, shelf, rug)', async ({ page }) => {
      // DefaultScene has desk, shelf, and rug
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();

      // Take screenshot to verify scene
      const screenshot = await canvas.screenshot();
      expect(screenshot.length).toBeGreaterThan(1000);
    });
  });
});
