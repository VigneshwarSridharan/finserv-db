# Dummy Data Files

This directory contains organized dummy data files for the Portfolio Management Database. Each file focuses on specific aspects of the database to help understand structure, relationships, and data patterns.

## 📁 File Structure

### Core Data Files

| File | Description | Key Entities |
|------|-------------|--------------|
| `01_dummy_users.sql` | User profiles and preferences | Users, User Profiles, User Preferences |
| `02_dummy_brokers.sql` | Brokers and user accounts | Brokers, User Broker Accounts |
| `03_dummy_securities.sql` | Securities and holdings | Securities, Security Prices, User Security Holdings |
| `04_dummy_banks.sql` | Banks and deposits | Banks, User Bank Accounts, Fixed Deposits, Recurring Deposits |
| `05_dummy_assets.sql` | Physical assets and valuations | User Assets, Real Estate Details, Gold Details, Asset Valuations |
| `06_dummy_portfolio.sql` | Portfolio management data | Portfolio Goals, Asset Allocation, Watchlist, Performance |
| `07_dummy_transactions.sql` | All transaction data | Security Transactions, Asset Transactions, Portfolio Log |

## 🎯 Purpose

These dummy files serve multiple purposes:

### **Learning & Understanding**
- **Database Structure**: Understand table relationships and foreign keys
- **Data Patterns**: See realistic data patterns and business scenarios
- **Query Examples**: Practice with real data scenarios
- **Testing**: Test application logic with comprehensive data

### **Development & Testing**
- **Feature Development**: Test new features with realistic data
- **Performance Testing**: Evaluate query performance with substantial data
- **Integration Testing**: Test data flows between different modules
- **UI Development**: Develop user interfaces with realistic data

## 📊 Data Overview

### **User Profiles**
- **11 total users** with different risk profiles and investment strategies
- **Geographic diversity** across major Indian cities
- **Income ranges** from ₹8 lakhs to ₹20 lakhs annually
- **Risk profiles** covering conservative, moderate, and aggressive strategies

### **Financial Instruments**
- **13 brokers** including full-service, discount, and online platforms
- **35 securities** across multiple sectors (IT, Banking, Energy, Consumer Goods)
- **12 banks** covering public and private sector institutions
- **Multiple deposit products** with different tenures and interest rates

### **Physical Assets**
- **12 physical assets** including gold, real estate, and collectibles
- **Property types** covering residential, commercial, and retail spaces
- **Gold assets** with different purities and types
- **Valuation tracking** with historical price data

### **Portfolio Management**
- **12 portfolio goals** with different types and priorities
- **Asset allocation targets** showing target vs current percentages
- **Performance tracking** with daily, weekly, monthly data
- **Alert system** for price targets and allocation issues

## 🚀 Usage

### **Load All Dummy Data**
```bash
# Using Docker
docker exec -i portfolio_db psql -U portfolio_user -d portfolio_management < schema/dummy/01_dummy_users.sql
docker exec -i portfolio_db psql -U portfolio_user -d portfolio_user -d portfolio_management < schema/dummy/02_dummy_brokers.sql
# ... continue for all files

# Or use the init script which loads all files automatically
docker-compose up -d
```

### **Load Specific Data**
```bash
# Load only user data
docker exec -i portfolio_db psql -U portfolio_user -d portfolio_management < schema/dummy/01_dummy_users.sql

# Load only securities data
docker exec -i portfolio_db psql -U portfolio_user -d portfolio_management < schema/dummy/03_dummy_securities.sql
```

### **Run Understanding Queries**
```bash
# Explore the dummy data
docker exec -i portfolio_db psql -U portfolio_user -d portfolio_management < examples/understanding_queries.sql
```

## 📈 Data Characteristics

### **Realistic Scenarios**
- **Portfolio values** ranging from ₹4.5 crores to ₹20 crores
- **Investment patterns** reflecting different user profiles
- **Transaction history** showing realistic investment timelines
- **Performance data** with both positive and negative returns

### **Business Logic**
- **Goal tracking** with progress percentages and timelines
- **Asset allocation** showing rebalancing needs
- **Risk management** with alerts and monitoring
- **Performance analytics** with multiple timeframes

### **Data Relationships**
- **User-centric** data organization
- **Cross-references** between different asset types
- **Historical tracking** for all major entities
- **Audit trails** for all transactions

## 🔍 Key Insights

### **Investment Patterns**
- **Young professionals** tend to have aggressive equity allocations
- **Conservative investors** prefer fixed deposits and gold
- **High-income users** diversify across multiple asset classes
- **Geographic factors** influence investment choices

### **Portfolio Performance**
- **Equity investments** show higher volatility but better returns
- **Fixed deposits** provide stable, predictable returns
- **Real estate** offers good long-term appreciation
- **Gold** serves as a hedge against inflation

### **Data Quality**
- **Referential integrity** maintained across all tables
- **Realistic date ranges** for all historical data
- **Consistent naming** conventions throughout
- **Comprehensive coverage** of all major features

## 🛠️ Customization

### **Adding More Users**
```sql
-- Add new user in 01_dummy_users.sql
INSERT INTO users (username, email, ...) VALUES (...);
INSERT INTO user_profiles (user_id, ...) VALUES (...);
INSERT INTO user_preferences (user_id, ...) VALUES (...);
```

### **Adding More Securities**
```sql
-- Add new securities in 03_dummy_securities.sql
INSERT INTO securities (symbol, name, ...) VALUES (...);
INSERT INTO security_prices (security_id, ...) VALUES (...);
```

### **Adding More Assets**
```sql
-- Add new assets in 05_dummy_assets.sql
INSERT INTO user_assets (user_id, ...) VALUES (...);
INSERT INTO real_estate_details (asset_id, ...) VALUES (...);
```

## 📚 Related Files

- **Schema Files**: `/workspace/schema/` - Core database structure
- **Example Queries**: `/workspace/examples/` - Query examples and understanding queries
- **Docker Setup**: `/workspace/docker/` - Database setup and initialization
- **Documentation**: `/workspace/README.md` - Main project documentation

## ⚠️ Notes

- **Dummy data only**: This data is for development and testing purposes
- **No real information**: All personal and financial data is fictional
- **Regular updates**: Data may be updated to reflect new features
- **Backup recommended**: Always backup before loading dummy data

## 🤝 Contributing

When adding new dummy data:

1. **Follow naming conventions** used in existing files
2. **Maintain referential integrity** across all tables
3. **Add realistic data** that reflects real-world scenarios
4. **Update this README** to document new data
5. **Test thoroughly** before committing changes