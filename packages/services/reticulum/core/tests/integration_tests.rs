//! Integration tests for reticulum-core

use reticulum_core::{
    hash_password, verify_password, validate_password_strength, Config, Error, JwtManager,
    PasswordHasher, TokenType,
};
use uuid::Uuid;

#[test]
fn test_config_loading() {
    let config = Config::load_or_default().unwrap();
    assert_eq!(config.server.host, "0.0.0.0");
    assert_eq!(config.server.port, 4000);
    assert_eq!(config.auth.jwt_expiration, 3600);
}

#[test]
fn test_password_hashing_integration() {
    let password = "SecurePassword123!";

    // Hash password
    let hash = hash_password(password).unwrap();
    assert!(!hash.is_empty());
    assert_ne!(hash, password);

    // Verify correct password
    assert!(verify_password(password, &hash).unwrap());

    // Verify wrong password
    assert!(!verify_password("WrongPassword123!", &hash).is_ok());
}

#[test]
fn test_password_strength_validation() {
    // Valid passwords
    assert!(validate_password_strength("SecurePass123!").is_ok());
    assert!(validate_password_strength("MyP@ssw0rd").is_ok());

    // Invalid passwords
    assert!(validate_password_strength("short1!").is_err()); // Too short
    assert!(validate_password_strength("alllowercase123!").is_err()); // No uppercase
    assert!(validate_password_strength("ALLUPPERCASE123!").is_err()); // No lowercase
    assert!(validate_password_strength("NoDigits!").is_err()); // No digits
    assert!(validate_password_strength("NoSpecial123").is_err()); // No special
}

#[test]
fn test_jwt_token_full_cycle() {
    let manager = JwtManager::new(
        "test-secret-key-for-integration-testing",
        "reticulum-test".to_string(),
        3600,
        86400,
    );

    let user_id = Uuid::new_v4();

    // Create token pair
    let token_pair = manager.create_token_pair(user_id).unwrap();
    assert!(!token_pair.access_token.is_empty());
    assert!(!token_pair.refresh_token.is_empty());

    // Validate access token
    let access_claims = manager.validate_access_token(&token_pair.access_token).unwrap();
    assert_eq!(access_claims.sub, user_id.to_string());
    assert_eq!(access_claims.token_type, TokenType::Access);

    // Validate refresh token
    let refresh_claims = manager
        .validate_refresh_token(&token_pair.refresh_token)
        .unwrap();
    assert_eq!(refresh_claims.sub, user_id.to_string());
    assert_eq!(refresh_claims.token_type, TokenType::Refresh);

    // Ensure tokens are different
    assert_ne!(token_pair.access_token, token_pair.refresh_token);

    // Ensure wrong token type validation fails
    assert!(manager
        .validate_refresh_token(&token_pair.access_token)
        .is_err());
    assert!(manager
        .validate_access_token(&token_pair.refresh_token)
        .is_err());
}

#[test]
fn test_error_types() {
    // Test creating different error types
    let auth_err = Error::auth("Authentication failed");
    assert!(matches!(auth_err, Error::Auth(_)));

    let not_found_err = Error::not_found("User not found");
    assert!(matches!(not_found_err, Error::NotFound(_)));

    let validation_err = Error::validation("Invalid input");
    assert!(matches!(validation_err, Error::Validation(_)));

    let internal_err = Error::internal("Something went wrong");
    assert!(matches!(internal_err, Error::Internal(_)));
}

#[test]
fn test_password_hasher_struct() {
    let hasher = PasswordHasher::new();
    let password = "TestPassword123!";

    // Hash password
    let hash = hasher.hash_password(password).unwrap();
    assert!(!hash.is_empty());

    // Verify correct password
    assert!(hasher.verify_password(password, &hash).unwrap());

    // Verify wrong password fails
    assert!(hasher.verify_password("WrongPassword123!", &hash).is_err());
}

#[test]
fn test_multiple_hashes_are_unique() {
    let hasher = PasswordHasher::new();
    let password = "TestPassword123!";

    let hash1 = hasher.hash_password(password).unwrap();
    let hash2 = hasher.hash_password(password).unwrap();

    // Same password should produce different hashes (different salts)
    assert_ne!(hash1, hash2);

    // But both should verify correctly
    assert!(hasher.verify_password(password, &hash1).unwrap());
    assert!(hasher.verify_password(password, &hash2).unwrap());
}

#[test]
fn test_jwt_manager_with_different_users() {
    let manager = JwtManager::new(
        "test-secret-key-for-different-users",
        "reticulum-test".to_string(),
        3600,
        86400,
    );

    let user1 = Uuid::new_v4();
    let user2 = Uuid::new_v4();

    // Create tokens for different users
    let token1 = manager.create_access_token(user1).unwrap();
    let token2 = manager.create_access_token(user2).unwrap();

    // Tokens should be different
    assert_ne!(token1, token2);

    // Validate tokens contain correct user IDs
    let claims1 = manager.validate_access_token(&token1).unwrap();
    let claims2 = manager.validate_access_token(&token2).unwrap();

    assert_eq!(claims1.sub, user1.to_string());
    assert_eq!(claims2.sub, user2.to_string());
    assert_ne!(claims1.sub, claims2.sub);
}
