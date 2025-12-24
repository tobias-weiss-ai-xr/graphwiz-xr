use sea_orm_migration::prelude::*;

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
                    .col(pk_auto(Rooms::Id))
                    .col(string(Rooms::RoomId))
                    .col(string(Rooms::Name))
                    .col(text(Rooms::Description).null())
                    .col(integer(Rooms::MaxPlayers).default(50))
                    .col(boolean(Rooms::IsPrivate).default(false))
                    .col(string(Rooms::CreatedBy))
                    .col(timestamp(Rooms::CreatedAt))
                    .col(timestamp(Rooms::UpdatedAt))
                    .col(boolean(Rooms::IsActive).default(true))
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
