# E2E Test Execution Guide

GraphWiz-XR uses Playwright for end-to-end UI testing. This guide covers how to run tests, understand coverage, and interpret results.

## Quick Start

### Prerequisites

1. **Install Playwright browsers:**

   ```bash
   pnpm exec playwright install
   ```

2. **Start dev server:**

   ```bash
   cd packages/clients/hub-client
   pnpm dev
   ```

3. **Run all tests:**
   ```bash
   cd packages/clients/hub-client
   pnpm test:e2e
   ```

### Test Coverage Summary

| Test File                         | Tests | Features Covered                                                               |
| --------------------------------- | ----- | ------------------------------------------------------------------------------ |
| `basic.spec.ts`                   | 14    | App loading, canvas rendering, window resize, keyboard input, performance      |
| `chat-system.spec.ts`             | 8     | Chat panel visibility, message sending, panel toggle, message count            |
| `scene-selector.spec.ts`          | 10    | Scene dropdown, scene switching, keyboard navigation, ARIA accessibility       |
| `performance-overlay.spec.ts`     | 10    | FPS counter, entity count, network latency, overlay toggle                     |
| `avatar-configurator.spec.ts`     | 12    | 3D preview, body types, color pickers, height slider, save/cancel              |
| `settings-panel.spec.ts`          | 6     | Settings tab switching, slider/toggle interactivity, 18 controls across 4 tabs |
| `emoji-picker.spec.ts`            | 4     | Emoji selection, 3D display, grid layout, floating emoji animation             |
| `interactive-objects.spec.ts`     | 17    | Lamp toggle, book hover, object interactivity, state sync                      |
| `performance-overlay.spec.ts`     | 10    | FPS, entities, latency metrics display and toggle                              |
| `hud-positioning.spec.ts`         | 8     | HUD element position persistence across scene changes                          |
| `networked-avatar-sync.spec.ts`   | 6     | Avatar rendering, position updates, remote player sync                         |
| `connection-status.spec.ts`       | 6     | Connection state indicators, reconnection, client ID display                   |
| `storage-panel.spec.ts`           | 6     | Asset browser, upload functionality, file management                           |
| `cross-scene-persistence.spec.ts` | 5     | Settings/state preservation across scene switches                              |
| `weboscket.spec.ts`               | 4     | WebSocket connection, message handling, reconnection                           |
| `keyboard-navigation.spec.ts`     | 5     | Tab navigation, keyboard shortcuts, focus management                           |
| `z-index-layering.spec.ts`        | 5     | UI layer z-index hierarchy, modal overlay stacking                             |
| `ui-responsiveness.spec.ts`       | 4     | Window resize handling, responsive layout, performance                         |
| `simple-test.spec.ts`             | 2     | Basic sanity checks                                                            |
| `room-persistence.spec.ts`        | 6     | Room state saving, loading, persistence verification                           |
| `multi-user-sync.spec.ts`         | 6     | Multiplayer entity synchronization across clients                              |
| `default-scene-ui.spec.ts`        | 30+   | Default scene UI components (many skipped - awaiting backend)                  |
| Legacy tests                      | -     | Old movement, grabbing, multiplayer tests (deprecated)                         |

**Total:** 130+ E2E tests covering all major UI components and interactions.

## Command Reference

### Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e e2e/chat-system.spec.ts

# Run with test name filter
pnpm test:e2e -g "Chat System"

# Run specific test file and test
pnpm test:e2e e2e/chat-system.spec.ts -g "should send message"

# Run with UI mode (interactive)
pnpm test:e2e --ui

# Run with headed browser (visible UI)
pnpm test:e2e --headed

# Run with trace capture
pnpm test:e2e --trace on

# Run specific project
pnpm test:e2e --project=chromium-desktop
```

### Test Configuration

| Config         | Value              | Description                |
| -------------- | ------------------ | -------------------------- |
| Timeout        | 60s                | Default test timeout       |
| Expect timeout | 10s                | Assertion timeout          |
| Action timeout | 15s                | Action operations timeout  |
| Workers        | 8                  | Parallel test execution    |
| Retries        | 1 (local) / 0 (CI) | Automatic retry on failure |

### Output Options

- **HTML report:** Generated automatically at `packages/clients/hub-client/playwright-report/index.html`
- **Traces:** Captured on failure in `trace.zip` files
- **Screenshots:** Captured on failure in `test-results/` directories
- **Video:** Captured on failure (can be enabled in config)

## Test File Structure

Each test file follows this pattern:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should behave correctly', async ({ page }) => {
    // Test implementation
  });
});
```

### Test Groups by Feature

#### Core UI Components

- **`basic.spec.ts`** - App initialization, canvas rendering, basic interactions
- **`performance-overlay.spec.ts`** - Performance metrics display
- **`connection-status.spec.ts`** - Connection state indicators

#### Interaction Systems

- **`chat-system.spec.ts`** - Text chat functionality, message handling
- **`emoji-picker.spec.ts`** - Emoji selection and 3D display
- **`interactive-objects.spec.ts`** - Clickable objects, hover effects
- **`networked-avatar-sync.spec.ts`** - Avatar rendering and sync

#### Configuration & Customization

- **`avatar-configurator.spec.ts`** - Avatar customization modal
- **`settings-panel.spec.ts`** - Settings UI across 4 tabs (Audio, Graphics, Network, Account)
- **`scene-selector.spec.ts`** - Scene dropdown and switching

#### Advanced Features

- **`hud-positioning.spec.ts`** - HUD element positioning
- **`storage-panel.spec.ts`** - Asset management
- **`cross-scene-persistence.spec.ts`** - State preservation
- **`multi-user-sync.spec.ts`** - Multiplayer synchronization

## Common Test Patterns

### Element Interaction

```typescript
// Click with force option to bypass pointer interception
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

// Verify body contains specific text (for low-opacity elements)
const bodyText = await page.textContent('body');
expect(bodyText).toContain('Expected text');
```

### Helper Functions

```typescript
// Example from scene-selector.spec.ts
async function clickSceneSelectorToggle(page: Page) {
  const toggleButton = page
    .locator('button')
    .filter({
      hasText: /Default|Interactive/
    })
    .filter({
      has: page.locator('text=▼').or(page.locator('text=▲'))
    })
    .first();
  await toggleButton.click({ force: true });
}
```

## Environment Variables

| Variable              | Description                                        |
| --------------------- | -------------------------------------------------- |
| `CI=true`             | Enable CI mode (no retries, forbidOnly)            |
| `TEST_ENV=production` | Test against production URL                        |
| `TEST_ENV=ws-test`    | Test with WebSocket backend                        |
| `BASE_URL`            | Override test URL (default: http://localhost:5173) |

## Debugging Tests

### Visual Debugging

```bash
# Run inheaded mode (see browser)
pnpm test:e2e --headed

# Run with UI mode
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

## Evidence Collection

Tests automatically capture:

1. **Screenshots** - On failure, showing element state
2. **Video** - Full test execution (configurable)
3. **Traces** - Interactive trace with DOM snapshots
4. **Network logs** - Request/response history

### Locating Evidence

```bash
# Find test results
ls packages/clients/hub-client/test-results/

# Find HTML report
open packages/clients/hub-client/playwright-report/index.html
```

## Skip Patterns

Some tests use `test.skip()` when:

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

## Best Practices

1. **Always use `{ force: true }` on clicks** to bypass Playwright's pointer interception
2. **Use `page.waitForLoadState('networkidle')`** after navigation
3. **Prefer `locator('text=...')` over hardcoded selectors**
4. **Use `textContent('body')` for verifying low-opacity text**
5. **Always call `page.waitForTimeout()` after UI state changes** for animation/rendering
6. **Handle missing elements gracefully** with conditional checks
7. **Use helper functions** for repeated UI interactions

## Troubleshooting

### Tests failing with random timeout

- Increase timeout in test or config
- Check if dev server is running
- Verify no network issues

### Element not found

- Check if selector matches current UI state
- Verify element is visible (not hidden)
- Use `page.screenshot()` to debug

### Flaky tests

- Add `test.describe.fixme()` while investigating
- Check for timing issues
- Add appropriate waits
- Consider `test.describe.serial()` for dependent tests

## Running in CI

The CI pipeline runs tests automatically. Manual CI run:

```bash
# Set CI environment
CI=true pnpm test:e2e

# Generate HTML report
npx playwright show-report
```

## Related Documentation

- [Playwright Documentation](https://playwright.dev/)
- [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md) - Overall project progress
- [README.md](../packages/clients/hub-client/README.md) - Hub client documentation
