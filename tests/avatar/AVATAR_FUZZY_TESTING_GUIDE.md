# Avatar System Fuzzy Testing Guide

**Last Updated**: 2026-01-02
**Status**: ✅ Ready for Testing
**Site**: https://xr.graphwiz.ai

---

## Overview

This guide covers automated fuzzy testing, multi-client simulation, and stress testing for the GraphWiz-XR avatar system.

---

## Test Suite Architecture

```
tests/avatar/
├── avatar-fuzzy-test.ts          # Core fuzzy testing utilities
├── run-fuzzy-tests.ts            # Automated test runner (Node.js)
├── browser-test-runner.ts        # Browser automation tests (Playwright)
└── AVATAR_FUZZY_TESTING_GUIDE.md # This file
```

### Components

1. **avatar-fuzzy-test.ts** - Core testing framework
   - `AvatarFuzzer`: Generate random avatar configs
   - `AvatarValidator`: Validate avatar configurations
   - `FuzzyTestRunner`: Execute tests and collect results
   - `MultiClientFuzzer`: Simulate multiple concurrent clients

2. **run-fuzzy-tests.ts** - Automated test suite
   - Basic validation tests
   - Edge case tests
   - Random fuzzy tests (100 iterations)
   - Color format tests
   - Height boundary tests
   - Body type validation tests
   - Multi-client simulation
   - Stress tests (1000 operations)
   - Data integrity tests
   - Performance benchmarks

3. **browser-test-runner.ts** - Browser automation
   - Multi-client simulation using Playwright
   - Real browser testing at https://xr.graphwiz.ai
   - Screenshot capture
   - End-to-end testing

---

## Installation

### Prerequisites

```bash
# Install dependencies
cd /opt/git/graphwiz-xr
npm install -D typescript tsx
npm install -D playwright

# Install Playwright browsers (for browser tests)
npx playwright install chromium
```

---

## Running Tests

### 1. Unit Tests (Fastest)

Run the automated fuzzy test suite:

```bash
# Run all tests
npx tsx tests/avatar/run-fuzzy-tests.ts

# Run with output to file
npx tsx tests/avatar/run-fuzzy-tests.ts 2>&1 | tee test-results.txt
```

**Expected Output**:
```
================================================================================
🧪 AVATAR SYSTEM TEST SUITE
================================================================================

📋 Running: Basic Validation Tests
--------------------------------------------------------------------------------
  Testing valid avatar configs...
    ✅ Test 1: PASSED (2.34ms)
    ✅ Test 2: PASSED (1.98ms)
    ...
  📊 Validation Stats: 10/10 passed (100.0%)

📋 Running: Edge Case Tests
--------------------------------------------------------------------------------
  Testing edge cases...
    ✅ edge-minHeight: PASSED
    ✅ edge-maxHeight: PASSED
    ❌ edge-negativeHeight: FAILED
       Config: {"body_type":"abstract",...}
       Errors: height is below minimum (0.5m): -1.0
    ...
  📊 Edge Case Stats: 6/11 passed (54.5%)

...

================================================================================
✨ All tests completed in 2.34s
================================================================================
```

### 2. Browser Automation Tests (Requires Site to be Live)

Run multi-client browser tests:

```bash
# Create screenshot directory
mkdir -p /tmp/avatar-tests

# Run browser tests (3 clients by default)
npx tsx tests/avatar/browser-test-runner.ts

# Run with more clients
npx tsx -e "
  const { BrowserAvatarTester } = require('./tests/avatar/browser-test-runner');
  const tester = new BrowserAvatarTester('https://xr.graphwiz.ai');
  (async () => {
    await tester.init();
    await tester.runMultiClientTest(5); // 5 clients
    await tester.cleanup();
  })().catch(console.error);
"
```

**Expected Output**:
```
================================================================================
🧪 MULTI-CLIENT AVATAR TEST (3 clients)
================================================================================

👥 Creating 3 test clients...
  👤 Creating client: client-1234567890-0
  👤 Creating client: client-1234567890-1
  👤 Creating client: client-1234567890-2
✅ Created 3 clients

🧪 Running tests for client-1234567890-0...
  🔍 Testing avatar button...
    ✅ Avatar button visible
  🔲 Opening configurator...
    ✅ Configurator opened
  🎨 Customizing avatar...
    ✅ Avatar customized
  💾 Testing persistence...
    ✅ Avatar persisted

...
```

### 3. Custom Fuzzy Testing

Run custom fuzzy tests programmatically:

```bash
npx tsx -e "
const { AvatarFuzzer, FuzzyTestRunner } = require('./tests/avatar/avatar-fuzzy-test');

async function test() {
  const runner = new FuzzyTestRunner();
  const fuzzer = new AvatarFuzzer();

  // Run 50 random fuzzy tests
  console.log('Running 50 fuzzy tests...');
  const results = await runner.runBatch(50, () => fuzzer.randomFuzzy());

  const stats = runner.getStats();
  console.log(\`Stats: \${stats.passed}/\${stats.total} passed\`);
  console.log(\`Pass rate: \${stats.passRate.toFixed(2)}%\`);

  // Show report
  console.log(runner.generateReport());
}

test().catch(console.error);
"
```

---

## Test Categories

### 1. Validation Tests

Validates that avatar configurations meet requirements:

- Body type is one of: human, robot, alien, animal, abstract
- Colors are valid hex format (#RRGGBB)
- Height is between 0.5m and 3.0m
- All required fields are present

### 2. Edge Case Tests

Tests boundary conditions:

**Minimum/Maximum Values**:
- Min height: 0.5m
- Max height: 3.0m
- Color formats: #000000 (black), #FFFFFF (white)

**Invalid Values**:
- Negative heights
- Empty colors
- Invalid body types
- Non-string values
- NaN and Infinity

### 3. Fuzzy Tests

Randomized testing to find unexpected bugs:

- Random body types (including invalid ones)
- Random color formats (hex, rgb, hsl, invalid)
- Random heights (including out of bounds)
- Random combinations of all fields

### 4. Multi-Client Tests

Simulates multiple concurrent users:

- Multiple independent avatar configurations
- Concurrent updates
- Data consistency checks
- Race condition detection

### 5. Stress Tests

High-volume testing to identify performance issues:

- 1000+ operations
- Concurrent client simulation
- Performance benchmarks (ops/sec)
- Memory leak detection

### 6. Browser Tests

End-to-end testing with real browsers:

- Avatar button visibility
- Configurator opening
- Avatar customization UI
- Save functionality
- Persistence after refresh
- Screenshot capture

---

## Test Results Interpretation

### Pass/Fail Criteria

**Passed Test**: Avatar config is valid according to validation rules

**Failed Test**: Avatar config has validation errors

**Warning**: Non-critical issues (e.g., unusual but valid values)

### Example Test Report

```
================================================================================
FUZZY TEST REPORT
================================================================================
Total Tests: 1000
Passed: 847 (84.70%)
Failed: 153
Warnings: 42
Total Duration: 1234.56ms
Avg Duration: 1.23ms

FAILED TESTS:
--------------------------------------------------------------------------------
[test-1234567890-abc]
  Config: {"body_type":"invalid","primary_color":"","secondary_color":"","height":-999}
  Errors: body_type must be one of: human, robot, alien, animal, abstract, got: invalid
         primary_color is missing or invalid:
         secondary_color is missing or invalid:
         height is below minimum (0.5m): -999

[test-1234567891-def]
  Config: {"body_type":null,"primary_color":"#GGGGGG","secondary_color":"#","height":NaN}
  Errors: body_type is missing or invalid: null
         primary_color is not a valid hex color: #GGGGGG
         secondary_color is not a valid hex color: #
         height must be a number, got: NaN

...
```

### Expected Failure Rates

- **Valid Configs**: ~100% pass rate (all randomly generated valid configs should pass)
- **Fuzzy Configs**: ~40-60% pass rate (intentionally includes invalid configs)
- **Edge Cases**: ~50-70% pass rate (mix of valid and invalid edge cases)

**Note**: High failure rates in fuzzy tests are **expected and normal** - the purpose is to find invalid inputs and ensure they're properly rejected.

---

## Performance Benchmarks

### Reference Performance

**Test Machine**: Standard development machine
**Node.js Version**: v20+

| Test Type | Operations | Duration | Throughput |
|-----------|-----------|----------|------------|
| Validation | 100 | ~100ms | ~1000 ops/sec |
| Fuzzy | 1000 | ~1200ms | ~833 ops/sec |
| Multi-Client (3) | 15 updates | ~5000ms | ~3 ops/sec (with UI) |

### Performance Expectations

- **Validation**: >500 ops/sec
- **Fuzzy Tests**: >300 ops/sec
- **Browser Tests**: ~1-5 ops/sec (includes network and rendering)

---

## Manual Testing Guide

For manual testing alongside automated tests, see:
- **MULTI_CLIENT_AVATAR_TEST.md** - Manual multi-client testing guide
- **AVATAR_TESTING_GUIDE.md** - Comprehensive avatar testing

### Quick Manual Test

1. Open 3 browser windows to https://xr.graphwiz.ai
2. Customize different avatars in each window
3. Test save and persistence
4. Verify no conflicts between windows

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Avatar Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npx tsx tests/avatar/run-fuzzy-tests.ts
```

---

## Troubleshooting

### Issue: Tests fail to run

**Solution**: Ensure TypeScript and dependencies are installed
```bash
npm install -D typescript tsx
```

### Issue: Browser tests fail

**Solution**: Ensure site is accessible and Playwright is installed
```bash
npx playwright install chromium
curl -I https://xr.graphwiz.ai
```

### Issue: High failure rate

**Solution**: This is expected for fuzzy tests. Check that:
- Invalid configs are properly rejected (expected)
- Valid configs all pass (important)
- No crashes or exceptions

### Issue: Performance degradation

**Solution**: Check for:
- Memory leaks (run multiple iterations)
- Blocking operations (use async/await)
- Resource cleanup (close clients, contexts)

---

## Adding New Tests

### Adding a New Validation Rule

```typescript
// In avatar-fuzzy-test.ts
export class AvatarValidator {
  static validate(config: AvatarConfig) {
    // ... existing validation ...

    // Add new rule
    if (config.custom_model_url && !this.isValidUrl(config.custom_model_url)) {
      errors.push(`custom_model_url must be a valid URL`);
    }

    return { valid: errors.length === 0, errors, warnings };
  }
}
```

### Adding a New Test Suite

```typescript
// In run-fuzzy-tests.ts
suite.addSuite('My New Test Suite', async () => {
  const runner = new FuzzyTestRunner();

  // Your test logic here
  const results = await runner.runBatch(10, () => ({
    body_type: 'robot',
    primary_color: '#FF0000',
    secondary_color: '#0000FF',
    height: 1.7,
  }));

  console.log(`Results: ${results.filter(r => r.passed).length}/${results.length} passed`);
});
```

---

## Test Coverage

### Current Coverage

| Component | Coverage |
|-----------|----------|
| Body Type Validation | ✅ Full |
| Color Validation | ✅ Full |
| Height Validation | ✅ Full |
| Edge Cases | ✅ Full |
| Multi-Client | ✅ Full |
| Browser UI | ✅ Full |
| Persistence | ✅ Full |
| Performance | ⚠️ Basic |

### Future Improvements

- [ ] Add network delay simulation
- [ ] Add websocket connection testing
- [ ] Add 3D rendering validation
- [ ] Add mobile device testing
- [ ] Add accessibility testing
- [ ] Add visual regression tests

---

## Summary

The avatar system fuzzy testing suite provides:

1. ✅ **Automated validation tests** - Fast, comprehensive validation
2. ✅ **Fuzzy testing** - Randomized input generation
3. ✅ **Multi-client simulation** - Concurrent user testing
4. ✅ **Browser automation** - End-to-end testing
5. ✅ **Stress testing** - Performance and stability
6. ✅ **Edge case coverage** - Boundary condition testing

**Quick Start**:
```bash
# Run all automated tests
npx tsx tests/avatar/run-fuzzy-tests.ts

# Run browser tests (site must be live)
npx tsx tests/avatar/browser-test-runner.ts
```

---

**Status**: ✅ Testing suite complete and ready for use
**Site**: https://xr.graphwiz.ai
**Documentation**: 2026-01-02

**END OF TESTING GUIDE**
