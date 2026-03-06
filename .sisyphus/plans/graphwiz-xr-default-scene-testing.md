# GraphWiz-XR Default Scene Testing and Enhancement

## TL;DR

> **Quick Summary**: Create comprehensive Playwright E2E tests for all UI elements in GraphWiz-XR's default scene, fix any UI issues discovered, and ensure reliable cross-scene functionality.
>
> **Deliverables**:
>
> - Playwright test suite covering all UI elements (scene selector, chat, emoji picker, settings, avatar, storage, performance overlay, interactive 3D objects)
> - Enhanced UI reliability fixes for default scene
> - Documentation of test coverage and known issues
>
> **Estimated Effort**: Medium (~4-6 hours of testing, ~2-4 hours of fixes)
> **Parallel Execution**: YES - 5 waves of parallel testing
> **Critical Path**: Test discovery → Create test files → Run tests → Fix issues → Verify → Final QA

---

## Context

### Original Request

Test and enhance the default scene in GraphWiz-XR, ensuring UI elements work as expected using Playwright for testing.

### Interview Summary

**Key Discussions**:

- **UI Scope**: User confirmed testing focus on all UI elements present in default scene
- **Testing Tool**: Playwright explicitly requested for E2E testing
- **Deliverables**: Test suite + enhancements based on findings
- **Approach**: Test-first, fix issues discovered during testing

**Research Findings**:

- **Default Scene**: `packages/clients/hub-client/src/scenes/DefaultScene.tsx` with interactive lamp and book objects
- **Main App**: `packages/clients/hub-client/src/App.tsx` with 9 major UI overlay components
- **Test Infrastructure**: Playwright tests exist in `e2e/` directory (basic.spec.ts provides patterns)
- **Scene Selector**: 7 scenes available (default, interactive, media, grab, drawing, portal, gestures)

### Metis Review

**Identified Gaps (addressed)**:

- **Gap**: Missing acceptance criteria for 3D interaction testing
  - **Resolution**: Added specific 3D click/hover verification using raycasting simulation
- **Gap**: No network synchronization tests for multiplayer UI
  - **Resolution**: Added mock WebSocket client testing for entity updates
- **Gap**: Accessibility testing not specified
  - **Resolution**: Verified ARIA attributes and keyboard navigation in all UI components
- **Gap**: Performance impact of test additions not considered
  - **Resolution**: Tests run independently and include cleanup to prevent test pollution

---

## Work Objectives

### Core Objective

Create a comprehensive Playwright test suite for all UI elements in GraphWiz-XR's default scene, identify UI issues, and implement fixes to ensure reliable functionality.

### Concrete Deliverables

1. **Playwright Test Suite**: `packages/clients/hub-client/e2e/default-scene-ui.spec.ts` with comprehensive UI tests
2. **Test Reports**: Coverage documentation and test execution evidence in `.sisyphus/evidence/`
3. **UI Enhancements**: Fixed issues discovered during testing (documented per issue)
4. **Test Execution Guide**: Instructions for running the test suite locally and in CI

### Definition of Done

- [ ] All 10 UI element test suites created and passing
- [ ] All test scenarios run and verified with evidence screenshots
- [ ] All bugs discovered during testing are fixed or documented with workarounds
- [ ] Test suite can run end-to-end without human intervention
- [ ] Documentation explains how to run tests and interpret results

### Must Have

- Playwright tests for SceneSelector (scene switching, dropdown, accessibility)
- Playwright tests for Connection Status UI (visibility, state changes, accuracy)
- Playwright tests for Chat System (input, send, receive, display, scroll)
- Playwright tests for Emoji Picker (selection, sending, floating emoji display)
- Playwright tests for Settings Panel (controls, persistence, toggles)
- Playwright tests for Avatar Configurator (3D preview, controls, save/load)
- Playwright tests for Storage Panel (browse, upload, tabs, error handling)
- Playwright tests for Performance Overlay (visibility, data accuracy, hide/show)
- Playwright tests for Default Scene interactive elements (lamp, book, hover states)
- Playwright tests for HUD positioning and visibility across scenes

### Must NOT Have (Guardrails)

- No modification to non-UI scene logic (physics, networking core) unless bug fix required
- No changes to other scenes (interactive, media, grab, drawing, portal, gestures)
- No test for VR-specific features that require actual VR hardware
- No tests that require external services (auth, storage) - use mocks
- No breaking changes to existing UI component APIs

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.
> Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision

- **Infrastructure exists**: YES (Playwright in `e2e/` directory)
- **Automated tests**: YES (Tests-after - create comprehensive E2E tests for existing UI)
- **Framework**: Playwright (already configured, pattern exists in `basic.spec.ts`)
- **If Tests-after**: Create test suite first, run tests to identify issues, then fix

### QA Policy

Every task MUST include agent-executed QA scenarios (see TODO template below).
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **3D Interactions**: Use Playwright with canvas raycasting — Simulate clicks on 3D objects
- **Mocking**: Use Playwright mocking for WebSocket client — Mock network sync behavior
- **Accessibility**: Use Playwright accessibility testing — Verify ARIA attributes, keyboard nav

---

## Execution Strategy

### Parallel Execution Waves

> Maximize throughput by grouping independent tasks into parallel waves.
> Each wave completes before the next begins.
> Target: 5-8 tasks per wave. Fewer than 3 per wave (except final) = under-splitting.

```
Wave 1 (Start Immediately — test infrastructure + phase 1 tests):
├── Task 1: Create Playwright test file structure [quick]
├── Task 2: Test SceneSelector component [quick]
├── Task 3: Test Connection Status UI [quick]
├── Task 4: Test Chat System basic functionality [quick]
├── Task 5: Test Emoji Picker UI [quick]
├── Task 6: Test Settings Panel UI [quick]
└── Task 7: Create test utilities and mocks [quick]

Wave 2 (After Wave 1 — complex UI tests, MAX PARALLEL):
├── Task 8: Test Avatar Configurator with 3D preview [deep]
├── Task 9: Test Storage Panel (browse + upload tabs) [unspecified-high]
├── Task 10: Test Performance Overlay visibility/data [quick]
├── Task 11: Test HUD positioning across scenes [unspecified-high]
├── Task 12: Test Default Scene interactive lamp [deep]
├── Task 13: Test Default Scene interactive book [deep]
└── Task 14: Create WebSocket mock for network sync tests [deep]

Wave 3 (After Wave 2 — integration tests and bug fixes):
├── Task 15: Test cross-scene UI persistence [deep]
├── Task 16: Test UI keyboard navigation and accessibility [deep]
├── Task 17: Test UI responsiveness at different screen sizes [unspecified-high]
├── Task 18: Fix any bugs discovered from Wave 1-2 tests [visual-engineering]
├── Task 19: Test UI z-index layering and overlapping [quick]
└── Task 20: Test UI event conflicts (click propogation) [deep]

Wave 4 (After Wave 3 — full integration and documentation):
├── Task 21: Full test suite execution and evidence collection [quick]
├── Task 22: Create test execution documentation [writing]
├── Task 23: Create bug fixes documentation [writing]
├── Task 24: Verify all tests pass with evidence [quick]
└── Task 25: Create test coverage report [writing]

Wave FINAL (After ALL tasks — independent review, 4 parallel):
├── Task F1: Test suite completeness review (oracle)
├── Task F2: Code quality review of test files (unspecified-high)
├── Task F3: Real manual QA of all UI fixes (unspecified-high + playwright skill)
└── Task F4: Test execution time analysis and optimization (deep)

Critical Path: Task 1 → Task 7 → Task 14 → Task 21 → F1-F4
Parallel Speedup: ~70% faster than sequential
Max Concurrent: 7 (Waves 1 & 2)
```

### Dependency Matrix (abbreviated — show ALL tasks in your generated plan)

- **1-7**: — — 8-14, 1
- **8**: 7 — 15, 18, 2
- **14**: 7 — 15, 2
- **15**: 8, 11, 14 — 21, 3
- **18**: 12, 13 — 21, 23, 3
- **21**: 18, 20 — 22, 23, 24, 25, 4
- **F1**: 25 — —
- **F2**: 24 — —
- **F3**: 18 — —
- **F4**: 21 — —

> This is abbreviated for reference. YOUR generated plan must include the FULL matrix for ALL tasks.

### Agent Dispatch Summary

- **1**: **7** — T1-T7 → `quick`
- **2**: **7** — T8 → `deep`, T9 → `unspecified-high`, T10 → `quick`, T11 → `unspecified-high`, T12 → `deep`, T13 → `deep`, T14 → `deep`
- **3**: **6** — T15 → `deep`, T16 → `deep`, T17 → `unspecified-high`, T18 → `visual-engineering`, T19 → `quick`, T20 → `deep`
- **4**: **5** — T21 → `quick`, T22 → `writing`, T23 → `writing`, T24 → `quick`, T25 → `writing`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high` + `playwright`, F4 → `deep`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Test Suite Completeness Review** — `oracle`
      Review the test suite end-to-end. Verify 100% coverage of requirements: all UI elements tested, all interactions covered, edge cases addressed, accessibility tested, network sync tested. Check missing coverage: untested components, untested states, untested error scenarios.
      Output: `Components [X/10] | Interactions [Y/Y] | Edge Cases [Z/Z] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
      Review all test files for quality. Check: consistent test patterns, proper use of Playwright APIs, appropriate selectors, adequate timeouts, proper cleanup, no hard-coded waits, descriptive test names, proper assertions. Check for duplicate tests, missing tests, flaky tests (timing issues).
      Output: `Test Files [N files] | Test Quality [PASS/FAIL] | Code Style [PASS/FAIL] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
      Run the full test suite and manually verify all UI fixes. Verify: all bugs from test execution are fixed, UI enhancements work as expected, no regressions, performance acceptable, accessibility improved. Test manually: scene switching, chat, emoji, settings, avatar, storage, performance overlay, interactive objects.
      Output: `Bugs Fixed [N/N] | Regressions [None] | Manual Tests [N/N pass] | VERDICT`

- [ ] F4. **Test Execution Analysis** — `deep`
      Analyze test execution performance. Check: total execution time, slowest tests (optimize if >30s), parallel execution efficiency, test isolation (no cross-test pollution), flaky test detection (run 3x to verify stability). Optimize slow tests: parallelize independent tests, reduce unnecessary waits, fix flaky assertions.
      Output: `Total Time [N seconds] | Tests [N fast, N medium, N slow] | Flaky [0/N] | VERDICT`

---

## Commit Strategy

- **1**: `test(e2e): add default scene UI test infrastructure` — e2e/\*.spec.ts, tests/
- **2**: `test(e2e): add SceneSelector tests` — e2e/default-scene-ui.spec.ts
- **7**: `test(e2e): add test utilities and mocks` — e2e/utils/test-helpers.ts
- **14**: `test(e2e): add WebSocket mocks` — e2e/utils/mocks.ts
- **18**: `fix(ui): resolve scene selector z-index issues` — src/components/SceneSelector.tsx
- **19**: `fix(ui): fix avatar configurator state bugs` — src/avatar/avatar-configurator.tsx
- **21**: `test(e2e): run full test suite` — e2e/evidence/
- **25**: `docs: add test coverage report` — TEST_COVERAGE.md

---

## Success Criteria

### Verification Commands

```bash
# Run all E2E tests
cd packages/clients/hub-client && pnpm test:e2e

# Run specific test file
pnpm playwright test e2e/default-scene-ui.spec.ts

# Run with headed mode (see browser)
pnpm playwright test --headed

# Generate test report
pnpm playwright show-report
```

### Final Checklist

- [ ] All 10 UI components tested with comprehensive scenarios
- [ ] All test evidence (screenshots, logs) captured in .sisyphus/evidence/
- [ ] All bugs discovered are fixed or documented
- [ ] Test suite runs reliably with no flaky tests
- [ ] Documentation explains how to run and extend tests
- [ ] Tests can run in CI/CD pipeline without human intervention

---
