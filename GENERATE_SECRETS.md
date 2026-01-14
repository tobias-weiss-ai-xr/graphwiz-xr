# GraphWiz-XR Strong Credentials Generator

# Run this script to generate production-ready secrets for GraphWiz-XR

# Note: Store generated secrets securely in production environment variables or secret management service

# DO NOT commit generated secrets to version control

## Database Password

```bash
openssl rand -base64 32
```

## Redis Password

```bash
openssl rand -base64 32
```

## JWT Secret

```bash
openssl rand -base64 32
```

## Storage Service Secret

```bash
openssl rand -base64 32
```

## Environment Variable Configuration

Copy these into your `.env` file:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:GENERATED_PASSWORD_HERE@localhost:5432/graphwiz
DATABASE_PASSWORD=GENERATED_PASSWORD_HERE

# Redis Configuration
REDIS_URL=redis://:GENERATED_PASSWORD_HERE@localhost:6379
REDIS_PASSWORD=GENERATED_PASSWORD_HERE

# JWT Configuration
JWT_SECRET=GENERATED_JWT_SECRET_HERE
JWT_EXPIRATION_HOURS=24

# Storage Service Configuration
STORAGE_SECRET=GENERATED_STORAGE_SECRET_HERE
```

## Production Deployment

For production deployment:

1. **Use secret management service** (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
2. **Never hardcode secrets** in code or committed files
3. **Rotate secrets regularly** (every 90 days recommended)
4. **Use environment-specific secrets** (dev, staging, production)
5. **Audit secret access** using cloud provider logging

## AWS Secrets Manager Example

```bash
# Store secrets
aws secretsmanager create-secret --name graphwiz/database-password --secret-string "GENERATED_PASSWORD"
aws secretsmanager create-secret --name graphwiz/redis-password --secret-string "GENERATED_PASSWORD"
aws secretsmanager create-secret --name graphwiz/jwt-secret --secret-string "GENERATED_JWT_SECRET"

# Retrieve in application
DATABASE_PASSWORD=$(aws secretsmanager get-secret-value --secret-id graphwiz/database-password --query SecretString --output text)
```

## Azure Key Vault Example

```bash
# Store secrets
az keyvault secret set --vault-name "graphwiz-vault" --name "database-password" --value "GENERATED_PASSWORD"
az keyvault secret set --vault-name "graphwiz-vault" --name "redis-password" --value "GENERATED_PASSWORD"
az keyvault secret set --vault-name "graphwiz-vault" --name "jwt-secret" --value "GENERATED_JWT_SECRET"

# Retrieve in application
DATABASE_PASSWORD=$(az keyvault secret show --vault-name "graphwiz-vault" --name "database-password" --query value -o tsv)
```

## Docker Compose Secrets

For local development with Docker Compose:

```yaml
# docker-compose.yml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    secrets:
      - postgres_password

secrets:
  postgres_password:
    file: ./secrets/postgres_password.txt

# Generate secrets file
echo "GENERATED_PASSWORD_HERE" > ./secrets/postgres_password.txt
chmod 600 ./secrets/postgres_password.txt
```

## Validation Script

```bash
#!/bin/bash

# Validate secrets before deployment
ERRORS=0

# Check for default/placeholder values
if grep -r "change_this" .env 2>/dev/null; then
  echo "ERROR: Default placeholder credentials found!"
  ERRORS=$((ERRORS+1))
fi

if grep -r "GENERATED" .env 2>/dev/null; then
  echo "ERROR: Generated placeholders still in use!"
  ERRORS=$((ERRORS+1))
fi

# Check minimum password length
if [ ${#DATABASE_PASSWORD} -lt 32 ]; then
  echo "ERROR: Database password too short (minimum 32 characters)"
  ERRORS=$((ERRORS+1))
fi

# Check JWT secret length
if [ ${#JWT_SECRET} -lt 32 ]; then
  echo "ERROR: JWT secret too short (minimum 32 characters)"
  ERRORS=$((ERRORS+1))
fi

if [ $ERRORS -eq 0 ]; then
  echo "✅ All secrets validated successfully"
  exit 0
else
  echo "❌ Found $ERRORS secret validation errors"
  exit 1
fi
```

## Startup Validation in Rust

Add to `packages/services/reticulum/core/src/config.rs`:

```rust
impl Config {
    pub fn validate_secrets(&self) -> Result<()> {
        if self.database.password.contains("change_this") ||
           self.database.password.contains("default") ||
           self.database.password.len() < 32 {
            return Err(ConfigError::InvalidSecret(
                "Database password is invalid. Please generate a strong password."
            ));
        }

        if self.redis.password.contains("change_this") ||
           self.redis.password.len() < 32 {
            return Err(ConfigError::InvalidSecret(
                "Redis password is invalid. Please generate a strong password."
            ));
        }

        if self.jwt_secret.contains("change_this") ||
           self.jwt_secret.len() < 32 {
            return Err(ConfigError::InvalidSecret(
                "JWT secret is invalid. Please generate a strong secret."
            ));
        }

        Ok(())
    }
}
```

Then in `main.rs`:

```rust
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let config = Config::load_or_default()?;

    // Validate secrets on startup
    if let Err(e) = config.validate_secrets() {
        eprintln!("ERROR: {}", e);
        eprintln!("Please run: openssl rand -base64 32");
        eprintln!("And update your .env file with generated secrets");
        std::process::exit(1);
    }

    // ... rest of main
}
```
