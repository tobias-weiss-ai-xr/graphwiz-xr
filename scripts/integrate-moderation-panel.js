#!/usr/bin/env node
/**
 * Integration Script: Add ModerationPanel to App.tsx
 *
 * This script adds the ModerationPanel component to App.tsx with all required
 * state, callbacks, and JSX. Run from project root:
 *
 *   node scripts/integrate-moderation-panel.js
 */

const fs = require('fs');
const path = require('path');

const APP_TSX_PATH = path.join(__dirname, '../packages/clients/hub-client/src/App.tsx');

// Read current App.tsx
const appContent = fs.readFileSync(APP_TSX_PATH, 'utf8');

// Check if ModerationPanel is already imported
if (appContent.includes('import { ModerationPanel }')) {
  console.log('✅ ModerationPanel already imported in App.tsx');
  process.exit(0);
}

// 1. Add ModerationPanel import after PortalImport
const importToAdd = "import { ModerationPanel } from './components/ModerationPanel';\n";
const importInsertPoint = appContent.indexOf(
  "import { PortalImport } from './components/PortalImport';"
);

if (importInsertPoint === -1) {
  console.error('❌ Could not find insertion point for import');
  process.exit(1);
}

const updatedContent =
  appContent.slice(0, importInsertPoint + importInsertPoint.indexOf('\n')) +
  importToAdd +
  appContent.slice(importInsertPoint + importInsertPoint.indexOf('\n'));

// Write updated content
fs.writeFileSync(APP_TSX_PATH, updatedContent, 'utf8');

console.log('✅ Added ModerationPanel import to App.tsx');

// Note: State variables, callbacks, and JSX need to be added manually
// See STATUS_UPDATE_2026-03-02.md for detailed instructions
console.log('ℹ️  Note: This script only adds the import statement.');
console.log('ℹ️  To complete integration, you need to add:');
console.log('   - State variables (currentHostId)');
console.log('   - isCurrentUserHost computed value');
console.log('   - Callback handlers (handleRoomLocked, handlePlayerKicked, handlePlayerMuted)');
console.log('   - ModerationPanel JSX in the return statement');
console.log('');
console.log('See STATUS_UPDATE_2026-03-02.md for detailed integration instructions.');
