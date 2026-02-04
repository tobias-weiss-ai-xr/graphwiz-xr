-- GraphWiz-XR Database Initialization Script
-- Run automatically when PostgreSQL container is first created

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create indexes for common queries
-- These will be created by migrations, but we can add some optimizations here

-- Set default timezone
SET timezone = 'UTC';

-- Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON DATABASE graphwiz TO graphwiz;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'GraphWiz-XR database initialized successfully';
END $$;
