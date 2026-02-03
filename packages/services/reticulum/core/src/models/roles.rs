//! Role model for user permissions

use sea_orm::entity::prelude::*;
use sea_orm::ActiveValue::Set;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "roles")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub user_id: i32,
    pub role: String, // 'USER', 'MODERATOR', 'ADMIN'
    pub granted_by: i32,
    pub granted_at: chrono::NaiveDateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Serialize, Deserialize)]
pub struct RoleAssignment {
    pub id: i32,
    pub user_id: i32,
    pub role: String,
    pub granted_by: i32,
    pub granted_at: chrono::NaiveDateTime,
}

impl From<Model> for RoleAssignment {
    fn from(model: Model) -> Self {
        Self {
            id: model.id,
            user_id: model.user_id,
            role: model.role,
            granted_by: model.granted_by,
            granted_at: model.granted_at,
        }
    }
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum UserRole {
    User,
    Moderator,
    Admin,
}

impl UserRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            UserRole::User => "USER",
            UserRole::Moderator => "MODERATOR",
            UserRole::Admin => "ADMIN",
        }
    }

    pub fn from_str(s: &str) -> Result<Self, String> {
        match s.to_uppercase().as_str() {
            "USER" => Ok(UserRole::User),
            "MODERATOR" => Ok(UserRole::Moderator),
            "ADMIN" => Ok(UserRole::Admin),
            _ => Err(format!("Invalid role: {}", s)),
        }
    }
}
pub struct RoleModel;

impl RoleModel {
    /// Get user's role
    pub async fn get_user_role(
        db: &DatabaseConnection,
        user_id: i32,
    ) -> crate::Result<Option<RoleAssignment>> {
        let result = Entity::find()
            .filter(Column::UserId.eq(user_id))
            .one(db)
            .await?;

        Ok(result.map(RoleAssignment::from))
    }

    /// Grant role to user
    pub async fn grant_role(
        db: &DatabaseConnection,
        user_id: i32,
        role: UserRole,
        granted_by: i32,
    ) -> crate::Result<RoleAssignment> {
        let now = chrono::Utc::now().naive_utc();

        let existing = Entity::find()
            .filter(Column::UserId.eq(user_id))
            .one(db)
            .await?;

        if let Some(existing_role) = existing {
            let mut active_model: ActiveModel = existing_role.into();
            active_model.role = Set(role.as_str().to_string());
            active_model.granted_by = Set(granted_by);
            active_model.granted_at = Set(now);
            let result = active_model.update(db).await?;
            Ok(RoleAssignment::from(result))
        } else {
            let model = ActiveModel {
                user_id: Set(user_id),
                role: Set(role.as_str().to_string()),
                granted_by: Set(granted_by),
                granted_at: Set(now),
                ..Default::default()
            };
            let result = model.insert(db).await?;
            Ok(RoleAssignment::from(result))
        }
    }

    /// Revoke role from user
    pub async fn revoke_role(db: &DatabaseConnection, user_id: i32) -> crate::Result<()> {
        Entity::delete_many()
            .filter(Column::UserId.eq(user_id))
            .exec(db)
            .await?;
        Ok(())
    }

    /// List all users with roles
    pub async fn list_all_with_roles(
        db: &DatabaseConnection,
    ) -> crate::Result<Vec<(crate::models::User, Option<RoleAssignment>)>> {
        let users = crate::models::UserModel::find_all(db).await?;

        let mut result = Vec::new();

        for user in users {
            let role_assignment = Entity::find()
                .filter(Column::UserId.eq(user.id))
                .one(db)
                .await?;

            let role = role_assignment.map(|a| RoleAssignment::from(a));
            result.push((user, role));
        }

        Ok(result)
    }
}
