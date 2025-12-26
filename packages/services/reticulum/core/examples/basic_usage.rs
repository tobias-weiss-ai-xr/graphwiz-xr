//! Example usage of reticulum-core utilities
//!
//! Run with: cargo run -p reticulum-core --example basic_usage

use reticulum_core::{
    hash_password, validate_password_strength, Config, Error, JwtManager, TokenType,
};
use uuid::Uuid;

fn main() -> Result<(), Error> {
    println!("=== Reticulum Core Usage Examples ===\n");

    // Example 1: Configuration loading
    println!("1. Loading configuration...");
    let config = Config::load_or_default()?;
    println!("   Server: {}:{}", config.server.host, config.server.port);
    println!("   Database URL: {}", config.database.url);
    println!("   JWT Expiration: {} seconds\n", config.auth.jwt_expiration);

    // Example 2: Password validation and hashing
    println!("2. Password handling...");
    let password = "SecurePassword123!";
    println!("   Original password: {}", password);

    // Validate password strength
    match validate_password_strength(password) {
        Ok(()) => println!("   Password strength: VALID"),
        Err(e) => println!("   Password strength: INVALID - {}", e),
    }

    // Hash password
    let hash = hash_password(password)?;
    println!("   Hashed password: {}...\n", &hash[....50]);

    // Example 3: JWT token management
    println!("3. JWT token management...");
    let jwt_manager = JwtManager::new(
        "example-secret-key-change-in-production",
        "reticulum-example".to_string(),
        3600,  // 1 hour
        86400, // 30 days
    );

    let user_id = Uuid::new_v4();
    println!("   User ID: {}", user_id);

    // Create token pair
    let tokens = jwt_manager.create_token_pair(user_id)?;
    println!("   Access token: {}...", &tokens.access_token[....50]);
    println!("   Refresh token: {}...\n", &tokens.refresh_token[....50]);

    // Validate access token
    let claims = jwt_manager.validate_access_token(&tokens.access_token)?;
    println!("4. Token validation...");
    println!("   Subject (user ID): {}", claims.sub);
    println!("   Issuer: {}", claims.iss);
    println!("   Token type: {:?}", claims.token_type);
    println!("   Expires at: {}", claims.exp);
    println!("   Issued at: {}", claims.iat);

    // Example 5: Error handling
    println!("\n5. Error handling examples...");
    let auth_error = Error::auth("Invalid credentials");
    println!("   Auth error: {}", auth_error);

    let not_found_error = Error::not_found("User not found");
    println!("   Not found error: {}", not_found_error);

    let validation_error = Error::validation("Email format invalid");
    println!("   Validation error: {}", validation_error);

    println!("\n=== Examples completed successfully ===");

    Ok(())
}
