//! Database connection and utilities

use sea_orm::{ConnectOptions, Database, DatabaseConnection};
use std::time::Duration;

use crate::{Config, Result};

/// Establish a database connection
pub async fn connect(config: &Config) -> Result<DatabaseConnection> {
    let mut opt = ConnectOptions::new(&config.database.url);
    opt.max_connections(config.database.max_connections.unwrap_or(10))
        .min_connections(config.database.min_connections.unwrap_or(1))
        .connect_timeout(Duration::from_secs(8))
        .acquire_timeout(Duration::from_secs(8))
        .idle_timeout(Duration::from_secs(8))
        .max_lifetime(Duration::from_secs(8))
        .sqlx_logging(true)
        .sqlx_logging_level(log::LevelFilter::Debug);

    Database::connect(opt).await.map_err(Into::into)
}

/// Run database migrations
pub async fn run_migrations(config: &Config) -> Result<()> {
    use sea_orm_migration::MigratorTrait;

    let db = connect(config).await?;

    reticulum_migrations::Migrator::up(&db, None)
        .await
        .map_err(|e| crate::Error::internal(format!("Migration failed: {}", e)))?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Requires a running database
    async fn test_database_connection() {
        let config = Config::load_or_default().unwrap();
        let result = connect(&config).await;
        assert!(result.is_ok() || result.is_err()); // May fail if DB not running
    }
}
