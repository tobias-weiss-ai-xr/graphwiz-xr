//! Database models using SeaORM

pub mod users;
pub mod rooms;
pub mod sessions;
pub mod entities;
pub mod oauth_accounts;
pub mod magic_link_tokens;

pub use users::{User, UserModel};
pub use rooms::{Room, RoomModel};
pub use sessions::{Session, SessionModel};
pub use entities::{EntityData, EntityModel, Vector3, Quaternion};
pub use oauth_accounts::{OAuthAccountModel, OAuthProvider};
pub use magic_link_tokens::{MagicLinkTokenModel};
