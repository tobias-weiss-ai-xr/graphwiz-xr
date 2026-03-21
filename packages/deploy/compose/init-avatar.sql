-- Create avatar_configs table (separate from main migrations for now)
CREATE TABLE IF NOT EXISTS avatar_configs (
    user_id UUID PRIMARY KEY,
    body_type VARCHAR(50) NOT NULL DEFAULT 'human',
    primary_color VARCHAR(7) NOT NULL DEFAULT '#4CAF50',
    secondary_color VARCHAR(7) NOT NULL DEFAULT '#2196F3',
    height FLOAT NOT NULL DEFAULT 1.7,
    custom_model_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
