//! SFU Error Types

use thiserror::Error;

pub type SfuResult<T> = Result<T, SfuError>;

#[derive(Error, Debug)]
pub enum SfuError {
    #[error("Room not found: {0}")]
    RoomNotFound(String),

    #[error("Peer not found: {0}")]
    PeerNotFound(String),

    #[error("Room capacity reached: {0}/{1}")]
    RoomCapacityReached(usize, usize),

    #[error("Invalid SDP: {0}")]
    InvalidSdp(String),

    #[error("RTP error: {0}")]
    RtpError(String),

    #[error("ICE error: {0}")]
    IceError(String),

    #[error("Track error: {0}")]
    TrackError(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),

    #[error("WebRTC error: {0}")]
    WebrtcError(String),

    #[error("Internal error: {0}")]
    InternalError(String),
}
