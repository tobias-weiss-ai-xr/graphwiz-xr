use sea_orm_migration::prelude::*;

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
                    .col(pk_auto(Entities::Id))
                    .col(string(Entities::EntityId))
                    .col(string(Entities::RoomId))
                    .col(string(Entities::TemplateId))
                    .col(string(Entities::OwnerId))
                    .col(json(Entities::Position))
                    .col(json(Entities::Rotation))
                    .col(json(Entities::Components))
                    .col(timestamp(Entities::CreatedAt))
                    .col(timestamp(Entities::UpdatedAt))
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
