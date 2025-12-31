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
                    .table(Assets::Table)
                    .if_not_exists()
                    .col(&mut ColumnDef::new(Assets::Id).integer().auto_increment().primary_key())
                    .col(&mut ColumnDef::new(Assets::AssetId).string().not_null())
                    .col(&mut ColumnDef::new(Assets::OwnerId).string().not_null())
                    .col(&mut ColumnDef::new(Assets::AssetType).string().not_null())
                    .col(&mut ColumnDef::new(Assets::FileName).string().not_null())
                    .col(&mut ColumnDef::new(Assets::FilePath).string().not_null())
                    .col(&mut ColumnDef::new(Assets::FileSize).big_integer().not_null())
                    .col(&mut ColumnDef::new(Assets::MimeType).string().not_null())
                    .col(&mut ColumnDef::new(Assets::Metadata).json().null())
                    .col(&mut ColumnDef::new(Assets::IsPublic).boolean().default(false))
                    .col(&mut ColumnDef::new(Assets::CreatedAt).timestamp().not_null())
                    .col(&mut ColumnDef::new(Assets::UpdatedAt).timestamp().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_assets_owner")
                            .from(Assets::Table, Assets::OwnerId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                    )
                    .to_owned(),
            )
            .await?;

        // Create unique index on asset_id
        manager
            .create_index(
                Index::create()
                    .name("idx_assets_asset_id")
                    .table(Assets::Table)
                    .col(Assets::AssetId)
                    .unique()
                    .to_owned(),
            )
            .await?;

        // Create index on owner_id
        manager
            .create_index(
                Index::create()
                    .name("idx_assets_owner")
                    .table(Assets::Table)
                    .col(Assets::OwnerId)
                    .to_owned(),
            )
            .await?;

        // Create index on asset_type
        manager
            .create_index(
                Index::create()
                    .name("idx_assets_type")
                    .table(Assets::Table)
                    .col(Assets::AssetType)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Assets::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Assets {
    Table,
    Id,
    AssetId,
    OwnerId,
    AssetType,
    FileName,
    FilePath,
    FileSize,
    MimeType,
    Metadata,
    IsPublic,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}
