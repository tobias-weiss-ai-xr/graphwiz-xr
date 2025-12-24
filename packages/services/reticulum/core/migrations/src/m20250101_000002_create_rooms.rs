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
                    .table(Rooms::Table)
                    .if_not_exists()
                    .col(&mut ColumnDef::new(Rooms::Id).integer().auto_increment().primary_key())
                    .col(&mut ColumnDef::new(Rooms::RoomId).string())
                    .col(&mut ColumnDef::new(Rooms::Name).string())
                    .col(&mut ColumnDef::new(Rooms::Description).string().null())
                    .col(&mut ColumnDef::new(Rooms::MaxPlayers).integer().default(50))
                    .col(&mut ColumnDef::new(Rooms::IsPrivate).boolean().default(false))
                    .col(&mut ColumnDef::new(Rooms::CreatedBy).string())
                    .col(&mut ColumnDef::new(Rooms::CreatedAt).timestamp())
                    .col(&mut ColumnDef::new(Rooms::UpdatedAt).timestamp())
                    .col(&mut ColumnDef::new(Rooms::IsActive).boolean().default(true))
                    .to_owned(),
            )
            .await?;

        // Create unique index on room_id
        manager
            .create_index(
                Index::create()
                    .name("idx_rooms_room_id")
                    .table(Rooms::Table)
                    .col(Rooms::RoomId)
                    .unique()
                    .to_owned(),
            )
            .await?;

        // Create index on created_by
        manager
            .create_index(
                Index::create()
                    .name("idx_rooms_created_by")
                    .table(Rooms::Table)
                    .col(Rooms::CreatedBy)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Rooms::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Rooms {
    Table,
    Id,
    RoomId,
    Name,
    Description,
    MaxPlayers,
    IsPrivate,
    CreatedBy,
    CreatedAt,
    UpdatedAt,
    IsActive,
}
