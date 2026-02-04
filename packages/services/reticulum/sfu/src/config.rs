//! SFU Configuration

use serde::{Deserialize, Serialize};

/// SFU-specific configuration
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SfuConfig {
    /// Maximum number of concurrent rooms
    pub max_rooms: usize,

    /// Maximum peers per room
    pub max_peers_per_room: usize,

    /// Maximum video tracks per peer
    pub max_video_tracks: usize,

    /// Maximum audio tracks per peer
    pub max_audio_tracks: usize,

    /// Enable simulcast for adaptive quality
    pub enable_simulcast: bool,

    /// Enable SVC (Scalable Video Coding) support
    pub enable_svc: bool,

    /// RTP port range start
    pub rtp_port_range_start: u16,

    /// RTP port range end
    pub rtp_port_range_end: u16,

    /// ICE server URLs
    pub ice_servers: Vec<IceServer>,

    /// Maximum bitrate for video (in bps)
    pub max_video_bitrate: u32,

    /// Minimum bitrate for video (in bps)
    pub min_video_bitrate: u32,

    /// Bitrate for audio (in bps)
    pub audio_bitrate: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IceServer {
    pub urls: Vec<String>,
    pub username: Option<String>,
    pub credential: Option<String>,
}

impl Default for SfuConfig {
    fn default() -> Self {
        Self {
            max_rooms: 100,
            max_peers_per_room: 50,
            max_video_tracks: 4,
            max_audio_tracks: 2,
            enable_simulcast: true,
            enable_svc: false, // SVC is less widely supported
            rtp_port_range_start: 10000,
            rtp_port_range_end: 20000,
            ice_servers: vec![],
            max_video_bitrate: 3_000_000, // 3 Mbps
            min_video_bitrate: 300_000,   // 300 kbps
            audio_bitrate: 64_000,        // 64 kbps
        }
    }
}
