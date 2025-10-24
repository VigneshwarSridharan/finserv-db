-- =====================================================
-- Database Functions and Triggers
-- =====================================================
-- This file contains PostgreSQL functions and triggers that should be
-- executed as part of database migrations. These are database-level
-- operations that cannot be represented in Drizzle ORM schema.

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brokers_updated_at BEFORE UPDATE ON brokers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_broker_accounts_updated_at BEFORE UPDATE ON user_broker_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_securities_updated_at BEFORE UPDATE ON securities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_security_holdings_updated_at BEFORE UPDATE ON user_security_holdings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON banks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_bank_accounts_updated_at BEFORE UPDATE ON user_bank_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fixed_deposits_updated_at BEFORE UPDATE ON fixed_deposits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_deposits_updated_at BEFORE UPDATE ON recurring_deposits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_assets_updated_at BEFORE UPDATE ON user_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_goals_updated_at BEFORE UPDATE ON portfolio_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_allocation_targets_updated_at BEFORE UPDATE ON asset_allocation_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate portfolio summary
CREATE OR REPLACE FUNCTION calculate_portfolio_summary(p_user_id INTEGER)
RETURNS VOID AS $$
DECLARE
    total_portfolio_value DECIMAL(15,2) := 0;
    securities_total DECIMAL(15,2) := 0;
    fd_total DECIMAL(15,2) := 0;
    rd_total DECIMAL(15,2) := 0;
    assets_total DECIMAL(15,2) := 0;
    securities_investment DECIMAL(15,2) := 0;
    fd_investment DECIMAL(15,2) := 0;
    rd_investment DECIMAL(15,2) := 0;
    assets_investment DECIMAL(15,2) := 0;
BEGIN
    -- Calculate securities totals
    SELECT 
        COALESCE(SUM(current_value), 0),
        COALESCE(SUM(total_investment), 0)
    INTO securities_total, securities_investment
    FROM user_security_holdings 
    WHERE user_id = p_user_id;

    -- Calculate fixed deposits totals
    SELECT 
        COALESCE(SUM(principal_amount), 0),
        COALESCE(SUM(principal_amount), 0)
    INTO fd_total, fd_investment
    FROM fixed_deposits 
    WHERE user_id = p_user_id AND is_active = TRUE;

    -- Calculate recurring deposits totals
    SELECT 
        COALESCE(SUM(monthly_installment * tenure_months), 0),
        COALESCE(SUM(monthly_installment * tenure_months), 0)
    INTO rd_total, rd_investment
    FROM recurring_deposits 
    WHERE user_id = p_user_id AND is_active = TRUE;

    -- Calculate assets totals
    SELECT 
        COALESCE(SUM(current_value), 0),
        COALESCE(SUM(purchase_price), 0)
    INTO assets_total, assets_investment
    FROM user_assets 
    WHERE user_id = p_user_id AND is_active = TRUE;

    -- Calculate total portfolio value
    total_portfolio_value := securities_total + fd_total + rd_total + assets_total;

    -- Update or insert portfolio summary
    INSERT INTO portfolio_summary (user_id, asset_type, total_investment, current_value, unrealized_pnl, total_pnl, percentage_of_portfolio)
    VALUES 
        (p_user_id, 'securities', securities_investment, securities_total, securities_total - securities_investment, securities_total - securities_investment, 
         CASE WHEN total_portfolio_value > 0 THEN (securities_total / total_portfolio_value) * 100 ELSE 0 END),
        (p_user_id, 'fixed_deposits', fd_investment, fd_total, 0, 0, 
         CASE WHEN total_portfolio_value > 0 THEN (fd_total / total_portfolio_value) * 100 ELSE 0 END),
        (p_user_id, 'recurring_deposits', rd_investment, rd_total, 0, 0, 
         CASE WHEN total_portfolio_value > 0 THEN (rd_total / total_portfolio_value) * 100 ELSE 0 END),
        (p_user_id, 'other_assets', assets_investment, assets_total, assets_total - assets_investment, assets_total - assets_investment, 
         CASE WHEN total_portfolio_value > 0 THEN (assets_total / total_portfolio_value) * 100 ELSE 0 END)
    ON CONFLICT (user_id, asset_type) 
    DO UPDATE SET 
        total_investment = EXCLUDED.total_investment,
        current_value = EXCLUDED.current_value,
        unrealized_pnl = EXCLUDED.unrealized_pnl,
        total_pnl = EXCLUDED.total_pnl,
        percentage_of_portfolio = EXCLUDED.percentage_of_portfolio,
        last_updated = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to update security holdings after transaction
CREATE OR REPLACE FUNCTION update_security_holdings_after_transaction()
RETURNS TRIGGER AS $$
DECLARE
    current_quantity DECIMAL(15,4);
    current_avg_price DECIMAL(12,4);
    new_quantity DECIMAL(15,4);
    new_avg_price DECIMAL(12,4);
BEGIN
    -- Get current holdings
    SELECT quantity, average_price 
    INTO current_quantity, current_avg_price
    FROM user_security_holdings 
    WHERE user_id = NEW.user_id 
      AND account_id = NEW.account_id 
      AND security_id = NEW.security_id;

    -- Calculate new quantity and average price
    IF NEW.transaction_type = 'buy' THEN
        new_quantity := COALESCE(current_quantity, 0) + NEW.quantity;
        new_avg_price := CASE 
            WHEN COALESCE(current_quantity, 0) = 0 THEN NEW.price
            ELSE ((COALESCE(current_quantity, 0) * COALESCE(current_avg_price, 0)) + (NEW.quantity * NEW.price)) / new_quantity
        END;
    ELSIF NEW.transaction_type = 'sell' THEN
        new_quantity := COALESCE(current_quantity, 0) - NEW.quantity;
        new_avg_price := COALESCE(current_avg_price, 0);
    ELSE
        -- For bonus, split, dividend - just update quantity
        new_quantity := COALESCE(current_quantity, 0) + NEW.quantity;
        new_avg_price := COALESCE(current_avg_price, 0);
    END IF;

    -- Update or insert holdings
    IF new_quantity > 0 THEN
        INSERT INTO user_security_holdings (user_id, account_id, security_id, quantity, average_price, first_purchase_date, last_purchase_date)
        VALUES (NEW.user_id, NEW.account_id, NEW.security_id, new_quantity, new_avg_price, NEW.transaction_date, NEW.transaction_date)
        ON CONFLICT (user_id, account_id, security_id)
        DO UPDATE SET 
            quantity = new_quantity,
            average_price = new_avg_price,
            last_purchase_date = CASE WHEN NEW.transaction_type = 'buy' THEN NEW.transaction_date ELSE user_security_holdings.last_purchase_date END,
            updated_at = CURRENT_TIMESTAMP;
    ELSE
        -- Remove holding if quantity becomes zero or negative
        DELETE FROM user_security_holdings 
        WHERE user_id = NEW.user_id 
          AND account_id = NEW.account_id 
          AND security_id = NEW.security_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for security transactions
CREATE TRIGGER update_holdings_after_security_transaction
    AFTER INSERT ON security_transactions
    FOR EACH ROW EXECUTE FUNCTION update_security_holdings_after_transaction();

-- Function to log portfolio transactions
CREATE OR REPLACE FUNCTION log_portfolio_transaction()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO portfolio_transactions_log (user_id, transaction_type, asset_type, asset_id, transaction_amount, transaction_date, description)
    VALUES (NEW.user_id, TG_OP, 'securities', NEW.security_id, NEW.total_amount, NEW.transaction_date, 
            'Security ' || NEW.transaction_type || ' transaction');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for security transactions logging
CREATE TRIGGER log_security_transaction
    AFTER INSERT ON security_transactions
    FOR EACH ROW EXECUTE FUNCTION log_portfolio_transaction();

