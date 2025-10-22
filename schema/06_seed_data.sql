-- Seed Data for Portfolio Management System
-- Initial data to populate lookup tables

-- Insert Security Types
INSERT INTO security_types (type_name, description) VALUES
    ('Stock', 'Equity shares of companies'),
    ('Bond', 'Fixed income debt instruments'),
    ('Mutual Fund', 'Pooled investment funds'),
    ('ETF', 'Exchange Traded Funds'),
    ('Cryptocurrency', 'Digital or virtual currencies')
ON CONFLICT (type_name) DO NOTHING;

-- Insert Asset Categories
INSERT INTO asset_categories (category_name, description) VALUES
    ('Gold', 'Gold in various forms'),
    ('Silver', 'Silver in various forms'),
    ('Real Estate', 'Properties and land'),
    ('Vehicle', 'Cars, motorcycles, etc.'),
    ('Art', 'Paintings, sculptures, collectibles'),
    ('Jewelry', 'Precious jewelry items'),
    ('Antique', 'Antique items and collectibles'),
    ('Collectible', 'Rare coins, stamps, etc.')
ON CONFLICT (category_name) DO NOTHING;

-- Insert Sample Brokers (India)
INSERT INTO brokers (broker_name, broker_code, website_url, customer_support_phone, customer_support_email) VALUES
    ('Zerodha', 'ZERODHA', 'https://zerodha.com', '080-47181888', 'support@zerodha.com'),
    ('Upstox', 'UPSTOX', 'https://upstox.com', '022-61391000', 'support@upstox.com'),
    ('Angel One', 'ANGELONE', 'https://angelone.in', '022-39413596', 'care@angelbroking.com'),
    ('ICICI Direct', 'ICICIDIRECT', 'https://icicidirect.com', '022-40701111', 'customer.care@icicisecurities.com'),
    ('HDFC Securities', 'HDFCSEC', 'https://hdfcsec.com', '1800-103-1000', 'customercare@hdfcsec.com'),
    ('Groww', 'GROWW', 'https://groww.in', '9108-800-800', 'help@groww.in'),
    ('5Paisa', '5PAISA', 'https://5paisa.com', '1800-212-8888', 'care@5paisa.com')
ON CONFLICT (broker_code) DO NOTHING;

-- Insert Sample Banks (India)
INSERT INTO banks (bank_name, bank_code, website_url, customer_support_phone, customer_support_email) VALUES
    ('State Bank of India', 'SBIN', 'https://sbi.co.in', '1800-11-2211', 'sbi.customercare@sbi.co.in'),
    ('HDFC Bank', 'HDFC', 'https://hdfcbank.com', '1800-202-6161', 'support@hdfcbank.com'),
    ('ICICI Bank', 'ICIC', 'https://icicibank.com', '1860-120-7777', 'customer.care@icicibank.com'),
    ('Axis Bank', 'UTIB', 'https://axisbank.com', '1860-419-5555', 'customer.care@axisbank.com'),
    ('Kotak Mahindra Bank', 'KKBK', 'https://kotak.com', '1860-266-2666', 'service.helpdesk@kotak.com'),
    ('Punjab National Bank', 'PUNB', 'https://pnbindia.in', '1800-180-2222', 'care@pnb.co.in'),
    ('Bank of Baroda', 'BARB', 'https://bankofbaroda.in', '1800-102-4455', 'customercare@bankofbaroda.com'),
    ('Canara Bank', 'CNRB', 'https://canarabank.com', '1800-425-0018', 'canaraidbi@canarabank.com'),
    ('Union Bank of India', 'UBIN', 'https://unionbankofindia.co.in', '1800-22-2244', 'customercare@unionbankofindia.com'),
    ('IndusInd Bank', 'INDB', 'https://indusind.com', '1860-267-7777', 'customer.care@indusind.com')
ON CONFLICT (bank_code) DO NOTHING;

-- Sample Securities (Indian Market)
INSERT INTO securities (security_type_id, symbol, isin, security_name, exchange, currency, sector, industry) 
SELECT 
    st.security_type_id,
    data.symbol,
    data.isin,
    data.security_name,
    data.exchange,
    data.currency,
    data.sector,
    data.industry
FROM security_types st
CROSS JOIN (VALUES
    ('Stock', 'RELIANCE', 'INE002A01018', 'Reliance Industries Limited', 'NSE', 'INR', 'Energy', 'Oil & Gas'),
    ('Stock', 'TCS', 'INE467B01029', 'Tata Consultancy Services Limited', 'NSE', 'INR', 'Technology', 'IT Services'),
    ('Stock', 'INFY', 'INE009A01021', 'Infosys Limited', 'NSE', 'INR', 'Technology', 'IT Services'),
    ('Stock', 'HDFCBANK', 'INE040A01034', 'HDFC Bank Limited', 'NSE', 'INR', 'Financial', 'Banking'),
    ('Stock', 'ICICIBANK', 'INE090A01021', 'ICICI Bank Limited', 'NSE', 'INR', 'Financial', 'Banking'),
    ('Stock', 'SBIN', 'INE062A01020', 'State Bank of India', 'NSE', 'INR', 'Financial', 'Banking'),
    ('Stock', 'BHARTIARTL', 'INE397D01024', 'Bharti Airtel Limited', 'NSE', 'INR', 'Communication', 'Telecom'),
    ('Stock', 'ITC', 'INE154A01025', 'ITC Limited', 'NSE', 'INR', 'Consumer Goods', 'FMCG'),
    ('Stock', 'WIPRO', 'INE075A01022', 'Wipro Limited', 'NSE', 'INR', 'Technology', 'IT Services'),
    ('Stock', 'TATAMOTORS', 'INE155A01022', 'Tata Motors Limited', 'NSE', 'INR', 'Automotive', 'Automobile')
) AS data(type_name, symbol, isin, security_name, exchange, currency, sector, industry)
WHERE st.type_name = data.type_name
ON CONFLICT (symbol, exchange) DO NOTHING;
