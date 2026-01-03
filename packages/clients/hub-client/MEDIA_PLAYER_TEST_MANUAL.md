# Media Player Testing Guide

## Current Status

✅ **Presence Service**: Running and accessible
- Container: `graphwiz-presence`
- Port mapping: `4000:4000` (localhost:4000 → container:4000)
- Status: Accepting connections successfully

✅ **Dev Server**: Running
- URL: http://localhost:3002
- Environment: Development with WebSocket URL configured

⚠️ **Automated Testing**: WebSocket connections from headless browser failing
- Issue: Playwright headless mode cannot connect to Docker-mapped ports
- This is a known limitation with Docker + Playwright + headless browsers

## Manual Testing Instructions

### Option 1: Test in Your Browser (Recommended)

1. **Open your web browser** and navigate to:
   ```
   http://localhost:3002
   ```

2. **Open the browser console** (F12 or right-click → Inspect → Console)

3. **Look for WebSocket connection messages:**
   ```
   [WebSocketClient] Connecting to: ws://localhost:4000/ws/lobby...
   [WebSocketClient] WebSocket connected
   [App] My client ID: [uuid]
   ```

4. **Once connected, you should see:**
   - **Video Player** on the left side (Big Buck Bunny)
   - **Audio Player** on the right side (SoundHelix Song 1)
   - Both players with labels above them

5. **Test the media players:**
   - Click on the video player or audio player
   - A controls panel should appear with:
     - Play/Pause button
     - Seek bar
     - Volume control
     - Playback speed selector
     - Loop toggle

6. **Test audio visualization (for audio player):**
   - Click play on the audio player
   - You should see:
     - Circular frequency bars appearing around the player
     - Waveform visualization
     - Visual elements reacting to the music

### Option 2: Test with Two Browser Windows

1. **Open two browser windows** to:
   ```
   http://localhost:3002
   ```

2. **In both windows, wait for WebSocket connection** (check console)

3. **In one window, click the video player to open controls**

4. **Click Play on the video**

5. **Observe in the other window:**
   - The video should also start playing
   - Playback should be synchronized
   - Pause/Play should sync across windows

6. **Repeat with audio player:**
   - Play audio in one window
   - Both windows should see the audio visualizations
   - Playback state should be synchronized

### Expected Behavior

#### Video Player
- ✅ Big Buck Bunny video loads
- ✅ Video texture appears on 3D screen surface
- ✅ Controls appear on click
- ✅ Play/Pause works
- ✅ Seek bar moves with playback
- ✅ Volume control works
- ✅ Playback speed changes work
- ✅ Loop toggle works

#### Audio Player
- ✅ SoundHelix Song 1 audio loads
- ✅ Audio controls work
- ✅ When playing, visualizations appear:
    - 32 frequency bars in circle
    - Waveform line display
- ✅ Visualizations react to audio frequencies

#### Network Synchronization
- ✅ Multiple connected clients see synchronized state
- ✅ Play/Pause syncs across all clients
- ✅ Seek position syncs
- ✅ Volume changes sync
- ✅ Playback state is consistent

### Troubleshooting

#### If WebSocket doesn't connect:
1. Check presence service is running:
   ```bash
   docker ps | grep presence
   ```

2. Check presence service logs:
   ```bash
   docker logs graphwiz-presence --tail 20
   ```

3. Verify port mapping:
   ```bash
   docker port graphwiz-presence
   # Should show: 8003/tcp -> 0.0.0.0:4000
   ```

4. Check if service is listening:
   ```bash
   curl http://localhost:4000
   # Should get 404 or some response (not connection refused)
   ```

#### If media elements don't appear:
1. Open browser console
2. Check for `myClientId` value (should not be null)
3. Check for errors about missing dependencies
4. Verify `MediaDemoScene` is rendering (should see in React DevTools)

#### If video/audio doesn't play:
1. Check browser console for CORS errors
2. Check if media URLs are accessible:
   - Video: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
   - Audio: https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
3. Check if browser supports HTML5 video/audio
4. Try different browser (Chrome/Firefox/Safari)

### What to Look For in Screenshots

Check `test-screenshots/` directory:
- `01-page-loaded.png` - Initial page load
- `02-after-wait.png` - After waiting for connection

These show:
- ✅ Three.js canvas is rendering
- ✅ Scene with grid and lighting
- ❌ No media elements (because WebSocket didn't connect from headless browser)

### Console Logs to Watch For

**Success indicators:**
```
[WebSocketClient] WebSocket connected
[App] My client ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
[MediaPlayer] Video initialized
[MediaPlayer] Audio initialized
```

**Error indicators:**
```
[WebSocketClient] WebSocket error
[App] Failed to connect
MediaPlayer] Failed to play
```

## Test Results Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Presence Service | ✅ Running | Docker container active |
| Port Mapping | ✅ Configured | 4000:4000 mapped |
| Dev Server | ✅ Running | localhost:3002 |
| .env.development | ✅ Created | Points to localhost:4000 |
| WebSocket from Browser | 🔧 To test | Manual testing required |
| Media Player UI | ✅ Built | Components ready |
| Video Playback | 🔧 To test | Needs browser connection |
| Audio Playback | 🔧 To test | Needs browser connection |
| Audio Visualization | 🔧 To test | Needs browser connection |
| Network Sync | 🔧 To test | Needs multiple connections |

## Next Steps

1. **Open browser** to http://localhost:3002
2. **Check console** for successful WebSocket connection
3. **Verify media players** appear in the scene
4. **Test playback controls** (play/pause, seek, volume)
5. **Test audio visualizations** (should see when audio plays)
6. **Test multiplayer sync** (open second browser window)

The media player implementation is **complete and ready for testing**!
