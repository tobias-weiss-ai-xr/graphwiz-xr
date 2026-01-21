//! WebRTC Peer Connection Management

use super::{config::SfuConfig, error::{SfuError, SfuResult}, rtp::RtpPacket};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Represents a media track
#[derive(Clone, Debug)]
pub struct MediaTrack {
    pub id: String,
    pub kind: MediaKind,
    pub peer_id: String,
    pub simulcast: bool,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum MediaKind {
    Audio,
    Video,
}

/// SFU Peer - represents a connected client
pub struct SfuPeer {
    pub id: String,
    pub room_id: String,
    pub display_name: String,
    pub connection: Arc<RwLock<PeerConnection>>,
    pub tracks: Arc<RwLock<HashMap<String, MediaTrack>>>,
    pub metadata: PeerMetadata,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PeerMetadata {
    pub user_id: String,
    pub display_name: String,
    pub avatar_url: Option<String>,
    pub joined_at: i64,
}

impl SfuPeer {
    pub fn new(id: String, room_id: String, display_name: String, config: &SfuConfig) -> Self {
        Self {
            id: id.clone(),
            room_id,
            display_name: display_name.clone(),
            connection: Arc::new(RwLock::new(PeerConnection::new(id.clone(), config))),
            tracks: Arc::new(RwLock::new(HashMap::new())),
            metadata: PeerMetadata {
                user_id: id.clone(),
                display_name,
                avatar_url: None,
                joined_at: chrono::Utc::now().timestamp(),
            },
        }
    }

    /// Add a track to this peer
    pub async fn add_track(&self, track: MediaTrack) -> SfuResult<()> {
        let mut tracks = self.tracks.write().await;
        tracks.insert(track.id.clone(), track);
        Ok(())
    }

    /// Remove a track from this peer
    pub async fn remove_track(&self, track_id: &str) -> SfuResult<()> {
        let mut tracks = self.tracks.write().await;
        tracks.remove(track_id)
            .ok_or_else(|| SfuError::TrackError(format!("Track not found: {}", track_id)))?;
        Ok(())
    }

    /// Get all tracks for this peer
    pub async fn get_tracks(&self) -> Vec<MediaTrack> {
        self.tracks.read().await.values().cloned().collect()
    }

    /// Send RTP packet to this peer
    pub async fn send_rtp(&self, packet: RtpPacket) -> SfuResult<()> {
        let conn = self.connection.read().await;
        conn.send_rtp(packet).await
    }

    /// Handle incoming RTP packet from this peer
    pub async fn on_rtp(&self, packet: RtpPacket) -> SfuResult<()> {
        let conn = self.connection.read().await;
        conn.handle_rtp(packet).await
    }
}

/// Simplified Peer Connection representation
/// In production, this would wrap webrtc::RTCPeerConnection
pub struct PeerConnection {
    pub peer_id: String,
    pub local_description: Option<String>,
    pub remote_description: Option<String>,
    pub state: PeerConnectionState,
    pub ice_candidates: Vec<IceCandidate>,
    pub config: SfuConfig,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PeerConnectionState {
    New,
    Connecting,
    Connected,
    Disconnected,
    Failed,
    Closed,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IceCandidate {
    pub candidate: String,
    pub sdp_mid: String,
    pub sdp_mline_index: u16,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SessionDescription {
    pub sdp: String,
    pub sdp_type: SdpType,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SdpType {
    Offer,
    Answer,
    Rollback,
}

impl PeerConnection {
    pub fn new(peer_id: String, config: &SfuConfig) -> Self {
        Self {
            peer_id,
            local_description: None,
            remote_description: None,
            state: PeerConnectionState::New,
            ice_candidates: Vec::new(),
            config: config.clone(),
        }
    }

    /// Set remote description (SDP offer/answer)
    pub async fn set_remote_description(&mut self, sdp: &SessionDescription) -> SfuResult<()> {
        if !sdp.sdp.starts_with("v=") {
            return Err(SfuError::InvalidSdp("Invalid SDP format".to_string()));
        }

        self.remote_description = Some(sdp.sdp.clone());
        self.state = PeerConnectionState::Connecting;

        log::debug!("Set remote description for peer {}", self.peer_id);
        Ok(())
    }

    /// Create and set local description (SDP offer/answer)
    pub async fn create_answer(&mut self) -> SfuResult<SessionDescription> {
        if self.remote_description.is_none() {
            return Err(SfuError::InvalidSdp(
                "Remote description not set".to_string(),
            ));
        }

        // In production, this would create an answer using webrtc crate
        let sdp = self.generate_sfu_answer_sdp().await?;

        self.local_description = Some(sdp.clone());
        self.state = PeerConnectionState::Connected;

        Ok(SessionDescription {
            sdp,
            sdp_type: SdpType::Answer,
        })
    }

    /// Add ICE candidate
    pub async fn add_ice_candidate(&mut self, candidate: IceCandidate) -> SfuResult<()> {
        self.ice_candidates.push(candidate);
        log::debug!("Added ICE candidate for peer {}", self.peer_id);
        Ok(())
    }

    /// Send RTP packet
    pub async fn send_rtp(&self, _packet: RtpPacket) -> SfuResult<()> {
        // In production, this would send via webrtc::RTCRtpSender
        Ok(())
    }

    /// Handle incoming RTP packet
    pub async fn handle_rtp(&self, packet: RtpPacket) -> SfuResult<()> {
        log::trace!("Received RTP packet from peer {}, SSRC: {}", self.peer_id, packet.header.ssrc);
        Ok(())
    }

    /// Close the peer connection
    pub async fn close(&mut self) -> SfuResult<()> {
        self.state = PeerConnectionState::Closed;
        log::info!("Closed peer connection {}", self.peer_id);
        Ok(())
    }

    /// Generate SFU answer SDP (simplified - production would use webrtc crate)
    async fn generate_sfu_answer_sdp(&self) -> SfuResult<String> {
        let _remote_sdp = self.remote_description.as_ref().ok_or_else(|| {
            SfuError::InvalidSdp("Remote description not set".to_string())
        })?;

        // Generate unique ICE credentials from UUIDs for security
        let ice_ufrag_audio = Uuid::new_v4().to_string().split('-').next().unwrap_or("");
        let ice_pwd_audio = Uuid::new_v4().to_string();
        let ice_ufrag_video = Uuid::new_v4().to_string().split('-').next().unwrap_or("");
        let ice_pwd_video = Uuid::new_v4().to_string();

        // In production, this would parse the offer and create a proper answer
        // For now, return a minimal SDP answer
        Ok(format!(
            "v=0\r\n\
             o=- 0 0 IN IP4 0.0.0.0\r\n\
             s=-\r\n\
             t=0 0\r\n\
             a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33\r\n\
             a=group:BUNDLE 0 1\r\n\
             a=msid-semantic:WMS *\r\n\
             m=audio 9 UDP/TLS/RTP/SAVPF 111\r\n\
             c=IN IP4 0.0.0.0\r\n\
             a=rtcp:9 IN IP4 0.0.0.0\r\n\
             a=ice-ufrag: {}\r\n\
             a=ice-pwd: {}\r\n\
             a=ice-options:trickle\r\n\
             a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33\r\n\
             a=setup:active\r\n\
             a=mid:0\r\n\
             a=sendrecv\r\n\
             a=rtcp-mux\r\n\
             a=rtpmap:111 opus/48000/2\r\n\
             m=video 9 UDP/TLS/RTP/SAVPF 96\r\n\
             c=IN IP4 0.0.0.0\r\n\
             a=rtcp:9 IN IP4 0.0.0.0\r\n\
             a=ice-ufrag: {}\r\n\
             a=ice-pwd: {}\r\n\
             a=ice-options:trickle\r\n\
             a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33\r\n\
             a=setup:active\r\n\
             a=mid:1\r\n\
             a=sendrecv\r\n\
             a=rtcp-mux\r\n\
             a=rtpmap:96 VP8/90000\r\n",
            ice_ufrag_audio,
            ice_pwd_audio,
            ice_ufrag_video,
            ice_pwd_video
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_peer_creation() {
        let config = SfuConfig::default();
        let peer = SfuPeer::new(
            "peer-1".to_string(),
            "room-1".to_string(),
            "Test User".to_string(),
            &config,
        );

        assert_eq!(peer.id, "peer-1");
        assert_eq!(peer.room_id, "room-1");
    }

    #[tokio::test]
    async fn test_track_management() {
        let config = SfuConfig::default();
        let peer = SfuPeer::new(
            "peer-1".to_string(),
            "room-1".to_string(),
            "Test User".to_string(),
            &config,
        );

        let track = MediaTrack {
            id: "track-1".to_string(),
            kind: MediaKind::Video,
            peer_id: "peer-1".to_string(),
            simulcast: false,
        };

        peer.add_track(track.clone()).await.unwrap();
        let tracks = peer.get_tracks().await;
        assert_eq!(tracks.len(), 1);
        assert_eq!(tracks[0].id, "track-1");

        peer.remove_track("track-1").await.unwrap();
        let tracks = peer.get_tracks().await;
        assert_eq!(tracks.len(), 0);
    }
}
