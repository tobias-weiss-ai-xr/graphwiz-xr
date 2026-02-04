//! JWT token utilities

use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,    // User ID
    pub exp: i64,       // Expiration time
    pub iat: i64,       // Issued at
    pub iss: String,    // Issuer
    pub token_type: TokenType,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TokenType {
    Access,
    Refresh,
}

impl Claims {
    /// Create new access token claims
    pub fn access(user_id: Uuid, issuer: String, expiration_seconds: i64) -> Self {
        let now = Utc::now();
        Self {
            sub: user_id.to_string(),
            exp: (now + Duration::seconds(expiration_seconds)).timestamp(),
            iat: now.timestamp(),
            iss: issuer,
            token_type: TokenType::Access,
        }
    }

    /// Create new refresh token claims
    pub fn refresh(user_id: Uuid, issuer: String, expiration_seconds: i64) -> Self {
        let now = Utc::now();
        Self {
            sub: user_id.to_string(),
            exp: (now + Duration::seconds(expiration_seconds)).timestamp(),
            iat: now.timestamp(),
            iss: issuer,
            token_type: TokenType::Refresh,
        }
    }

    /// Validate token type
    pub fn validate_type(&self, expected: TokenType) -> Result<(), Error> {
        if self.token_type == expected {
            Ok(())
        } else {
            Err(Error::validation(format!(
                "Invalid token type: expected {:?}, got {:?}",
                expected, self.token_type
            )))
        }
    }
}

/// JWT token manager
pub struct JwtManager {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
    issuer: String,
    access_expiration: i64,
    refresh_expiration: i64,
}

impl JwtManager {
    /// Create a new JWT manager
    pub fn new(secret: &str, issuer: String, access_expiration: u64, refresh_expiration: u64) -> Self {
        Self {
            encoding_key: EncodingKey::from_secret(secret.as_bytes()),
            decoding_key: DecodingKey::from_secret(secret.as_bytes()),
            issuer,
            access_expiration: access_expiration as i64,
            refresh_expiration: refresh_expiration as i64,
        }
    }

    /// Generate an access token
    pub fn create_access_token(&self, user_id: Uuid) -> Result<String, Error> {
        let claims = Claims::access(user_id, self.issuer.clone(), self.access_expiration);
        self.encode_token(claims)
    }

    /// Generate a refresh token
    pub fn create_refresh_token(&self, user_id: Uuid) -> Result<String, Error> {
        let claims = Claims::refresh(user_id, self.issuer.clone(), self.refresh_expiration);
        self.encode_token(claims)
    }

    /// Generate token pair
    pub fn create_token_pair(&self, user_id: Uuid) -> Result<TokenPair, Error> {
        Ok(TokenPair {
            access_token: self.create_access_token(user_id)?,
            refresh_token: self.create_refresh_token(user_id)?,
        })
    }

    /// Encode claims to token
    fn encode_token(&self, claims: Claims) -> Result<String, Error> {
        encode(&Header::default(), &claims, &self.encoding_key).map_err(|e| {
            Error::internal(format!("Failed to encode token: {}", e))
        })
    }

    /// Decode and validate token
    pub fn decode_token(&self, token: &str) -> Result<Claims, Error> {
        let token_data = decode::<Claims>(
            token,
            &self.decoding_key,
            &Validation::default()
        ).map_err(|e| Error::auth(format!("Invalid token: {}", e)))?;

        Ok(token_data.claims)
    }

    /// Validate access token
    pub fn validate_access_token(&self, token: &str) -> Result<Claims, Error> {
        let claims = self.decode_token(token)?;
        claims.validate_type(TokenType::Access)?;
        Ok(claims)
    }

    /// Validate refresh token
    pub fn validate_refresh_token(&self, token: &str) -> Result<Claims, Error> {
        let claims = self.decode_token(token)?;
        claims.validate_type(TokenType::Refresh)?;
        Ok(claims)
    }
}

/// Token pair containing access and refresh tokens
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_and_validate_access_token() {
        let manager = JwtManager::new(
            "test-secret-key-for-testing-only",
            "test-issuer".to_string(),
            3600,
            86400,
        );

        let user_id = Uuid::new_v4();
        let token = manager.create_access_token(user_id).unwrap();
        let claims = manager.validate_access_token(&token).unwrap();

        assert_eq!(claims.sub, user_id.to_string());
        assert_eq!(claims.token_type, TokenType::Access);
    }

    #[test]
    fn test_create_and_validate_refresh_token() {
        let manager = JwtManager::new(
            "test-secret-key-for-testing-only",
            "test-issuer".to_string(),
            3600,
            86400,
        );

        let user_id = Uuid::new_v4();
        let token = manager.create_refresh_token(user_id).unwrap();
        let claims = manager.validate_refresh_token(&token).unwrap();

        assert_eq!(claims.sub, user_id.to_string());
        assert_eq!(claims.token_type, TokenType::Refresh);
    }

    #[test]
    fn test_token_type_validation() {
        let manager = JwtManager::new(
            "test-secret-key-for-testing-only",
            "test-issuer".to_string(),
            3600,
            86400,
        );

        let user_id = Uuid::new_v4();
        let access_token = manager.create_access_token(user_id).unwrap();

        // Should fail when validating access token as refresh token
        let result = manager.validate_refresh_token(&access_token);
        assert!(result.is_err());
    }

    #[test]
    fn test_create_token_pair() {
        let manager = JwtManager::new(
            "test-secret-key-for-testing-only",
            "test-issuer".to_string(),
            3600,
            86400,
        );

        let user_id = Uuid::new_v4();
        let pair = manager.create_token_pair(user_id).unwrap();

        // Validate both tokens
        let access_claims = manager.validate_access_token(&pair.access_token).unwrap();
        let refresh_claims = manager.validate_refresh_token(&pair.refresh_token).unwrap();

        assert_eq!(access_claims.sub, user_id.to_string());
        assert_eq!(refresh_claims.sub, user_id.to_string());
    }
}
