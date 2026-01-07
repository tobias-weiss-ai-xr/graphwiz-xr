# Playwright Automated Testing - Production Health Checks

## Summary

Automated Playwright tests for https://xr.graphwiz.ai. The test suite verifies application loading, WebSocket connectivity, and performance.

## Test Results

**Status:** ✅ All 5 tests passing

```
  5 passed (1.8m)
```

### Test Coverage

| Test | Description | Result |
|------|-------------|--------|
| Application loads with correct title | Verifies app loads with "GraphWiz" title | ✅ Pass |
| UI elements are present | Checks for buttons and UI components | ✅ Pass |
| Grab system initializes | Monitors grab-related console logs | ✅ Pass |
| WebSocket connects successfully | Verifies WebSocket connection to server | ✅ Pass |
| Performance metrics are acceptable | Checks load time is under 30s | ✅ Pass |

## Key Files

| File | Purpose |
|------|---------|
| `playwright.config.ts` | Playwright configuration (production: https://xr.graphwiz.ai) |
| `packages/clients/hub-client/grabbing.spec.ts` | Main test suite (5 health checks) |
| `test-multiplayer-grabbing.sh` | Manual testing guide script |

## Running Tests

### Run all tests:
```bash
pnpm exec playwright test grabbing.spec.ts
```

### Run with HTML reporter:
```bash
pnpm exec playwright test grabbing.spec.ts --reporter=html
pnpm exec playwright show-report
```

### Run specific test:
```bash
pnpm exec playwright test -g "Application loads"
```

### Run in headed mode (see browser):
```bash
pnpm exec playwright test grabbing.spec.ts --headed
```

## Test Output Example

```
========== TEST: App loads ==========

Page title: GraphWiz-XR Hub Client

✅ App loaded!

========== TEST: WebSocket ==========

[WS] [WebSocketClient] Connecting to: wss://xr.graphwiz.ai/ws/lobby?room_id=lobby&user_id=user-6091&client_id=a76301f4-bfc2-4a52-a6ff-be6f5302011d
[WS] [WebSocketClient] WebSocket connected
[WS] [WebSocketClient] Received server hello (text): {type: SERVER_HELLO, room_id: lobby, client_id: a0c2f98f-1d94-4d2e-a97f-f6efb4f0032a, timestamp: 1767550602}

WebSocket logs: 9

✅ WebSocket connected!

========== TEST: Performance ==========

Total load time: 207 ms

✅ Performance acceptable!
```

## What's Verified

The tests confirm:

✅ **Application Loads**
- Page title contains "GraphWiz"
- 6 UI buttons present
- Page loads in ~207ms

✅ **WebSocket Connectivity**
- Connects to `wss://xr.graphwiz.ai/ws/lobby`
- Receives server hello
- Client ID assigned
- Avatar updates sent

✅ **Infrastructure**
- GrabSystem.tsx code exists
- Network messaging in place
- Performance within acceptable bounds

## Manual Testing

For full multiplayer grabbing interaction testing, use the manual test script:

```bash
bash test-multiplayer-grabbing.sh
```

This will provide instructions for testing with multiple browser windows.

## Debugging Failed Tests

If tests fail:

1. **Check site is accessible:**
   ```bash
   curl -I https://xr.graphwiz.ai
   ```

2. **Run in headed mode to see what's happening:**
   ```bash
   pnpm exec playwright test grabbing.spec.ts --headed
   ```

3. **View test output:**
   ```bash
   pnpm exec playwright test grabbing.spec.ts --reporter=list
   ```

4. **Check the playwright-report:**
   ```bash
   pnpm exec playwright show-report
   ```

## CI/CD Integration

To add to CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Install dependencies
  run: pnpm install

- name: Install Playwright browsers
  run: pnpm exec playwright install --with-deps

- name: Run Playwright tests
  run: pnpm exec playwright test grabbing.spec.ts

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Conclusion

The Playwright test suite provides automated health checks for the production application. The tests verify that the application loads correctly, WebSocket connections are established, and performance is acceptable.

For full end-to-end grabbing system testing (multiple players, grab ownership, throw velocity), use manual testing with the provided script.
