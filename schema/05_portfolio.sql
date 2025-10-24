-- =====================================================
-- Portfolio Management Schema
-- =====================================================

-- Portfolio summary view (materialized view for performance)
CREATE TABLE portfolio_summary (
    summary_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('securities', 'fixed_deposits', 'recurring_deposits', 'gold', 'real_estate', 'other_assets')),
    total_investment DECIMAL(15,2) NOT NULL DEFAULT 0,
    current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    unrealized_pnl DECIMAL(15,2) NOT NULL DEFAULT 0,
    realized_pnl DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_pnl DECIMAL(15,2) NOT NULL DEFAULT 0,
    percentage_of_portfolio DECIMAL(5,2) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, asset_type)
);

-- Portfolio performance tracking
CREATE TABLE portfolio_performance (
    performance_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    performance_date DATE NOT NULL,
    total_portfolio_value DECIMAL(15,2) NOT NULL,
    total_investment DECIMAL(15,2) NOT NULL,
    total_pnl DECIMAL(15,2) NOT NULL,
    total_return_percentage DECIMAL(5,2) NOT NULL,
    day_change DECIMAL(15,2) DEFAULT 0,
    day_change_percentage DECIMAL(5,2) DEFAULT 0,
    week_change DECIMAL(15,2) DEFAULT 0,
    week_change_percentage DECIMAL(5,2) DEFAULT 0,
    month_change DECIMAL(15,2) DEFAULT 0,
    month_change_percentage DECIMAL(5,2) DEFAULT 0,
    year_change DECIMAL(15,2) DEFAULT 0,
    year_change_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, performance_date)
);

-- Portfolio goals and targets
CREATE TABLE portfolio_goals (
    goal_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    goal_name VARCHAR(255) NOT NULL,
    goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('retirement', 'education', 'house_purchase', 'marriage', 'vacation', 'emergency_fund', 'other')),
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    target_date DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_achieved BOOLEAN DEFAULT FALSE,
    achieved_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset allocation targets
CREATE TABLE asset_allocation_targets (
    allocation_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('equity', 'debt', 'gold', 'real_estate', 'cash', 'other')),
    target_percentage DECIMAL(5,2) NOT NULL,
    current_percentage DECIMAL(5,2) DEFAULT 0,
    tolerance_band DECIMAL(5,2) DEFAULT 5.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, asset_type)
);

-- Portfolio alerts and notifications
CREATE TABLE portfolio_alerts (
    alert_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('price_alert', 'allocation_alert', 'maturity_alert', 'goal_alert', 'performance_alert')),
    alert_name VARCHAR(255) NOT NULL,
    alert_condition TEXT NOT NULL,
    alert_threshold DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    is_triggered BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMP,
    last_checked TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio reports and analytics
CREATE TABLE portfolio_reports (
    report_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('monthly', 'quarterly', 'yearly', 'custom')),
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    total_investment DECIMAL(15,2) NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    total_pnl DECIMAL(15,2) NOT NULL,
    total_return_percentage DECIMAL(5,2) NOT NULL,
    best_performing_asset VARCHAR(255),
    worst_performing_asset VARCHAR(255),
    report_data JSONB,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist for securities
CREATE TABLE user_watchlist (
    watchlist_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    security_id INTEGER NOT NULL REFERENCES securities(security_id) ON DELETE CASCADE,
    target_price DECIMAL(12,4),
    notes TEXT,
    added_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(user_id, security_id)
);

-- Portfolio transactions log
CREATE TABLE portfolio_transactions_log (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    asset_id INTEGER,
    transaction_amount DECIMAL(15,2) NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for portfolio schema
CREATE INDEX idx_portfolio_summary_user_id ON portfolio_summary(user_id);
CREATE INDEX idx_portfolio_summary_asset_type ON portfolio_summary(asset_type);
CREATE INDEX idx_portfolio_performance_user_id ON portfolio_performance(user_id);
CREATE INDEX idx_portfolio_performance_date ON portfolio_performance(performance_date);
CREATE INDEX idx_portfolio_goals_user_id ON portfolio_goals(user_id);
CREATE INDEX idx_portfolio_goals_type ON portfolio_goals(goal_type);
CREATE INDEX idx_portfolio_goals_target_date ON portfolio_goals(target_date);
CREATE INDEX idx_asset_allocation_targets_user_id ON asset_allocation_targets(user_id);
CREATE INDEX idx_asset_allocation_targets_asset_type ON asset_allocation_targets(asset_type);
CREATE INDEX idx_portfolio_alerts_user_id ON portfolio_alerts(user_id);
CREATE INDEX idx_portfolio_alerts_type ON portfolio_alerts(alert_type);
CREATE INDEX idx_portfolio_alerts_active ON portfolio_alerts(is_active);
CREATE INDEX idx_portfolio_reports_user_id ON portfolio_reports(user_id);
CREATE INDEX idx_portfolio_reports_type ON portfolio_reports(report_type);
CREATE INDEX idx_portfolio_reports_period ON portfolio_reports(report_period_start, report_period_end);
CREATE INDEX idx_user_watchlist_user_id ON user_watchlist(user_id);
CREATE INDEX idx_user_watchlist_security_id ON user_watchlist(security_id);
CREATE INDEX idx_portfolio_transactions_log_user_id ON portfolio_transactions_log(user_id);
CREATE INDEX idx_portfolio_transactions_log_type ON portfolio_transactions_log(transaction_type);
CREATE INDEX idx_portfolio_transactions_log_date ON portfolio_transactions_log(transaction_date);