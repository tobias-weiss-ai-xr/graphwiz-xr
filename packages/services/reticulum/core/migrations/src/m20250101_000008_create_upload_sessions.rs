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
                    .table(UploadSessions::Table)
                    .if_not_exists()
                    .col(&mut ColumnDef::new(UploadSessions::Id).integer().auto_increment().primary_key())
                    .col(&mut ColumnDef::new(UploadSessions::SessionId).string().not_null())
                    .col(&mut ColumnDef::new(UploadSessions::OwnerId).string().not_null())
                    .col(&mut ColumnDef::new(UploadSessions::FileName).string().not_null())
                    .col(&mut ColumnDef::new(UploadSessions::AssetType).string().not_null())
                    .col(&mut ColumnDef::new(UploadSessions::FileSize).big_integer().not_null())
                    .col(&mut ColumnDef::new(UploadSessions::MimeType).string().not_null())
                    .col(&mut ColumnDef::new(UploadSessions::ChunkSize).integer().not_null())
                    .col(&mut ColumnDef::new(UploadSessions::TotalChunks).integer().not_null())
                    .col(&mut ColumnDef::new(UploadSessions::UploadedChunks).json().not_null())
                    .col(&mut ColumnDef::new(UploadSessions::Status).string().not_null())
                    .col(&mut ColumnDef::new(UploadSessions::IsPublic).boolean().default(false))
                    .col(&mut ColumnDef::new(UploadSessions::Metadata).json().null())
                    .col(&mut ColumnDef::new(UploadSessions::CreatedAt).timestamp().not_null())
                    .col(&mut ColumnDef::new(UploadSessions::UpdatedAt).timestamp().not_null())
                    .col(&mut ColumnDef::new(UploadSessions::CompletedAt).timestamp().null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_upload_sessions_owner")
                            .from(UploadSessions::Table, UploadSessions::OwnerId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_upload_sessions_session_id")
                    .table(UploadSessions::Table)
                    .col(UploadSessions::SessionId)
                    .unique()
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_upload_sessions_owner")
                    .table(UploadSessions::Table)
                    .col(UploadSessions::OwnerId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_upload_sessions_status")
                    .table(UploadSessions::Table)
                    .col(UploadSessions::Status)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(UploadSessions::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum UploadSessions {
    Table,
    Id,
    SessionId,
    OwnerId,
    FileName,
    AssetType,
    FileSize,
    MimeType,
    ChunkSize,
    TotalChunks,
    UploadedChunks,
    Status,
    IsPublic,
    Metadata,
    CreatedAt,
    UpdatedAt,
    CompletedAt,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}
