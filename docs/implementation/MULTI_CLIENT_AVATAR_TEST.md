# Multi-Client Avatar System Testing Guide

**Date**: 2026-01-02 06:01 UTC
**Goal**: Test avatar system with multiple simultaneous clients
**Site**: https://xr.graphwiz.ai

---

## Quick Start

### Step 1: Open Multiple Browser Windows

Open **3 separate browser windows** or **incognito/private windows** to:
```
https://xr.graphwiz.ai
```

**Tip**: Each window will get a different random user ID (Player-XXX)

### Step 2: Test Avatar Customization

In each window, customize the avatar differently:

#### Window 1 (Player A)
1. Click "🎭 Avatar" button (purple button in top-left)
2. Configure:
   - Body Type: Human 👤
   - Primary Color: #4CAF50 (Green)
   - Secondary Color: #2196F3 (Blue)
   - Height: 1.7m
3. Click "Save Changes"
4. Verify "✓ Saved!" message appears

#### Window 2 (Player B)
1. Click "🎭 Avatar" button
2. Configure:
   - Body Type: Robot 🤖
   - Primary Color: #FF5722 (Orange)
   - Secondary Color: #9C27B0 (Purple)
   - Height: 2.0m
3. Click "Save Changes"
4. Verify "✓ Saved!" message appears

#### Window 3 (Player C)
1. Click "🎭 Avatar" button
2. Configure:
   - Body Type: Alien 👽
   - Primary Color: #00BCD4 (Cyan)
   - Secondary Color: #E91E63 (Pink)
   - Height: 1.5m
3. Click "Save Changes"
4. Verify "✓ Saved!" message appears

### Step 3: Verify Persistence

1. **Refresh each window** (F5 or Ctrl+R)
2. Click "🎭 Avatar" button again
3. Verify customizations were saved:
   - Same body type selected
   - Same colors selected
   - Same height set
4. Click "Cancel" to close without changes

### Step 4: Test Live Preview

1. Open avatar configurator in any window
2. Make changes and watch 3D preview:
   - Change body type → Preview updates instantly
   - Change colors → Preview updates instantly
   - Adjust height slider → Avatar scales in real-time
3. Test orbit controls:
   - Click and drag to rotate
   - Scroll to zoom in/out
   - Right-click and drag to pan

---

## Testing Checklist

### Basic Functionality
- [ ] Open 3 browser windows to https://xr.graphwiz.ai
- [ ] Each window shows different "Player-XXX" name
- [ ] Avatar button visible in all windows
- [ ] Avatar configurator opens in all windows

### Customization Features
- [ ] Body type selection works (5 options)
- [ ] Primary color picker works
- [ ] Primary color presets work (15 swatches)
- [ ] Secondary color picker works
- [ ] Secondary color presets work (15 swatches)
- [ ] Height slider works (0.5m - 3.0m)
- [ ] Height value displays correctly

### 3D Preview
- [ ] 3D avatar renders in all windows
- [ ] All 5 body types display correctly
- [ ] Preview updates in real-time
- [ ] Orbit controls work (zoom, rotate, pan)
- [ ] Smooth rotation animation

### Save Functionality
- [ ] Save button enables when changes made
- [ ] Save button shows loading state
- [ ] Save button shows success message ("✓ Saved!")
- [ ] Modal closes after successful save (1.5s delay)

### Persistence
- [ ] Changes persist after page refresh
- [ ] Each window maintains separate avatar config
- [ ] Local storage fallback works (if backend unavailable)

### User Experience
- [ ] Hover effects work on all controls
- [ ] Green border appears on selected items
- [ ] Cancel button closes modal
- [ ] Unsaved changes confirmation works
- [ ] Click-outside confirmation works
- [ ] No console errors during normal operation

### Multi-Client
- [ ] Each client can customize independently
- [ ] No conflicts between multiple clients
- [ ] Changes in one window don't affect others
- [ ] All windows remain responsive

---

## Known Behaviors

### Expected Limitations
1. **No Multi-user Avatar Sync**: Other users won't see your customized avatar in the 3D scene yet (requires backend integration with presence system)
2. **LocalStorage Fallback**: If avatar backend is unavailable, changes save to browser localStorage
3. **Same Default**: All users start with default avatar until customized

### Expected Behaviors
1. **Independent Customization**: Each window maintains its own avatar configuration
2. **Instant Preview**: 3D preview updates immediately when changing settings
3. **Smooth Animations**: Avatar rotates smoothly in preview
4. **Responsive UI**: Modal adapts to different screen sizes

---

## Advanced Testing

### Test All 5 Body Types

For each body type, verify:
1. **Human 👤**:
   - Head (Sphere) renders correctly
   - Body (Cylinder) renders correctly
   - Limbs (Cylinders) render correctly
   - Colors apply correctly

2. **Robot 🤖**:
   - Blocky head (Box) renders correctly
   - Body (Box) renders correctly
   - Limbs (Cylinders) render correctly
   - Antenna (Cylinder + Sphere) renders correctly

3. **Alien 👽**:
   - Large head (Sphere) renders correctly
   - Body (Cylinder) renders correctly
   - Multiple eyes (Spheres) render correctly
   - Colors apply correctly

4. **Animal 🐾**:
   - Animal head (Box + Cone ears) renders correctly
   - Body (Cylinder) renders correctly
   - Tail (Cone) renders correctly
   - Colors apply correctly

5. **Abstract 🎨**:
   - Geometric shapes render correctly
   - Icosahedron body renders correctly
   - Torus rings render correctly
   - Colors apply correctly

### Test Color Combinations

Try these color combinations:
1. **Primary**: #4CAF50 (Green) / **Secondary**: #2196F3 (Blue)
2. **Primary**: #FF5722 (Orange) / **Secondary**: #9C27B0 (Purple)
3. **Primary**: #F44336 (Red) / **Secondary**: #FFEB3B (Yellow)
4. **Primary**: #00BCD4 (Cyan) / **Secondary**: #E91E63 (Pink)
5. **Primary**: #FF9800 (Amber) / **Secondary**: #795548 (Brown)

### Test Height Values

Test these heights and verify avatar scales correctly:
- **Minimum**: 0.5m (very small)
- **Default**: 1.7m (average human)
- **Maximum**: 3.0m (very tall)
- **Custom**: 2.2m (tall but not max)

---

## Performance Testing

### Check Rendering Performance

1. Open browser DevTools (F12)
2. Go to Performance tab
3. Start recording
4. Open avatar configurator
5. Make several changes
6. Stop recording
7. Verify:
   - Frame rate stays above 30 FPS
   - No dropped frames
   - Smooth animations

### Check Memory Usage

1. Open browser DevTools (F12)
2. Go to Memory tab
3. Take heap snapshot before opening configurator
4. Open and use avatar configurator
5. Take heap snapshot after
6. Verify:
   - Memory increase is reasonable (< 50MB)
   - No memory leaks
   - Memory releases after closing modal

---

## Console Error Checking

### Open Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors while:
   - Opening avatar configurator
   - Changing settings
   - Saving changes
   - Closing modal
   - Refreshing page

### Expected Console Output

**Normal INFO messages**:
- `[App] Avatar saved:` - When avatar is saved successfully

**No ERROR messages** during normal operation

**Acceptable WARN messages**:
- WebSocket connection warnings (if presence service unavailable)
- API warnings (if avatar backend unavailable)

---

## Troubleshooting

### Issue: Avatar button doesn't open modal
**Solution**:
1. Check browser console for errors
2. Verify page fully loaded
3. Try refreshing the page

### Issue: 3D preview doesn't show
**Solution**:
1. Check if WebGL is available
2. Try a different browser
3. Check browser console for Three.js errors

### Issue: Changes don't persist
**Solution**:
1. Check localStorage in DevTools
2. Verify browser allows storage
3. Check if avatar backend is running

### Issue: Multiple windows show same user
**Solution**:
1. Hard refresh each window (Ctrl+Shift+R)
2. Use incognito/private windows
3. Clear browser cache

### Issue: Save button doesn't work
**Solution**:
1. Check browser console for errors
2. Verify avatar backend is accessible
3. Check network tab in DevTools

---

## Testing with Backend

If avatar backend is running, test:

### API Endpoints

```bash
# Health check
curl https://xr.graphwiz.ai/api/health

# Get default avatar
curl https://xr.graphwiz.ai/api/avatars/default

# Get user avatar (replace USER_ID)
curl https://xr.graphwiz.ai/api/avatars/user/USER_ID

# Update avatar (replace USER_ID)
curl -X PUT https://xr.graphwiz.ai/api/avatars/user/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "body_type": "robot",
    "primary_color": "#FF5722",
    "height": 2.0
  }'
```

### Backend Testing

1. Check if avatar service is running:
```bash
docker ps --filter "name=avatar"
```

2. Check avatar service logs:
```bash
docker logs <avatar-container-name>
```

---

## Success Criteria

✅ **Test Passes If**:
- All 3 windows can open avatar configurator
- Each window can customize independently
- All 5 body types work in 3D preview
- Color pickers work (input + presets)
- Height slider works with correct scaling
- Save works in all windows
- Changes persist after refresh in each window
- No console errors during normal operation
- Performance stays above 30 FPS

---

## Next Steps After Testing

### If Tests Pass
1. Document as production-ready
2. Create user guide for avatar customization
3. Add preset avatars for quick selection
4. Implement multi-user avatar sync in 3D scene

### If Tests Fail
1. Document specific failures
2. Check browser console for errors
3. Verify backend API endpoints
4. Fix identified issues
5. Retest after fixes

---

## Test Report Template

After testing, fill out this report:

**Test Date**: ___________
**Tester**: ___________
**Browsers Used**: ___________

### Results
- [ ] All windows opened successfully
- [ ] Avatar configurator opened in all windows
- [ ] All 5 body types tested
- [ ] Color customization tested
- [ ] Height adjustment tested
- [ ] Save functionality tested
- [ ] Persistence verified
- [ ] No console errors

### Issues Found
1. ___________
2. ___________
3. ___________

### Performance
- Frame Rate: _____ FPS
- Memory Usage: _____ MB
- Load Time: _____ seconds

### Overall Assessment
- [ ] Pass
- [ ] Fail
- [ ] Pass with Minor Issues

---

**Testing Status**: Ready to Test
**Site**: https://xr.graphwiz.ai
**Avatar Backend**: Optional (localStorage fallback available)

**END OF TESTING GUIDE**
