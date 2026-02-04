//! Room Management for SFU
//!
//! Manages rooms and peer connections within each room

use super::{
    config::SfuConfig,
    error::{SfuError, SfuResult},
    peer::{IceCandidate, MediaKind, SfuPeer, SessionDescription},
    rtp::{RtpForwarder, RtpPacket, SimulcastLayer},
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// SFU Room - manages peers and media forwarding
pub struct SfuRoom {
    pub id: String,
    pub name: String,
    peers: Arc<RwLock<HashMap<String, Arc<SfuPeer>>>>,
    forwarder: RtpForwarder,
    config: SfuConfig,
    created_at: i64,
}

impl SfuRoom {
    pub fn new(id: String, name: String, config: SfuConfig) -> Self {
        Self {
            id,
            name,
            peers: Arc::new(RwLock::new(HashMap::new())),
            forwarder: RtpForwarder::new(),
            config,
            created_at: chrono::Utc::now().timestamp(),
        }
    }

    /// Get number of peers in the room
    pub async fn peer_count(&self) -> usize {
        self.peers.read().await.len()
    }

    /// Check if room is at capacity
    pub async fn is_full(&self) -> bool {
        self.peer_count().await >= self.config.max_peers_per_room
    }

    /// Add a peer to the room
    pub async fn add_peer(&self, peer: Arc<SfuPeer>) -> SfuResult<()> {
        if self.is_full().await {
            return Err(SfuError::RoomCapacityReached(
                self.peer_count().await,
                self.config.max_peers_per_room,
            ));
        }

        // Check for duplicate peer ID
        {
            let peers = self.peers.read().await;
            if peers.contains_key(&peer.id) {
                return Err(SfuError::InternalError(format!(
                    "Peer {} already exists in room",
                    peer.id
                )));
            }
        }

        {
            let mut peers = self.peers.write().await;
            peers.insert(peer.id.clone(), peer.clone());
        }

        log::info!(
            "Added peer {} to room {} (count: {})",
            peer.id,
            self.id,
            self.peer_count().await
        );

        Ok(())
    }

    /// Remove a peer from the room
    pub async fn remove_peer(&self, peer_id: &str) -> SfuResult<Arc<SfuPeer>> {
        // Clean up RTP forwarding
        self.forwarder.unregister_ssrc(peer_id).await;

        let mut peers = self.peers.write().await;
        let peer = peers
            .remove(peer_id)
            .ok_or_else(|| SfuError::PeerNotFound(peer_id.to_string()))?;

        log::info!(
            "Removed peer {} from room {} (count: {})",
            peer_id,
            self.id,
            peers.len()
        );

        Ok(peer)
    }

    /// Get a peer by ID
    pub async fn get_peer(&self, peer_id: &str) -> SfuResult<Arc<SfuPeer>> {
        let peers = self.peers.read().await;
        peers
            .get(peer_id)
            .cloned()
            .ok_or_else(|| SfuError::PeerNotFound(peer_id.to_string()))
    }

    /// Get all peers in the room
    pub async fn get_all_peers(&self) -> Vec<Arc<SfuPeer>> {
        self.peers.read().await.values().cloned().collect()
    }

    /// Handle WebRTC offer from a peer
    pub async fn handle_offer(
        &self,
        peer_id: &str,
        offer: &SessionDescription,
    ) -> SfuResult<SessionDescription> {
        let peer = self.get_peer(peer_id).await?;

        // Set remote description
        {
            let mut conn = peer.connection.write().await;
            conn.set_remote_description(offer).await?;
        }

        // Create answer
        let mut conn = peer.connection.write().await;
        let answer = conn.create_answer().await?;

        log::info!("Created answer for peer {} in room {}", peer_id, self.id);

        Ok(answer)
    }

    /// Handle ICE candidate from a peer
    pub async fn handle_ice_candidate(
        &self,
        peer_id: &str,
        candidate: IceCandidate,
    ) -> SfuResult<()> {
        let peer = self.get_peer(peer_id).await?;

        {
            let mut conn = peer.connection.write().await;
            conn.add_ice_candidate(candidate).await?;
        }

        Ok(())
    }

    /// Handle incoming RTP packet
    pub async fn handle_rtp(&self, from_peer_id: &str, packet: RtpPacket) -> SfuResult<()> {
        // Forward to all other peers
        let targets = self.forwarder.forward_packet(&packet, &[from_peer_id.to_string()]).await;

        for (target_peer_id, packet) in targets {
            if let Ok(target_peer) = self.get_peer(&target_peer_id).await {
                // Send packet to target peer
                let _ = target_peer.send_rtp(packet).await;
            }
        }

        Ok(())
    }

    /// Register SSRC for a peer
    pub async fn register_ssrc(&self, peer_id: &str, ssrc: u32) -> SfuResult<()> {
        self.forwarder.register_ssrc(peer_id, ssrc).await;
        Ok(())
    }

    /// Set simulcast configuration for a peer
    pub async fn set_simulcast_layers(
        &self,
        peer_id: &str,
        layers: Vec<SimulcastLayer>,
    ) -> SfuResult<()> {
        self.forwarder.set_simulcast_layers(peer_id, layers).await;
        Ok(())
    }

    /// Get room statistics
    pub async fn get_stats(&self) -> RoomStats {
        let peers = self.peers.read().await;
        let mut video_track_count = 0;
        let mut audio_track_count = 0;

        for peer in peers.values() {
            let tracks = peer.get_tracks().await;
            for track in tracks {
                match track.kind {
                    MediaKind::Video => video_track_count += 1,
                    MediaKind::Audio => audio_track_count += 1,
                }
            }
        }

        RoomStats {
            room_id: self.id.clone(),
            peer_count: peers.len(),
            video_track_count,
            audio_track_count,
            created_at: self.created_at,
        }
    }
}

/// Room statistics
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RoomStats {
    pub room_id: String,
    pub peer_count: usize,
    pub video_track_count: usize,
    pub audio_track_count: usize,
    pub created_at: i64,
}

/// Manages all SFU rooms
pub struct RoomManager {
    rooms: RwLock<HashMap<String, Arc<SfuRoom>>>,
    config: SfuConfig,
}

impl RoomManager {
    pub fn new(config: SfuConfig) -> Self {
        Self {
            rooms: RwLock::new(HashMap::new()),
            config,
        }
    }

    /// Create a new room
    pub async fn create_room(&self, id: String, name: String) -> SfuResult<Arc<SfuRoom>> {
        {
            let rooms = self.rooms.read().await;
            if rooms.contains_key(&id) {
                return Err(SfuError::InternalError(format!("Room {} already exists", id)));
            }
            if rooms.len() >= self.config.max_rooms {
                return Err(SfuError::InternalError("Maximum room count reached".to_string()));
            }
        }

        let room = Arc::new(SfuRoom::new(id.clone(), name, self.config.clone()));

        {
            let mut rooms = self.rooms.write().await;
            rooms.insert(id.clone(), room.clone());
        }

        log::info!("Created SFU room {}", id);

        Ok(room)
    }

    /// Get a room by ID
    pub async fn get_room(&self, id: &str) -> SfuResult<Arc<SfuRoom>> {
        let rooms = self.rooms.read().await;
        rooms
            .get(id)
            .cloned()
            .ok_or_else(|| SfuError::RoomNotFound(id.to_string()))
    }

    /// Remove a room
    pub async fn remove_room(&self, id: &str) -> SfuResult<()> {
        let mut rooms = self.rooms.write().await;
        rooms
            .remove(id)
            .ok_or_else(|| SfuError::RoomNotFound(id.to_string()))?;

        log::info!("Removed SFU room {}", id);

        Ok(())
    }

    /// Get all room IDs
    pub async fn get_room_ids(&self) -> Vec<String> {
        self.rooms.read().await.keys().cloned().collect()
    }

    /// Get count of active rooms
    pub async fn room_count(&self) -> usize {
        self.rooms.read().await.len()
    }

    /// Get all rooms with their statistics
    pub async fn get_all_room_stats(&self) -> Vec<RoomStats> {
        let rooms = self.rooms.read().await;
        let mut stats = Vec::new();

        for room in rooms.values() {
            stats.push(room.get_stats().await);
        }

        stats
    }
}

impl Default for RoomManager {
    fn default() -> Self {
        Self::new(SfuConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_room_creation() {
        let config = SfuConfig::default();
        let manager = RoomManager::new(config);

        let room = manager.create_room("room-1".to_string(), "Test Room".to_string()).await.unwrap();

        assert_eq!(room.id, "room-1");
        assert_eq!(room.peer_count().await, 0);
    }

    #[tokio::test]
    async fn test_room_manager() {
        let config = SfuConfig::default();
        let manager = RoomManager::new(config);

        manager
            .create_room("room-1".to_string(), "Room 1".to_string())
            .await
            .unwrap();
        manager
            .create_room("room-2".to_string(), "Room 2".to_string())
            .await
            .unwrap();

        assert_eq!(manager.room_count().await, 2);

        let room = manager.get_room("room-1").await.unwrap();
        assert_eq!(room.id, "room-1");

        manager.remove_room("room-1").await.unwrap();
        assert_eq!(manager.room_count().await, 1);
    }
}
