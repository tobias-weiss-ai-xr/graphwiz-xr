use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Users::Table)
                    .if_not_exists()
                    .col(pk_auto(Users::Id))
                    .col(string(Users::DisplayName))
                    .col(string(Users::Email))
                    .col(string(Users::PasswordHash))
                    .col(string(Users::AvatarUrl).null())
                    .col(text(Users::Bio).null())
                    .col(timestamp(Users::CreatedAt))
                    .col(timestamp(Users::UpdatedAt))
                    .col(boolean(Users::IsActive).default(true))
                    .to_owned(),
            )
            .await?;

        // Create index on email for fast lookups
        manager
            .create_index(
                Index::create()
                    .name("idx_users_email")
                    .table(Users::Table)
                    .col(Users::Email)
                    .to_owned(),
            )
            .await?;

        // Create index on display name
        manager
            .create_index(
                Index::create()
                    .name("idx_users_display_name")
                    .table(Users::Table)
                    .col(Users::DisplayName)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Users::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
    DisplayName,
    Email,
    PasswordHash,
    AvatarUrl,
    Bio,
    CreatedAt,
    UpdatedAt,
    IsActive,
}
