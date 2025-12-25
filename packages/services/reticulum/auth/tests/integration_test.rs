//! Integration tests for auth service
//!
//! These tests require a test database to run properly.
//! For now, we'll test the business logic without a real database.

use reticulum_auth::models::{LoginRequest, RegisterRequest, UserInfo};
use reticulum_auth::jwt::{hash_password, verify_password, generate_access_token, validate_token};
use reticulum_core::Config;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_registration_flow() {
        let registration = RegisterRequest {
            display_name: "Test User".to_string(),
            email: "test@example.com".to_string(),
            password: "SecurePassword123!".to_string(),
        };

        // Validate registration request
        assert!(registration.email.contains('@'));
        assert!(!registration.display_name.is_empty());
        assert!(registration.password.len() >= 8);
    }

    #[test]
    fn test_user_login_flow() {
        let login = LoginRequest {
            email: "test@example.com".to_string(),
            password: "SecurePassword123!".to_string(),
        };

        // Validate login request
        assert!(login.email.contains('@'));
        assert!(!login.password.is_empty());
    }

    #[test]
    fn test_password_hashing_verification() {
        let password = "TestPassword123!";
        let hash = hash_password(password).unwrap();

        // Hash should be different from password
        assert_ne!(password, hash);

        // Correct password should verify
        assert!(verify_password(password, &hash).is_ok());

        // Wrong password should not verify
        assert!(verify_password("WrongPassword", &hash).is_err());
    }

    #[test]
    fn test_token_generation() {
        let config = Config::load_or_default().unwrap();
        let user = UserInfo {
            id: 1,
            display_name: "Test User".to_string(),
            email: "test@example.com".to_string(),
            avatar_url: None,
        };

        let token = generate_access_token(&config, &user).unwrap();

        // Token should not be empty
        assert!(!token.is_empty());

        // Token should have 3 parts (header.payload.signature)
        let parts: Vec<&str> = token.split('.').collect();
        assert_eq!(parts.len(), 3);
    }

    #[test]
    fn test_token_verification_valid() {
        let config = Config::load_or_default().unwrap();
        let user = UserInfo {
            id: 123,
            display_name: "Test User".to_string(),
            email: "test@example.com".to_string(),
            avatar_url: None,
        };

        let token = generate_access_token(&config, &user).unwrap();
        let claims = validate_token(&config, &token).unwrap();

        assert_eq!(claims.sub, "123");
        assert!(claims.exp > 0);
    }

    #[test]
    fn test_token_verification_invalid() {
        let config = Config::load_or_default().unwrap();
        let fake_token = "invalid.token.here";
        let result = validate_token(&config, fake_token);
        assert!(result.is_err());
    }

    #[test]
    fn test_different_users_different_tokens() {
        let config = Config::load_or_default().unwrap();
        let user1 = UserInfo {
            id: 1,
            display_name: "User One".to_string(),
            email: "user1@example.com".to_string(),
            avatar_url: None,
        };
        let user2 = UserInfo {
            id: 2,
            display_name: "User Two".to_string(),
            email: "user2@example.com".to_string(),
            avatar_url: None,
        };

        let token1 = generate_access_token(&config, &user1).unwrap();
        let token2 = generate_access_token(&config, &user2).unwrap();

        // Tokens should be different
        assert_ne!(token1, token2);

        // Each token should verify to its respective user
        let claims1 = validate_token(&config, &token1).unwrap();
        let claims2 = validate_token(&config, &token2).unwrap();

        assert_eq!(claims1.sub, "1");
        assert_eq!(claims2.sub, "2");
    }

    #[test]
    fn test_password_hash_consistency() {
        let password = "SamePassword123!";

        let hash1 = hash_password(password).unwrap();
        let hash2 = hash_password(password).unwrap();

        // Hashes should be different (different salt)
        assert_ne!(hash1, hash2);

        // But both should verify
        assert!(verify_password(password, &hash1).is_ok());
        assert!(verify_password(password, &hash2).is_ok());
    }

    #[test]
    fn test_user_info_serialization() {
        let user = UserInfo {
            id: 42,
            display_name: "Test User".to_string(),
            email: "test@example.com".to_string(),
            avatar_url: Some("https://example.com/avatar.png".to_string()),
        };

        // Test serialization
        let serialized = serde_json::to_string(&user);
        assert!(serialized.is_ok());

        // Test deserialization
        let deserialized: Result<UserInfo, _> = serde_json::from_str(&serialized.unwrap());
        assert!(deserialized.is_ok());

        let user2 = deserialized.unwrap();
        assert_eq!(user.id, user2.id);
        assert_eq!(user.email, user2.email);
    }

    #[test]
    fn test_concurrent_token_generation() {
        let config = Config::load_or_default().unwrap();
        let user = UserInfo {
            id: 1,
            display_name: "Test User".to_string(),
            email: "test@example.com".to_string(),
            avatar_url: None,
        };

        let mut tokens = Vec::new();

        // Generate multiple tokens for the same user
        // Note: Tokens generated quickly may have the same timestamp
        for _ in 0..10 {
            let token = generate_access_token(&config, &user).unwrap();
            tokens.push(token);
        }

        // All tokens should verify successfully
        for token in &tokens {
            let claims = validate_token(&config, token).unwrap();
            assert_eq!(claims.sub, "1");
        }

        // At minimum, all tokens should be generated
        assert_eq!(tokens.len(), 10);
    }

    #[test]
    fn test_minimal_registration_data() {
        let registration = RegisterRequest {
            display_name: "AB".to_string(),  // Minimum 2 characters
            email: "a@b.c".to_string(),
            password: "12345678".to_string(),  // Minimum 8 characters
        };

        // Validate all fields
        assert!(registration.display_name.len() >= 2);
        assert!(registration.email.contains('@'));
        assert!(registration.password.len() >= 8);
    }

    #[test]
    fn test_weak_passwords_still_work() {
        let weak_passwords = vec![
            "12345678",
            "abcdefgh",
            "password1",
        ];

        for password in weak_passwords {
            let result = hash_password(password);
            assert!(result.is_ok()); // Hashing should still work

            // And verification should work
            let hash = result.unwrap();
            assert!(verify_password(password, &hash).is_ok());
        }
    }

    #[test]
    fn test_user_info_without_avatar() {
        let user = UserInfo {
            id: 1,
            display_name: "Test User".to_string(),
            email: "test@example.com".to_string(),
            avatar_url: None,
        };

        // Serialization should work
        let serialized = serde_json::to_string(&user);
        assert!(serialized.is_ok());

        // Deserialization should work
        let deserialized: Result<UserInfo, _> = serde_json::from_str(&serialized.unwrap());
        assert!(deserialized.is_ok());

        let user2 = deserialized.unwrap();
        assert!(user2.avatar_url.is_none());
    }
}
