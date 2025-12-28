use sea_orm_migration::prelude::*;
use sea_query::{ColumnDef, Index, Table};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create user_settings table for storing user preferences
        manager
            .create_table(
                Table::create()
                    .table(UserSettings::Table)
                    .if_not_exists()
                    .col(&mut ColumnDef::new(UserSettings::Id).integer().auto_increment().primary_key())
                    .col(&mut ColumnDef::new(UserSettings::UserId).integer().not_null())
                    .col(&mut ColumnDef::new(UserSettings::Key).string().not_null())
                    .col(&mut ColumnDef::new(UserSettings::Value).string().not_null())
                    .col(&mut ColumnDef::new(UserSettings::CreatedAt).timestamp().not_null())
                    .col(&mut ColumnDef::new(UserSettings::UpdatedAt).timestamp().not_null())
                    .foreign_key(
                        sea_query::ForeignKey::create()
                            .name("fk_user_settings_user_id")
                            .from(UserSettings::Table, UserSettings::UserId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                    )
                    .to_owned(),
            )
            .await?;

        // Create unique index on user_id + key (one value per key per user)
        manager
            .create_index(
                Index::create()
                    .name("idx_user_settings_user_key")
                    .table(UserSettings::Table)
                    .col(UserSettings::UserId)
                    .col(UserSettings::Key)
                    .unique()
                    .to_owned(),
            )
            .await?;

        // Create index on user_id for lookups
        manager
            .create_index(
                Index::create()
                    .name("idx_user_settings_user_id")
                    .table(UserSettings::Table)
                    .col(UserSettings::UserId)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop user_settings table
        manager
            .drop_table(Table::drop().table(UserSettings::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum UserSettings {
    Table,
    Id,
    UserId,
    Key,
    Value,
    CreatedAt,
    UpdatedAt,
}
