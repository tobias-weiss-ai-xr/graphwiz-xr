use sea_orm_migration::prelude::*;
use sea_query::{ColumnDef, Index, Table};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Sessions::Table)
                    .if_not_exists()
                    .col(&mut ColumnDef::new(Sessions::Id).integer().auto_increment().primary_key())
                    .col(&mut ColumnDef::new(Sessions::SessionId).string())
                    .col(&mut ColumnDef::new(Sessions::UserId).string())
                    .col(&mut ColumnDef::new(Sessions::RoomId).string().null())
                    .col(&mut ColumnDef::new(Sessions::ClientId).string())
                    .col(&mut ColumnDef::new(Sessions::CreatedAt).timestamp())
                    .col(&mut ColumnDef::new(Sessions::ExpiresAt).timestamp())
                    .col(&mut ColumnDef::new(Sessions::IsActive).boolean().default(true))
                    .to_owned(),
            )
            .await?;

        // Create unique index on session_id
        manager
            .create_index(
                Index::create()
                    .name("idx_sessions_session_id")
                    .table(Sessions::Table)
                    .col(Sessions::SessionId)
                    .unique()
                    .to_owned(),
            )
            .await?;

        // Create index on user_id for user session lookups
        manager
            .create_index(
                Index::create()
                    .name("idx_sessions_user_id")
                    .table(Sessions::Table)
                    .col(Sessions::UserId)
                    .to_owned(),
            )
            .await?;

        // Create index on room_id for room session lookups
        manager
            .create_index(
                Index::create()
                    .name("idx_sessions_room_id")
                    .table(Sessions::Table)
                    .col(Sessions::RoomId)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Sessions::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Sessions {
    Table,
    Id,
    SessionId,
    UserId,
    RoomId,
    ClientId,
    CreatedAt,
    ExpiresAt,
    IsActive,
}
