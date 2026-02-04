use sea_orm_migration::prelude::*;
use sea_query::{ColumnDef, Index, Table, PgInterval};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add role and updated_at columns to users table
        manager
            .alter_table(
                Table::alter()
                    .table(Users::Table)
                    .add_column(
                        ColumnDef::new(Users::Role)
                            .string()
                            .not_null()
                            .default("USER")
                    )
                    .to_owned(),
            )
            .await?;

        // Note: UpdatedAt already exists in users table, so we don't need to add it

        // Create oauth_accounts table
        manager
            .create_table(
                Table::create()
                    .table(OAuthAccounts::Table)
                    .if_not_exists()
                    .col(&mut ColumnDef::new(OAuthAccounts::Id).integer().auto_increment().primary_key())
                    .col(&mut ColumnDef::new(OAuthAccounts::Provider).string().not_null())
                    .col(&mut ColumnDef::new(OAuthAccounts::ProviderUserId).string().not_null())
                    .col(&mut ColumnDef::new(OAuthAccounts::UserId).integer().not_null())
                    .col(&mut ColumnDef::new(OAuthAccounts::AccessToken).string().null())
                    .col(&mut ColumnDef::new(OAuthAccounts::RefreshToken).string().null())
                    .col(&mut ColumnDef::new(OAuthAccounts::ExpiresAt).timestamp().null())
                    .col(&mut ColumnDef::new(OAuthAccounts::CreatedAt).timestamp().not_null())
                    .col(&mut ColumnDef::new(OAuthAccounts::UpdatedAt).timestamp().not_null())
                    .foreign_key(
                        sea_query::ForeignKey::create()
                            .name("fk_oauth_accounts_user_id")
                            .from(OAuthAccounts::Table, OAuthAccounts::UserId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                    )
                    .to_owned(),
            )
            .await?;

        // Create unique index on provider + provider_user_id
        manager
            .create_index(
                Index::create()
                    .name("idx_oauth_accounts_provider")
                    .table(OAuthAccounts::Table)
                    .col(OAuthAccounts::Provider)
                    .col(OAuthAccounts::ProviderUserId)
                    .unique()
                    .to_owned(),
            )
            .await?;

        // Create index on user_id for lookups
        manager
            .create_index(
                Index::create()
                    .name("idx_oauth_accounts_user_id")
                    .table(OAuthAccounts::Table)
                    .col(OAuthAccounts::UserId)
                    .to_owned(),
            )
            .await?;

        // Create roles table for tracking granted roles
        manager
            .create_table(
                Table::create()
                    .table(Roles::Table)
                    .if_not_exists()
                    .col(&mut ColumnDef::new(Roles::Id).integer().auto_increment().primary_key())
                    .col(&mut ColumnDef::new(Roles::UserId).integer().not_null())
                    .col(&mut ColumnDef::new(Roles::Role).string().not_null()) // USER, MODERATOR, ADMIN
                    .col(&mut ColumnDef::new(Roles::GrantedBy).integer().not_null())
                    .col(&mut ColumnDef::new(Roles::GrantedAt).timestamp().not_null())
                    .foreign_key(
                        sea_query::ForeignKey::create()
                            .name("fk_roles_user_id")
                            .from(Roles::Table, Roles::UserId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                    )
                    .foreign_key(
                        sea_query::ForeignKey::create()
                            .name("fk_roles_granted_by")
                            .from(Roles::Table, Roles::GrantedBy)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                    )
                    .to_owned(),
            )
            .await?;

        // Create unique index on user_id + role (one role per user)
        manager
            .create_index(
                Index::create()
                    .name("idx_roles_user_role")
                    .table(Roles::Table)
                    .col(Roles::UserId)
                    .col(Roles::Role)
                    .unique()
                    .to_owned(),
            )
            .await?;

        // Create magic_link_tokens table
        manager
            .create_table(
                Table::create()
                    .table(MagicLinkTokens::Table)
                    .if_not_exists()
                    .col(&mut ColumnDef::new(MagicLinkTokens::Id).integer().auto_increment().primary_key())
                    .col(&mut ColumnDef::new(MagicLinkTokens::Token).string().not_null())
                    .col(&mut ColumnDef::new(MagicLinkTokens::Email).string().not_null())
                    .col(&mut ColumnDef::new(MagicLinkTokens::ExpiresAt).timestamp().not_null())
                    .col(&mut ColumnDef::new(MagicLinkTokens::UsedAt).timestamp().null())
                    .col(&mut ColumnDef::new(MagicLinkTokens::CreatedAt).timestamp().not_null())
                    .to_owned(),
            )
            .await?;

        // Create unique index on token
        manager
            .create_index(
                Index::create()
                    .name("idx_magic_link_tokens_token")
                    .table(MagicLinkTokens::Table)
                    .col(MagicLinkTokens::Token)
                    .unique()
                    .to_owned(),
            )
            .await?;

        // Create index on email for cleanup queries
        manager
            .create_index(
                Index::create()
                    .name("idx_magic_link_tokens_email")
                    .table(MagicLinkTokens::Table)
                    .col(MagicLinkTokens::Email)
                    .to_owned(),
            )
            .await?;

        // Create index on expires_at for cleanup queries
        manager
            .create_index(
                Index::create()
                    .name("idx_magic_link_tokens_expires_at")
                    .table(MagicLinkTokens::Table)
                    .col(MagicLinkTokens::ExpiresAt)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop magic_link_tokens table
        manager
            .drop_table(Table::drop().table(MagicLinkTokens::Table).to_owned())
            .await?;

        // Drop roles table
        manager
            .drop_table(Table::drop().table(Roles::Table).to_owned())
            .await?;

        // Drop oauth_accounts table
        manager
            .drop_table(Table::drop().table(OAuthAccounts::Table).to_owned())
            .await?;

        // Remove role column from users table
        manager
            .alter_table(
                Table::alter()
                    .table(Users::Table)
                    .drop_column(Users::Role)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
    Role,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum OAuthAccounts {
    Table,
    Id,
    Provider,
    ProviderUserId,
    UserId,
    AccessToken,
    RefreshToken,
    ExpiresAt,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Roles {
    Table,
    Id,
    UserId,
    Role,
    GrantedBy,
    GrantedAt,
}

#[derive(DeriveIden)]
enum MagicLinkTokens {
    Table,
    Id,
    Token,
    Email,
    ExpiresAt,
    UsedAt,
    CreatedAt,
}
