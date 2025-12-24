//! Message builder and parser utilities

use crate::error::{ProtocolError, Result};
use crate::generated::graphwiz::core::*;
use uuid::Uuid;

/// Builder for creating GraphWiz-XR protocol messages
pub struct MessageBuilder;

impl MessageBuilder {
    /// Create a new position update message
    pub fn position_update(entity_id: String, position: Vector3, rotation: Quaternion) -> Message {
        Message {
            message_id: Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            r#type: MessageType::PositionUpdate as i32,
            payload: Some(message::Payload::PositionUpdate(PositionUpdate {
                entity_id,
                position: Some(position),
                rotation: Some(rotation),
                sequence_number: 0,
            })),
        }
    }

    /// Create a new voice data message
    pub fn voice_data(
        from_client_id: String,
        audio_data: Vec<u8>,
        sequence_number: i32,
        codec: VoiceCodec,
    ) -> Message {
        Message {
            message_id: Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            r#type: MessageType::VoiceData as i32,
            payload: Some(message::Payload::VoiceData(VoiceData {
                from_client_id,
                audio_data,
                sequence_number,
                codec: codec as i32,
            })),
        }
    }

    /// Create a new entity spawn message
    pub fn entity_spawn(
        entity_id: String,
        template_id: String,
        owner_id: String,
        components: std::collections::HashMap<String, String>,
    ) -> Message {
        Message {
            message_id: Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            r#type: MessageType::EntitySpawn as i32,
            payload: Some(message::Payload::EntitySpawn(EntitySpawn {
                entity_id,
                template_id,
                owner_id,
                components,
            })),
        }
    }

    /// Create a new entity despawn message
    pub fn entity_despawn(entity_id: String) -> Message {
        Message {
            message_id: Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            r#type: MessageType::EntityDespawn as i32,
            payload: Some(message::Payload::EntityDespawn(EntityDespawn { entity_id })),
        }
    }

    /// Create a new chat message
    pub fn chat_message(
        from_client_id: String,
        message: String,
        msg_type: ChatMessageType,
    ) -> Message {
        Message {
            message_id: Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            r#type: MessageType::ChatMessage as i32,
            payload: Some(message::Payload::ChatMessage(ChatMessage {
                from_client_id,
                message,
                timestamp: chrono::Utc::now().timestamp_millis(),
                r#type: msg_type as i32,
            })),
        }
    }

    /// Create a new presence event
    pub fn presence_event(
        client_id: String,
        event_type: PresenceEventType,
        data: Option<PresenceData>,
    ) -> Message {
        Message {
            message_id: Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            r#type: MessageType::PresenceUpdate as i32,
            payload: Some(message::Payload::PresenceEvent(PresenceEvent {
                client_id,
                event_type: event_type as i32,
                data,
            })),
        }
    }
}

/// Parser for GraphWiz-XR protocol messages
pub struct MessageParser;

impl MessageParser {
    /// Parse a message from binary buffer
    pub fn parse(buffer: &[u8]) -> Result<Message> {
        prost::Message::decode(buffer)
            .map_err(|e: prost::DecodeError| ProtocolError::DeserializationError(e.to_string()))
    }

    /// Serialize a message to binary buffer
    pub fn serialize(message: &Message) -> Result<Vec<u8>> {
        let mut buf = Vec::new();
        prost::Message::encode(message, &mut buf)
            .map_err(|e: prost::EncodeError| ProtocolError::SerializationError(e.to_string()))?;
        Ok(buf)
    }

    /// Validate a message
    pub fn validate(message: &Message) -> Result<()> {
        if message.message_id.is_empty() {
            return Err(ProtocolError::MissingField("message_id".to_string()));
        }
        if message.timestamp <= 0 {
            return Err(ProtocolError::InvalidTimestamp(message.timestamp));
        }
        Ok(())
    }
}
