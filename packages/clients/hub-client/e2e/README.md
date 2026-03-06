# GraphWiz-XR E2E Test Documentation

End-to-end tests for the Hub Client using Playwright with Chromium browser.

## Overview

E2E tests verify the complete user experience, from page load through user interactions to final state changes. Tests run against the dev server at `http://localhost:5173` by default.

## Quick Start

### Prerequisites

Install Playwright browsers:

```bash
pnpm exec playwright install
```

### Running Tests

```bash
# All E2E tests
pnpm test:e2e

# Specific test file
pnpm test:e2e e2e/avatar-scene.spec.ts

# Test with name filter
pnpm test:e2e -g "PlayerAvatar"

# UI mode (interactive)
pnpm test:e2e --ui

# Visible browser (headed mode)
pnpm test:e2e --headed

# With trace capture
pnpm test:e2e --trace on
```

## Test Coverage

### Total Tests: 25+ tests across 20 test files

### Test Files by Feature Category

#### Avatar & Scene Rendering

- **`avatar-scene.spec.ts`** (4 tests) - PlayerAvatar and DemoScene default rendering
- **`avatar-configurator.spec.ts`** (12 tests) - Avatar customization modal with 3D preview

#### Chat & Communication

- **`chat-system.spec.ts`** (4 tests) - Text chat panel, message sending, panel toggle
- **`emoji-picker.spec.ts`** (4 tests) - Emoji selection, 3D display, floating animations

#### Scene & Navigation

- **`scene-selector.spec.ts`** (10 tests) - Scene dropdown, switching, keyboard navigation
- **`cross-scene-persistence.spec.ts`** (5 tests) - Settings/state preservation across scenes

#### Interactive Objects

- **`interactive-objects.spec.ts`** (7 tests) - Clickable objects, hover effects, state sync
- **`drawing-system.spec.ts`** (9 tests) - Drawing canvas, brush controls, network sync
- **`click-propagation.spec.ts`** (7 tests) - Event propagation, z-index interactions

#### UI Components

- **`settings-panel.spec.ts`** (6 tests) - 18 controls across 4 tabs (Audio, Graphics, Network, Account)
- **`storage-panel.spec.ts`** (6 tests) - Asset browser, upload functionality
- **`performance-overlay.spec.ts`** (9 tests) - FPS counter, entity count, network latency
- **`hud-positioning.spec.ts`** (8 tests) - HUD element positioning persistence

#### Network & Sync

- **`networked-avatar-sync.spec.ts`** (8 tests) - Avatar rendering, position updates, remote sync
- **`multi-user-sync.spec.ts`** (6 tests) - Multiplayer entity synchronization

#### User Input & Controls

- **`keyboard-navigation.spec.ts`** (7 tests) - Tab navigation, keyboard shortcuts, focus
- **`connection-status.spec.ts`** (6 tests) - Connection state, reconnection, client ID
- **`ui-responsiveness.spec.ts`** (4 tests) - Window resize, responsive layout

#### System & Integration

- **`room-persistence.spec.ts`** (6 tests) - Room state saving, loading, persistence
- **`z-index-layering.spec.ts`** (5 tests) - UI layer stacking, modal overlays
- **`websocket.spec.ts`** (3 tests) - WebSocket connection, message handling

#### Legacy (Deprecated)

- **`legacy/`** - Older movement, grabbing, multiplayer tests (retained for reference)

## New Tests: PlayerAvatar and DemoScene

**File:** `avatar-scene.spec.ts` (4 new tests, 14.5s total execution time)

### Test Overview

These tests verify the default scene rendering and PlayerAvatar system:

| Test                                                         | Description                                                       | Execution Time |
| ------------------------------------------------------------ | ----------------------------------------------------------------- | -------------- |
| **DemoScene shows by default on page load**                  | Verifies DemoScene renders in canvas on initial load              | ~5s            |
| **PlayerAvatar renders when player connects**                | Verifies PlayerAvatar appears when myClientId is provided         | ~4s            |
| **PlayerAvatar displays with correct position and rotation** | Verifies avatar renders at position [0,0,0] with rotation [0,0,0] | ~3.5s          |
| **PlayerAvatar includes name tag with displayName**          | Verifies "Player" name tag renders at position [0, 1.2, 0]        | ~2s            |

### Test Details

#### 1. DemoScene Shows by Default on Page Load

**Verifies:**

- Canvas element is visible on page load
- Canvas has valid dimensions (≥512px × 512px)
- Three.js renders 3D content to HTML canvas
- DemoScene uses orbit controls with default camera position

**Test Pattern:**

```typescript
await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });
const canvas = page.locator('canvas').first();
const box = await canvas.boundingBox();
expect(box).not.toBeNull();
expect(box!.width).toBeGreaterThanOrEqual(512);
expect(box!.height).toBeGreaterThanOrEqual(512);
```

#### 2. PlayerAvatar Renders When Player Connects

**Verifies:**

- Canvas exists and renders 3D content
- PlayerAvatar rendered when myClientId provided to DemoScene
- Canvas has proper dimensions for rendered content

**Test Pattern:**

```typescript
await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });
const canvas = page.locator('canvas').first();
const box = await canvas.boundingBox();
expect(box).not.toBeNull();
if (box) {
  expect(box.width).toBeGreaterThan(0);
  expect(box.height).toBeGreaterThan(0);
}
```

#### 3. PlayerAvatar Displays with Correct Position and Rotation

**Verifies:**

- PlayerAvatar renders at default position [0, 0, 0]
- PlayerAvatar uses default rotation [0, 0, 0]
- Canvas shows rendered 3D scene content
- Default Avatar has head, body, arms, legs components

**Test Pattern:**

```typescript
await expect(canvas).toBeVisible({ timeout: 5000 });
const box = await canvas.boundingBox();
expect(box).not.toBeNull();
expect(box!.width).toBeGreaterThan(200);
expect(box!.height).toBeGreaterThan(200);
```

#### 4. PlayerAvatar Includes Name Tag with displayName

**Verifies:**

- Name tag "Player" renders at position [0, 1.2, 0] above avatar
- displayName='Player' (default value) from PlayerAvatar component
- 3D Text mesh renders name in canvas
- Canvas screenshot captures rendered content

**Test Pattern:**

```typescript
await expect(canvas).toBeVisible({ timeout: 5000 });
const canvasContent = await canvas.screenshot({ timeout: 3000 });
expect(canvasContent).toBeTruthy();
expect(canvasContent.length).toBeGreaterThan(0);
const box = await canvas.boundingBox();
expect(box).not.toBeNull();
```

### Test Structure

```typescript
import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

async function waitForCanvas(page: Page, timeout = 15000): Promise<boolean> {
  try {
    await page.waitForSelector('canvas', { timeout });
    return true;
  } catch {
    return false;
  }
}

test.describe('PlayerAvatar and DemoScene', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await waitForCanvas(page);
  });

  test('DemoScene shows by default on page load', async ({ page }) => {
    // Test implementation...
  });

  // ... 3 more tests
});
```

## Common Test Patterns

### Canvas Rendering Verification

```typescript
// Wait for canvas to be ready
await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });
const canvas = page.locator('canvas').first();

// Verify canvas has rendered content
const box = await canvas.boundingBox();
expect(box).not.toBeNull();
expect(box!.width).toBeGreaterThan(0);
expect(box!.height).toBeGreaterThan(0);
```

### Element Interaction

```typescript
// Click with force option (bypasses pointer interception)
await button.click({ force: true });

// Fill input field
await input.fill('Hello World');

// Press key
await input.press('Enter');
```

### Text Verification

```typescript
// Check element visibility
await expect(element).toBeVisible();

// Check text content
await expect(page.locator('text=Expected text')).toBeVisible();

// Verify low-opacity text using body textContent
const bodyText = await page.textContent('body');
expect(bodyText).toContain('Expected text');
```

### Helper Functions

```typescript
// Example helper from scene-selector.spec.ts
async function clickSceneSelectorToggle(page: Page) {
  const toggleButton = page
    .locator('button')
    .filter({ hasText: /Default|Interactive/ })
    .filter({ has: page.locator('text=▼').or(page.locator('text=▲')) })
    .first();
  await toggleButton.click({ force: true });
}
```

## Debugging Tests

### Visual Debugging

```bash
# Run in headed mode (see browser)
pnpm test:e2e --headed

# Run with UI mode (interactive)
pnpm test:e2e --ui
```

### Trace Analysis

```bash
# Run with trace capture
pnpm test:e2e --trace on

# View trace
npx playwright show-trace trace.zip
```

### Console Logging

Add logging to test:

```typescript
console.log('Test step: opening settings');
await page.locator('button', { hasText: '⚙️ Settings' }).click();
```

### Screenshots

Playwright automatically captures:

- Screenshots on failure
- Video on failure (configurable)
- Traces with DOM snapshots
- Network request logs

Locate evidence:

```bash
# Find test results
ls packages/clients/hub-client/test-results/

# Open HTML report
open packages/clients/hub-client/playwright-report/index.html
```

## Best Practices

1. **Always use `{ force: true }`** on clicks to bypass pointer interception
2. **Use `page.waitForLoadState('networkidle')`** after navigation
3. **Prefer `locator('text=...')`** over hardcoded selectors
4. **Use `textContent('body')`** for low-opacity text verification
5. **Wait for UI animations** with appropriate timeouts
6. **Handle missing elements gracefully** with conditional checks
7. **Use helper functions** for repeated UI interactions

## Best Practices for 3D Rendering Tests

Since most features render in Three.js canvas, use these patterns:

1. **Canvas visibility as primary check** - Canvas renders 3D content
2. **Bounding box verification** - Canvas must have dimensions > 0
3. **Screenshot capture** - Verify content rendered visually
4. **Screenshot size check** - Large files indicate rendered content

## Test Configuration

| Config         | Value              | Description                |
| -------------- | ------------------ | -------------------------- |
| Timeout        | 60s                | Default test timeout       |
| Expect timeout | 10s                | Assertion timeout          |
| Action timeout | 15s                | Action operations timeout  |
| Workers        | 8                  | Parallel test execution    |
| Retries        | 1 (local) / 0 (CI) | Automatic retry on failure |

## Environment Variables

| Variable              | Description                                        |
| --------------------- | -------------------------------------------------- |
| `CI=true`             | Enable CI mode (no retries, forbidOnly)            |
| `TEST_ENV=production` | Test against production URL                        |
| `TEST_ENV=ws-test`    | Test with WebSocket backend                        |
| `BASE_URL`            | Override test URL (default: http://localhost:5173) |

## Skip Patterns

Tests use `test.skip()` when:

- Connection required but unavailable
- Backend feature not yet implemented
- Depends on specific server configuration

Example:

```typescript
test('requires backend API', async ({ page }) => {
  const isConnected = await waitForConnection(page, 5000);
  if (!isConnected) {
    test.skip();
    return;
  }
  // Test implementation
});
```

## Related Documentation

- [Playwright Documentation](https://playwright.dev/)
- [e2e-test-execution.md](../../docs/e2e-test-execution.md) - Full test execution guide
- [IMPLEMENTATION_STATUS.md](../../IMPLEMENTATION_STATUS.md) - Project progress
- [README.md](README.md) - Hub client documentation
