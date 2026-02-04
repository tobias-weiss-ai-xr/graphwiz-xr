# SFU (Selective Forwarding Unit) Service

The SFU service handles WebRTC media forwarding for video/audio streaming in GraphWiz-XR.

## Architecture

The SFU implements a Selective Forwarding Unit architecture:
- Each peer sends a single media stream to the SFU
- The SFU selectively forwards streams to other peers
- Supports simulcast for adaptive quality
- Manages ICE candidates and WebRTC signaling

## Features

### Core Features
- **Room Management**: Create and manage virtual rooms for peers
- **Peer Connection**: Handle WebRTC peer connections with SDP offer/answer
- **RTP/RTCP Forwarding**: Efficient media packet forwarding
- **ICE Handling**: ICE candidate exchange for NAT traversal
- **Simulcast Support**: Adaptive quality based on bandwidth

### Scalability
- Configurable maximum rooms (default: 100)
- Configurable maximum peers per room (default: 50)
- Efficient RTP forwarding with minimal overhead

## API Endpoints

### Room Management

#### Create Room
```http
POST /api/v1/rooms
Content-Type: application/json

{
  "room_id": "room-123",
  "name": "My Room"
}
```

#### List Rooms
```http
GET /api/v1/rooms
```

#### Get Room Info
```http
GET /api/v1/rooms/{room_id}
```

#### Get Room Statistics
```http
GET /api/v1/rooms/stats
```

### Peer Connections

#### Join Room
```http
POST /api/v1/peers/join
Content-Type: application/json

{
  "room_id": "room-123",
  "display_name": "John Doe",
  "user_id": "user-123"
}
```

Response:
```json
{
  "peer_id": "peer-abc-123",
  "room_id": "room-123",
  "ice_servers": [...]
}
```

#### Handle Offer
```http
POST /api/v1/peers/offer
Content-Type: application/json

{
  "peer_id": "peer-abc-123",
  "room_id": "room-123",
  "offer": {
    "sdp": "v=0\r\n...",
    "sdp_type": "offer"
  }
}
```

Response:
```json
{
  "answer": {
    "sdp": "v=0\r\n...",
    "sdp_type": "answer"
  }
}
```

#### Handle ICE Candidate
```http
POST /api/v1/peers/ice
Content-Type: application/json

{
  "peer_id": "peer-abc-123",
  "room_id": "room-123",
  "candidate": {
    "candidate": "candidate:1 1 UDP 2130706431 192.168.1.1 54400 typ host",
    "sdp_mid": "0",
    "sdp_mline_index": 0
  }
}
```

#### Add Track
```http
POST /api/v1/peers/track
Content-Type: application/json

{
  "peer_id": "peer-abc-123",
  "room_id": "room-123",
  "track_id": "track-video-1",
  "kind": "video",
  "simulcast": true
}
```

#### Leave Room
```http
DELETE /api/v1/peers/{room_id}/{peer_id}
```

### Health

#### Health Check
```http
GET /api/v1/health
```

Response:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "uptime": 1703740800
}
```

## Configuration

### SfuConfig

```rust
pub struct SfuConfig {
    pub max_rooms: usize,                    // Default: 100
    pub max_peers_per_room: usize,           // Default: 50
    pub max_video_tracks: usize,             // Default: 4
    pub max_audio_tracks: usize,             // Default: 2
    pub enable_simulcast: bool,              // Default: true
    pub enable_svc: bool,                    // Default: false
    pub rtp_port_range_start: u16,           // Default: 10000
    pub rtp_port_range_end: u16,             // Default: 20000
    pub ice_servers: Vec<IceServer>,         // ICE servers
    pub max_video_bitrate: u32,              // Default: 3 Mbps
    pub min_video_bitrate: u32,              // Default: 300 kbps
    pub audio_bitrate: u32,                  // Default: 64 kbps
}
```

## Usage Example

```rust
use reticulum_sfu::{SfuService, SfuConfig};
use reticulum_core::Config;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let config = Config::default();
    let sfu_config = SfuConfig::default();

    let sfu_service = SfuService::new(config, sfu_config);
    sfu_service.run().await
}
```

## WebRTC Integration

The SFU integrates with the presence service for signaling:
1. Client connects via WebSocket to presence service
2. Client joins room via SFU REST API
3. Client sends SDP offer via SFU
4. SFU returns SDP answer
5. ICE candidates exchanged via SFU
6. Media flows through SFU using RTP forwarding

## RTP Packet Format

The SFU handles standard RTP packets:
- Version 2
- Supports RTP extensions
- Handles CSRC lists
- Supports padding

## Simulcast

Simulcast allows sending multiple quality layers:
- **Spatial Layers**: Low, Medium, High resolution
- **Temporal Layers**: Low, Medium, High framerate

The SFU can select the optimal layer based on:
- Available bandwidth
- Receiver capabilities
- Network conditions

## Performance Targets

- P50 latency: < 10ms
- P99 latency: < 50ms
- CPU usage: < 50% at full capacity
- Memory: < 2GB per room

## Testing

```bash
# Run tests
cargo test -p reticulum-sfu

# Run with logging
RUST_LOG=debug cargo run -p reticulum-sfu
```

## Future Enhancements

- [ ] WebTransport support
- [ ] SVC (Scalable Video Coding)
- [ ] Recording
- [ ] Screen sharing optimization
- [ ] Bandwidth estimation
- [ ] Congestion control
