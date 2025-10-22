-- Audit Logs Table
-- Tracks all important system activities for compliance and security

CREATE TABLE audit_logs (
    audit_id BIGSERIAL PRIMARY KEY,
    
    -- Entity Information
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT,
    
    -- Action Details
    action_type VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE, LOGIN, LOGOUT, etc.
    action_description TEXT,
    
    -- User Information
    user_id BIGINT REFERENCES users(user_id),
    username VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    
    -- Change Information
    old_values JSONB,
    new_values JSONB,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_old_values ON audit_logs USING GIN(old_values);
CREATE INDEX idx_audit_logs_new_values ON audit_logs USING GIN(new_values);
