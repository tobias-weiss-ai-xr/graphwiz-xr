//! RTP/RTCP Packet Handling and Forwarding

use bytes::{Buf, BufMut, Bytes, BytesMut};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// RTP Packet representation
#[derive(Clone, Debug)]
pub struct RtpPacket {
    /// Header
    pub header: RtpHeader,
    /// Payload
    pub payload: Bytes,
    /// Padding size (if padding bit is set)
    pub padding_size: Option<u8>,
}

#[derive(Clone, Debug)]
pub struct RtpHeader {
    /// RTP version (must be 2)
    pub version: u8,
    /// Padding flag
    pub padding: bool,
    /// Extension flag
    pub extension: bool,
    /// CSRC count
    pub csrc_count: u8,
    /// Marker bit
    pub marker: bool,
    /// Payload type
    pub payload_type: u8,
    /// Sequence number
    pub sequence_number: u16,
    /// Timestamp
    pub timestamp: u32,
    /// SSRC
    pub ssrc: u32,
    /// CSRC list
    pub csrc: Vec<u32>,
    /// Extension header
    pub extension_header: Option<RtpExtension>,
    /// Header size in bytes
    pub header_size: usize,
}

#[derive(Clone, Debug)]
pub struct RtpExtension {
    pub profile: u16,
    pub length: u16,
    pub data: Bytes,
}

/// RTCP Packet types
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum RtcpPacketType {
    SenderReport = 200,
    ReceiverReport = 201,
    SourceDescription = 202,
    Bye = 203,
    ApplicationDefined = 204,
    PayloadSpecificFeedback = 205,
    TransportLayerFeedback = 206,
}

/// RTCP Packet representation
#[derive(Clone, Debug)]
pub struct RtcpPacket {
    pub packet_type: RtcpPacketType,
    pub payload: Bytes,
}

/// Simulcast spatial layer
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum SimulcastSpatialLayer {
    Low = 0,
    Medium = 1,
    High = 2,
}

/// Simulcast temporal layer
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum SimulcastTemporalLayer {
    Low = 0,
    Medium = 1,
    High = 2,
}

/// Simulcast configuration
#[derive(Clone, Debug)]
pub struct SimulcastLayer {
    pub spatial: SimulcastSpatialLayer,
    pub temporal: SimulcastTemporalLayer,
    pub max_bitrate: u32,
    pub target_bitrate: u32,
    pub scale_resolution_down_by: f32,
}

impl Default for SimulcastLayer {
    fn default() -> Self {
        Self {
            spatial: SimulcastSpatialLayer::Medium,
            temporal: SimulcastTemporalLayer::Medium,
            max_bitrate: 1_500_000,
            target_bitrate: 1_000_000,
            scale_resolution_down_by: 1.0,
        }
    }
}

/// RTP Forwarder - handles selective forwarding
pub struct RtpForwarder {
    /// SSRC to peer mapping
    ssrc_to_peer: Arc<RwLock<HashMap<u32, String>>>,
    /// Peer to SSRC mapping
    peer_to_ssrc: Arc<RwLock<HashMap<String, u32>>>,
    /// Simulcast layer configuration
    simulcast_layers: Arc<RwLock<HashMap<String, Vec<SimulcastLayer>>>>,
}

impl RtpForwarder {
    pub fn new() -> Self {
        Self {
            ssrc_to_peer: Arc::new(RwLock::new(HashMap::new())),
            peer_to_ssrc: Arc::new(RwLock::new(HashMap::new())),
            simulcast_layers: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Register a peer's SSRC
    pub async fn register_ssrc(&self, peer_id: &str, ssrc: u32) {
        self.ssrc_to_peer.write().await.insert(ssrc, peer_id.to_string());
        self.peer_to_ssrc.write().await.insert(peer_id.to_string(), ssrc);
        log::debug!("Registered SSRC {} for peer {}", ssrc, peer_id);
    }

    /// Unregister a peer's SSRC
    pub async fn unregister_ssrc(&self, peer_id: &str) {
        if let Some(ssrc) = self.peer_to_ssrc.write().await.remove(peer_id) {
            self.ssrc_to_peer.write().await.remove(&ssrc);
        }
    }

    /// Get peer ID from SSRC
    pub async fn get_peer_id(&self, ssrc: u32) -> Option<String> {
        self.ssrc_to_peer.read().await.get(&ssrc).cloned()
    }

    /// Forward RTP packet to target peers
    pub async fn forward_packet(
        &self,
        packet: &RtpPacket,
        exclude_peers: &[String],
    ) -> Vec<(String, RtpPacket)> {
        let ssrc = packet.header.ssrc;
        let from_peer = self.get_peer_id(ssrc).await;

        if from_peer.is_none() {
            log::warn!("Unknown SSRC {}, cannot forward packet", ssrc);
            return Vec::new();
        }

        let from_peer = from_peer.unwrap();
        let mut targets = Vec::new();

        // Get all peers except sender and excluded ones
        let all_peers: Vec<String> = self
            .peer_to_ssrc
            .read()
            .await
            .keys()
            .filter(|p| *p != &from_peer && !exclude_peers.contains(p))
            .cloned()
            .collect();

        for peer_id in all_peers {
            // In production, would apply simulcast layer selection here
            targets.push((peer_id.clone(), packet.clone()));
        }

        targets
    }

    /// Set simulcast layers for a peer
    pub async fn set_simulcast_layers(&self, peer_id: &str, layers: Vec<SimulcastLayer>) {
        self.simulcast_layers
            .write()
            .await
            .insert(peer_id.to_string(), layers);
    }

    /// Get optimal simulcast layer based on bandwidth
    pub async fn select_layer(
        &self,
        peer_id: &str,
        available_bitrate: u32,
    ) -> Option<SimulcastLayer> {
        let layers = self.simulcast_layers.read().await;
        let peer_layers = layers.get(peer_id)?;

        // Find highest layer that fits in available bitrate
        for layer in peer_layers.iter().rev() {
            if layer.target_bitrate <= available_bitrate {
                return Some(layer.clone());
            }
        }

        // Return lowest layer if none fit
        peer_layers.first().cloned()
    }
}

impl Default for RtpForwarder {
    fn default() -> Self {
        Self::new()
    }
}

impl RtpPacket {
    /// Parse RTP packet from bytes
    pub fn parse(data: Bytes) -> Result<Self, String> {
        if data.len() < 12 {
            return Err("RTP packet too short".to_string());
        }

        let original_len = data.len();
        let mut cursor = std::io::Cursor::new(data.clone());

        // First byte
        let first_byte = cursor.get_u8();
        let version = (first_byte >> 6) & 0x03;
        let padding = (first_byte >> 5) & 0x01 == 1;
        let extension = (first_byte >> 4) & 0x01 == 1;
        let csrc_count = first_byte & 0x0F;

        if version != 2 {
            return Err(format!("Invalid RTP version: {}", version));
        }

        // Second byte
        let second_byte = cursor.get_u8();
        let marker = (second_byte >> 7) & 0x01 == 1;
        let payload_type = second_byte & 0x7F;

        // Sequence number
        let sequence_number = cursor.get_u16();

        // Timestamp
        let timestamp = cursor.get_u32();

        // SSRC
        let ssrc = cursor.get_u32();

        // CSRC list
        let mut csrc = Vec::with_capacity(csrc_count as usize);
        for _ in 0..csrc_count {
            csrc.push(cursor.get_u32());
        }

        // Extension header
        let mut extension_header = None;
        if extension {
            if cursor.remaining() < 4 {
                return Err("RTP extension too short".to_string());
            }
            let profile = cursor.get_u16();
            let length = cursor.get_u16();
            let ext_data_len = (length as usize + 1) * 4;

            if cursor.remaining() < ext_data_len {
                return Err("RTP extension data truncated".to_string());
            }

            let mut ext_data = BytesMut::with_capacity(ext_data_len);
            for _ in 0..ext_data_len {
                ext_data.put_u8(cursor.get_u8());
            }
            extension_header = Some(RtpExtension {
                profile,
                length,
                data: ext_data.freeze(),
            });
        }

        let header_size = original_len - cursor.remaining();

        // Payload
        let payload = data.slice(cursor.position() as usize..);

        // Padding
        let padding_size = if padding && !payload.is_empty() {
            let last_byte = payload[payload.len() - 1] as usize;
            if last_byte <= payload.len() {
                Some(last_byte as u8)
            } else {
                return Err("Invalid padding size".to_string());
            }
        } else {
            None
        };

        Ok(Self {
            header: RtpHeader {
                version,
                padding,
                extension,
                csrc_count,
                marker,
                payload_type,
                sequence_number,
                timestamp,
                ssrc,
                csrc,
                extension_header,
                header_size,
            },
            payload,
            padding_size,
        })
    }

    /// Serialize RTP packet to bytes
    pub fn serialize(&self) -> Bytes {
        let mut buf = BytesMut::new();

        // First byte
        let first_byte = (self.header.version << 6)
            | ((self.header.padding as u8) << 5)
            | ((self.header.extension as u8) << 4)
            | self.header.csrc_count;
        buf.put_u8(first_byte);

        // Second byte
        let second_byte = ((self.header.marker as u8) << 7) | self.header.payload_type;
        buf.put_u8(second_byte);

        // Sequence number
        buf.put_u16(self.header.sequence_number);

        // Timestamp
        buf.put_u32(self.header.timestamp);

        // SSRC
        buf.put_u32(self.header.ssrc);

        // CSRC list
        for csrc in &self.header.csrc {
            buf.put_u32(*csrc);
        }

        // Extension header
        if let Some(ref ext) = self.header.extension_header {
            buf.put_u16(ext.profile);
            buf.put_u16(ext.length);
            buf.extend_from_slice(&ext.data);
        }

        // Payload
        buf.extend_from_slice(&self.payload);

        buf.freeze()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rtp_packet_roundtrip() {
        let packet = RtpPacket {
            header: RtpHeader {
                version: 2,
                padding: false,
                extension: false,
                csrc_count: 0,
                marker: false,
                payload_type: 96,
                sequence_number: 12345,
                timestamp: 987654321,
                ssrc: 123456789,
                csrc: vec![],
                extension_header: None,
                header_size: 12,
            },
            payload: Bytes::from_static(&[0x00, 0x01, 0x02, 0x03]),
            padding_size: None,
        };

        let serialized = packet.serialize();
        let parsed = RtpPacket::parse(serialized).unwrap();

        assert_eq!(parsed.header.version, 2);
        assert_eq!(parsed.header.sequence_number, 12345);
        assert_eq!(parsed.header.ssrc, 123456789);
    }

    #[tokio::test]
    async fn test_rtp_forwarder() {
        let forwarder = RtpForwarder::new();
        forwarder.register_ssrc("peer1", 123456).await;
        forwarder.register_ssrc("peer2", 234567).await;

        assert_eq!(forwarder.get_peer_id(123456).await, Some("peer1".to_string()));
        assert_eq!(forwarder.get_peer_id(234567).await, Some("peer2".to_string()));
    }
}
