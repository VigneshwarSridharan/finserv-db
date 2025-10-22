-- Customers Table
-- Stores detailed customer information for KYC and business purposes

CREATE TABLE customers (
    customer_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    customer_number VARCHAR(20) UNIQUE NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    nationality VARCHAR(50),
    
    -- Address Information
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- KYC Information
    id_type VARCHAR(50), -- e.g., 'PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID'
    id_number VARCHAR(100),
    id_expiry_date DATE,
    kyc_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    kyc_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Financial Information
    occupation VARCHAR(100),
    annual_income DECIMAL(15, 2),
    source_of_funds VARCHAR(100),
    
    -- Customer Status
    customer_status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED, CLOSED
    risk_rating VARCHAR(20), -- LOW, MEDIUM, HIGH
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_gender CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')),
    CONSTRAINT check_kyc_status CHECK (kyc_status IN ('PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED')),
    CONSTRAINT check_customer_status CHECK (customer_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED')),
    CONSTRAINT check_risk_rating CHECK (risk_rating IN ('LOW', 'MEDIUM', 'HIGH'))
);

-- Indexes
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_customer_number ON customers(customer_number);
CREATE INDEX idx_customers_kyc_status ON customers(kyc_status);
CREATE INDEX idx_customers_customer_status ON customers(customer_status);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- Update trigger
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
