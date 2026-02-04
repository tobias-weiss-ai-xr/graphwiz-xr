# Voice Chat System for GraphWiz-XR

Complete WebRTC-based voice chat with spatial audio positioning and voice activity detection.

## Features

### ✅ Implemented

- **WebRTC Audio Streaming**
  - Microphone capture with echo/noise cancellation
  - Opus codec for high-quality audio
  - SFU integration for multi-user voice
  - Automatic bitrate adaptation

- **Spatial Audio**
  - 3D positional audio (HRTF)
  - Distance-based attenuation
  - Real-time position updates
  - Per-user volume control

- **Voice Activity Detection (VAD)**
  - Automatic speaking detection
  - Configurable threshold
  - Speaking indicators

- **Controls**
  - Mute/unmute microphone
  - Push-to-talk support
  - Volume control per user
  - Haptic feedback on mute

- **ECS Integration**
  - `VoiceParticipantComponent` - Remote users
  - `VoiceLocalComponent` - Local player
  - `VoiceSystem` - Update system

## Quick Start

### Basic Setup

```typescript
import { VoiceChatClient } from '@graphwiz-xr/hub-client/voice';

const voiceClient = new VoiceChatClient({
  sfuUrl: 'http://localhost:8014',
  roomId: 'room-1',
  userId: 'user-123',
  authToken: 'your-token',
});

// Connect to SFU
await voiceClient.connect();

// Mute/unmute
voiceClient.setMuted(true);
voiceClient.setMuted(false);

// Check stats
const stats = voiceClient.getStats();
console.log(stats.audioLevel); // 0-1
console.log(stats.isSpeaking);  // boolean

// Disconnect
await voiceClient.disconnect();
```

### With ECS and Spatial Audio

```typescript
import { VoiceChatClient, VoiceSystem } from '@graphwiz-xr/hub-client/voice';
import { Engine } from '@graphwiz-xr/hub-client/core';

const engine = new Engine();
const voiceClient = new VoiceChatClient({
  sfuUrl: 'http://localhost:8014',
  roomId: 'room-1',
  userId: 'user-1',
  authToken: 'token',
});

await voiceClient.connect();

const voiceSystem = new VoiceSystem(voiceClient, {
  maxDistance: 10,
  spatialAudioEnabled: true,
  voiceActivityEnabled: true,
});

engine.addSystem(voiceSystem);
engine.start();

// Participants get spatial audio automatically based on their position
```

## API Reference

### VoiceChatClient

Main class for WebRTC voice chat.

#### Constructor

```typescript
const client = new VoiceChatClient({
  sfuUrl: string,              // SFU service URL
  roomId: string,               // Room ID
  userId: string,               // Your user ID
  authToken: string,            // Auth token
  audioConstraints?: {          // Optional audio config
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 1,
  },
});
```

#### Methods

##### `connect(): Promise<void>`

Connect to SFU and start streaming audio.

##### `disconnect(): Promise<void>`

Stop streaming and cleanup.

##### `setMuted(muted: boolean): void`

Mute/unmute microphone.

##### `toggleMute(): boolean`

Toggle mute state, returns new state.

##### `setRemoteVolume(userId, volume): void`

Set volume (0-1) for remote user.

##### `setRemotePosition(userId, position): void`

Update spatial position for remote user's audio.

##### `getStats(): VoiceChatStats`

Get connection statistics.

##### `isConnected(): boolean`

Check if connected.

##### `isMuted(): boolean`

Check if muted.

##### `isUserSpeaking(): boolean`

Check if you're currently speaking.

##### `setVoiceActivityThreshold(threshold): void`

Set VAD threshold (0-1).

#### Events

- `connected` - Successfully connected
- `disconnected` - Disconnected from SFU
- `error` (error) - Connection error
- `dataChannelOpen` - Signaling channel ready
- `userJoined` (userId) - Remote user joined
- `startedSpeaking` - You started speaking
- `stoppedSpeaking` - You stopped speaking

### VoiceSystem

ECS system for voice chat integration.

#### Constructor

```typescript
const system = new VoiceSystem(voiceClient, {
  maxDistance: 10,              // Max hearing distance (meters)
  spatialAudioEnabled: true,     // Enable 3D positioning
  voiceActivityEnabled: true,    // Enable VAD
});
```

#### Methods

##### `setMuted(muted: boolean)`

Mute/unmute locally.

##### `toggleMute(): boolean`

Toggle mute.

##### `getParticipants(): string[]`

Get list of participant user IDs.

##### `getParticipantEntityId(userId): string`

Get entity ID for a participant.

##### `setParticipantVolume(userId, volume)`

Set volume for a participant (0-1).

##### `isLocalUserSpeaking(): boolean`

Check if you're speaking.

#### Events

- `voiceParticipantCreated` (entityId, userId)
- `localVoiceEntityCreated` (entityId)
- `localUserStartedSpeaking` (entityId)
- `localUserStoppedSpeaking` (entityId)
- `userStartedSpeaking` (userId, entityId)
- `userStoppedSpeaking` (userId, entityId)

### Components

#### VoiceParticipantComponent

Attached to entities representing remote users.

```typescript
const participant = new VoiceParticipantComponent(userId);
entity.addComponent(VoiceParticipantComponent, participant);
```

#### VoiceLocalComponent

Attached to local player entity.

```typescript
const localVoice = new VoiceLocalComponent({
  pushToTalk: false,
  voiceActivityDetection: true,
});
entity.addComponent(VoiceLocalComponent, localVoice);
```

## Usage Patterns

### Push-to-Talk

```typescript
// Keyboard push-to-talk
let pttActive = false;

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !pttActive) {
    voiceClient.setMuted(false);
    pttActive = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'Space' && pttActive) {
    voiceClient.setMuted(true);
    pttActive = false;
  }
});

// VR controller push-to-talk
xrInputManager.on('gripPressed', (controllerId) => {
  if (controllerId === 'right') {
    voiceClient.setMuted(false);
  }
});

xrInputManager.on('gripReleased', (controllerId) => {
  if (controllerId === 'right') {
    voiceClient.setMuted(true);
  }
});
```

### Per-User Volume Control

```typescript
// Mute annoying user
voiceSystem.setParticipantVolume('loud-user', 0);

// Set volume to 50%
voiceSystem.setParticipantVolume('friend', 0.5);

// Unmute (full volume)
voiceSystem.setParticipantVolume('friend', 1.0);
```

### Voice Activity Indicators

```typescript
// Show speaking indicator
voiceSystem.on('userStartedSpeaking', (userId, entityId) => {
  const indicator = document.getElementById(`indicator-${userId}`);
  if (indicator) {
    indicator.style.display = 'block';
    indicator.classList.add('speaking');
  }
});

voiceSystem.on('userStoppedSpeaking', (userId, entityId) => {
  const indicator = document.getElementById(`indicator-${userId}`);
  if (indicator) {
    indicator.style.display = 'none';
    indicator.classList.remove('speaking');
  }
});
```

## Spatial Audio

Voice chat uses Web Audio API's `PannerNode` for spatial positioning:

- **HRTF** - Head-related transfer function for realistic 3D audio
- **Distance Attenuation** - Volume decreases with distance
- **Cone of Direction** - Sound comes from user's position
- **Rolloff** - Configurable distance model

### Spatial Audio Configuration

```typescript
const voiceSystem = new VoiceSystem(voiceClient, {
  maxDistance: 10,              // Max hearing distance
  spatialAudioEnabled: true,    // Enable spatial audio
});
```

### Performance

Spatial audio is hardware-accelerated in most browsers:
- Chrome: ✅ Hardware accelerated
- Firefox: ✅ Hardware accelerated
- Safari: ✅ Supported
- Quest Browser: ✅ Supported

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| getUserMedia | ✅ | ✅ | ✅ | ✅ |
| RTCPeerConnection | ✅ | ✅ | ✅ | ✅ |
| Spatial Audio | ✅ | ✅ | ✅ | ✅ |
| Opus Codec | ✅ | ✅ | ✅ | ✅ |
| HRTF | ✅ | ✅ | ⚠️ Partial | ✅ |

## Audio Quality

### Default Settings

- **Sample Rate**: 48 kHz
- **Channels**: 1 (mono)
- **Codec**: Opus
- **Bitrate**: Adaptive (24-64 kbps)
- **Frame Size**: 20ms

### Quality vs Bandwidth

| Quality | Bitrate | Usage/hr (approx) |
|---------|---------|------------------|
| Low | 24 kbps | ~10 MB |
| Medium | 32 kbps | ~14 MB |
| High | 64 kbps | ~28 MB |

## Performance

### CPU Usage

- **Audio Capture**: ~2-3%
- **Audio Playback (per user)**: ~1-2%
- **Spatial Audio**: ~5-10% total
- **VAD**: ~1%

### Memory

- **Per Audio Stream**: ~500 KB
- **Spatial Audio (per user)**: ~200 KB
- **Total (10 users)**: ~7 MB

## Troubleshooting

### Microphone Not Working

**Problem**: Can't hear yourself or others

**Solutions**:
1. Check browser permissions
2. Ensure microphone is not muted in OS
3. Check `voiceClient.isConnected()`
4. Look for errors in browser console

### No Sound From Others

**Problem**: Connected but can't hear others

**Solutions**:
1. Check system volume
2. Verify SFU is running
3. Check `getParticipants()` has users
4. Ensure spatial audio is within range (< 10m)

### Poor Audio Quality

**Problem**: Choppy or robotic audio

**Solutions**:
1. Check network connection
2. Check bandwidth usage
3. Try lower sample rate: `audioConstraints: { sampleRate: 24000 }`
4. Check SFU metrics for packet loss

### Echo

**Problem**: Hear yourself through others

**Solutions**:
1. Enable echo cancellation (default)
2. Use headphones
3. Check other users' audio setup

## React Integration

```typescript
import { createVoiceChatHook } from '@graphwiz-xr/hub-client/voice/example';

function VoiceChatComponent() {
  const { isConnected, isMuted, participants, toggleMute } = createVoiceChatHook({
    sfuUrl: 'http://localhost:8014',
    roomId: 'room-1',
    userId: 'user-1',
    authToken: token,
  })();

  return (
    <div>
      <button onClick={toggleMute}>
        {isMuted ? '🔇 Unmute' : '🎤 Mute'}
      </button>
      <div>Connected: {isConnected ? '✓' : '✗'}</div>
      <div>Participants: {participants.length}</div>
      <ul>
        {participants.map(id => <li key={id}>{id}</li>)}
      </ul>
    </div>
  );
}
```

## Examples

See `example.ts` for:
1. Basic voice chat setup
2. ECS integration
3. Push-to-talk
4. Spatial audio
5. Volume control
6. Voice activity detection
7. React integration

## Security & Privacy

### Permissions

Voice chat requires microphone permission:
```javascript
const permission = await navigator.permissions.query({ name: 'microphone' });
console.log('Microphone permission:', permission.state);
```

### Privacy

- Audio is processed locally before streaming
- Only audio is sent (no video unless requested)
- SFU routes audio peer-to-peer
- Audio is encrypted (DTLS/SRTP)

### Best Practices

1. **Always ask for permission** before connecting
2. **Provide mute controls** - users should control their mic
3. **Show speaking indicator** - visual feedback
4. **Handle errors gracefully** - network issues, permissions
5. **Test bandwidth** - warn users on poor connections

## Advanced Features

### Custom Audio Processing

```typescript
// Create custom audio processing
const audioContext = new AudioContext();

// Add noise gate
const noiseGate = audioContext.createGain();
noiseGate.gain.value = 0; // Starts muted

// Process audio before sending
// (advanced - requires Web Audio worklet)
```

### Recording

```typescript
// Record voice chat (with consent!)
const mediaRecorder = new MediaRecorder(remoteStream);

mediaRecorder.ondataavailable = (event) => {
  if (event.data.size > 0) {
    // Save chunk
    chunks.push(event.data);
  }
};

mediaRecorder.start();
```

## Future Enhancements

- [ ] Advanced noise suppression
- [ ] Audio level normalization
- [ ] Priority speaker (louder for important people)
- [ ] Audio recording/playback
- [ ] Sound effects (join, leave, mute)
- [ ] Multiple audio channels
- [ ] Language translation

## License

MIT
