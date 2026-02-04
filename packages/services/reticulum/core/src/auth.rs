//! Authentication utilities including password hashing

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordVerifier, SaltString},
    Argon2, PasswordHasher,
};

use crate::Error;

/// Password hasher using Argon2
pub struct PasswordHasherWrapper {
    argon2: Argon2<'static>,
}

impl PasswordHasherWrapper {
    /// Create a new password hasher with default parameters
    pub fn new() -> Self {
        Self {
            argon2: Argon2::default(),
        }
    }

    /// Hash a password with a random salt
    pub fn hash_password(&self, password: &str) -> Result<String, Error> {
        let salt = SaltString::generate(&mut OsRng);
        let password_hash = Argon2::default()
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| Error::internal(format!("Failed to hash password: {}", e)))?;

        Ok(password_hash.to_string())
    }

    /// Verify a password against a hash
    pub fn verify_password(&self, password: &str, hash: &str) -> Result<bool, Error> {
        let parsed_hash = PasswordHash::new(hash)
            .map_err(|e| Error::internal(format!("Invalid password hash: {}", e)))?;

        self.argon2
            .verify_password(password.as_bytes(), &parsed_hash)
            .map(|_| true)
            .map_err(|_| Error::auth("Invalid password"))
    }
}

impl Default for PasswordHasherWrapper {
    fn default() -> Self {
        Self::new()
    }
}

/// Utility functions for password operations
pub fn hash_password(password: &str) -> Result<String, Error> {
    PasswordHasherWrapper::new().hash_password(password)
}

/// Verify a password against a hash
pub fn verify_password(password: &str, hash: &str) -> Result<bool, Error> {
    PasswordHasherWrapper::new().verify_password(password, hash)
}

/// Validate password strength
/// Returns Ok(()) if password meets requirements, Err otherwise
pub fn validate_password_strength(password: &str) -> Result<(), Error> {
    if password.len() < 8 {
        return Err(Error::validation("Password must be at least 8 characters long"));
    }

    if password.len() > 128 {
        return Err(Error::validation("Password must be less than 128 characters long"));
    }

    let has_uppercase = password.chars().any(|c| c.is_uppercase());
    let has_lowercase = password.chars().any(|c| c.is_lowercase());
    let has_digit = password.chars().any(|c| c.is_ascii_digit());
    let has_special = password.chars().any(|c| {
        c.is_ascii_punctuation() || c.is_ascii_graphic() && !c.is_alphanumeric()
    });

    if !has_lowercase {
        return Err(Error::validation("Password must contain at least one lowercase letter"));
    }

    if !has_uppercase {
        return Err(Error::validation("Password must contain at least one uppercase letter"));
    }

    if !has_digit {
        return Err(Error::validation("Password must contain at least one digit"));
    }

    if !has_special {
        return Err(Error::validation(
            "Password must contain at least one special character",
        ));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_and_verify_password() {
        let hasher = PasswordHasherWrapper::new();
        let password = "TestPassword123!";

        let hash = hasher.hash_password(password).unwrap();
        assert!(hash.len() > 0);

        let is_valid = hasher.verify_password(password, &hash).unwrap();
        assert!(is_valid);
    }

    #[test]
    fn test_verify_wrong_password() {
        let hasher = PasswordHasherWrapper::new();
        let password = "TestPassword123!";
        let wrong_password = "WrongPassword123!";

        let hash = hasher.hash_password(password).unwrap();
        let result = hasher.verify_password(wrong_password, &hash);

        assert!(result.is_err());
    }

    #[test]
    fn test_hash_uniqueness() {
        let hasher = PasswordHasherWrapper::new();
        let password = "TestPassword123!";

        let hash1 = hasher.hash_password(password).unwrap();
        let hash2 = hasher.hash_password(password).unwrap();

        // Same password should produce different hashes due to salt
        assert_ne!(hash1, hash2);

        // But both should verify correctly
        assert!(hasher.verify_password(password, &hash1).unwrap());
        assert!(hasher.verify_password(password, &hash2).unwrap());
    }

    #[test]
    fn test_validate_password_strength_valid() {
        let valid_passwords = vec![
            "SecurePass123!",
            "MyP@ssw0rd",
            "Str0ng!Pass",
            "Very$ecure123456",
        ];

        for password in valid_passwords {
            let result = validate_password_strength(password);
            assert!(
                result.is_ok(),
                "Password '{}' should be valid but got error: {:?}",
                password,
                result
            );
        }
    }

    #[test]
    fn test_validate_password_strength_too_short() {
        let result = validate_password_strength("Short1!");
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_password_strength_no_uppercase() {
        let result = validate_password_strength("lowercase123!");
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_password_strength_no_lowercase() {
        let result = validate_password_strength("UPPERCASE123!");
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_password_strength_no_digit() {
        let result = validate_password_strength("NoDigits!");
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_password_strength_no_special() {
        let result = validate_password_strength("NoSpecial123");
        assert!(result.is_err());
    }

    #[test]
    fn test_utility_functions() {
        let password = "TestPassword123!";

        let hash = hash_password(password).unwrap();
        assert!(verify_password(password, &hash).unwrap());
        assert!(!verify_password("WrongPassword123!", &hash).is_ok());
    }
}
