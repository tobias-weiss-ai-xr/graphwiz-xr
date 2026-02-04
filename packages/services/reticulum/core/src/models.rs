//! Database models using SeaORM

pub mod assets;
pub mod entities;
pub mod magic_link_tokens;
pub mod oauth_accounts;
pub mod roles;
pub mod room_states;
pub mod rooms;
pub mod sessions;
pub mod upload_sessions;
pub mod users;

pub use assets::{Asset, AssetModel, AssetType};
pub use entities::{EntityData, EntityModel, Quaternion, Vector3};
pub use magic_link_tokens::{
    ActiveModel as MagicLinkTokenActiveModel, Entity as MagicLinkTokenEntity, MagicLinkTokenModel,
    Model as MagicLinkToken,
};
pub use oauth_accounts::{OAuthAccountModel, OAuthProvider};
pub use roles::{RoleAssignment, RoleModel, UserRole};
pub use room_states::Model;
pub use rooms::{Room, RoomModel};
pub use sessions::{Session, SessionModel};
pub use upload_sessions::{UploadSession, UploadSessionModel, UploadStatus};
pub use users::Entity as UsersEntity;
pub use users::{User, UserModel};
