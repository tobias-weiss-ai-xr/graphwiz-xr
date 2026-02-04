//! Protobuf message handling for WebSocket communication

use crate::reticulum_core::Result;
use prost::Message;

// Re-export generated protobuf types
pub mod graphwiz {
    pub mod core {
        include!(concat!(env!("OUT_DIR"), "/graphwiz.core.rs"));
    }
}

/// Parse protobuf message from bytes
pub fn parse_message(bytes: &[u8]) -> Result<graphwiz::core::Message> {
    graphwiz::core::Message::decode(bytes)
        .map_err(|e| reticulum_core::Error::InternalError(format!("Failed to decode message: {}", e)))
}

/// Encode protobuf message to bytes
pub fn encode_message(message: &graphwiz::core::Message) -> Result<Vec<u8>> {
    let mut buf = Vec::new();
    message
        .encode(&mut buf)
        .map_err(|e| reticulum_core::Error::InternalError(format!("Failed to encode message: {}", e)))?;
    Ok(buf)
}

/// Message handler for different message types
pub trait MessageHandler: Send + Sync {
    fn handle_client_hello(&self, room_id: &str, conn_id: &str, msg: &graphwiz::core::ClientHello) -> Result<Option<Vec<u8>>>;
    fn handle_position_update(&self, room_id: &str, conn_id: &str, msg: &graphwiz::core::PositionUpdate) -> Result<Option<Vec<u8>>>;
    fn handle_chat_message(&self, room_id: &str, conn_id: &str, msg: &graphwiz::core::ChatMessage) -> Result<Option<Vec<u8>>>;
    fn handle_entity_spawn(&self, room_id: &str, conn_id: &str, msg: &graphwiz::core::EntitySpawn) -> Result<Option<Vec<u8>>>;
    fn handle_presence_event(&self, room_id: &str, conn_id: &str, msg: &graphwiz::core::PresenceEvent) -> Result<Option<Vec<u8>>>;
}

/// Default message handler
pub struct DefaultMessageHandler;

impl MessageHandler for DefaultMessageHandler {
    fn handle_client_hello(&self, room_id: &str, conn_id: &str, msg: &graphwiz::core::ClientHello) -> Result<Option<Vec<u8>>> {
        log::info!(
            "Client hello from {} in room {}: display_name={}, auth_token={}",
            conn_id,
            room_id,
            msg.display_name,
            if msg.auth_token.is_empty() { "none" } else { "***" }
        );

        // Create server hello response
        let response = graphwiz::core::Message {
            message_id: uuid::Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().timestamp_micros(),
            r#type: graphwiz::core::MessageType::ServerHello as i32,
            server_hello: Some(graphwiz::core::ServerHello {
                server_version: env!("CARGO_PKG_VERSION").to_string(),
                assigned_client_id: conn_id.to_string(),
                room_id: room_id.to_string(),
                initial_state: None,
            }),
        };

        encode_message(&response).map(Some)
    }

    fn handle_position_update(&self, room_id: &str, conn_id: &str, msg: &graphwiz::core::PositionUpdate) -> Result<Option<Vec<u8>>> {
        log::debug!(
            "Position update from {} in room {}: entity_id={}, seq={}",
            conn_id,
            room_id,
            msg.entity_id,
            msg.sequence_number
        );

        // Broadcast to other clients in room
        Ok(None) // Let the WebSocket manager handle broadcasting
    }

    fn handle_chat_message(&self, room_id: &str, conn_id: &str, msg: &graphwiz::core::ChatMessage) -> Result<Option<Vec<u8>>> {
        log::info!(
            "Chat message from {} in room {}: {}",
            conn_id,
            room_id,
            msg.message
        );

        // Broadcast to other clients
        Ok(None)
    }

    fn handle_entity_spawn(&self, room_id: &str, conn_id: &str, msg: &graphwiz::core::EntitySpawn) -> Result<Option<Vec<u8>>> {
        log::info!(
            "Entity spawn from {} in room {}: entity_id={}, template={}",
            conn_id,
            room_id,
            msg.entity_id,
            msg.template_id
        );

        Ok(None)
    }

    fn handle_presence_event(&self, room_id: &str, conn_id: &str, msg: &graphwiz::core::PresenceEvent) -> Result<Option<Vec<u8>>> {
        log::info!(
            "Presence event from {} in room {}: client_id={:?}, event_type={:?}",
            conn_id,
            room_id,
            msg.client_id,
            msg.r#type
        );

        Ok(None)
    }
}

/// Route a protobuf message to the appropriate handler
pub async fn route_message(
    message: &graphwiz::core::Message,
    room_id: &str,
    conn_id: &str,
    handler: &dyn MessageHandler,
) -> Result<Option<Vec<u8>>> {
    // Check for client hello
    if let Some(hello) = &message.client_hello {
        return handler.handle_client_hello(room_id, conn_id, hello);
    }

    // Check for position update
    if let Some(pos_update) = &message.position_update {
        return handler.handle_position_update(room_id, conn_id, pos_update);
    }

    // Check for chat message
    if let Some(chat) = &message.chat_message {
        return handler.handle_chat_message(room_id, conn_id, chat);
    }

    // Check for entity spawn
    if let Some(spawn) = &message.entity_spawn {
        return handler.handle_entity_spawn(room_id, conn_id, spawn);
    }

    // Check for presence event
    if let Some(presence) = &message.presence_event {
        return handler.handle_presence_event(room_id, conn_id, presence);
    }

    Ok(None)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_message() {
        // Create a test message
        let msg = graphwiz::core::Message {
            message_id: "test-123".to_string(),
            timestamp: 12345,
            r#type: graphwiz::core::MessageType::ClientHello as i32,
            client_hello: Some(graphwiz::core::ClientHello {
                client_id: "client-1".to_string(),
                display_name: "Test User".to_string(),
                auth_token: "token-123".to_string(),
                requested_room: "room-1".to_string(),
            }),
            ..Default::default()
        };

        let encoded = encode_message(&msg).unwrap();
        let decoded = parse_message(&encoded).unwrap();

        assert_eq!(decoded.message_id, "test-123");
    }
}
