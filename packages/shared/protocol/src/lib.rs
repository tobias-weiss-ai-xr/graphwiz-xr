//! GraphWiz-XR Protocol Library
//!
//! This crate provides types and utilities for working with the GraphWiz-XR protocol.

pub mod generated {
    // Generated protobuf code
    include!(concat!(env!("OUT_DIR"), "/graphwiz.core.rs"));
    include!(concat!(env!("OUT_DIR"), "/graphwiz.networking.rs"));
}

pub mod error;
pub mod message;

pub use error::ProtocolError;
pub use message::{MessageBuilder, MessageParser};

// Re-export commonly used types
pub use generated::graphwiz::*;
