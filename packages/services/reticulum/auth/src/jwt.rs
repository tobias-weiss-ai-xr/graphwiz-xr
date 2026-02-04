//! JWT token generation and validation

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};

use crate::models::{TokenClaims, UserInfo};
use reticulum_core::{Config, Error, Result};

/// Hash a password using Argon2
pub fn hash_password(password: &str) -> Result<String> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    argon2
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|e| Error::internal(format!("Failed to hash password: {}", e)))
}

/// Verify a password against a hash
pub fn verify_password(password: &str, hash: &str) -> Result<bool> {
    let parsed_hash = PasswordHash::new(hash)
        .map_err(|e| Error::internal(format!("Invalid password hash: {}", e)))?;

    Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .map(|_| true)
        .map_err(|_| Error::auth("Invalid password"))
}

/// Generate JWT access token
pub fn generate_access_token(config: &Config, user: &UserInfo) -> Result<String> {
    let now = chrono::Utc::now().timestamp();
    let exp = now + config.auth.jwt_expiration as i64;

    let claims = TokenClaims {
        sub: user.id.to_string(),
        email: user.email.clone(),
        exp: exp as usize,
        iat: now as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.auth.jwt_secret.as_ref()),
    )
    .map_err(|e| Error::internal(format!("Failed to generate token: {}", e)))
}

/// Generate refresh token
pub fn generate_refresh_token(config: &Config, user: &UserInfo) -> Result<String> {
    let now = chrono::Utc::now().timestamp();
    let exp = now + config.auth.refresh_expiration as i64;

    let claims = TokenClaims {
        sub: user.id.to_string(),
        email: user.email.clone(),
        exp: exp as usize,
        iat: now as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.auth.jwt_secret.as_ref()),
    )
    .map_err(|e| Error::internal(format!("Failed to generate refresh token: {}", e)))
}

/// Validate JWT token and return claims
pub fn validate_token(config: &Config, token: &str) -> Result<TokenClaims> {
    decode::<TokenClaims>(
        token,
        &DecodingKey::from_secret(config.auth.jwt_secret.as_ref()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|_| Error::auth("Invalid or expired token"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_and_verify_password() {
        let password = "test_password_123";
        let hash = hash_password(password).unwrap();
        assert!(verify_password(password, &hash).is_ok());
        assert!(verify_password("wrong_password", &hash).is_err());
    }

    #[test]
    fn test_generate_and_validate_token() {
        let config = Config::load_or_default().unwrap();
        let user = UserInfo {
            id: 1,
            display_name: "Test User".to_string(),
            email: "test@example.com".to_string(),
            avatar_url: None,
        };

        let token = generate_access_token(&config, &user).unwrap();
        let claims = validate_token(&config, &token).unwrap();

        assert_eq!(claims.sub, "1");
        assert_eq!(claims.email, "test@example.com");
    }
}
