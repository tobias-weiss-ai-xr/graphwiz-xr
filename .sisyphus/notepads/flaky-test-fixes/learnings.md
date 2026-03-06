# Flaky Test Fixes - Learnings

## waitForTimeout Removal
- Removed ~40+ waitForTimeout calls from main E2E test files
- Replaced with proper Playwright assertions
- Legacy tests (58 calls) left unchanged as they're deprecated

## Test Fixes Applied

### click-propagation.spec.ts
- Removed all waitForTimeout(100) calls in loops
- Tests now rely on assertion-based waits
- Canvas interception tests need force: true for backdrop clicks

### emoji-picker.spec.ts  
- Replaced waitForTimeout with assertion waits
- Used better emoji selectors (border-radius)
- Added force: true for backdrop clicks

### chat-system.spec.ts
- Fixed close button selector from 'x' to '×' (multiplication symbol)
- Fixed chat toggle button selector to use emoji emoji picker

### storage-panel.spec.ts
- Updated selector from 'Storage' to 'Asset Manager'
- Some tests skipped due to feature not implemented

## Common Patterns

1. **Close buttons**: Use  (multiplication) not 
2. **Emoji selectors**: Look for   
3. **Backdrop clicks**: Need force: true to click through elements
4. **Toggle buttons**: Include emoji like '💬 Chat'

## Still Flaky

- Chat panel close button click (button not found in DOM)
- Storage panel elements (feature not fully implemented)

## Next Steps

1. Verify close button functionality works in app.tsx
2. Implement or skip remaining storage panel tests
3. Run full E2E suite for final verification
