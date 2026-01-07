pub use sea_orm_migration::prelude::*;

mod m20250101_000001_create_users;
mod m20250101_000002_create_rooms;
mod m20250101_000003_create_sessions;
mod m20250101_000004_create_entities;
mod m20250101_000005_add_oauth_and_sessions;
mod m20250101_000006_add_profile_settings;
mod m20250101_000007_create_assets;
mod m20250101_000008_create_upload_sessions;

pub mod runner;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20250101_000001_create_users::Migration),
            Box::new(m20250101_000002_create_rooms::Migration),
            Box::new(m20250101_000003_create_sessions::Migration),
            Box::new(m20250101_000004_create_entities::Migration),
            Box::new(m20250101_000005_add_oauth_and_sessions::Migration),
            Box::new(m20250101_000006_add_profile_settings::Migration),
            Box::new(m20250101_000007_create_assets::Migration),
            Box::new(m20250101_000008_create_upload_sessions::Migration),
        ]
    }
}
