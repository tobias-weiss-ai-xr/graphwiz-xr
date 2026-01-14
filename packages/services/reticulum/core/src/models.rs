//! Database models using SeaORM

pub mod users;
pub mod rooms;
pub mod sessions;
pub mod entities;
pub mod oauth_accounts;
pub mod magic_link_tokens;
pub mod assets;
pub mod upload_sessions;
pub mod roles;
pub mod room_states;

pub use users::{User, UserModel};
pub use rooms::{Room, RoomModel};
pub use sessions::{Session, SessionModel};
pub use entities::{EntityData, EntityModel, Vector3, Quaternion};
pub use oauth_accounts::{OAuthAccountModel, OAuthProvider};
pub use magic_link_tokens::{MagicLinkTokenModel, Entity as MagicLinkTokenEntity, ActiveModel as MagicLinkTokenActiveModel, Model as MagicLinkToken};
pub use assets::{Asset, AssetModel, AssetType};
pub use upload_sessions::{UploadSession, UploadSessionModel, UploadStatus};
pub use roles::{RoleAssignment, RoleModel, UserRole};
pub use room_states::{RoomState as RoomStateModel, RoomStateModel as RoomStateDbModel};
