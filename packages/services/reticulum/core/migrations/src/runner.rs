//! Migration runner utility
//!
//! Provides functions to run database migrations programmatically

use sea_orm_migration::prelude::*;
use sea_orm::{Database, DbConn, ConnectionTrait};
use std::env;

/// Run all pending migrations
///
/// # Example
///
/// ```no_run
/// use reticulum_migrations::runner::run_migrations;
///
/// #[tokio::main]
/// async fn main() -> Result<(), Box<dyn std::error::Error>> {
///     let db_url = "postgresql://user:pass@localhost/database";
///     run_migrations(&db_url).await?;
///     Ok(())
/// }
/// ```
pub async fn run_migrations(database_url: &str) -> Result<(), Box<dyn std::error::Error>> {
    // Connect to database
    let db = Database::connect(database_url).await?;

    // Get migrations from the migrator
    let migrations = crate::Migrator::migrations();

    // Run migrations using the schema manager
    println!("Running database migrations...");
    let manager = SchemaManager::new(&db);

    for migration in migrations {
        let name = migration.name();
        println!("Applying migration: {}", name);

        // Check if migration has already been applied
        // For now, just apply it (in production, you'd check the sea_migration table)
        migration.up(&manager).await?;
    }

    println!("Migrations completed successfully!");

    Ok(())
}

/// Rollback last migration
///
/// # Example
///
/// ```no_run
/// use reticulum_migrations::runner::rollback_last_migration;
///
/// #[tokio::main]
/// async fn main() -> Result<(), Box<dyn std::error::Error>> {
///     let db_url = "postgresql://user:pass@localhost/database";
///     rollback_last_migration(&db_url).await?;
///     Ok(())
/// }
/// ```
pub async fn rollback_last_migration(database_url: &str) -> Result<(), Box<dyn std::error::Error>> {
    // Connect to database
    let db = Database::connect(database_url).await?;

    // Get migrations from the migrator
    let migrations = crate::Migrator::migrations();

    // Rollback the last migration
    if let Some(last_migration) = migrations.last() {
        let name = last_migration.name();
        println!("Rolling back migration: {}", name);

        let manager = SchemaManager::new(&db);
        last_migration.down(&manager).await?;

        println!("Rollback completed successfully!");
    } else {
        println!("No migrations to rollback.");
    }

    Ok(())
}

/// Get migration status
///
/// Lists all migrations and their status
pub async fn get_migration_status(database_url: &str) -> Result<(), Box<dyn std::error::Error>> {
    // Connect to database
    let db = Database::connect(database_url).await?;

    // Get migrations
    let migrations = crate::Migrator::migrations();

    println!("Migration Status:");
    println!("================");

    // In a real implementation, you would query the sea_migration table
    // to check which migrations have been applied
    for (i, migration) in migrations.iter().enumerate() {
        let name = migration.name();
        println!("{}. {}", i + 1, name);
        println!("   Status: Pending (check not implemented)");
    }

    Ok(())
}

/// Fresh start - drop all tables and re-run all migrations
///
/// # WARNING
///
/// This will delete all data in the database!
pub async fn fresh_start(database_url: &str) -> Result<(), Box<dyn std::error::Error>> {
    // Connect to database
    let db = Database::connect(database_url).await?;

    // Get migrations
    let migrations = crate::Migrator::migrations();
    let manager = SchemaManager::new(&db);

    println!("WARNING: This will delete all data!");
    println!("Rolling back all migrations...");

    // Rollback all migrations in reverse order
    for migration in migrations.iter().rev() {
        let name = migration.name();
        println!("Rolling back: {}", name);
        migration.down(&manager).await?;
    }

    println!("Re-running all migrations...");

    // Re-apply all migrations
    for migration in migrations.iter() {
        let name = migration.name();
        println!("Applying: {}", name);
        migration.up(&manager).await?;
    }

    println!("Fresh start completed!");

    Ok(())
}

/// Helper function to create a database connection
pub async fn connect(database_url: &str) -> Result<DbConn, Box<dyn std::error::Error>> {
    let db = Database::connect(database_url).await?;
    Ok(db)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Requires database connection
    async fn test_migration_runner() {
        let db_url = env::var("TEST_DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://postgres:postgres@localhost/test_reticulum".to_string());

        // This test requires a running database
        // run_migrations(&db_url).await.unwrap();
    }
}
