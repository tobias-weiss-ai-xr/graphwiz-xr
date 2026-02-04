# Avatar System Multi-Client Testing Guide

**Date**: 2026-01-01
**Goal**: Test avatar system with multiple simultaneous clients

## Current Status

### Running Services
- ✅ Hub Client: http://localhost:3000
- ✅ Presence Service: http://localhost:4000
- ⚠️ Avatar Service: Not started (optional for frontend testing)

## Testing Instructions

### Option 1: Frontend Testing (Recommended)

**Step 1: Open Multiple Browser Windows**

```bash
# Open the hub client in your default browser
xdg-open http://localhost:3000 2>/dev/null || open http://localhost:3000 2>/dev/null

# Or open manually: Navigate to http://localhost:3000
```

**Step 2: Create Multiple Users**
1. Open 3 separate browser windows/tabs to http://localhost:3000
2. Each window will be assigned a different random user ID
3. You should see different "Player-XXX" names in the connection panel

**Step 3: Test Avatar Customization**

In each window:
1. Click the "🎭 Avatar" button (purple button in top-left)
2. Customize each avatar differently:

   **Window 1 (Player A)**:
   - Body Type: Human 👤
   - Primary Color: #4CAF50 (Green)
   - Secondary Color: #2196F3 (Blue)
   - Height: 1.7m

   **Window 2 (Player B)**:
   - Body Type: Robot 🤖
   - Primary Color: #FF5722 (Orange)
   - Secondary Color: #9C27B0 (Purple)
   - Height: 2.0m

   **Window 3 (Player C)**:
   - Body Type: Alien 👽
   - Primary Color: #00BCD4 (Cyan)
   - Secondary Color: #E91E63 (Pink)
   - Height: 1.5m

3. Click "Save Changes" in each window
4. Verify "✓ Saved!" message appears
5. Modal closes after 1.5 seconds

**Step 4: Verify Persistence**
1. Refresh each browser window (F5)
2. Click "🎭 Avatar" button again
3. Verify your customizations were saved:
   - Same body type selected
   - Same colors selected
   - Same height set

**Step 5: Test Live Preview**
1. Open avatar configurator
2. Make changes and watch 3D preview update instantly
3. Test all 5 body types
4. Test color picker + preset swatches
5. Test height slider (watch avatar scale)

**Step 6: Test Interactions**
1. Make changes, then click "Cancel"
2. Confirm dialog should appear
3. Click outside modal with unsaved changes
4. Confirm dialog should appear
5. Verify changes are not saved

### Option 2: Backend API Testing

If you want to test the backend avatar service:

**Start Avatar Service**:
```bash
cd /opt/git/graphwiz-xr/packages/services/reticulum/avatar
# Note: Requires Rust toolchain
cargo run
```

**Test API Endpoints**:
```bash
# Health check
curl http://localhost:4003/health

# Get default avatar
curl http://localhost:4003/avatars/default

# Create/update avatar (replace USER_ID)
curl -X PUT http://localhost:4003/avatars/user/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "body_type": "robot",
    "primary_color": "#FF5722",
    "height": 2.0
  }'

# Get user avatar
curl http://localhost:4003/avatars/user/USER_ID
```

## Testing Checklist

### Frontend Tests
- [ ] Avatar configurator opens from button
- [ ] All 5 body types display correctly in 3D preview
- [ ] Body type selection works (visual feedback)
- [ ] Primary color picker works
- [ ] Primary color presets work (15 swatches)
- [ ] Secondary color picker works
- [ ] Secondary color presets work (15 swatches)
- [ ] Height slider updates preview live
- [ ] Height value displays correctly
- [ ] Save button enables when changes made
- [ ] Save button shows loading state
- [ ] Save button shows success message
- [ ] Modal closes after successful save
- [ ] Cancel button closes modal
- [ ] Unsaved changes confirmation works
- [ ] Click-outside confirmation works
- [ ] Avatar persists after page refresh
- [ ] Multiple clients can customize simultaneously
- [ ] 3D preview rotates smoothly
- [ ] Orbit controls work (zoom, rotate, pan)

### Backend Tests (if service running)
- [ ] Health check returns 200
- [ ] Default avatar endpoint returns config
- [ ] User avatar endpoint returns config
- [ ] Update endpoint saves changes
- [ ] Custom model registration works

## Expected Results

### Successful Test Indicators

**Visual**:
- 3D avatar rotates smoothly in preview
- All 5 body types render correctly
- Color changes apply instantly
- Height scaling is visible
- Green border appears on selected items
- Hover effects work on all controls

**Functional**:
- Save persists across page refreshes
- Multiple users can customize independently
- Confirmation dialogs prevent accidental data loss
- Success feedback is clear
- No console errors

**Performance**:
- 3D preview maintains 60 FPS
- No lag when changing colors
- Save completes in < 1 second
- Modal opens instantly

## Known Behaviors

### Expected Limitations
1. **No Multi-user Avatar Sync**: Other users won't see your customized avatar yet (requires backend integration)
2. **No Custom Models**: Custom 3D model upload UI not implemented
3. **Single Save**: No undo/redo history
4. **Same Default**: All users start with default avatar until customized

### Browser Console
- **INFO**: Messages about avatar loading/saving
- **WARN**: Presence connection issues (expected if server not running)
- **ERROR**: Backend API errors (expected if avatar service not running)

## Troubleshooting

### Issue: Avatar button doesn't open modal
**Solution**: Check browser console for errors, verify build succeeded

### Issue: 3D preview doesn't show
**Solution**: Check if WebGL is available, try different browser

### Issue: Changes don't persist
**Solution**: Check localStorage, verify browser allows storage

### Issue: Multiple windows show same user
**Solution**: Hard refresh (Ctrl+Shift+R) in each window

### Issue: Backend errors
**Solution**: Avatar service is optional for frontend testing, persistence uses localStorage fallback

## Success Criteria

✅ **Test Passes If**:
- Avatar configurator opens in all windows
- Each window can customize independently
- Changes persist after refresh
- 3D preview works for all body types
- No console errors during normal operation

## Next Steps After Testing

1. **Pass**: Document as production-ready
2. **Fail**: Fix identified issues
3. **Enhancement**: Add requested features (undo/redo, presets, etc.)

---

**Testing Status**: Ready to test
**Services Running**: Hub Client (3000), Presence (4000)
**Avatar Backend**: Optional (localStorage fallback available)
