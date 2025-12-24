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
                    .table(Entities::Table)
                    .if_not_exists()
                    .col(&mut ColumnDef::new(Entities::Id).integer().auto_increment().primary_key())
                    .col(&mut ColumnDef::new(Entities::EntityId).string())
                    .col(&mut ColumnDef::new(Entities::RoomId).string())
                    .col(&mut ColumnDef::new(Entities::TemplateId).string())
                    .col(&mut ColumnDef::new(Entities::OwnerId).string())
                    .col(&mut ColumnDef::new(Entities::Position).string())  // JSON stored as text
                    .col(&mut ColumnDef::new(Entities::Rotation).string())  // JSON stored as text
                    .col(&mut ColumnDef::new(Entities::Components).string())  // JSON stored as text
                    .col(&mut ColumnDef::new(Entities::CreatedAt).timestamp())
                    .col(&mut ColumnDef::new(Entities::UpdatedAt).timestamp())
                    .to_owned(),
            )
            .await?;

        // Create unique index on entity_id
        manager
            .create_index(
                Index::create()
                    .name("idx_entities_entity_id")
                    .table(Entities::Table)
                    .col(Entities::EntityId)
                    .unique()
                    .to_owned(),
            )
            .await?;

        // Create index on room_id for room entity queries
        manager
            .create_index(
                Index::create()
                    .name("idx_entities_room_id")
                    .table(Entities::Table)
                    .col(Entities::RoomId)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Entities::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Entities {
    Table,
    Id,
    EntityId,
    RoomId,
    TemplateId,
    OwnerId,
    Position,
    Rotation,
    Components,
    CreatedAt,
    UpdatedAt,
}
